import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Dialog,
  DropdownMenu,
  Progress,
  RadioGroup,
  Select,
  Spinner,
  Switch,
  Textarea,
  TextInput,
  ToastProvider,
  useToast
} from 'frey-ui';
import { useCallback, useEffect, useRef, useState } from 'react';

const meta: Meta = {
  title: 'Patterns/Usage Patterns',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Practical form, overlay, and feedback composition examples for real product UI flows using Frey UI.'
      }
    }
  }
};

export default meta;

type Story = StoryObj;
type SyncStatus = 'idle' | 'running' | 'success' | 'error';

const basePatternStyle = {
  display: 'grid',
  gap: 16
} as const;

const headingBlockStyle = {
  display: 'grid',
  gap: 4
} as const;

const titleStyle = {
  margin: 0
} as const;

const subtitleStyle = {
  margin: 0,
  color: 'var(--frey-color-text-muted, #64748b)',
  fontSize: 14
} as const;

const actionRowStyle = {
  display: 'flex',
  gap: 8,
  flexWrap: 'wrap',
  alignItems: 'center'
} as const;

function AsyncFeedbackFlow() {
  const { toast } = useToast();
  const [status, setStatus] = useState<SyncStatus>('idle');
  const [progressValue, setProgressValue] = useState(0);
  const timeoutsRef = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  const clearTimers = useCallback(() => {
    for (const timeoutId of timeoutsRef.current) {
      clearTimeout(timeoutId);
    }
    timeoutsRef.current = [];
  }, []);

  const schedule = useCallback((delay: number, callback: () => void) => {
    const timeoutId = setTimeout(callback, delay);
    timeoutsRef.current.push(timeoutId);
  }, []);

  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, [clearTimers]);

  const runSync = (shouldFail: boolean) => {
    clearTimers();
    setStatus('running');
    setProgressValue(0);

    schedule(250, () => setProgressValue(25));
    schedule(700, () => setProgressValue(55));
    schedule(1200, () => setProgressValue(85));
    schedule(1700, () => {
      if (shouldFail) {
        setStatus('error');
        setProgressValue(72);
        toast({
          variant: 'error',
          title: 'Sync failed',
          description: 'Could not sync all records. Please retry.'
        });
        return;
      }

      setStatus('success');
      setProgressValue(100);
      toast({
        variant: 'success',
        title: 'Sync complete',
        description: 'All records are now up to date.'
      });
    });
  };

  const alertContent = {
    idle: null,
    running: (
      <Alert variant='info' title='Sync in progress'>
        Keep this tab open while records are being synced.
      </Alert>
    ),
    success: (
      <Alert variant='success' title='Sync completed'>
        New updates are available to your team.
      </Alert>
    ),
    error: (
      <Alert variant='error' title='Sync failed'>
        We could not sync every record. Please run it again.
      </Alert>
    )
  } as const;

  return (
    <section style={{ ...basePatternStyle, maxWidth: 680 }}>
      <div style={headingBlockStyle}>
        <h3 style={titleStyle}>Async Feedback</h3>
        <p style={subtitleStyle}>
          Compose loading, completion, and error feedback with progress, toasts,
          and alerts.
        </p>
      </div>

      <Card>
        <Card.Header>
          <Card.Title>Daily customer sync</Card.Title>
        </Card.Header>
        <Card.Content>
          <div style={{ display: 'grid', gap: 12 }}>
            <Progress
              label={
                status === 'running' ? 'Sync in progress' : 'Most recent sync'
              }
              value={progressValue}
              showValue
            />

            {status === 'running' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Spinner size='sm' />
                <small>Syncing records...</small>
              </div>
            )}

            {alertContent[status]}
          </div>
        </Card.Content>
        <Card.Footer style={actionRowStyle}>
          <Button
            disabled={status === 'running'}
            onClick={() => runSync(false)}
          >
            Run sync
          </Button>
          <Button
            disabled={status === 'running'}
            variant='secondary'
            onClick={() => runSync(true)}
          >
            Run failing sync
          </Button>
        </Card.Footer>
      </Card>
    </section>
  );
}

export const forms: Story = {
  render: function FormsPattern() {
    return (
      <form style={{ ...basePatternStyle, maxWidth: 520 }}>
        <div style={headingBlockStyle}>
          <h3 style={titleStyle}>Forms</h3>
          <p style={subtitleStyle}>
            Build consistent form layouts with shared label, helper, and action
            patterns.
          </p>
        </div>

        <TextInput label='Project name' placeholder='Frey UI v2' required />
        <Textarea
          label='Description'
          helperText='Tell your team what this project is about.'
          placeholder='A short summary...'
        />
        <Select label='Team' placeholder='Choose team' required>
          <option value='engineering'>Engineering</option>
          <option value='design'>Design</option>
          <option value='marketing'>Marketing</option>
        </Select>
        <RadioGroup
          label='Visibility'
          defaultValue='internal'
          options={[
            { label: 'Private', value: 'private' },
            { label: 'Internal', value: 'internal' },
            { label: 'Public', value: 'public' }
          ]}
        />
        <div style={actionRowStyle}>
          <Button variant='secondary' type='button'>
            Save draft
          </Button>
          <Button type='submit'>Create project</Button>
        </div>
      </form>
    );
  }
} satisfies Story;

export const settings_page: Story = {
  render: function SettingsPattern() {
    return (
      <section style={{ ...basePatternStyle, maxWidth: 640 }}>
        <div style={headingBlockStyle}>
          <h3 style={titleStyle}>Settings Page</h3>
          <p style={subtitleStyle}>
            Combine toggles and selection controls for organization-level
            preferences.
          </p>
        </div>

        <Switch label='Enable notifications' defaultChecked />
        <Checkbox label='Send weekly report emails' defaultChecked />
        <Select label='Default timezone' defaultValue='asia-jakarta'>
          <option value='asia-jakarta'>Asia/Jakarta</option>
          <option value='utc'>UTC</option>
          <option value='america-new_york'>America/New_York</option>
        </Select>
        <Textarea
          label='Support note'
          helperText='Shown only to organization admins.'
        />
        <div style={actionRowStyle}>
          <Button variant='secondary'>Cancel</Button>
          <Button>Save settings</Button>
        </div>
      </section>
    );
  }
} satisfies Story;

export const auth_form: Story = {
  render: function AuthPattern() {
    const [rememberMe, setRememberMe] = useState(true);

    return (
      <form style={{ ...basePatternStyle, maxWidth: 360 }}>
        <div style={headingBlockStyle}>
          <h3 style={titleStyle}>Auth Form</h3>
          <p style={subtitleStyle}>
            Keep sign-in flows concise while preserving controlled checkbox
            behavior.
          </p>
        </div>

        <TextInput
          label='Email'
          type='email'
          placeholder='you@company.com'
          required
        />
        <TextInput label='Password' type='password' required />
        <Checkbox
          label='Remember me'
          checked={rememberMe}
          onChange={(event) => setRememberMe(event.target.checked)}
        />
        <div style={actionRowStyle}>
          <Button variant='secondary' type='button'>
            Need help?
          </Button>
          <Button type='submit'>Continue</Button>
        </div>
      </form>
    );
  }
} satisfies Story;

export const table_filters: Story = {
  render: function TableFiltersPattern() {
    const [includeArchived, setIncludeArchived] = useState(false);

    return (
      <section style={{ ...basePatternStyle, maxWidth: 880 }}>
        <div style={headingBlockStyle}>
          <h3 style={titleStyle}>Table Filters</h3>
          <p style={subtitleStyle}>
            Combine search, segmented choices, and controlled toggles for
            discoverability.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 12
          }}
        >
          <TextInput
            label='Search users'
            type='search'
            placeholder='Name or email'
          />
          <Select label='Role' defaultValue='all'>
            <option value='all'>All roles</option>
            <option value='owner'>Owner</option>
            <option value='editor'>Editor</option>
            <option value='viewer'>Viewer</option>
          </Select>
          <Select label='Status' defaultValue='active'>
            <option value='active'>Active</option>
            <option value='invited'>Invited</option>
            <option value='suspended'>Suspended</option>
          </Select>
          <RadioGroup
            label='Sort by'
            orientation='horizontal'
            defaultValue='updated'
            options={[
              { label: 'Updated', value: 'updated' },
              { label: 'Name', value: 'name' }
            ]}
          />
        </div>
        <Checkbox
          label='Include archived users'
          checked={includeArchived}
          onChange={(event) => setIncludeArchived(event.target.checked)}
        />
        <div style={actionRowStyle}>
          <Button variant='secondary'>Reset</Button>
          <Button>Apply filters</Button>
        </div>
      </section>
    );
  }
} satisfies Story;

export const overlay_actions: Story = {
  render: function OverlayActionsPattern() {
    const [menuSelection, setMenuSelection] = useState<string | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    return (
      <section style={{ ...basePatternStyle, maxWidth: 680 }}>
        <div style={headingBlockStyle}>
          <h3 style={titleStyle}>Overlay Actions</h3>
          <p style={subtitleStyle}>
            Use a trigger-first menu for row actions and escalate destructive
            steps to a controlled dialog.
          </p>
        </div>

        <Card>
          <Card.Header>
            <Card.Title>Project row actions</Card.Title>
          </Card.Header>
          <Card.Content>
            <div style={{ display: 'grid', gap: 12 }}>
              <p style={{ margin: 0 }}>
                Project: <strong>Growth Dashboard</strong>
              </p>
              <div style={actionRowStyle}>
                <DropdownMenu>
                  <DropdownMenu.Trigger asChild>
                    <Button variant='secondary'>Row actions</Button>
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Content>
                    <DropdownMenu.Item
                      onSelect={() => setMenuSelection('Renamed project')}
                    >
                      Rename
                    </DropdownMenu.Item>
                    <DropdownMenu.Item
                      onSelect={() =>
                        setMenuSelection('Duplicated configuration')
                      }
                    >
                      Duplicate
                    </DropdownMenu.Item>
                    <DropdownMenu.Item
                      onSelect={() => setMenuSelection('Archived project')}
                    >
                      Archive
                    </DropdownMenu.Item>
                    <DropdownMenu.Item
                      destructive
                      onSelect={() => setIsDeleteDialogOpen(true)}
                    >
                      Delete project
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu>
              </div>
            </div>
          </Card.Content>
          <Card.Footer>
            <small>Last action: {menuSelection ?? 'none'}</small>
          </Card.Footer>
        </Card>

        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Delete project?</Dialog.Title>
              <Dialog.Description>
                This action permanently removes all project data.
              </Dialog.Description>
            </Dialog.Header>
            <Dialog.Body>
              Are you sure you want to delete <strong>Growth Dashboard</strong>?
            </Dialog.Body>
            <Dialog.Footer style={actionRowStyle}>
              <Button
                variant='secondary'
                onClick={() => {
                  setMenuSelection('Delete cancelled');
                  setIsDeleteDialogOpen(false);
                }}
              >
                Cancel
              </Button>
              <Button
                variant='destructive'
                onClick={() => {
                  setMenuSelection('Deleted project');
                  setIsDeleteDialogOpen(false);
                }}
              >
                Delete project
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog>
      </section>
    );
  }
} satisfies Story;

export const async_feedback: Story = {
  render: () => (
    <ToastProvider placement='top-right' limit={4}>
      <AsyncFeedbackFlow />
    </ToastProvider>
  )
} satisfies Story;
