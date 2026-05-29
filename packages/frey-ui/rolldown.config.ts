import crypto from 'node:crypto';
import path from 'node:path';
import MagicString from 'magic-string';
import postcss from 'postcss';
import postcssModules from 'postcss-modules';
import { defineConfig } from 'rolldown';
import external from 'rollup-plugin-peer-deps-external';
import dts from 'unplugin-dts/rolldown';

function toPosixPath(filePath: string): string {
  return filePath.split(path.sep).join('/');
}

function normalizeSourcemapSourcePath(sourcePath: string): string {
  return sourcePath
    .replaceAll('\\', '/')
    .replace(/^\.\.\/\.\.\/\.\.\/\.\.\/src\//, '../../../src/');
}

function prependAfterDirectivePrologue(code: string, statement: string) {
  const magicString = new MagicString(code);
  const directiveRegex = /^(?:[ \t]*['"][^'"\r\n]+['"];[ \t]*(?:\r?\n|$))+/;
  const directiveMatch = directiveRegex.exec(code);
  const insertIndex = directiveMatch ? directiveMatch[0].length : 0;

  magicString.appendLeft(insertIndex, `${statement}\n`);

  return {
    code: magicString.toString(),
    map: magicString.generateMap({ hires: true }),
  };
}

interface EmitAssetOptions {
  type: 'asset';
  fileName: string;
  source: string;
}

interface TransformContext {
  emitFile: (options: EmitAssetOptions) => void;
}

interface CssModuleChunk {
  facadeModuleId: string | null;
}

interface RenderChunkOptions {
  format: string;
}

interface SourceMapBundleItem {
  type: string;
  map?: {
    sources: string[];
  };
}

function cssModulesPlugin() {
  return {
    name: 'css-modules',
    async transform(this: TransformContext, code: string, id: string) {
      const sourceId = id.split('?')[0];
      if (!sourceId.endsWith('.css')) return null;

      const isTheme = sourceId.endsWith('theme.css');
      let classNames = {};

      const plugins = [];
      if (!isTheme) {
        plugins.push(
          postcssModules({
            generateScopedName: (name, filename) => {
              const hash = crypto
                .createHash('sha256')
                .update(filename + name)
                .digest('hex')
                .substring(0, 8);
              return `${name}_${hash}`;
            },
            getJSON: (_, json) => {
              classNames = json;
            },
          })
        );
      }

      const result = await postcss(plugins).process(code, {
        from: sourceId,
        to: sourceId,
      });

      const relativePath = path.relative(path.resolve('./src'), sourceId);
      const outputCssPath = isTheme
        ? relativePath
        : relativePath.replace('.module.css', '.css');
      const normalizedOutputCssPath = toPosixPath(outputCssPath);

      this.emitFile({
        type: 'asset',
        fileName: `cjs/${normalizedOutputCssPath}`,
        source: result.css,
      });
      this.emitFile({
        type: 'asset',
        fileName: `esm/${normalizedOutputCssPath}`,
        source: result.css,
      });

      // Explicitly return moduleType: 'js' to stop Rolldown from parsing this asset as raw CSS
      if (isTheme) {
        return { code: '', map: { mappings: '' }, moduleType: 'js' };
      }

      return {
        code: `export default ${JSON.stringify(classNames)};`,
        map: { mappings: '' },
        moduleType: 'js',
      };
    },

    renderChunk(
      code: string,
      chunk: CssModuleChunk,
      options: RenderChunkOptions
    ) {
      if (!chunk.facadeModuleId?.endsWith('.css')) {
        return null;
      }

      const isTheme = chunk.facadeModuleId.endsWith('theme.css');
      const outputCssName = isTheme
        ? 'theme.css'
        : path.basename(chunk.facadeModuleId).replace('.module.css', '.css');
      const cssSideEffect =
        options.format === 'cjs'
          ? `require('./${outputCssName}');`
          : `import './${outputCssName}';`;

      return prependAfterDirectivePrologue(code, cssSideEffect);
    },
  };
}

function normalizeSourcemapPathsPlugin() {
  return {
    name: 'normalize-sourcemap-paths',
    generateBundle(
      _outputOptions: unknown,
      bundle: Record<string, SourceMapBundleItem>
    ) {
      for (const chunkOrAsset of Object.values(bundle)) {
        if (chunkOrAsset.type !== 'chunk' || !chunkOrAsset.map?.sources)
          continue;

        chunkOrAsset.map.sources = chunkOrAsset.map.sources.map(
          normalizeSourcemapSourcePath
        );
      }
    },
  };
}

export default defineConfig({
  input: './src/index.ts',
  output: [
    {
      dir: 'dist',
      format: 'cjs',
      sourcemap: true,
      exports: 'named',
      preserveModules: true,
      preserveModulesRoot: 'src',
      entryFileNames: 'cjs/[name].cjs',
      chunkFileNames: 'cjs/[name]-[hash].cjs',
      banner: "'use client';",
    },
    {
      dir: 'dist',
      format: 'esm',
      sourcemap: true,
      exports: 'named',
      preserveModules: true,
      preserveModulesRoot: 'src',
      entryFileNames: 'esm/[name].mjs',
      chunkFileNames: 'esm/[name]-[hash].mjs',
      banner: "'use client';",
    },
  ],
  plugins: [
    external({ includeDependencies: true }),
    cssModulesPlugin(),
    normalizeSourcemapPathsPlugin(),
    dts({
      tsconfigPath: './tsconfig.lib.json',
      bundleTypes: true,
    }),
  ],
});
