import type { Meta, StoryObj } from '@storybook/react-vite';
import { Accordion, type AccordionProps } from 'frey-ui';

type AccordionStoryProps = Pick<
  AccordionProps,
  'type' | 'value' | 'defaultValue' | 'onValueChange'
>;

const meta: Meta<AccordionStoryProps> = {
  component: Accordion,
  parameters: {
    layout: 'padded'
  },
  args: {
    type: 'single'
  },
  argTypes: {
    type: {
      control: { type: 'select' },
      options: ['single', 'multiple'],
      description: 'Whether the accordion allows one or multiple items open',
      table: {
        type: {
          summary: "'single' | 'multiple'"
        },
        defaultValue: {
          summary: "'single'"
        }
      }
    },
    value: {
      control: { type: 'object' },
      description: 'Controlled open item value or values',
      table: {
        type: {
          summary: 'string | string[]'
        },
        defaultValue: {
          summary: 'None'
        }
      }
    },
    defaultValue: {
      control: { type: 'object' },
      description: 'Initial open item value or values when uncontrolled',
      table: {
        type: {
          summary: 'string | string[]'
        },
        defaultValue: {
          summary: 'None'
        }
      }
    },
    onValueChange: {
      action: 'value changed',
      description: 'Called when the open accordion item value changes',
      table: {
        type: {
          summary: '(value: string | string[]) => void'
        },
        defaultValue: {
          summary: 'None'
        }
      }
    }
  }
} satisfies Meta<AccordionStoryProps>;

export default meta;

type Story = StoryObj<AccordionStoryProps>;

export const basic: Story = {
  render: (args) => (
    <div style={{ width: 400 }}>
      <Accordion {...args}>
        <Accordion.Item value='item-1'>
          <Accordion.Trigger>Is it accessible?</Accordion.Trigger>
          <Accordion.Content>
            Yes. It adheres to the WAI-ARIA design pattern and uses semantic
            HTML elements.
          </Accordion.Content>
        </Accordion.Item>
        <Accordion.Item value='item-2'>
          <Accordion.Trigger>Is it styled?</Accordion.Trigger>
          <Accordion.Content>
            Yes. It comes with default styles that match the other components'
            aesthetic.
          </Accordion.Content>
        </Accordion.Item>
        <Accordion.Item value='item-3'>
          <Accordion.Trigger>Is it animated?</Accordion.Trigger>
          <Accordion.Content>
            Yes. It's animated by default, but you can disable it if you prefer
            using CSS overrides.
          </Accordion.Content>
        </Accordion.Item>
      </Accordion>
    </div>
  )
} satisfies Story;

export const multiple: Story = {
  render: () => (
    <div style={{ width: 400 }}>
      <Accordion type='multiple' defaultValue={['item-1', 'item-2']}>
        <Accordion.Item value='item-1'>
          <Accordion.Trigger>Section 1</Accordion.Trigger>
          <Accordion.Content>
            This section is open by default. Multiple items can be open at once.
          </Accordion.Content>
        </Accordion.Item>
        <Accordion.Item value='item-2'>
          <Accordion.Trigger>Section 2</Accordion.Trigger>
          <Accordion.Content>
            This section is also open by default. You can close them
            independently.
          </Accordion.Content>
        </Accordion.Item>
      </Accordion>
    </div>
  )
} satisfies Story;
