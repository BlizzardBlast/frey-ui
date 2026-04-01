import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Button,
  ToastProvider,
  type ToastProviderProps,
  useToast
} from 'frey-ui';

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

type ToastProviderStoryProps = Pick<
  ToastProviderProps,
  'children' | 'placement' | 'limit' | 'className' | 'style'
>;

const meta: Meta<ToastProviderStoryProps> = {
  component: ToastProvider,
  parameters: {
    layout: 'centered'
  },
  argTypes: {
    placement: {
      control: { type: 'select' },
      options: ['top-right', 'top-left', 'bottom-right', 'bottom-left'],
      description: 'Viewport corner where toast notifications stack',
      table: {
        type: {
          summary: "'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'"
        },
        defaultValue: {
          summary: "'top-right'"
        }
      }
    },
    limit: {
      control: { type: 'number' },
      description: 'Maximum number of toasts displayed at one time',
      table: {
        type: {
          summary: 'number'
        },
        defaultValue: {
          summary: '4'
        }
      }
    },
    children: {
      control: false,
      description: 'Content rendered inside the toast provider context',
      table: {
        type: {
          summary: 'ReactNode'
        },
        defaultValue: {
          summary: 'None'
        }
      }
    },
    className: {
      control: { type: 'text' },
      description: 'Additional class names applied to the toast viewport',
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
      description: 'Inline styles applied to the toast viewport',
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
} satisfies Meta<ToastProviderStoryProps>;

export default meta;

type Story = StoryObj<ToastProviderStoryProps>;

export const basic_toast: Story = {
  render: (args) => (
    <ToastProvider {...args}>
      <ToastDemo />
    </ToastProvider>
  ),
  args: {
    placement: 'top-right',
    limit: 4
  }
} satisfies Story;
