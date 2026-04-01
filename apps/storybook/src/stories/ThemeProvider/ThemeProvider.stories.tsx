import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button, Card, ThemeProvider, type ThemeProviderProps } from 'frey-ui';

function ThemePreview() {
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <Card style={{ padding: '1rem' }}>
        <h3 style={{ marginTop: 0, marginBottom: 8 }}>Workspace Settings</h3>
        <p style={{ marginTop: 0, marginBottom: 12 }}>
          Preview how semantic tokens adapt to different theme modes.
        </p>
        <div style={{ display: 'flex', gap: 10 }}>
          <Button variant='primary'>Save</Button>
          <Button variant='secondary'>Cancel</Button>
        </div>
      </Card>
    </div>
  );
}

type ThemeProviderStoryProps = Pick<
  ThemeProviderProps,
  'children' | 'theme' | 'highContrast' | 'id' | 'className' | 'style'
>;

const meta: Meta<ThemeProviderStoryProps> = {
  component: ThemeProvider,
  parameters: {
    layout: 'centered'
  },
  decorators: [
    (Story) => (
      <div style={{ width: 420 }}>
        <Story />
      </div>
    )
  ],
  argTypes: {
    theme: {
      control: { type: 'select' },
      options: ['light', 'dark', 'system'],
      description: 'Theme mode to apply to semantic design tokens',
      table: {
        type: {
          summary: "'light' | 'dark' | 'system'"
        },
        defaultValue: {
          summary: "'light'"
        }
      }
    },
    highContrast: {
      control: { type: 'boolean' },
      description: 'Whether to enable the high-contrast token set',
      table: {
        type: {
          summary: 'boolean'
        },
        defaultValue: {
          summary: 'false'
        }
      }
    },
    children: {
      control: false,
      description: 'Theme-aware content rendered inside the provider',
      table: {
        type: {
          summary: 'ReactNode'
        },
        defaultValue: {
          summary: 'None'
        }
      }
    },
    id: {
      control: { type: 'text' },
      description: 'Id applied to the theme provider root element',
      table: {
        type: {
          summary: 'string'
        },
        defaultValue: {
          summary: 'None'
        }
      }
    },
    className: {
      control: { type: 'text' },
      description: 'Additional class names applied to the theme provider root',
      table: {
        type: {
          summary: 'string'
        },
        defaultValue: {
          summary: 'None'
        }
      }
    },
    style: {
      control: { type: 'object' },
      description: 'Inline styles applied to the theme provider root',
      table: {
        type: {
          summary: 'CSSProperties'
        },
        defaultValue: {
          summary: 'None'
        }
      }
    }
  }
} satisfies Meta<ThemeProviderStoryProps>;

export default meta;

type Story = StoryObj<ThemeProviderStoryProps>;

export const light_theme: Story = {
  args: {
    theme: 'light',
    highContrast: false
  },
  render: (args) => (
    <ThemeProvider {...args}>
      <ThemePreview />
    </ThemeProvider>
  )
} satisfies Story;

export const dark_theme: Story = {
  args: {
    theme: 'dark',
    highContrast: false
  },
  render: (args) => (
    <ThemeProvider {...args}>
      <ThemePreview />
    </ThemeProvider>
  )
} satisfies Story;

export const system_theme: Story = {
  args: {
    theme: 'system',
    highContrast: false
  },
  render: (args) => (
    <ThemeProvider {...args}>
      <ThemePreview />
    </ThemeProvider>
  )
} satisfies Story;

export const high_contrast: Story = {
  args: {
    theme: 'light',
    highContrast: true
  },
  render: (args) => (
    <ThemeProvider {...args}>
      <ThemePreview />
    </ThemeProvider>
  )
} satisfies Story;
