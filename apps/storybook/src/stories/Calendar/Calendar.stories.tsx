import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Calendar,
  type CalendarProps,
  type DateValue,
  ThemeProvider,
} from 'frey-ui';
import { useState } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';

const meta: Meta<CalendarProps> = {
  component: Calendar,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A locale-aware, single-date calendar grid with a fixed six-week layout. Public values stay strict ISO `YYYY-MM-DD` strings while `calendar` changes only the displayed calendar system. Unavailable and out-of-range dates remain keyboard focusable for context but cannot be selected.',
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
      description: 'Accessible name for the date grid.',
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
      description: 'Initial selected ISO date for uncontrolled usage.',
      table: {
        type: { summary: 'DateValue | null' },
        defaultValue: { summary: 'null' },
      },
    },
    onValueChange: {
      action: 'date changed',
      description: 'Called with the selected ISO date.',
      table: {
        type: { summary: '(value: DateValue | null) => void' },
        defaultValue: { summary: 'None' },
      },
    },
    defaultFocusedValue: {
      control: 'text',
      description:
        'Initial focused ISO date when no selected value determines focus.',
      table: {
        type: { summary: 'DateValue' },
        defaultValue: { summary: 'None' },
      },
    },
    today: {
      control: 'text',
      description:
        'ISO date treated as today; defaults to the current local date.',
      table: {
        type: { summary: 'DateValue' },
        defaultValue: { summary: 'Current local date' },
      },
    },
    minValue: {
      control: 'text',
      description: 'Inclusive minimum selectable ISO date.',
      table: {
        type: { summary: 'DateValue' },
        defaultValue: { summary: 'None' },
      },
    },
    maxValue: {
      control: 'text',
      description: 'Inclusive maximum selectable ISO date.',
      table: {
        type: { summary: 'DateValue' },
        defaultValue: { summary: 'None' },
      },
    },
    isDateUnavailable: {
      control: false,
      description:
        'Marks otherwise in-range ISO dates unavailable without removing them from focus navigation.',
      table: {
        type: { summary: '(value: DateValue) => boolean' },
        defaultValue: { summary: 'None' },
      },
    },
    locale: {
      control: 'text',
      description:
        'BCP 47 locale for labels, digits, week start, and text direction.',
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
      description: 'Display calendar. Selection remains an ISO Gregorian value.',
      table: {
        type: {
          summary:
            "'gregory' | 'buddhist' | 'japanese' | 'roc' | 'persian' | 'islamic-civil' | 'hebrew'",
        },
        defaultValue: { summary: "'gregory'" },
      },
    },
    firstDayOfWeek: {
      control: 'select',
      options: ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'],
      description: 'Overrides the locale-derived first weekday.',
      table: {
        type: {
          summary: "'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat'",
        },
        defaultValue: { summary: 'Locale week data' },
      },
    },
    previousMonthLabel: {
      control: 'text',
      description: 'Accessible label for the previous-month action.',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: "'Previous month'" },
      },
    },
    nextMonthLabel: {
      control: 'text',
      description: 'Accessible label for the next-month action.',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: "'Next month'" },
      },
    },
    disabled: {
      control: 'boolean',
      description: 'Disables selection, focus movement, and month navigation.',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    readOnly: {
      control: 'boolean',
      description:
        'Allows calendar inspection and navigation while preventing selection.',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    className: {
      control: 'text',
      description: 'Additional class names for the outer Calendar div.',
      table: { type: { summary: 'string' }, defaultValue: { summary: 'None' } },
    },
    style: {
      control: 'object',
      description: 'Inline styles for the outer Calendar div.',
      table: {
        type: { summary: 'CSSProperties' },
        defaultValue: { summary: 'None' },
      },
    },
  },
} satisfies Meta<CalendarProps>;

export default meta;
type Story = StoryObj<CalendarProps>;

export const basic: Story = {
  args: {
    label: 'Appointment date',
    defaultValue: '2024-03-20',
    today: '2024-03-15',
    onValueChange: fn(),
  },
  play: async ({ canvas, args }) => {
    await userEvent.click(
      canvas.getByRole('button', { name: 'March 21, 2024' })
    );
    await expect(args.onValueChange).toHaveBeenCalledWith('2024-03-21');
    await expect(
      canvas.getByRole('button', { name: 'March 21, 2024' }).closest('td')
    ).toHaveAttribute('aria-selected', 'true');
  },
} satisfies Story;

export const controlled: Story = {
  args: {
    label: 'Settlement date',
    defaultValue: '2024-03-20',
    today: '2024-03-15',
    onValueChange: fn(),
  },
  render: function ControlledCalendarStory(args) {
    const [value, setValue] = useState<DateValue | null>(
      args.value ?? args.defaultValue ?? null
    );
    return (
      <div style={{ display: 'grid', gap: 8 }}>
        <Calendar
          {...args}
          value={value}
          onValueChange={(nextValue) => {
            setValue(nextValue);
            args.onValueChange?.(nextValue);
          }}
        />
        <output>Selected ISO: {value ?? 'empty'}</output>
      </div>
    );
  },
  play: async ({ canvas, args }) => {
    await userEvent.click(
      canvas.getByRole('button', { name: 'March 22, 2024' })
    );
    await expect(canvas.getByText('Selected ISO: 2024-03-22')).toBeVisible();
    await expect(args.onValueChange).toHaveBeenCalledWith('2024-03-22');
  },
} satisfies Story;

export const calendar_systems: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: 16,
        width: 'min(1100px, 95vw)',
      }}
    >
      <Calendar label='Gregorian calendar' value='2024-03-20' calendar='gregory' />
      <Calendar
        label='Buddhist calendar'
        value='2024-03-20'
        calendar='buddhist'
        locale='th-TH'
      />
      <Calendar
        label='Japanese calendar'
        value='2019-05-01'
        calendar='japanese'
        locale='ja-JP'
      />
      <Calendar
        label='ROC calendar'
        value='2024-03-20'
        calendar='roc'
        locale='zh-TW'
      />
      <Calendar
        label='Persian calendar'
        value='2024-03-20'
        calendar='persian'
        locale='fa-IR'
      />
      <Calendar
        label='Islamic Civil calendar'
        value='2024-03-20'
        calendar='islamic-civil'
        locale='ar-EG'
      />
      <Calendar
        label='Hebrew calendar'
        value='2024-10-03'
        calendar='hebrew'
        locale='he-IL'
      />
    </div>
  ),
  parameters: { layout: 'fullscreen' },
} satisfies Story;

export const localized_digits_and_rtl: Story = {
  args: {
    label: 'Persian appointment date',
    value: '2024-03-20',
    today: '2024-03-21',
    calendar: 'persian',
    locale: 'fa-IR',
    firstDayOfWeek: 'sat',
  },
} satisfies Story;

export const constraints: Story = {
  args: {
    label: 'Available date',
    defaultValue: '2024-03-20',
    today: '2024-03-15',
    minValue: '2024-03-10',
    maxValue: '2024-03-25',
    isDateUnavailable: (value) => value === '2024-03-21',
    onValueChange: fn(),
  },
  play: async ({ canvas, args }) => {
    const unavailable = canvas.getByRole('button', {
      name: 'March 21, 2024',
    });
    await expect(unavailable).toHaveAttribute('aria-disabled', 'true');
    await userEvent.click(unavailable);
    await expect(args.onValueChange).not.toHaveBeenCalled();
    await userEvent.click(
      canvas.getByRole('button', { name: 'March 22, 2024' })
    );
    await expect(args.onValueChange).toHaveBeenCalledWith('2024-03-22');
  },
} satisfies Story;

export const states: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16 }}>
      <Calendar
        label='Read-only calendar'
        value='2024-03-20'
        today='2024-03-15'
        readOnly
      />
      <Calendar
        label='Disabled calendar'
        value='2024-03-20'
        today='2024-03-15'
        disabled
      />
    </div>
  ),
} satisfies Story;

export const themes: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: 16,
        width: 'min(1100px, 95vw)',
      }}
    >
      <ThemeProvider theme='light'>
        <Calendar label='Light calendar' value='2024-03-14' today='2024-03-15' />
      </ThemeProvider>
      <ThemeProvider theme='dark'>
        <Calendar label='Dark calendar' value='2024-03-14' today='2024-03-15' />
      </ThemeProvider>
      <ThemeProvider theme='dark' highContrast>
        <Calendar
          label='High contrast calendar'
          value='2024-03-14'
          today='2024-03-15'
          isDateUnavailable={(value) => value === '2024-03-21'}
        />
      </ThemeProvider>
    </div>
  ),
  parameters: { layout: 'fullscreen' },
} satisfies Story;

export const focus_geometry: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: 16,
        width: 'min(760px, 95vw)',
      }}
    >
      <Calendar
        label='Today after focused date'
        value='2024-03-14'
        today='2024-03-15'
      />
      <Calendar
        label='Today before focused date'
        value='2024-03-15'
        today='2024-03-14'
      />
      <Calendar
        label='RTL today after focused date'
        value='2024-03-20'
        today='2024-03-21'
        calendar='persian'
        locale='fa-IR'
      />
      <Calendar
        label='Focused selected today'
        value='2024-03-15'
        today='2024-03-15'
      />
    </div>
  ),
  parameters: { layout: 'fullscreen' },
  play: async ({ canvas }) => {
    const grid = canvas.getByRole('grid', { name: 'Today after focused date' });
    const selected = within(grid).getByRole('button', {
      name: 'March 14, 2024',
    });

    selected.focus();

    await expect(selected).toHaveFocus();
  },
} satisfies Story;

export const iso_boundaries: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16 }}>
      <Calendar label='Minimum ISO calendar' value='0001-01-01' today='2024-03-15' />
      <Calendar label='Maximum ISO calendar' value='9999-12-31' today='2024-03-15' />
    </div>
  ),
} satisfies Story;

export const browser_proof: Story = {
  args: {
    label: 'Browser proof calendar',
    defaultValue: '2024-03-20',
    today: '2024-03-15',
    firstDayOfWeek: 'mon',
    isDateUnavailable: (value) => value === '2024-03-25',
    onValueChange: fn(),
  },
  render: function BrowserProofCalendarStory(args) {
    const [value, setValue] = useState<DateValue | null>(
      args.defaultValue ?? null
    );
    return (
      <div style={{ display: 'grid', gap: 8 }}>
        <Calendar
          {...args}
          value={value}
          onValueChange={(nextValue) => {
            setValue(nextValue);
            args.onValueChange?.(nextValue);
          }}
        />
        <output>Browser ISO: {value ?? 'empty'}</output>
      </div>
    );
  },
  play: async ({ canvas, args }) => {
    const selected = canvas.getByRole('button', { name: 'March 20, 2024' });
    selected.focus();
    await userEvent.keyboard('{ArrowRight}{Enter}');
    await expect(canvas.getByText('Browser ISO: 2024-03-21')).toBeVisible();
    await expect(args.onValueChange).toHaveBeenCalledWith('2024-03-21');
  },
} satisfies Story;
