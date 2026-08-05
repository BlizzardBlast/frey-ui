import type { Meta, StoryObj } from '@storybook/react-vite';
import type { FileUploadProps } from 'frey-ui';
import { FileUpload } from 'frey-ui';
import { useState } from 'react';
import { expect, within } from 'storybook/test';

const meta: Meta<FileUploadProps> = {
  component: FileUpload,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    children: {
      control: false,
      description: 'Compound FileUpload children (Dropzone, List, Item)',
      table: {
        type: {
          summary: 'ReactNode',
        },
        defaultValue: {
          summary: 'None',
        },
      },
    },
    label: {
      control: { type: 'text' },
      description: 'Accessible label for the file upload',
      table: {
        type: {
          summary: 'string',
        },
        defaultValue: {
          summary: 'None',
        },
      },
    },
    hideLabel: {
      control: { type: 'boolean' },
      description: 'Visually hide the label',
      table: {
        type: {
          summary: 'boolean',
        },
        defaultValue: {
          summary: 'false',
        },
      },
    },
    helperText: {
      control: { type: 'text' },
      description: 'Helper text below the file upload',
      table: {
        type: {
          summary: 'string',
        },
        defaultValue: {
          summary: 'None',
        },
      },
    },
    error: {
      control: { type: 'text' },
      description: 'Error message to display',
      table: {
        type: {
          summary: 'string',
        },
        defaultValue: {
          summary: 'None',
        },
      },
    },
    required: {
      control: { type: 'boolean' },
      description: 'Whether the file upload is required',
      table: {
        type: {
          summary: 'boolean',
        },
        defaultValue: {
          summary: 'false',
        },
      },
    },
    id: {
      control: { type: 'text' },
      description: 'Id for the file input and accessible label',
      table: {
        type: {
          summary: 'string',
        },
        defaultValue: {
          summary: 'None',
        },
      },
    },
    name: {
      control: { type: 'text' },
      description: 'Name attribute for the hidden file input',
      table: {
        type: {
          summary: 'string',
        },
        defaultValue: {
          summary: 'None',
        },
      },
    },
    className: {
      control: { type: 'text' },
      description: 'Additional class names applied to the field wrapper',
      table: {
        type: {
          summary: 'string',
        },
        defaultValue: {
          summary: 'None',
        },
      },
    },
    style: {
      control: { type: 'object' },
      description: 'Inline styles applied to the field wrapper',
      table: {
        type: {
          summary: 'CSSProperties',
        },
        defaultValue: {
          summary: 'None',
        },
      },
    },
    value: {
      control: false,
      description: 'Controlled array of selected files',
      table: {
        type: {
          summary: 'File[]',
        },
        defaultValue: {
          summary: 'None',
        },
      },
    },
    defaultValue: {
      control: false,
      description: 'Uncontrolled default array of selected files',
      table: {
        type: {
          summary: 'File[]',
        },
        defaultValue: {
          summary: 'None',
        },
      },
    },
    onValueChange: {
      action: 'value changed',
      description: 'Called when the selected files change',
      table: {
        type: {
          summary: '(files: File[]) => void',
        },
        defaultValue: {
          summary: 'None',
        },
      },
    },
    onFilesRejected: {
      action: 'files rejected',
      description: 'Called when files fail validation',
      table: {
        type: {
          summary: '(rejected: { file: File; reason: string }[]) => void',
        },
        defaultValue: {
          summary: 'None',
        },
      },
    },
    accept: {
      control: { type: 'text' },
      description: 'Accepted MIME types or file extensions',
      table: {
        type: {
          summary: 'string',
        },
        defaultValue: {
          summary: 'None',
        },
      },
    },
    multiple: {
      control: { type: 'boolean' },
      description: 'Whether multiple files can be selected',
      table: {
        type: {
          summary: 'boolean',
        },
        defaultValue: {
          summary: 'false',
        },
      },
    },
    maxFiles: {
      control: { type: 'number' },
      description: 'Maximum number of files allowed',
      table: {
        type: {
          summary: 'number',
        },
        defaultValue: {
          summary: 'None',
        },
      },
    },
    maxSize: {
      control: { type: 'number' },
      description: 'Maximum file size in bytes',
      table: {
        type: {
          summary: 'number',
        },
        defaultValue: {
          summary: 'None',
        },
      },
    },
    minSize: {
      control: { type: 'number' },
      description: 'Minimum file size in bytes',
      table: {
        type: {
          summary: 'number',
        },
        defaultValue: {
          summary: 'None',
        },
      },
    },
    validate: {
      control: false,
      description: 'Custom validator that returns a rejection reason or null',
      table: {
        type: {
          summary: '(file: File) => string | null',
        },
        defaultValue: {
          summary: 'None',
        },
      },
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Whether the file upload is disabled',
      table: {
        type: {
          summary: 'boolean',
        },
        defaultValue: {
          summary: 'false',
        },
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: 320 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<FileUploadProps>;

export default meta;
type Story = StoryObj<FileUploadProps>;

const defaultRender = (args: FileUploadProps) => (
  <FileUpload {...args}>
    <FileUpload.Dropzone />
    <FileUpload.List>
      <FileUpload.Item />
    </FileUpload.List>
  </FileUpload>
);

export const basic_file_upload: Story = {
  args: {
    label: 'Upload',
  },
  render: defaultRender,
} satisfies Story;

export const multiple_files: Story = {
  args: {
    label: 'Upload files',
    multiple: true,
  },
  render: defaultRender,
} satisfies Story;

export const with_validation: Story = {
  args: {
    label: 'Upload images',
    accept: 'image/*',
    maxSize: 1024 * 1024,
    maxFiles: 3,
  },
  render: defaultRender,
} satisfies Story;

export const disabled: Story = {
  args: {
    label: 'Disabled upload',
    disabled: true,
  },
  render: defaultRender,
} satisfies Story;

export const with_error: Story = {
  args: {
    label: 'Upload',
    error: 'Please upload a valid file.',
  },
  render: defaultRender,
} satisfies Story;

export const with_files: Story = {
  args: {
    label: 'Attachments',
  },
  render: (args) => (
    <FileUpload
      {...args}
      defaultValue={[new File(['hello'], 'hello.txt', { type: 'text/plain' })]}
    >
      <FileUpload.Dropzone />
      <FileUpload.List>
        <FileUpload.Item />
      </FileUpload.List>
    </FileUpload>
  ),
} satisfies Story;

export const controlled: Story = {
  render: function ControlledFileUpload(args: FileUploadProps) {
    const [files, setFiles] = useState<File[]>([]);

    return (
      <FileUpload {...args} value={files} onValueChange={setFiles}>
        <FileUpload.Dropzone />
        <FileUpload.List>
          <FileUpload.Item />
        </FileUpload.List>
      </FileUpload>
    );
  },
} satisfies Story;

export const renders_dropzone: Story = {
  args: {
    label: 'Upload',
  },
  render: defaultRender,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const dropzone = canvas.getByRole('button', { name: 'Upload' });

    expect(dropzone).toBeInTheDocument();
  },
} satisfies Story;
