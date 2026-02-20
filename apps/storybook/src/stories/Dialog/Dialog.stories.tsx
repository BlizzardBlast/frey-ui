import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button, Dialog, type DialogProps } from 'frey-ui';
import type React from 'react';
import { useState } from 'react';

const StoryDialog = Dialog as unknown as React.ComponentType<DialogProps>;

const meta: Meta<DialogProps> = {
  component: StoryDialog,
  parameters: {
    layout: 'centered'
  },
  argTypes: {
    closeOnEscape: {
      control: { type: 'boolean' },
      description: 'Whether Escape closes the dialog'
    },
    closeOnOverlayClick: {
      control: { type: 'boolean' },
      description: 'Whether backdrop click closes the dialog'
    }
  }
} satisfies Meta<DialogProps>;

export default meta;

type Story = StoryObj<DialogProps>;

export const basic_dialog: Story = {
  render: function BasicDialogStory(args) {
    const [open, setOpen] = useState(false);

    return (
      <div style={{ display: 'grid', gap: 12 }}>
        <Button onClick={() => setOpen(true)}>Open dialog</Button>
        {open && (
          <StoryDialog
            {...args}
            open={open}
            onOpenChange={setOpen}
            title='Delete this project?'
          >
            This action cannot be undone.
          </StoryDialog>
        )}
      </div>
    );
  },
  args: {
    closeOnEscape: true,
    closeOnOverlayClick: true
  }
} satisfies Story;

export const with_description: Story = {
  render: function WithDescriptionStory(args) {
    const [open, setOpen] = useState(false);

    return (
      <div style={{ display: 'grid', gap: 12 }}>
        <Button onClick={() => setOpen(true)}>Invite collaborator</Button>
        {open && (
          <StoryDialog
            {...args}
            open={open}
            onOpenChange={setOpen}
            title='Invite collaborator'
            description='They will receive an email invitation immediately.'
          >
            Use a valid company email address to continue.
          </StoryDialog>
        )}
      </div>
    );
  },
  args: {
    closeOnEscape: true,
    closeOnOverlayClick: true
  }
} satisfies Story;

export const controlled_dialog: Story = {
  render: function ControlledDialogStory(args) {
    const [open, setOpen] = useState(false);

    return (
      <div style={{ display: 'grid', gap: 12 }}>
        <Button onClick={() => setOpen(true)}>Open dialog</Button>
        {open && (
          <StoryDialog
            {...args}
            open={open}
            onOpenChange={setOpen}
            title='Settings saved'
            description='Your workspace preferences have been updated.'
          >
            <div
              style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}
            >
              <Button variant='secondary' onClick={() => setOpen(false)}>
                Close
              </Button>
            </div>
          </StoryDialog>
        )}
      </div>
    );
  },
  args: {
    closeOnEscape: true,
    closeOnOverlayClick: true
  }
} satisfies Story;
