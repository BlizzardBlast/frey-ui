import type { Meta, StoryObj } from '@storybook/react-vite';
import type { RadioGroupProps } from 'frey-ui';
import { RadioGroup } from 'frey-ui';
import type React from 'react';
import { useState } from 'react';

const StoryRadioGroup =
  RadioGroup as unknown as React.ComponentType<RadioGroupProps>;

const meta: Meta<RadioGroupProps> = {
  component: StoryRadioGroup,
  parameters: {
    layout: 'centered'
  },
  decorators: [
    (Story) => (
      <div style={{ width: 360 }}>
        <Story />
      </div>
    )
  ]
} satisfies Meta<RadioGroupProps>;

export default meta;

type Story = StoryObj<RadioGroupProps>;

const planOptions: RadioGroupProps['options'] = [
  {
    label: 'Starter',
    value: 'starter',
    description: 'Good for small teams'
  },
  {
    label: 'Growth',
    value: 'growth',
    description: 'Best for scaling products'
  },
  {
    label: 'Enterprise',
    value: 'enterprise',
    description: 'Advanced security and support'
  }
];

export const basic_radio_group: Story = {
  args: {
    label: 'Plan',
    options: planOptions,
    defaultValue: 'growth'
  }
} satisfies Story;

export const horizontal: Story = {
  args: {
    label: 'Environment',
    orientation: 'horizontal',
    options: [
      { label: 'Development', value: 'dev' },
      { label: 'Staging', value: 'staging' },
      { label: 'Production', value: 'prod' }
    ]
  }
} satisfies Story;

export const with_error: Story = {
  args: {
    label: 'Billing cycle',
    options: [
      { label: 'Monthly', value: 'monthly' },
      { label: 'Yearly', value: 'yearly' }
    ],
    error: 'Please choose a billing cycle.'
  }
} satisfies Story;

export const disabled: Story = {
  args: {
    label: 'Readonly options',
    options: planOptions,
    defaultValue: 'starter',
    disabled: true
  }
} satisfies Story;

export const controlled: Story = {
  render: function ControlledRadioGroup() {
    const [value, setValue] = useState('starter');

    return (
      <div style={{ display: 'grid', gap: 8 }}>
        <StoryRadioGroup
          label='Selected plan'
          options={planOptions}
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
        <small>Current selection: {value}</small>
      </div>
    );
  }
} satisfies Story;
