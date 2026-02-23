import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button, Card, ThemeProvider, type ThemeProviderProps } from 'frey-ui';

function ThemePreview() {
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <Card>
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

const meta: Meta<ThemeProviderProps> = {
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
      options: ['light', 'dark', 'system']
    },
    highContrast: {
      control: { type: 'boolean' }
    },
    children: {
      table: {
        disable: true
      }
    }
  }
} satisfies Meta<ThemeProviderProps>;

export default meta;

type Story = StoryObj<ThemeProviderProps>;

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
