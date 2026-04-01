import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge, Table, type TableProps } from 'frey-ui';

type TableStoryProps = Pick<
  TableProps,
  'containerClassName' | 'containerStyle'
>;

const meta: Meta<TableStoryProps> = {
  component: Table,
  parameters: {
    layout: 'centered'
  },
  argTypes: {
    containerStyle: {
      control: { type: 'object' },
      description: 'Inline styles applied to the outer table container',
      table: {
        type: {
          summary: 'CSSProperties'
        },
        defaultValue: {
          summary: 'None'
        }
      }
    },
    containerClassName: {
      control: { type: 'text' },
      description:
        'Additional class names applied to the outer table container',
      table: {
        type: {
          summary: 'string'
        },
        defaultValue: {
          summary: 'None'
        }
      }
    }
  }
} satisfies Meta<TableStoryProps>;

export default meta;
type Story = StoryObj<TableStoryProps>;

export const basic: Story = {
  args: {
    containerStyle: { width: 680 }
  },
  render: (args) => (
    <Table {...args}>
      <Table.Caption>Project member roles</Table.Caption>
      <Table.Header>
        <Table.Row>
          <Table.Head>Name</Table.Head>
          <Table.Head>Role</Table.Head>
          <Table.Head>Status</Table.Head>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        <Table.Row>
          <Table.Cell>Ada Lovelace</Table.Cell>
          <Table.Cell>Owner</Table.Cell>
          <Table.Cell>
            <Badge tone='success' size='sm'>
              Active
            </Badge>
          </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>Linus Torvalds</Table.Cell>
          <Table.Cell>Maintainer</Table.Cell>
          <Table.Cell>
            <Badge tone='info' size='sm'>
              Invited
            </Badge>
          </Table.Cell>
        </Table.Row>
      </Table.Body>
    </Table>
  )
} satisfies Story;

export const with_footer: Story = {
  args: {
    containerStyle: { width: 720 }
  },
  render: (args) => (
    <Table {...args}>
      <Table.Header>
        <Table.Row>
          <Table.Head>Plan</Table.Head>
          <Table.Head>Users</Table.Head>
          <Table.Head scope='col'>Cost</Table.Head>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        <Table.Row>
          <Table.Cell>Starter</Table.Cell>
          <Table.Cell>5</Table.Cell>
          <Table.Cell>$12</Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>Pro</Table.Cell>
          <Table.Cell>25</Table.Cell>
          <Table.Cell>$49</Table.Cell>
        </Table.Row>
      </Table.Body>
      <Table.Footer>
        <Table.Row>
          <Table.Cell>Total</Table.Cell>
          <Table.Cell>30</Table.Cell>
          <Table.Cell>$61</Table.Cell>
        </Table.Row>
      </Table.Footer>
    </Table>
  )
} satisfies Story;
