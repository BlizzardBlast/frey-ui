import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  DatePicker,
  type DatePickerProps,
  type DateValue,
  ThemeProvider,
} from 'frey-ui';
import { useState } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';

const meta: Meta<DatePickerProps> = {
  component: DatePicker,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A dependency-free, locale-aware single-date picker that composes DateField, Calendar, and Popover. Segmented entry and calendar selection share one strict ISO `YYYY-MM-DD` value; display calendars affect presentation only.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: 420, maxWidth: 'calc(100vw - 32px)' }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    label: {
      control: 'text',
      description: 'Accessible label for the complete date picker field.',
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
      description: 'Called with a complete selectable ISO date or `null`.',
      table: {
        type: { summary: '(value: DateValue | null) => void' },
        defaultValue: { summary: 'None' },
      },
    },
    minValue: {
      control: 'text',
      description: 'Inclusive minimum ISO date.',
      table: { type: { summary: 'DateValue' }, defaultValue: { summary: 'None' } },
    },
    maxValue: {
      control: 'text',
      description: 'Inclusive maximum ISO date.',
      table: { type: { summary: 'DateValue' }, defaultValue: { summary: 'None' } },
    },
    isDateUnavailable: {
      control: false,
      description: 'Marks otherwise in-range ISO dates unavailable.',
      table: {
        type: { summary: '(value: DateValue) => boolean' },
        defaultValue: { summary: 'None' },
      },
    },
    locale: {
      control: 'text',
      description: 'BCP 47 locale for order, digits, labels, and direction.',
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
      description: 'Display calendar; public and form values remain ISO.',
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
      description: 'Accessible label overrides for date segments.',
      table: {
        type: { summary: 'DateSegmentLabels' },
        defaultValue: { summary: 'English labels' },
      },
    },
    showClearButton: {
      control: 'boolean',
      description: 'Whether optional editable values show a clear action.',
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'true' } },
    },
    clearButtonLabel: {
      control: 'text',
      description: 'Accessible label for the clear action.',
      table: { type: { summary: 'string' }, defaultValue: { summary: "'Clear date'" } },
    },
    hideLabel: {
      control: 'boolean',
      description: 'Visually hides the field label while preserving its name.',
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'false' } },
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
      description: 'Disables entry, clear, trigger, selection, and form data.',
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'false' } },
    },
    readOnly: {
      control: 'boolean',
      description: 'Allows calendar inspection without any value mutation.',
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'false' } },
    },
    required: {
      control: 'boolean',
      description: 'Marks empty or incomplete values invalid and hides clear.',
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'false' } },
    },
    name: {
      control: 'text',
      description: 'Name for the single hidden ISO form value.',
      table: { type: { summary: 'string' }, defaultValue: { summary: 'None' } },
    },
    id: {
      control: 'text',
      description: 'Id for the segmented control and derived field messages.',
      table: { type: { summary: 'string' }, defaultValue: { summary: 'Generated' } },
    },
    className: {
      control: 'text',
      description: 'Additional class names for the Field wrapper.',
      table: { type: { summary: 'string' }, defaultValue: { summary: 'None' } },
    },
    style: {
      control: 'object',
      description: 'Inline styles for the Field wrapper.',
      table: { type: { summary: 'CSSProperties' }, defaultValue: { summary: 'None' } },
    },
    controlClassName: {
      control: 'text',
      description: 'Additional class names for the segmented control div.',
      table: { type: { summary: 'string' }, defaultValue: { summary: 'None' } },
    },
    controlStyle: {
      control: 'object',
      description: 'Inline styles for the segmented control div.',
      table: { type: { summary: 'CSSProperties' }, defaultValue: { summary: 'None' } },
    },
    open: {
      control: 'boolean',
      description: 'Controlled popover open state.',
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'undefined' } },
    },
    defaultOpen: {
      control: 'boolean',
      description: 'Initial popover state for uncontrolled usage.',
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'false' } },
    },
    onOpenChange: {
      action: 'open changed',
      description: 'Called whenever the requested popover state changes.',
      table: {
        type: { summary: '(open: boolean) => void' },
        defaultValue: { summary: 'None' },
      },
    },
    defaultFocusedValue: {
      control: 'text',
      description: 'Initial focused ISO date when no selected value exists.',
      table: { type: { summary: 'DateValue' }, defaultValue: { summary: 'None' } },
    },
    today: {
      control: 'text',
      description: 'ISO date treated as today; defaults to the local date.',
      table: { type: { summary: 'DateValue' }, defaultValue: { summary: 'Current local date' } },
    },
    firstDayOfWeek: {
      control: 'select',
      options: ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'],
      description: 'Overrides the locale-derived first weekday.',
      table: {
        type: { summary: "'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat'" },
        defaultValue: { summary: 'Locale week data' },
      },
    },
    calendarLabel: {
      control: 'text',
      description: 'Accessible name for the calendar dialog and grid.',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'Field label followed by calendar' },
      },
    },
    previousMonthLabel: {
      control: 'text',
      description: 'Accessible label for previous-month navigation.',
      table: { type: { summary: 'string' }, defaultValue: { summary: "'Previous month'" } },
    },
    nextMonthLabel: {
      control: 'text',
      description: 'Accessible label for next-month navigation.',
      table: { type: { summary: 'string' }, defaultValue: { summary: "'Next month'" } },
    },
    getCalendarButtonLabel: {
      control: false,
      description: 'Localizes the trigger name from the formatted value.',
      table: {
        type: { summary: '(formattedValue: string | null) => string' },
        defaultValue: { summary: 'Choose date / Change date, {value}' },
      },
    },
  },
} satisfies Meta<DatePickerProps>;

export default meta;
type Story = StoryObj<DatePickerProps>;

export const basic_selection_and_clearing: Story = {
  args: {
    label: 'Appointment date',
    defaultValue: '2024-03-20',
    today: '2024-03-15',
    helperText: 'Type a date or choose one from the calendar.',
    onValueChange: fn(),
    onOpenChange: fn(),
  },
  play: async ({ canvas, canvasElement, args }) => {
    await userEvent.click(
      canvas.getByRole('button', { name: 'Change date, March 20, 2024' })
    );
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(page.getByRole('button', { name: 'March 21, 2024' }));
    await expect(args.onValueChange).toHaveBeenCalledWith('2024-03-21');
    await expect(page.queryByRole('dialog')).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'Clear date' }));
    await expect(args.onValueChange).toHaveBeenCalledWith(null);
  },
} satisfies Story;

export const controlled_segmented_entry: Story = {
  args: {
    label: 'Settlement date',
    defaultValue: '2024-03-20',
    today: '2024-03-15',
    onValueChange: fn(),
  },
  render: function ControlledDatePickerStory(args) {
    const [value, setValue] = useState<DateValue | null>(
      args.value ?? args.defaultValue ?? null
    );
    return (
      <div style={{ display: 'grid', gap: 8 }}>
        <DatePicker
          {...args}
          value={value}
          onValueChange={(nextValue) => {
            setValue(nextValue);
            args.onValueChange?.(nextValue);
          }}
        />
        <output>Controlled ISO: {value ?? 'empty'}</output>
      </div>
    );
  },
  play: async ({ canvas, args }) => {
    const day = canvas.getByRole('spinbutton', { name: 'Day' });
    await userEvent.click(day);
    await userEvent.keyboard('{ArrowUp}');
    await expect(canvas.getByText('Controlled ISO: 2024-03-21')).toBeVisible();
    await expect(args.onValueChange).toHaveBeenCalledWith('2024-03-21');
  },
} satisfies Story;

export const constraints_and_consumer_error: Story = {
  args: {
    label: 'Booking date',
    defaultValue: '2024-03-20',
    today: '2024-03-15',
    minValue: '2024-03-10',
    maxValue: '2024-03-31',
    isDateUnavailable: (value) => value === '2024-03-24',
    helperText: 'March 10-31, except March 24.',
    error: 'Confirm the date with the account owner.',
    onValueChange: fn(),
  },
  play: async ({ canvas, canvasElement, args }) => {
    await userEvent.click(
      canvas.getByRole('button', { name: 'Change date, March 20, 2024' })
    );
    const page = within(canvasElement.ownerDocument.body);
    const unavailable = page.getByRole('button', { name: 'March 24, 2024' });
    await expect(unavailable).toHaveAttribute('aria-disabled', 'true');
    await userEvent.click(unavailable);
    await expect(args.onValueChange).not.toHaveBeenCalled();
    await expect(page.getByRole('dialog')).toBeVisible();
  },
} satisfies Story;

export const required_disabled_and_read_only: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16 }}>
      <DatePicker label='Required date' value='2024-03-20' required />
      <DatePicker label='Disabled date' value='2024-03-20' disabled />
      <DatePicker label='Read-only date' value='2024-03-20' readOnly />
    </div>
  ),
} satisfies Story;

export const seven_calendars: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: 16,
        width: 'min(1000px, 94vw)',
      }}
    >
      <DatePicker label='Gregorian' value='2024-03-20' calendar='gregory' />
      <DatePicker label='Buddhist' value='2024-03-20' calendar='buddhist' locale='th-TH' />
      <DatePicker label='Japanese' value='2019-05-01' calendar='japanese' locale='ja-JP' />
      <DatePicker label='ROC' value='2024-03-20' calendar='roc' locale='zh-TW' />
      <DatePicker label='Persian' value='2024-03-20' calendar='persian' locale='fa-IR' />
      <DatePicker label='Islamic Civil' value='2024-03-20' calendar='islamic-civil' locale='ar-EG' />
      <DatePicker label='Hebrew' value='2024-02-10' calendar='hebrew' locale='he-IL' />
    </div>
  ),
  parameters: { layout: 'fullscreen' },
} satisfies Story;

export const localized_digits_first_day_and_rtl: Story = {
  args: {
    label: 'Persian appointment date',
    value: '2024-03-20',
    today: '2024-03-15',
    calendar: 'persian',
    locale: 'fa-IR',
    firstDayOfWeek: 'sat',
    getCalendarButtonLabel: (formattedValue) =>
      `تقویم، ${formattedValue ?? 'بدون تاریخ'}`,
  },
} satisfies Story;

export const themes: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16 }}>
      <ThemeProvider theme='light'>
        <DatePicker label='Light date' value='2024-03-20' />
      </ThemeProvider>
      <ThemeProvider theme='dark'>
        <DatePicker label='Dark date' value='2024-03-20' />
      </ThemeProvider>
      <ThemeProvider theme='dark' highContrast>
        <DatePicker label='High contrast date' value='2024-03-20' />
      </ThemeProvider>
    </div>
  ),
} satisfies Story;

export const narrow_viewport: Story = {
  args: {
    label: 'Mobile booking date',
    defaultValue: '2024-03-20',
    today: '2024-03-15',
  },
  decorators: [
    (Story) => (
      <div style={{ width: 320, maxWidth: 'calc(100vw - 16px)' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Story;

export const browser_proof: Story = {
  render: function BrowserProofDatePickerStory() {
    const [value, setValue] = useState<DateValue | null>('2024-03-20');
    const [submittedValue, setSubmittedValue] = useState('Not submitted');
    return (
      <form
        style={{ display: 'grid', gap: 12 }}
        onSubmit={(event) => {
          event.preventDefault();
          setSubmittedValue(
            String(new FormData(event.currentTarget).get('browser-picker-date'))
          );
        }}
      >
        <DatePicker
          label='Browser picker date'
          name='browser-picker-date'
          value={value}
          onValueChange={setValue}
          today='2024-03-15'
          firstDayOfWeek='mon'
          isDateUnavailable={(date) => date === '2024-03-25'}
        />
        <output>Current picker ISO: {value ?? 'empty'}</output>
        <button type='submit'>Submit picker date</button>
        <output>Submitted picker ISO: {submittedValue}</output>
      </form>
    );
  },
} satisfies Story;
