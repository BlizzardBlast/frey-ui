import type { Meta, StoryObj } from '@storybook/react-vite';
import { Breadcrumbs, type BreadcrumbsProps } from 'frey-ui';

const meta: Meta<BreadcrumbsProps> = {
  component: Breadcrumbs,
  parameters: {
    layout: 'centered'
  }
} satisfies Meta<BreadcrumbsProps>;

export default meta;
type Story = StoryObj<BreadcrumbsProps>;

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
