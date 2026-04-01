import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card, Tabs, type TabsProps } from 'frey-ui';
import { useEffect, useState } from 'react';

type TabsStoryProps = Pick<
  TabsProps,
  'value' | 'defaultValue' | 'onValueChange'
>;

const meta: Meta<TabsStoryProps> = {
  component: Tabs,
  parameters: {
    layout: 'centered'
  },
  argTypes: {
    value: {
      control: { type: 'text' },
      description: 'Controlled active tab value',
      table: {
        type: {
          summary: 'string'
        },
        defaultValue: {
          summary: 'None'
        }
      }
    },
    defaultValue: {
      control: { type: 'text' },
      description: 'Initial active tab value when uncontrolled',
      table: {
        type: {
          summary: 'string'
        },
        defaultValue: {
          summary: 'None'
        }
      }
    },
    onValueChange: {
      action: 'tab changed',
      description: 'Called when the active tab value changes',
      table: {
        type: {
          summary: '(value: string) => void'
        },
        defaultValue: {
          summary: 'None'
        }
      }
    }
  }
} satisfies Meta<TabsStoryProps>;

export default meta;

type Story = StoryObj<TabsStoryProps>;

export const basic: Story = {
  args: {
    defaultValue: 'account'
  },
  render: (args) => (
    <Card style={{ width: 400 }}>
      <Card.Content>
        <Tabs {...args}>
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
  args: {
    defaultValue: 'billing'
  },
  render: function ControlledStory(args) {
    const [tab, setTab] = useState(args.defaultValue ?? 'billing');

    useEffect(() => {
      if (args.value === undefined) {
        setTab(args.defaultValue ?? 'billing');
      }
    }, [args.defaultValue, args.value]);

    const resolvedTab = args.value ?? tab;
    const handleValueChange = (nextValue: string) => {
      if (args.value === undefined) {
        setTab(nextValue);
      }

      args.onValueChange?.(nextValue);
    };

    return (
      <Card style={{ width: 400 }}>
        <Card.Header>
          <Card.Title>Settings</Card.Title>
        </Card.Header>
        <Card.Content>
          <Tabs value={resolvedTab} onValueChange={handleValueChange}>
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
