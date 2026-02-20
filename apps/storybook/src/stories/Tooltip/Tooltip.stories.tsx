import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button, Tooltip, type TooltipProps } from 'frey-ui';
import type React from 'react';
import { useState } from 'react';

const StoryTooltip = Tooltip as unknown as React.ComponentType<TooltipProps>;

const meta: Meta<TooltipProps> = {
  component: StoryTooltip,
  parameters: {
    layout: 'centered'
  },
  argTypes: {
    placement: {
      control: { type: 'select' },
      options: ['top', 'right', 'bottom', 'left']
    },
    delay: {
      control: { type: 'number' }
    }
  }
} satisfies Meta<TooltipProps>;

export default meta;

type Story = StoryObj<TooltipProps>;

export const basic_tooltip: Story = {
  render: (args) => (
    <StoryTooltip {...args} content='Copy to clipboard'>
      <Button variant='secondary'>Hover or focus me</Button>
    </StoryTooltip>
  ),
  args: {
    placement: 'top',
    delay: 120
  }
} satisfies Story;

export const placement_variants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 10 }}>
      {(['top', 'right', 'bottom', 'left'] as const).map((placement) => (
        <Tooltip
          key={placement}
          placement={placement}
          delay={0}
          content={`Placement: ${placement}`}
        >
          <Button variant='ghost'>{placement}</Button>
        </Tooltip>
      ))}
    </div>
  )
} satisfies Story;

export const controlled_tooltip: Story = {
  render: function ControlledTooltipStory(args) {
    const [open, setOpen] = useState(false);

    return (
      <div style={{ display: 'grid', gap: 10, justifyItems: 'center' }}>
        <StoryTooltip
          {...args}
          content='Controlled tooltip'
          open={open}
          onOpenChange={setOpen}
        >
          <Button variant='secondary'>Controlled target</Button>
        </StoryTooltip>

        <Button variant='ghost' onClick={() => setOpen((current) => !current)}>
          Toggle tooltip
        </Button>
      </div>
    );
  },
  args: {
    placement: 'top',
    delay: 0
  }
} satisfies Story;
