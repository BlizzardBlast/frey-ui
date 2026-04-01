import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button, Dialog, type DialogProps } from 'frey-ui';
import { useEffect, useState } from 'react';

type DialogStoryProps = Pick<
  DialogProps,
  'children' | 'open' | 'defaultOpen' | 'onOpenChange'
>;

const meta: Meta<DialogStoryProps> = {
  component: Dialog,
  parameters: {
    layout: 'centered'
  },
  argTypes: {
    open: {
      control: { type: 'boolean' },
      description: 'Controlled open state of the dialog',
      table: {
        type: {
          summary: 'boolean'
        },
        defaultValue: {
          summary: 'None'
        }
      }
    },
    defaultOpen: {
      control: { type: 'boolean' },
      description: 'Initial open state when the dialog is uncontrolled',
      table: {
        type: {
          summary: 'boolean'
        },
        defaultValue: {
          summary: 'false'
        }
      }
    },
    onOpenChange: {
      action: 'open changed',
      description: 'Called when the dialog open state changes',
      table: {
        type: {
          summary: '(open: boolean) => void'
        },
        defaultValue: {
          summary: 'None'
        }
      }
    },
    children: {
      control: false,
      description: 'Composed dialog trigger and content elements',
      table: {
        type: {
          summary: 'ReactNode'
        },
        defaultValue: {
          summary: 'None'
        }
      }
    }
  }
} satisfies Meta<DialogStoryProps>;

export default meta;

type Story = StoryObj<DialogStoryProps>;

export const basic_dialog: Story = {
  args: {
    defaultOpen: false
  },
  render: function BasicDialogStory(args) {
    return (
      <Dialog {...args}>
        <Dialog.Trigger asChild>
          <Button>Open dialog</Button>
        </Dialog.Trigger>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>Delete this project?</Dialog.Title>
          </Dialog.Header>
          <Dialog.Body>This action cannot be undone.</Dialog.Body>
          <Dialog.Footer>
            <Button variant='secondary'>Cancel</Button>
            <Button variant='primary'>Delete</Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog>
    );
  }
} satisfies Story;

export const with_description: Story = {
  args: {
    defaultOpen: false
  },
  render: function WithDescriptionStory(args) {
    return (
      <Dialog {...args}>
        <Dialog.Trigger asChild>
          <Button>Invite collaborator</Button>
        </Dialog.Trigger>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>Invite collaborator</Dialog.Title>
            <Dialog.Description>
              They will receive an email invitation immediately.
            </Dialog.Description>
          </Dialog.Header>
          <Dialog.Body>
            Use a valid company email address to continue.
          </Dialog.Body>
        </Dialog.Content>
      </Dialog>
    );
  }
} satisfies Story;

export const controlled_dialog: Story = {
  args: {
    defaultOpen: false
  },
  render: function ControlledDialogStory(args) {
    const [open, setOpen] = useState(Boolean(args.defaultOpen));

    useEffect(() => {
      if (args.open === undefined) {
        setOpen(Boolean(args.defaultOpen));
      }
    }, [args.defaultOpen, args.open]);

    const resolvedOpen = args.open ?? open;
    const handleOpenChange = (nextOpen: boolean) => {
      if (args.open === undefined) {
        setOpen(nextOpen);
      }

      args.onOpenChange?.(nextOpen);
    };

    return (
      <div style={{ display: 'grid', gap: 12 }}>
        <Button onClick={() => handleOpenChange(true)}>
          Open controlled dialog
        </Button>
        <Dialog open={resolvedOpen} onOpenChange={handleOpenChange}>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Settings saved</Dialog.Title>
              <Dialog.Description>
                Your workspace preferences have been updated.
              </Dialog.Description>
            </Dialog.Header>
            <Dialog.Footer>
              <Button
                variant='secondary'
                onClick={() => handleOpenChange(false)}
              >
                Close
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog>
      </div>
    );
  }
} satisfies Story;
