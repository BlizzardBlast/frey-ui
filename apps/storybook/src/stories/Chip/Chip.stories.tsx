import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ChipElement, Variant } from 'frey-ui';

import { Chip } from 'frey-ui';
import type React from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';

type ChipStoryProps = {
  label: string;
  variant?: Variant;
  as?: ChipElement;
  href?: string;
  onClick?: React.MouseEventHandler<HTMLElement>;
};

const meta: Meta<ChipStoryProps> = {
  component: Chip,
  parameters: {
    layout: 'centered'
  },
  argTypes: {
    label: {
      control: {
        type: 'text'
      },
      description: 'The text to display in the chip',
      table: {
        type: {
          summary: 'string'
        },
        defaultValue: {
          summary: 'None'
        }
      }
    },
    onClick: {
      description: 'The event handler for the click event',
      action: 'clicked',
      table: {
        type: {
          summary: 'MouseEventHandler<HTMLElement>'
        },
        defaultValue: {
          summary: 'None'
        }
      }
    },
    as: {
      description: 'The HTML element to render for the chip',
      table: {
        type: {
          summary: "'button' | 'div' | 'span' | 'a'"
        },
        defaultValue: {
          summary: "'span' (or 'button' when onClick is set)"
        }
      },
      control: {
        type: 'select'
      },
      options: ['button', 'div', 'span', 'a']
    },
    href: {
      description: 'URL when rendering as an anchor chip',
      control: {
        type: 'text'
      },
      table: {
        type: {
          summary: 'string'
        },
        defaultValue: {
          summary: 'None'
        }
      }
    },
    variant: {
      description: 'The variant of the chip',
      table: {
        type: {
          summary: 'default | outlined'
        },
        defaultValue: {
          summary: "'default'"
        }
      },
      control: {
        type: 'select'
      },
      options: ['default', 'outlined']
    }
  }
} satisfies Meta<ChipStoryProps>;

export default meta;
type Story = StoryObj<ChipStoryProps>;

export const basic_chip: Story = {
  args: {
    label: 'Chip',
    onClick: undefined
  },
  render: (args) => (
    <div className='flex gap-4'>
      <Chip {...args} variant={'default'} />
      <Chip {...args} variant={'outlined'} />
    </div>
  )
} satisfies Story;

export const clickable_chip: Story = {
  args: {
    label: 'Chip',
    onClick: fn(),
    as: 'button'
  },
  render: (args) => (
    <div className='flex gap-4'>
      <Chip {...args} variant={'default'} />
      <Chip {...args} variant={'outlined'} />
    </div>
  )
} satisfies Story;

export const link_chip: Story = {
  args: {
    label: 'Read docs',
    as: 'a',
    href: 'https://storybook.js.org',
    variant: 'outlined'
  },
  render: (args) => <Chip {...args} />
} satisfies Story;

export const interactive_flow: Story = {
  args: {
    label: 'Click me',
    onClick: fn()
  },
  render: (args) => <Chip {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const chip = canvas.getByRole('button', { name: 'Click me' });

    await userEvent.click(chip);

    expect(args.onClick).toHaveBeenCalledTimes(1);
  }
} satisfies Story;

export const keyboard_navigation: Story = {
  args: {
    label: 'Keyboard chip',
    as: 'div',
    onClick: fn()
  },
  render: (args) => <Chip {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const chip = canvas.getByRole('button', { name: 'Keyboard chip' });

    expect(chip).toHaveAttribute('tabindex', '0');

    chip.focus();
    await userEvent.keyboard('{Enter}');

    expect(args.onClick).toHaveBeenCalledTimes(1);
  }
} satisfies Story;
