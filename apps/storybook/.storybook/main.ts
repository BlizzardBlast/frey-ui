import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { StorybookConfig } from '@storybook/react-vite';
import { mergeConfig } from 'vite';

const getAbsolutePath = (packageName: string) =>
  dirname(fileURLToPath(import.meta.resolve(`${packageName}/package.json`)));

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    getAbsolutePath('@chromatic-com/storybook'),
    getAbsolutePath('@storybook/addon-a11y'),
    getAbsolutePath('@storybook/addon-docs'),
    getAbsolutePath('@storybook/addon-themes'),
    getAbsolutePath('@storybook/addon-mcp'),
  ],
  framework: {
    name: getAbsolutePath('@storybook/react-vite'),
    options: {},
  },

  async viteFinal(config) {
    const reactPrefixes = ['react/', 'react-dom/', 'react-is/', 'scheduler/'];

    const chunkStrategies = [
      { key: 'axe-core', name: 'vendor-axe' },
      { key: '@testing-library', name: 'vendor-testing-library' },
      { key: 'storybook/dist/preview', name: 'vendor-storybook-preview' },
      {
        key: 'storybook/dist/components',
        name: 'vendor-storybook-components-ui',
      },
      { key: 'storybook/dist/manager-api', name: 'vendor-storybook-manager' },
      { key: '@storybook/blocks', name: 'vendor-storybook-blocks' },
      { key: '@storybook/components', name: 'vendor-storybook-ui' },
      { key: '@storybook/preview-api', name: 'vendor-storybook-core' },
      { key: '@storybook/core-preview', name: 'vendor-storybook-core' },
      { key: '@storybook/react', name: 'vendor-storybook-react' },
      { key: '@storybook/addon-docs', name: 'vendor-storybook-docs-addon' },
      { key: 'storybook/', name: 'vendor-storybook-app' },
      { key: '@storybook/', name: 'vendor-storybook-addons' },
      { key: '@floating-ui', name: 'vendor-floating-ui' },
      { key: 'mdx', name: 'vendor-markdown-engine' },
      { key: 'micromark', name: 'vendor-markdown-engine' },
      { key: 'remark', name: 'vendor-markdown-engine' },
      { key: 'rehype', name: 'vendor-markdown-engine' },
    ];

    return mergeConfig(config, {
      build: {
        chunkSizeWarningLimit: 800,
        rolldownOptions: {
          output: {
            codeSplitting: true,
            manualChunks(id: string): string | undefined {
              if (!id.includes('node_modules')) {
                return undefined;
              }

              const normalizedId = id
                .replaceAll('\\', '/')
                .replaceAll('+', '/');
              const pathParts = normalizedId.split('node_modules/');
              const packagePath = pathParts.at(-1) ?? '';

              if (
                reactPrefixes.some((prefix) => packagePath.startsWith(prefix))
              ) {
                return 'vendor-react-core';
              }

              const matchingStrategy = chunkStrategies.find((item) =>
                packagePath.includes(item.key)
              );

              return matchingStrategy ? matchingStrategy.name : 'vendor-utils';
            },
          },
        },
      },
    });
  },
};

export default config;
