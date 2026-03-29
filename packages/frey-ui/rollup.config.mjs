import crypto from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import MagicString from 'magic-string';
import postcss from 'postcss';
import postcssModules from 'postcss-modules';
import { defineConfig } from 'rollup';
import dts from 'rollup-plugin-dts';
import external from 'rollup-plugin-peer-deps-external';
import typescriptEngine from 'typescript';

const packageJson = JSON.parse(readFileSync('./package.json'));
const externalPackages = [
  ...Object.keys(packageJson.dependencies || {}),
  ...Object.keys(packageJson.peerDependencies || {}),
  'react/jsx-runtime'
];

function toPosixPath(filePath) {
  return filePath.split(path.sep).join('/');
}

function normalizeSourcemapSourcePath(sourcePath) {
  return sourcePath
    .replaceAll('\\', '/')
    .replace(/^\.\.\/\.\.\/\.\.\/\.\.\/src\//, '../../../src/');
}

function prependAfterDirectivePrologue(code, statement) {
  const magicString = new MagicString(code);
  const directiveRegex = /^(?:[ \t]*['"][^'"\r\n]+['"];[ \t]*(?:\r?\n|$))+/;
  const directiveMatch = code.match(directiveRegex);
  const insertIndex = directiveMatch ? directiveMatch[0].length : 0;

  magicString.appendLeft(insertIndex, `${statement}\n`);

  return {
    code: magicString.toString(),
    map: magicString.generateMap({ hires: true })
  };
}

function cssModulesPlugin() {
  return {
    name: 'css-modules',
    async transform(code, id) {
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
            }
          })
        );
      }

      const result = await postcss(plugins).process(code, {
        from: sourceId,
        to: sourceId
      });

      const relativePath = path.relative(path.resolve('./src'), sourceId);
      const outputCssPath = isTheme
        ? relativePath
        : relativePath.replace('.module.css', '.css');
      const normalizedOutputCssPath = toPosixPath(outputCssPath);

      this.emitFile({
        type: 'asset',
        fileName: `cjs/${normalizedOutputCssPath}`,
        source: result.css
      });
      this.emitFile({
        type: 'asset',
        fileName: `esm/${normalizedOutputCssPath}`,
        source: result.css
      });

      if (isTheme) {
        return { code: '', map: { mappings: '' } };
      }

      return {
        code: `export default ${JSON.stringify(classNames)};`,
        map: { mappings: '' }
      };
    },

    renderChunk(code, chunk, options) {
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
    }
  };
}

function normalizeSourcemapPathsPlugin() {
  return {
    name: 'normalize-sourcemap-paths',
    generateBundle(_outputOptions, bundle) {
      for (const chunkOrAsset of Object.values(bundle)) {
        if (chunkOrAsset.type !== 'chunk' || !chunkOrAsset.map?.sources)
          continue;

        chunkOrAsset.map.sources = chunkOrAsset.map.sources.map(
          normalizeSourcemapSourcePath
        );
      }
    }
  };
}

export default defineConfig([
  {
    input: './src/index.ts',
    output: [
      {
        dir: 'dist',
        format: 'cjs',
        sourcemap: true,
        sourcemapPathTransform: (relativeSourcePath) => {
          return normalizeSourcemapSourcePath(relativeSourcePath);
        },
        exports: 'named',
        preserveModules: true,
        preserveModulesRoot: 'src',
        entryFileNames: 'cjs/[name].cjs',
        chunkFileNames: 'cjs/[name]-[hash].cjs',
        name: packageJson.name,
        banner: "'use client';"
      },
      {
        dir: 'dist',
        format: 'es',
        exports: 'named',
        sourcemap: true,
        sourcemapPathTransform: (relativeSourcePath) => {
          return normalizeSourcemapSourcePath(relativeSourcePath);
        },
        preserveModules: true,
        preserveModulesRoot: 'src',
        entryFileNames: 'esm/[name].mjs',
        chunkFileNames: 'esm/[name]-[hash].mjs',
        banner: "'use client';"
      }
    ],
    external: externalPackages,
    plugins: [
      external({ includeDependencies: true }),
      resolve(),
      commonjs(),
      cssModulesPlugin(),
      typescript({
        tsconfig: './tsconfig.lib.json',
        typescript: typescriptEngine,
        sourceMap: true,
        exclude: [
          'coverage',
          '.storybook',
          'storybook-static',
          'config',
          'dist',
          'node_modules/**',
          '*.cjs',
          '*.mjs',
          '**/__snapshots__/*',
          '**/__tests__',
          '**/*.test.js+(|x)',
          '**/*.test.ts+(|x)',
          '**/*.mdx',
          '**/*.story.ts+(|x)',
          '**/*.story.js+(|x)',
          '**/*.stories.ts+(|x)',
          '**/*.stories.js+(|x)',
          'setupTests.ts',
          'vitest.config.ts'
        ]
      }),
      normalizeSourcemapPathsPlugin()
    ]
  },
  {
    input: 'dist/types/src/index.d.ts',
    output: [{ file: 'dist/index.d.ts', format: 'esm' }],
    external: [/\.(sc|sa|c)ss$/],
    plugins: [dts()]
  }
]);
