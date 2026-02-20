import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button, Dialog, type DialogProps } from 'frey-ui';
import { useState } from 'react';

const meta: Meta<DialogProps> = {
  component: Dialog,
  parameters: {
    layout: 'centered'
  }
} satisfies Meta<DialogProps>;

export default meta;

type Story = StoryObj<DialogProps>;

export const basic_dialog: Story = {
  render: function BasicDialogStory() {
    return (
      <Dialog>
        <Dialog.Trigger>
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
  render: function WithDescriptionStory() {
    return (
      <Dialog>
        <Dialog.Trigger>
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
  render: function ControlledDialogStory() {
    const [open, setOpen] = useState(false);

    return (
      <div style={{ display: 'grid', gap: 12 }}>
        <Button onClick={() => setOpen(true)}>Open controlled dialog</Button>
        <Dialog open={open} onOpenChange={setOpen}>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Settings saved</Dialog.Title>
              <Dialog.Description>
                Your workspace preferences have been updated.
              </Dialog.Description>
            </Dialog.Header>
            <Dialog.Footer>
              <Button variant='secondary' onClick={() => setOpen(false)}>
                Close
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog>
      </div>
    );
  }
} satisfies Story;
