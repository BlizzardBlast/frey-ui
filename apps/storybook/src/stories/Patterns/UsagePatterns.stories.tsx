import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Button,
  Checkbox,
  RadioGroup,
  Select,
  Switch,
  Textarea,
  TextInput
} from 'frey-ui';
import { useState } from 'react';

const meta: Meta = {
  title: 'Patterns/Usage Patterns',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Practical composition examples for real product UI flows using Frey UI form controls.'
      }
    }
  }
};

export default meta;

type Story = StoryObj;

export const forms: Story = {
  render: function FormsPattern() {
    return (
      <form style={{ maxWidth: 520, display: 'grid', gap: 16 }}>
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
        <Button type='submit'>Create project</Button>
      </form>
    );
  }
} satisfies Story;

export const settings_page: Story = {
  render: function SettingsPattern() {
    return (
      <section style={{ maxWidth: 640, display: 'grid', gap: 20 }}>
        <h3 style={{ margin: 0 }}>Workspace Settings</h3>
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
        <div style={{ display: 'flex', gap: 8 }}>
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
      <form style={{ maxWidth: 360, display: 'grid', gap: 12 }}>
        <h3 style={{ margin: 0 }}>Sign in</h3>
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
        <Button type='submit'>Continue</Button>
      </form>
    );
  }
} satisfies Story;

export const table_filters: Story = {
  render: function TableFiltersPattern() {
    const [includeArchived, setIncludeArchived] = useState(false);

    return (
      <section style={{ maxWidth: 880, display: 'grid', gap: 16 }}>
        <h3 style={{ margin: 0 }}>Table Filters</h3>
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
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant='secondary'>Reset</Button>
          <Button>Apply filters</Button>
        </div>
      </section>
    );
  }
} satisfies Story;
