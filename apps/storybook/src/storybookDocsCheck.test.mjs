import { describe, expect, it } from 'vitest';
import { collectStoryDocsIssues } from '../../../scripts/storybookDocsCheck.mjs';

describe('collectStoryDocsIssues', () => {
  it('reports a missing argTypes block', () => {
    const issues = collectStoryDocsIssues({
      filePath: 'apps/storybook/src/stories/Badge/Badge.stories.tsx',
      sourceText: `
        import type { Meta } from '@storybook/react-vite';

        const meta = {
          component: Badge
        } satisfies Meta<unknown>;

        export default meta;
      `
    });

    expect(issues).toEqual(['Missing meta.argTypes block.']);
  });

  it('reports incomplete visible argTypes rows', () => {
    const issues = collectStoryDocsIssues({
      filePath: 'apps/storybook/src/stories/Badge/Badge.stories.tsx',
      sourceText: `
        import type { Meta } from '@storybook/react-vite';

        const meta = {
          component: Badge,
          argTypes: {
            tone: {
              control: { type: 'select' }
            },
            children: {
              table: {
                disable: true
              }
            }
          }
        } satisfies Meta<unknown>;

        export default meta;
      `
    });

    expect(issues).toEqual([
      "Incomplete argTypes entry 'tone': missing description.",
      "Incomplete argTypes entry 'tone': missing table.type.summary.",
      "Incomplete argTypes entry 'tone': missing table.defaultValue.summary."
    ]);
  });

  it('accepts complete visible argTypes rows and ignored disabled rows', () => {
    const issues = collectStoryDocsIssues({
      filePath: 'apps/storybook/src/stories/Badge/Badge.stories.tsx',
      sourceText: `
        import type { Meta } from '@storybook/react-vite';

        const meta = {
          component: Badge,
          argTypes: {
            tone: {
              control: { type: 'select' },
              description: 'Visual tone',
              table: {
                type: {
                  summary: "'neutral' | 'info'"
                },
                defaultValue: {
                  summary: "'neutral'"
                }
              }
            },
            children: {
              table: {
                disable: true
              }
            },
            onChange: {
              action: 'changed',
              description: 'Called when the value changes',
              table: {
                type: {
                  summary: '(value: string) => void'
                },
                defaultValue: {
                  summary: 'None'
                }
              }
            }
          }
        } satisfies Meta<unknown>;

        export default meta;
      `
    });

    expect(issues).toEqual([]);
  });
});
