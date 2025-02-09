import type { Meta, StoryObj } from '@storybook/react';

import { expect, fireEvent, fn, within } from '@storybook/test';
import Chip from '../../../../../src/Chip';

const meta: Meta<typeof Chip> = {
  component: Chip,
  parameters: {
    layout: 'centered'
  },
  argTypes: {
    label: {
      control: {
        type: 'text'
      },
      description: 'The text to display in the chip'
    },
    onClick: {
      type: 'function',
      description: 'The event handler for the click event',
      action: 'clicked'
    },
    variant: {
      description: 'The variant of the chip',
      table: {
        type: {
          summary: 'default | outlined'
        }
      },
      control: {
        type: 'select'
      },
      options: ['default', 'outlined']
    },
    style: {
      description: 'The style of the chip',
      control: {
        type: 'object'
      },
      table: {
        type: {
          summary: 'CSSProperties'
        }
      }
    },
    className: {
      description: 'The class name of the chip',
      control: {
        type: 'text'
      },
      table: {
        type: {
          summary: 'string'
        }
      }
    }
  }
} satisfies Meta<typeof Chip>;

export default meta;
type Story = StoryObj<typeof Chip>;

export const Non_Clickable_Chip: Story = {
  args: {
    label: 'Chip',
    onClick: undefined,
    variant: 'default',
    className: undefined,
    style: undefined
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const chip = canvas.getByRole('button');
    fireEvent.click(chip);

    expect(chip).toBeDisabled();
  }
} satisfies Story;

export const Clickable_Chip: Story = {
  args: {
    label: 'Chip',
    onClick: fn(),
    variant: 'default',
    className: undefined,
    style: undefined
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    const chip = canvas.getByRole('button');
    fireEvent.click(chip);

    expect(args.onClick).toHaveBeenCalled();
  }
} satisfies Story;

export const Outlined_Non_Clickable_Chip: Story = {
  args: {
    label: 'Chip',
    onClick: undefined,
    variant: 'outlined',
    className: undefined,
    style: undefined
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const chip = canvas.getByRole('button');
    fireEvent.click(chip);

    expect(chip).toBeDisabled();
  }
} satisfies Story;

export const Outlined_Clickable_Chip: Story = {
  args: {
    label: 'Chip',
    onClick: fn(),
    variant: 'outlined',
    className: undefined,
    style: undefined
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    const chip = canvas.getByRole('button');
    fireEvent.click(chip);

    expect(args.onClick).toHaveBeenCalled();
  }
} satisfies Story;
