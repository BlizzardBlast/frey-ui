import type { Meta, StoryObj } from '@storybook/react-vite';
import type { FileUploadProps } from 'frey-ui';
import { Button, FileUpload } from 'frey-ui';
import { useState } from 'react';
import { expect, within } from 'storybook/test';

const STRING_TYPE = 'string';
const BOOLEAN_TYPE = 'boolean';
const NUMBER_TYPE = 'number';
const NONE_DEFAULT = 'None';
const FALSE_DEFAULT = 'false';
const PDF_MIME_TYPE = 'application/pdf';

const meta: Meta<FileUploadProps> = {
  component: FileUpload,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div style={{ width: 'min(36rem, 90vw)' }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    children: {
      control: false,
      description: 'Custom compound component composition.',
      table: {
        type: { summary: 'ReactNode' },
        defaultValue: { summary: 'Default dropzone and file list' },
      },
    },
    label: {
      control: { type: 'text' },
      description: 'Accessible field label.',
      table: {
        type: { summary: STRING_TYPE },
        defaultValue: { summary: 'Required' },
      },
    },
    hideLabel: {
      control: { type: BOOLEAN_TYPE },
      description: 'Visually hides the field label.',
      table: {
        type: { summary: BOOLEAN_TYPE },
        defaultValue: { summary: FALSE_DEFAULT },
      },
    },
    helperText: {
      control: { type: 'text' },
      description: 'Additional guidance displayed below the field.',
      table: {
        type: { summary: STRING_TYPE },
        defaultValue: { summary: NONE_DEFAULT },
      },
    },
    error: {
      control: { type: 'text' },
      description: 'External validation error shown instead of rejections.',
      table: {
        type: { summary: STRING_TYPE },
        defaultValue: { summary: NONE_DEFAULT },
      },
    },
    required: {
      control: { type: BOOLEAN_TYPE },
      description: 'Marks the file input as required while empty.',
      table: {
        type: { summary: BOOLEAN_TYPE },
        defaultValue: { summary: FALSE_DEFAULT },
      },
    },
    id: {
      control: { type: 'text' },
      description: 'Stable identifier for the field and file input.',
      table: {
        type: { summary: STRING_TYPE },
        defaultValue: { summary: 'Generated' },
      },
    },
    name: {
      control: { type: 'text' },
      description: 'Name submitted by the native file input.',
      table: {
        type: { summary: STRING_TYPE },
        defaultValue: { summary: NONE_DEFAULT },
      },
    },
    className: {
      control: { type: 'text' },
      description: 'Additional class name for the field wrapper.',
      table: {
        type: { summary: STRING_TYPE },
        defaultValue: { summary: NONE_DEFAULT },
      },
    },
    style: {
      control: { type: 'object' },
      description: 'Inline styles for the field wrapper.',
      table: {
        type: { summary: 'CSSProperties' },
        defaultValue: { summary: NONE_DEFAULT },
      },
    },
    value: {
      control: false,
      description: 'Controlled selected files.',
      table: {
        type: { summary: 'File[]' },
        defaultValue: { summary: NONE_DEFAULT },
      },
    },
    defaultValue: {
      control: false,
      description: 'Initial files for uncontrolled usage.',
      table: {
        type: { summary: 'File[]' },
        defaultValue: { summary: '[]' },
      },
    },
    onValueChange: {
      action: 'value changed',
      description: 'Called whenever the selected files change.',
      table: {
        type: { summary: '(files: File[]) => void' },
        defaultValue: { summary: NONE_DEFAULT },
      },
    },
    onFilesRejected: {
      action: 'files rejected',
      description: 'Called with structured details for rejected files.',
      table: {
        type: { summary: '(rejected: FileUploadRejected[]) => void' },
        defaultValue: { summary: NONE_DEFAULT },
      },
    },
    disabled: {
      control: { type: BOOLEAN_TYPE },
      description: 'Disables browsing, dropping, and removal.',
      table: {
        type: { summary: BOOLEAN_TYPE },
        defaultValue: { summary: FALSE_DEFAULT },
      },
    },
    accept: {
      control: { type: 'text' },
      description: 'Accepted MIME types or file extensions.',
      table: {
        type: { summary: STRING_TYPE },
        defaultValue: { summary: 'Any file' },
      },
    },
    maxSize: {
      control: { type: NUMBER_TYPE },
      description: 'Maximum file size in bytes.',
      table: {
        type: { summary: NUMBER_TYPE },
        defaultValue: { summary: 'Unlimited' },
      },
    },
    minSize: {
      control: { type: NUMBER_TYPE },
      description: 'Minimum file size in bytes.',
      table: {
        type: { summary: NUMBER_TYPE },
        defaultValue: { summary: '0' },
      },
    },
    maxFiles: {
      control: { type: NUMBER_TYPE },
      description: 'Maximum number of selected files.',
      table: {
        type: { summary: NUMBER_TYPE },
        defaultValue: { summary: 'Unlimited' },
      },
    },
    multiple: {
      control: { type: BOOLEAN_TYPE },
      description: 'Allows more than one selected file.',
      table: {
        type: { summary: BOOLEAN_TYPE },
        defaultValue: { summary: FALSE_DEFAULT },
      },
    },
    validate: {
      control: false,
      description: 'Custom validation function returning an error or null.',
      table: {
        type: { summary: '(file: File) => string | null' },
        defaultValue: { summary: NONE_DEFAULT },
      },
    },
  },
} satisfies Meta<FileUploadProps>;

export default meta;
type Story = StoryObj<FileUploadProps>;

const previewFile = new File(
  [
    Uint8Array.from([
      137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 0, 1,
      0, 0, 0, 1, 8, 6, 0, 0, 0, 31, 21, 196, 137, 0, 0, 0, 13, 73, 68, 65, 84,
      8, 215, 99, 248, 207, 192, 240, 31, 0, 5, 0, 1, 255, 137, 153, 61, 29, 0,
      0, 0, 0, 73, 69, 78, 68, 174, 66, 96, 130,
    ]),
  ],
  'profile-photo.png',
  { type: 'image/png', lastModified: 1 }
);

export const Default: Story = {
  args: {
    label: 'Attachments',
    helperText:
      'Files are selected locally and are not uploaded automatically.',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole('button', { name: 'Browse files' })
    ).toBeInTheDocument();
    await expect(
      canvas.getByText('Drag and drop a file here')
    ).toBeInTheDocument();
  },
};

export const ImagePreview: Story = {
  args: {
    label: 'Profile picture',
    accept: 'image/png,image/jpeg',
    maxSize: 2 * 1024 * 1024,
    defaultValue: [previewFile],
  },
};

export const MultipleFiles: Story = {
  args: {
    label: 'Project files',
    multiple: true,
    maxFiles: 5,
    maxSize: 5 * 1024 * 1024,
    accept: 'image/*,.pdf,.docx',
    defaultValue: [
      previewFile,
      new File(['Quarterly report'], 'quarterly-report.pdf', {
        type: PDF_MIME_TYPE,
        lastModified: 2,
      }),
    ],
  },
};

export const TriggerOnly: Story = {
  args: {
    label: 'Attachment',
    hideLabel: true,
  },
  render: (args) => (
    <FileUpload {...args}>
      <FileUpload.Trigger asChild>
        <Button variant='secondary'>Attach file</Button>
      </FileUpload.Trigger>
      <FileUpload.List />
    </FileUpload>
  ),
};

export const CustomComposition: Story = {
  args: {
    label: 'Design assets',
    accept: 'image/*',
    multiple: true,
    maxFiles: 3,
  },
  render: (args) => (
    <FileUpload {...args}>
      <FileUpload.Dropzone
        heading='Add design assets'
        description='Drop images here or browse from your device'
      />
      <FileUpload.List>
        <FileUpload.Item>
          {(file, onRemove) => (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
              }}
            >
              <span>{file.name}</span>
              <Button variant='ghost' size='sm' onClick={onRemove}>
                Remove
              </Button>
            </div>
          )}
        </FileUpload.Item>
      </FileUpload.List>
    </FileUpload>
  ),
};

export const Controlled: Story = {
  args: {
    label: 'Controlled files',
    multiple: true,
  },
  render: function ControlledFileUpload(args) {
    const [files, setFiles] = useState<File[]>([]);

    return <FileUpload {...args} value={files} onValueChange={setFiles} />;
  },
};

export const ValidationError: Story = {
  args: {
    label: 'Identity document',
    accept: '.pdf',
    maxSize: 1024 * 1024,
    error: 'Upload a PDF smaller than 1 MB.',
  },
};

export const Required: Story = {
  args: {
    label: 'Supporting document',
    required: true,
    helperText: 'A supporting document is required.',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Locked attachment',
    disabled: true,
    defaultValue: [
      new File(['Locked'], 'locked-document.pdf', {
        type: PDF_MIME_TYPE,
      }),
    ],
  },
};

export const LongFilename: Story = {
  args: {
    label: 'Long filename',
    defaultValue: [
      new File(
        ['Long filename'],
        'final-approved-quarterly-financial-report-with-appendices-and-supporting-evidence.pdf',
        { type: PDF_MIME_TYPE }
      ),
    ],
  },
};
