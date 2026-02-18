import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ChipElement, Variant } from 'frey-ui';

import { Chip } from 'frey-ui';
import type React from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';

type ChipStoryProps = {
  label: string;
  variant?: Variant;
  style?: React.CSSProperties;
  className?: string;
  as?: ChipElement;
  href?: string;
  onClick?: React.MouseEventHandler<HTMLElement>;
};

const StoryChip = Chip as unknown as React.ComponentType<ChipStoryProps>;

const meta: Meta<ChipStoryProps> = {
  component: StoryChip,
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
    as: {
      description: 'The HTML element to render for the chip',
      table: {
        type: {
          summary: "'button' | 'div' | 'span' | 'a'"
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
      }
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
} satisfies Meta<ChipStoryProps>;

export default meta;
type Story = StoryObj<ChipStoryProps>;

export const Basic_Chip: Story = {
  args: {
    label: 'Chip',
    onClick: undefined,
    className: undefined,
    style: undefined
  },
  render: (args) => (
    <div className='flex gap-4'>
      <StoryChip {...args} variant={'default'} />
      <StoryChip {...args} variant={'outlined'} />
    </div>
  )
} satisfies Story;

export const Clickable_Chip: Story = {
  args: {
    label: 'Chip',
    onClick: fn(),
    as: 'button',
    className: undefined,
    style: undefined
  },
  render: (args) => (
    <div className='flex gap-4'>
      <StoryChip {...args} variant={'default'} />
      <StoryChip {...args} variant={'outlined'} />
    </div>
  )
} satisfies Story;

export const Link_Chip: Story = {
  args: {
    label: 'Read docs',
    as: 'a',
    href: 'https://storybook.js.org',
    variant: 'outlined'
  },
  render: (args) => <StoryChip {...args} />
} satisfies Story;

export const Interactive_Flow: Story = {
  args: {
    label: 'Click me',
    onClick: fn()
  },
  render: (args) => <StoryChip {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const chip = canvas.getByRole('button', { name: 'Click me' });

    await userEvent.click(chip);

    expect(args.onClick).toHaveBeenCalledTimes(1);
  }
} satisfies Story;

export const Keyboard_Navigation: Story = {
  args: {
    label: 'Keyboard chip',
    as: 'div',
    onClick: fn()
  },
  render: (args) => <StoryChip {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const chip = canvas.getByRole('button', { name: 'Keyboard chip' });

    expect(chip).toHaveAttribute('tabindex', '0');

    chip.focus();
    await userEvent.keyboard('{Enter}');

    expect(args.onClick).toHaveBeenCalledTimes(1);
  }
} satisfies Story;
