import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button, Card, TextInput } from 'frey-ui';

const meta: Meta<typeof Card> = {
  component: Card,
  parameters: {
    layout: 'centered'
  }
} satisfies Meta<typeof Card>;

export default meta;

type Story = StoryObj<typeof Card>;

export const basic: Story = {
  render: () => (
    <Card style={{ width: 350 }}>
      <Card.Header>
        <Card.Title>Create project</Card.Title>
      </Card.Header>
      <Card.Content>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <TextInput
            label='Project name'
            placeholder='Enter your project name'
          />
        </div>
      </Card.Content>
      <Card.Footer style={{ justifyContent: 'space-between' }}>
        <Button variant='secondary'>Cancel</Button>
        <Button>Deploy</Button>
      </Card.Footer>
    </Card>
  )
} satisfies Story;

export const content_only: Story = {
  render: () => (
    <Card style={{ width: 350 }}>
      <Card.Content>
        <p style={{ margin: 0, color: 'var(--frey-color-text-muted)' }}>
          This card only has content. It does not have a header or footer.
        </p>
      </Card.Content>
    </Card>
  )
} satisfies Story;
