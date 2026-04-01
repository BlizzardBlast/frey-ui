import type { Meta, StoryObj } from '@storybook/react-vite';
import { Breadcrumbs, type BreadcrumbsProps } from 'frey-ui';

type BreadcrumbsStoryProps = Pick<BreadcrumbsProps, 'separator' | 'ariaLabel'>;

const meta: Meta<BreadcrumbsStoryProps> = {
  component: Breadcrumbs,
  parameters: {
    layout: 'centered'
  },
  argTypes: {
    separator: {
      control: { type: 'text' },
      description: 'Separator string shown between breadcrumb items',
      table: {
        type: {
          summary: 'string'
        },
        defaultValue: {
          summary: "'/'"
        }
      }
    },
    ariaLabel: {
      control: { type: 'text' },
      description: 'Accessible label for the breadcrumb navigation',
      table: {
        type: {
          summary: 'string'
        },
        defaultValue: {
          summary: "'Breadcrumb'"
        }
      }
    }
  }
} satisfies Meta<BreadcrumbsStoryProps>;

export default meta;
type Story = StoryObj<BreadcrumbsStoryProps>;

export const basic: Story = {
  render: () => (
    <Breadcrumbs>
      <Breadcrumbs.List>
        <Breadcrumbs.Item>
          <Breadcrumbs.Link href='/'>Home</Breadcrumbs.Link>
        </Breadcrumbs.Item>
        <Breadcrumbs.Item>
          <Breadcrumbs.Link href='/projects'>Projects</Breadcrumbs.Link>
        </Breadcrumbs.Item>
        <Breadcrumbs.Item>
          <Breadcrumbs.Current>Frey UI</Breadcrumbs.Current>
        </Breadcrumbs.Item>
      </Breadcrumbs.List>
    </Breadcrumbs>
  )
} satisfies Story;

export const custom_separator: Story = {
  render: () => (
    <Breadcrumbs separator='>'>
      <Breadcrumbs.List>
        <Breadcrumbs.Item>
          <Breadcrumbs.Link href='/'>Dashboard</Breadcrumbs.Link>
        </Breadcrumbs.Item>
        <Breadcrumbs.Item>
          <Breadcrumbs.Link href='/teams'>Teams</Breadcrumbs.Link>
        </Breadcrumbs.Item>
        <Breadcrumbs.Item>
          <Breadcrumbs.Current>Platform</Breadcrumbs.Current>
        </Breadcrumbs.Item>
      </Breadcrumbs.List>
    </Breadcrumbs>
  )
} satisfies Story;
