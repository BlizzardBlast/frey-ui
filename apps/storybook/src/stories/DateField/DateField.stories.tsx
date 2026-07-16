import type { Meta, StoryObj } from '@storybook/react-vite';
import type { DateFieldProps, DateValue } from 'frey-ui';
import { DateField } from 'frey-ui';
import { useState } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';

const meta: Meta<DateFieldProps> = {
  component: DateField,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A locale-aware segmented date field. Public values and native form values are always strict ISO `YYYY-MM-DD` strings, while `locale` and `calendar` control presentation only. The root `className` and `style` target the Field wrapper; `controlClassName`, `controlStyle`, the root id, and the forwarded ref target the segmented control.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: 420, maxWidth: '100%' }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    label: {
      control: 'text',
      description: 'Accessible label for the complete segmented date field.',
      table: { type: { summary: 'string' }, defaultValue: { summary: 'None' } },
    },
    value: {
      control: 'text',
      description:
        'Controlled strict ISO date. `null` is controlled empty; `undefined` is uncontrolled.',
      table: {
        type: { summary: 'DateValue | null' },
        defaultValue: { summary: 'undefined' },
      },
    },
    defaultValue: {
      control: 'text',
      description: 'Initial strict ISO date for uncontrolled usage.',
      table: {
        type: { summary: 'DateValue | null' },
        defaultValue: { summary: 'null' },
      },
    },
    onValueChange: {
      action: 'date changed',
      description: 'Called only with a complete selectable ISO date or `null`.',
      table: {
        type: { summary: '(value: DateValue | null) => void' },
        defaultValue: { summary: 'None' },
      },
    },
    minValue: {
      control: 'text',
      description: 'Inclusive minimum ISO date.',
      table: {
        type: { summary: 'DateValue' },
        defaultValue: { summary: 'None' },
      },
    },
    maxValue: {
      control: 'text',
      description: 'Inclusive maximum ISO date.',
      table: {
        type: { summary: 'DateValue' },
        defaultValue: { summary: 'None' },
      },
    },
    isDateUnavailable: {
      control: false,
      description: 'Marks otherwise in-range ISO dates as unavailable.',
      table: {
        type: { summary: '(value: DateValue) => boolean' },
        defaultValue: { summary: 'None' },
      },
    },
    locale: {
      control: 'text',
      description:
        'BCP 47 locale for segment order, digits, separators, labels, and direction.',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'Browser locale; en-US during SSR' },
      },
    },
    calendar: {
      control: 'select',
      options: [
        'gregory',
        'buddhist',
        'japanese',
        'roc',
        'persian',
        'islamic-civil',
        'hebrew',
      ],
      description: 'Display calendar. The public value remains ISO Gregorian.',
      table: {
        type: {
          summary:
            "'gregory' | 'buddhist' | 'japanese' | 'roc' | 'persian' | 'islamic-civil' | 'hebrew'",
        },
        defaultValue: { summary: "'gregory'" },
      },
    },
    segmentLabels: {
      control: 'object',
      description: 'Accessible label overrides for era, year, month, and day.',
      table: {
        type: { summary: 'DateSegmentLabels' },
        defaultValue: { summary: 'English labels' },
      },
    },
    showClearButton: {
      control: 'boolean',
      description: 'Whether optional editable values show a clear action.',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'true' },
      },
    },
    clearButtonLabel: {
      control: 'text',
      description: 'Accessible label for the clear action.',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: "'Clear date'" },
      },
    },
    hideLabel: {
      control: 'boolean',
      description: 'Visually hides the field label while preserving its name.',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    helperText: {
      control: 'text',
      description: 'Supporting text associated with the segmented group.',
      table: { type: { summary: 'string' }, defaultValue: { summary: 'None' } },
    },
    error: {
      control: 'text',
      description: 'Consumer-owned visible error text and invalid state.',
      table: { type: { summary: 'string' }, defaultValue: { summary: 'None' } },
    },
    disabled: {
      control: 'boolean',
      description: 'Disables every segment and native form submission.',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    readOnly: {
      control: 'boolean',
      description: 'Prevents typing, stepping, paste, and clear behavior.',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    required: {
      control: 'boolean',
      description:
        'Marks empty and incomplete drafts invalid for native forms.',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    name: {
      control: 'text',
      description: 'Name for the single hidden ISO form value.',
      table: { type: { summary: 'string' }, defaultValue: { summary: 'None' } },
    },
    id: {
      control: 'text',
      description: 'Id for the segmented control and derived field messages.',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'Generated' },
      },
    },
    className: {
      control: 'text',
      description: 'Additional class names for the Field wrapper.',
      table: { type: { summary: 'string' }, defaultValue: { summary: 'None' } },
    },
    style: {
      control: 'object',
      description: 'Inline styles for the Field wrapper.',
      table: {
        type: { summary: 'CSSProperties' },
        defaultValue: { summary: 'None' },
      },
    },
    controlClassName: {
      control: 'text',
      description: 'Additional class names for the segmented control div.',
      table: { type: { summary: 'string' }, defaultValue: { summary: 'None' } },
    },
    controlStyle: {
      control: 'object',
      description: 'Inline styles for the segmented control div.',
      table: {
        type: { summary: 'CSSProperties' },
        defaultValue: { summary: 'None' },
      },
    },
  },
} satisfies Meta<DateFieldProps>;

export default meta;
type Story = StoryObj<DateFieldProps>;

export const basic: Story = {
  args: {
    label: 'Start date',
    defaultValue: '2024-03-20',
    helperText: 'Use arrow keys to move and adjust date segments.',
    onValueChange: fn(),
  },
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Clear date' }));
    await expect(args.onValueChange).toHaveBeenCalledWith(null);
    await expect(canvas.getByRole('spinbutton', { name: 'Month' })).toHaveValue(
      ''
    );
  },
} satisfies Story;

export const controlled: Story = {
  args: {
    label: 'Settlement date',
    defaultValue: '2024-03-20',
    onValueChange: fn(),
  },
  render: function ControlledDateFieldStory(args) {
    const [value, setValue] = useState<DateValue | null>(
      args.value ?? args.defaultValue ?? null
    );
    return (
      <div style={{ display: 'grid', gap: 8 }}>
        <DateField
          {...args}
          value={value}
          onValueChange={(nextValue) => {
            setValue(nextValue);
            args.onValueChange?.(nextValue);
          }}
        />
        <output>ISO value: {value ?? 'empty'}</output>
      </div>
    );
  },
  play: async ({ canvas, args }) => {
    const day = canvas.getByRole('spinbutton', { name: 'Day' });
    await userEvent.clear(day);
    await userEvent.type(day, '21');
    await expect(canvas.getByText('ISO value: 2024-03-21')).toBeVisible();
    await expect(args.onValueChange).toHaveBeenCalledWith('2024-03-21');
  },
} satisfies Story;

export const partial_entry_and_paste: Story = {
  args: {
    label: 'Invoice date',
    defaultValue: '2024-03-20',
    name: 'invoice-date',
    onValueChange: fn(),
  },
  play: async ({ canvas, args }) => {
    const day = canvas.getByRole('spinbutton', { name: 'Day' });
    await userEvent.clear(day);
    await expect(day).toHaveValue('');
    await expect(
      canvas.getByRole('group', { name: 'Invoice date' })
    ).toHaveAttribute('aria-invalid', 'true');
    await expect(args.onValueChange).not.toHaveBeenCalled();

    const month = canvas.getByRole('spinbutton', { name: 'Month' });
    await userEvent.click(month);
    await userEvent.paste('04/21/2025');
    await expect(args.onValueChange).toHaveBeenCalledWith('2025-04-21');
  },
} satisfies Story;

export const calendar_systems: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16 }}>
      <DateField label='Gregorian' value='2024-03-20' calendar='gregory' />
      <DateField
        label='Buddhist'
        value='2024-03-20'
        calendar='buddhist'
        locale='th-TH'
      />
      <DateField
        label='Japanese'
        value='2019-05-01'
        calendar='japanese'
        locale='ja-JP'
      />
      <DateField label='ROC' value='2024-03-20' calendar='roc' locale='zh-TW' />
      <DateField
        label='Persian'
        value='2024-03-20'
        calendar='persian'
        locale='fa-IR'
      />
      <DateField
        label='Islamic Civil'
        value='2024-03-20'
        calendar='islamic-civil'
        locale='ar-EG'
      />
      <DateField
        label='Hebrew'
        value='2024-10-03'
        calendar='hebrew'
        locale='he-IL'
      />
    </div>
  ),
} satisfies Story;

export const localized_digits_and_rtl: Story = {
  args: {
    label: 'Persian date',
    calendar: 'persian',
    locale: 'fa-IR',
    onValueChange: fn(),
  },
  render: function LocalizedDigitsAndRtlStory(args) {
    const [value, setValue] = useState<DateValue | null>(null);
    return (
      <div style={{ display: 'grid', gap: 8 }}>
        <DateField
          {...args}
          value={value}
          onValueChange={(nextValue) => {
            setValue(nextValue);
            args.onValueChange?.(nextValue);
          }}
        />
        <output>Localized ISO: {value ?? 'empty'}</output>
      </div>
    );
  },
  play: async ({ canvas, args }) => {
    const group = canvas.getByRole('group', { name: 'Persian date' });
    await userEvent.click(
      within(group).getByRole('spinbutton', { name: 'Year' })
    );
    await userEvent.paste('۱/۲/۱۴۰۳ هجری شمسی');
    await expect(canvas.getByText('Localized ISO: 2024-03-21')).toBeVisible();
    await expect(args.onValueChange).toHaveBeenCalledWith('2024-03-21');
  },
} satisfies Story;

export const constraints_and_consumer_error: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16 }}>
      <DateField
        label='Booking date'
        value='2024-03-20'
        minValue='2024-03-01'
        maxValue='2024-03-31'
        isDateUnavailable={(value) => value === '2024-03-24'}
        helperText='March 2024, except March 24.'
      />
      <DateField
        label='Reviewed date'
        value='2024-03-20'
        error='Confirm this date with the account owner.'
      />
    </div>
  ),
} satisfies Story;

export const field_states_and_form_data: Story = {
  render: function FieldStatesAndFormDataStory() {
    const [submittedValue, setSubmittedValue] = useState('Not submitted');
    return (
      <form
        style={{ display: 'grid', gap: 16 }}
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          setSubmittedValue(String(data.get('report-date')));
        }}
      >
        <DateField
          label='Report date'
          name='report-date'
          defaultValue='2024-03-20'
          required
        />
        <DateField label='Archived date' value='2023-12-31' readOnly />
        <DateField label='Unavailable date field' value='2024-01-01' disabled />
        <button type='submit'>Submit date</button>
        <output>Submitted ISO: {submittedValue}</output>
      </form>
    );
  },
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Submit date' }));
    await expect(canvas.getByText('Submitted ISO: 2024-03-20')).toBeVisible();
  },
} satisfies Story;

export const focus_geometry: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16 }}>
      <DateField
        label='Gregorian focus geometry'
        value='2024-03-20'
        showClearButton={false}
      />
      <DateField
        label='Persian focus geometry'
        value='2024-03-21'
        calendar='persian'
        locale='fa-IR'
        showClearButton={false}
      />
      <DateField
        label='Japanese focus geometry'
        value='2019-05-01'
        calendar='japanese'
        locale='ja-JP'
        showClearButton={false}
      />
    </div>
  ),
  play: async ({ canvas }) => {
    await userEvent.tab();

    const group = canvas.getByRole('group', {
      name: 'Gregorian focus geometry',
    });
    await expect(
      within(group).getByRole('spinbutton', { name: 'Month' })
    ).toHaveFocus();
  },
} satisfies Story;

export const browser_proof: Story = {
  render: function BrowserProofStory() {
    const [value, setValue] = useState<DateValue | null>('2024-01-31');
    const [submittedValue, setSubmittedValue] = useState('Not submitted');
    return (
      <form
        style={{ display: 'grid', gap: 12 }}
        onSubmit={(event) => {
          event.preventDefault();
          setSubmittedValue(
            String(new FormData(event.currentTarget).get('browser-proof-date'))
          );
        }}
      >
        <DateField
          label='Browser proof date'
          name='browser-proof-date'
          value={value}
          onValueChange={setValue}
        />
        <output>Current ISO: {value ?? 'empty'}</output>
        <button type='submit'>Submit browser proof</button>
        <output>Submitted ISO: {submittedValue}</output>
      </form>
    );
  },
} satisfies Story;
