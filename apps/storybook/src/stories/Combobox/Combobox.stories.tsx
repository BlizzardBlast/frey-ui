import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ComboboxOption, ComboboxProps } from 'frey-ui';
import { Combobox } from 'frey-ui';
import { type ChangeEvent, useState } from 'react';

const options: ReadonlyArray<ComboboxOption> = [
  {
    value: 'id',
    label: 'Indonesia'
  },
  {
    value: 'sg',
    label: 'Singapore'
  },
  {
    value: 'jp',
    label: 'Japan'
  },
  {
    value: 'us',
    label: 'United States'
  }
];

const meta: Meta<ComboboxProps> = {
  component: Combobox,
  parameters: {
    layout: 'centered'
  },
  decorators: [
    (Story) => (
      <div style={{ width: 320 }}>
        <Story />
      </div>
    )
  ]
} satisfies Meta<ComboboxProps>;

export default meta;

type Story = StoryObj<ComboboxProps>;

export const basic_combobox: Story = {
  args: {
    label: 'Country',
    options,
    placeholder: 'Search country'
  }
} satisfies Story;

export const with_helper_text: Story = {
  args: {
    label: 'Timezone region',
    options: [
      {
        value: 'asia-jakarta',
        label: 'Asia/Jakarta'
      },
      {
        value: 'utc',
        label: 'UTC'
      },
      {
        value: 'america-new-york',
        label: 'America/New_York'
      }
    ],
    helperText: 'Type to filter long option lists quickly.'
  }
} satisfies Story;

export const with_error: Story = {
  args: {
    label: 'Country',
    options,
    error: 'Please choose a valid country.'
  }
} satisfies Story;

export const disabled: Story = {
  args: {
    label: 'Country',
    options,
    value: 'Indonesia',
    disabled: true
  }
} satisfies Story;

export const controlled: Story = {
  render: function ControlledCombobox() {
    const [value, setValue] = useState('Indonesia');

    return (
      <div style={{ display: 'grid', gap: 8 }}>
        <Combobox
          label='Country'
          options={options}
          value={value}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            setValue(event.target.value)
          }
        />
        <small>Current value: {value}</small>
      </div>
    );
  }
} satisfies Story;

export const custom_empty_state: Story = {
  args: {
    label: 'Country',
    options,
    placeholder: 'Type a country name',
    noResultsText: 'No countries match your search.'
  }
} satisfies Story;
