import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Button,
  ToastProvider,
  type ToastProviderProps,
  useToast
} from 'frey-ui';
import type React from 'react';

function ToastDemo() {
  const { toast, dismissAll } = useToast();

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      <Button
        variant='secondary'
        onClick={() => {
          toast({
            variant: 'info',
            title: 'Info',
            description: 'A new report is ready to review.'
          });
        }}
      >
        Show info toast
      </Button>

      <Button
        variant='secondary'
        onClick={() => {
          toast({
            variant: 'success',
            title: 'Saved',
            description: 'Your changes were saved successfully.',
            action: {
              label: 'Undo',
              onClick: () => undefined
            }
          });
        }}
      >
        Show success toast
      </Button>

      <Button
        variant='secondary'
        onClick={() => {
          toast({
            variant: 'warning',
            title: 'Storage warning',
            description: 'You are close to your workspace storage limit.'
          });
        }}
      >
        Show warning toast
      </Button>

      <Button
        variant='destructive'
        onClick={() => {
          toast({
            variant: 'error',
            title: 'Publish failed',
            description: 'Please try again in a few moments.'
          });
        }}
      >
        Show error toast
      </Button>

      <Button variant='ghost' onClick={dismissAll}>
        Dismiss all
      </Button>
    </div>
  );
}

const StoryToastProvider =
  ToastProvider as unknown as React.ComponentType<ToastProviderProps>;

const meta: Meta<ToastProviderProps> = {
  component: StoryToastProvider,
  parameters: {
    layout: 'centered'
  },
  argTypes: {
    placement: {
      control: { type: 'select' },
      options: ['top-right', 'top-left', 'bottom-right', 'bottom-left']
    },
    limit: {
      control: { type: 'number' }
    }
  }
} satisfies Meta<ToastProviderProps>;

export default meta;

type Story = StoryObj<ToastProviderProps>;

export const basic_toast: Story = {
  render: (args) => (
    <StoryToastProvider {...args}>
      <ToastDemo />
    </StoryToastProvider>
  ),
  args: {
    placement: 'top-right',
    limit: 4
  }
} satisfies Story;
