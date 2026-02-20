import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card, Tabs, type TabsProps } from 'frey-ui';
import { useState } from 'react';

const meta: Meta<TabsProps> = {
  component: Tabs,
  parameters: {
    layout: 'centered'
  }
} satisfies Meta<TabsProps>;

export default meta;

type Story = StoryObj<TabsProps>;

export const basic: Story = {
  render: () => (
    <Card style={{ width: 400 }}>
      <Card.Content>
        <Tabs defaultValue='account'>
          <Tabs.List>
            <Tabs.Trigger value='account'>Account</Tabs.Trigger>
            <Tabs.Trigger value='password'>Password</Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content value='account'>
            <p style={{ margin: 0 }}>
              Make changes to your account here. Click save when you're done.
            </p>
          </Tabs.Content>
          <Tabs.Content value='password'>
            <p style={{ margin: 0 }}>
              Change your password here. After saving, you'll be logged out.
            </p>
          </Tabs.Content>
        </Tabs>
      </Card.Content>
    </Card>
  )
} satisfies Story;

export const controlled: Story = {
  render: function ControlledStory() {
    const [tab, setTab] = useState('billing');

    return (
      <Card style={{ width: 400 }}>
        <Card.Header>
          <Card.Title>Settings</Card.Title>
        </Card.Header>
        <Card.Content>
          <Tabs value={tab} onValueChange={setTab}>
            <Tabs.List>
              <Tabs.Trigger value='general'>General</Tabs.Trigger>
              <Tabs.Trigger value='billing'>Billing</Tabs.Trigger>
              <Tabs.Trigger value='notifications'>Notifications</Tabs.Trigger>
            </Tabs.List>
            <Tabs.Content value='general'>
              <p>General settings view.</p>
            </Tabs.Content>
            <Tabs.Content value='billing'>
              <p>Billing information and history.</p>
            </Tabs.Content>
            <Tabs.Content value='notifications'>
              <p>Notification preferences.</p>
            </Tabs.Content>
          </Tabs>
        </Card.Content>
      </Card>
    );
  }
} satisfies Story;
