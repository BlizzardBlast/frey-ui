import { readFileSync } from 'node:fs';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import { defineConfig } from 'rollup';
import dts from 'rollup-plugin-dts';
import external from 'rollup-plugin-peer-deps-external';
import postcss from 'rollup-plugin-postcss';
import typescriptEngine from 'typescript';

const packageJson = JSON.parse(readFileSync('./package.json'));
const externalPackages = [
  ...Object.keys(packageJson.dependencies || {}),
  ...Object.keys(packageJson.peerDependencies || {}),
  'react/jsx-runtime'
];

export default defineConfig([
  {
    input: './src/index.ts',
    output: [
      {
        dir: 'dist',
        format: 'cjs',
        sourcemap: true,
        sourcemapPathTransform: (relativeSourcePath) => {
          return relativeSourcePath.replace(
            /^\.\.\/\.\.\/\.\.\/\.\.\/src\//,
            '../../../src/'
          );
        },
        exports: 'named',
        preserveModules: true,
        preserveModulesRoot: 'src',
        entryFileNames: 'cjs/[name].js',
        name: packageJson.name,
        banner: "'use client';"
      },
      {
        dir: 'dist',
        format: 'es',
        exports: 'named',
        sourcemap: true,
        sourcemapPathTransform: (relativeSourcePath) => {
          return relativeSourcePath.replace(
            /^\.\.\/\.\.\/\.\.\/\.\.\/src\//,
            '../../../src/'
          );
        },
        preserveModules: true,
        preserveModulesRoot: 'src',
        entryFileNames: 'esm/[name].js',
        banner: "'use client';"
      }
    ],
    external: externalPackages,
    plugins: [
      postcss({
        plugins: [],
        modules: true,
        minimize: true,
        extract: 'styles.css',
        sourceMap: true
      }),
      external({ includeDependencies: true }),
      resolve(),
      commonjs(),
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
      })
    ]
  },
  {
    input: 'dist/types/src/index.d.ts',
    output: [{ file: 'dist/index.d.ts', format: 'esm' }],
    external: [/\.(sc|sa|c)ss$/],
    plugins: [dts()]
  }
]);
