import type { Meta, StoryObj } from '@storybook/react-vite';
import { Field } from 'frey-ui';
import { useState } from 'react';

const baseInputStyle = {
  width: '100%',
  border: '1px solid var(--frey-color-border-default, #cbd5e1)',
  borderRadius: 8,
  padding: '0.5rem 0.75rem',
  backgroundColor: 'var(--frey-color-surface-primary, #ffffff)',
  color: 'var(--frey-color-text-primary, #0f172a)'
} as const;

const meta: Meta<typeof Field> = {
  component: Field,
  parameters: {
    layout: 'centered'
  },
  decorators: [
    (Story) => (
      <div style={{ width: 360 }}>
        <Story />
      </div>
    )
  ],
  argTypes: {
    labelElement: {
      control: { type: 'select' },
      options: ['label', 'span']
    },
    children: {
      table: {
        disable: true
      }
    }
  }
} satisfies Meta<typeof Field>;

export default meta;

type Story = StoryObj<typeof Field>;

export const basic_field: Story = {
  args: {
    label: 'Email address',
    helperText: 'We only use this for account notifications.'
  },
  render: (args) => (
    <Field {...args}>
      {({ inputId, describedBy, hasError }) => (
        <input
          id={inputId}
          type='email'
          placeholder='you@example.com'
          aria-describedby={describedBy}
          aria-invalid={hasError || undefined}
          style={baseInputStyle}
        />
      )}
    </Field>
  )
} satisfies Story;

export const with_error: Story = {
  args: {
    label: 'Username',
    error: 'That username is already taken.'
  },
  render: (args) => (
    <Field {...args}>
      {({ inputId, describedBy, hasError }) => (
        <input
          id={inputId}
          type='text'
          defaultValue='frey-ui'
          aria-describedby={describedBy}
          aria-invalid={hasError || undefined}
          style={baseInputStyle}
        />
      )}
    </Field>
  )
} satisfies Story;

export const grouped_controls: Story = {
  args: {
    label: 'Theme preference',
    labelElement: 'span',
    helperText: 'Use arrow keys to navigate choices.'
  },
  render: (args) => (
    <Field {...args}>
      {({ labelId, describedBy }) => (
        <div
          role='radiogroup'
          aria-labelledby={labelId}
          aria-describedby={describedBy}
          style={{ display: 'grid', gap: 8 }}
        >
          <label style={{ display: 'flex', gap: 8 }}>
            <input type='radio' name='theme' defaultChecked />
            <span>System</span>
          </label>
          <label style={{ display: 'flex', gap: 8 }}>
            <input type='radio' name='theme' />
            <span>Light</span>
          </label>
          <label style={{ display: 'flex', gap: 8 }}>
            <input type='radio' name='theme' />
            <span>Dark</span>
          </label>
        </div>
      )}
    </Field>
  )
} satisfies Story;

export const controlled_field: Story = {
  render: function ControlledFieldStory(args) {
    const [value, setValue] = useState('');
    const hasError = value.length > 0 && value.length < 3;

    return (
      <Field
        {...args}
        label='Project key'
        helperText='Minimum 3 characters.'
        error={hasError ? 'Project key is too short.' : undefined}
      >
        {({ inputId, describedBy, hasError: invalid }) => (
          <input
            id={inputId}
            type='text'
            value={value}
            onChange={(event) => setValue(event.target.value)}
            aria-describedby={describedBy}
            aria-invalid={invalid || undefined}
            style={baseInputStyle}
          />
        )}
      </Field>
    );
  }
} satisfies Story;
