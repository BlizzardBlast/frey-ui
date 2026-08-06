import type { Meta, StoryObj } from '@storybook/react-vite';
import type { EmptyStateProps } from 'frey-ui';
import { Button, Card, CircleInfoIcon, EmptyState, FileIcon } from 'frey-ui';

type EmptyStateStoryProps = Pick<EmptyStateProps, 'layout'>;

const meta: Meta<EmptyStateStoryProps> = {
  component: EmptyState,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div style={{ width: 'min(42rem, 90vw)' }}>
        <Story />
      </div>
    ),
  ],
  args: {
    layout: 'centered',
  },
  argTypes: {
    layout: {
      control: { type: 'select' },
      options: ['centered', 'compact'],
      description:
        'Controls spacing and alignment without changing the content semantics.',
      table: {
        type: { summary: "'centered' | 'compact'" },
        defaultValue: { summary: "'centered'" },
      },
    },
  },
} satisfies Meta<EmptyStateStoryProps>;

export default meta;

type Story = StoryObj<EmptyStateStoryProps>;

export const first_use: Story = {
  render: (args) => (
    <EmptyState {...args}>
      <EmptyState.Icon aria-hidden='true'>
        <FileIcon size='lg' />
      </EmptyState.Icon>
      <EmptyState.Title as='h2'>Create your first project</EmptyState.Title>
      <EmptyState.Description>
        Projects keep files, tasks, and team activity organized in one place.
      </EmptyState.Description>
      <EmptyState.Actions>
        <Button>Create project</Button>
        <Button variant='secondary'>View a sample</Button>
      </EmptyState.Actions>
    </EmptyState>
  ),
} satisfies Story;

export const no_search_results: Story = {
  render: () => (
    <EmptyState>
      <EmptyState.Icon aria-hidden='true'>
        <CircleInfoIcon size='lg' />
      </EmptyState.Icon>
      <EmptyState.Title as='h2'>No matching customers</EmptyState.Title>
      <EmptyState.Description>
        Try changing the search term or removing one of the active filters.
      </EmptyState.Description>
      <EmptyState.Actions>
        <Button variant='secondary'>Clear filters</Button>
      </EmptyState.Actions>
    </EmptyState>
  ),
} satisfies Story;

export const empty_collection: Story = {
  render: () => (
    <div
      style={{
        border: '1px solid var(--frey-color-border-subtle)',
        borderRadius: 'var(--frey-radius-lg)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          borderBottom: '1px solid var(--frey-color-border-subtle)',
          padding: '0.75rem 1rem',
          fontWeight: 600,
        }}
      >
        Team members
      </div>
      <EmptyState>
        <EmptyState.Title as='h3'>No team members yet</EmptyState.Title>
        <EmptyState.Description>
          Invite someone when you are ready to collaborate.
        </EmptyState.Description>
        <EmptyState.Actions>
          <Button>Invite member</Button>
        </EmptyState.Actions>
      </EmptyState>
    </div>
  ),
} satisfies Story;

export const compact_in_card: Story = {
  render: () => (
    <Card>
      <Card.Header>
        <Card.Title>Recent exports</Card.Title>
      </Card.Header>
      <Card.Content>
        <EmptyState layout='compact' style={{ padding: 0 }}>
          <EmptyState.Title as='h4'>No exports available</EmptyState.Title>
          <EmptyState.Description>
            Completed exports will appear here for 30 days.
          </EmptyState.Description>
          <EmptyState.Actions>
            <Button size='sm' variant='secondary'>
              Export data
            </Button>
          </EmptyState.Actions>
        </EmptyState>
      </Card.Content>
    </Card>
  ),
} satisfies Story;

export const read_only: Story = {
  render: () => (
    <EmptyState>
      <EmptyState.Icon aria-hidden='true'>
        <FileIcon size='lg' />
      </EmptyState.Icon>
      <EmptyState.Title as='h2'>No archived documents</EmptyState.Title>
      <EmptyState.Description>
        Documents moved to the archive will be listed here.
      </EmptyState.Description>
    </EmptyState>
  ),
} satisfies Story;

export const long_localized_content: Story = {
  render: () => (
    <EmptyState>
      <EmptyState.Title as='h2'>
        Belum ada permohonan yang dapat ditampilkan untuk periode pelaporan yang
        dipilih
      </EmptyState.Title>
      <EmptyState.Description>
        Ubah rentang tanggal atau hapus beberapa filter untuk melihat permohonan
        lain yang mungkin sesuai dengan kriteria pencarian Anda.
      </EmptyState.Description>
      <EmptyState.Actions>
        <Button variant='secondary'>Atur ulang filter</Button>
      </EmptyState.Actions>
    </EmptyState>
  ),
} satisfies Story;
