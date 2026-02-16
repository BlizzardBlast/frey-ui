import type { Meta, StoryObj } from '@storybook/react-vite';

import { Alert } from 'frey-ui';
import type { AlertProps } from 'frey-ui';

const meta: Meta<AlertProps> = {
  component: Alert,
  parameters: {
    layout: 'centered'
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['error', 'success', 'warning', 'info'],
      description: 'Visual variant / severity'
    },
    title: {
      control: { type: 'text' },
      description: 'Optional bold title'
    },
    children: {
      control: { type: 'text' },
      description: 'Alert message content'
    }
  },
  decorators: [
    (Story) => (
      <div style={{ width: 400 }}>
        <Story />
      </div>
    )
  ]
} satisfies Meta<AlertProps>;

export default meta;
type Story = StoryObj<AlertProps>;

export const all_variants: Story = {
  render: () => (
    <div className='flex flex-col gap-4' style={{ width: 400 }}>
      <Alert variant='info'>This is an informational message.</Alert>
      <Alert variant='success'>Operation completed successfully.</Alert>
      <Alert variant='warning'>Please review before continuing.</Alert>
      <Alert variant='error'>Something went wrong. Please try again.</Alert>
    </div>
  )
} satisfies Story;

export const with_title: Story = {
  render: () => (
    <div className='flex flex-col gap-4' style={{ width: 400 }}>
      <Alert variant='error' title='Submission Failed'>
        Please check the form for errors and try again.
      </Alert>
      <Alert variant='success' title='Saved'>
        Your changes have been saved successfully.
      </Alert>
    </div>
  )
} satisfies Story;

export const info: Story = {
  args: {
    variant: 'info',
    children: 'Your session will expire in 5 minutes.'
  }
} satisfies Story;

export const success: Story = {
  args: {
    variant: 'success',
    title: 'Payment received',
    children: 'Thank you for your purchase.'
  }
} satisfies Story;

export const warning: Story = {
  args: {
    variant: 'warning',
    children: 'This action cannot be undone.'
  }
} satisfies Story;

export const error: Story = {
  args: {
    variant: 'error',
    title: 'Error',
    children: 'Failed to save changes.'
  }
} satisfies Story;
