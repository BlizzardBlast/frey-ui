/** @type {import('stylelint').Config} */
export default {
  extends: ['stylelint-config-standard'],
  ignoreFiles: [
    'dist/**',
    'apps/storybook/storybook-static/**',
    'apps/storybook/html/**',
    'apps/storybook/tailwind.css'
  ],
  rules: {
    'at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: ['tailwind', 'apply', 'variants', 'responsive', 'screen']
      }
    ]
  }
};
