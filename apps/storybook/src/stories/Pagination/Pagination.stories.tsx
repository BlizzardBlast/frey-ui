import type { Meta, StoryObj } from '@storybook/react-vite';
import { Pagination, type PaginationProps } from 'frey-ui';
import { useEffect, useState } from 'react';

function normalizePositiveInt(
  value: number | undefined,
  fallback: number
): number {
  const parsed = Math.floor(value ?? fallback);

  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback;
  }

  return parsed;
}

function clampPage(page: number, totalPages: number): number {
  return Math.min(Math.max(page, 1), totalPages);
}

type PaginationStoryProps = Pick<
  PaginationProps,
  | 'totalPages'
  | 'page'
  | 'defaultPage'
  | 'onPageChange'
  | 'siblingCount'
  | 'boundaryCount'
  | 'disabled'
  | 'showControls'
  | 'previousLabel'
  | 'nextLabel'
  | 'ariaLabel'
  | 'className'
  | 'style'
>;

const meta: Meta<PaginationStoryProps> = {
  component: Pagination,
  parameters: {
    layout: 'centered'
  },
  argTypes: {
    totalPages: {
      control: { type: 'number' },
      description: 'Total number of available pages',
      table: {
        type: {
          summary: 'number'
        },
        defaultValue: {
          summary: 'None'
        }
      }
    },
    page: {
      control: { type: 'number' },
      description: 'Controlled current page',
      table: {
        type: {
          summary: 'number'
        },
        defaultValue: {
          summary: 'None'
        }
      }
    },
    defaultPage: {
      control: { type: 'number' },
      description: 'Initial page when the component is uncontrolled',
      table: {
        type: {
          summary: 'number'
        },
        defaultValue: {
          summary: '1'
        }
      }
    },
    onPageChange: {
      action: 'page changed',
      description: 'Called when the selected page changes',
      table: {
        type: {
          summary: '(page: number) => void'
        },
        defaultValue: {
          summary: 'None'
        }
      }
    },
    siblingCount: {
      control: { type: 'number' },
      description:
        'Number of sibling pages shown on each side of the current page',
      table: {
        type: {
          summary: 'number'
        },
        defaultValue: {
          summary: '1'
        }
      }
    },
    boundaryCount: {
      control: { type: 'number' },
      description:
        'Number of always-visible pages shown at the beginning and end',
      table: {
        type: {
          summary: 'number'
        },
        defaultValue: {
          summary: '1'
        }
      }
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Whether the pagination is disabled',
      table: {
        type: {
          summary: 'boolean'
        },
        defaultValue: {
          summary: 'false'
        }
      }
    },
    showControls: {
      control: { type: 'boolean' },
      description: 'Whether the previous and next controls are displayed',
      table: {
        type: {
          summary: 'boolean'
        },
        defaultValue: {
          summary: 'true'
        }
      }
    },
    previousLabel: {
      control: { type: 'text' },
      description: 'Text label for the previous page button',
      table: {
        type: {
          summary: 'string'
        },
        defaultValue: {
          summary: "'Previous'"
        }
      }
    },
    nextLabel: {
      control: { type: 'text' },
      description: 'Text label for the next page button',
      table: {
        type: {
          summary: 'string'
        },
        defaultValue: {
          summary: "'Next'"
        }
      }
    },
    ariaLabel: {
      control: { type: 'text' },
      description: 'Accessible label for the pagination navigation landmark',
      table: {
        type: {
          summary: 'string'
        },
        defaultValue: {
          summary: "'Pagination'"
        }
      }
    },
    className: {
      control: { type: 'text' },
      description: 'Additional class names applied to the pagination root',
      table: {
        type: {
          summary: 'string'
        },
        defaultValue: {
          summary: 'None'
        }
      }
    },
    style: {
      control: { type: 'object' },
      description: 'Inline styles applied to the pagination root',
      table: {
        type: {
          summary: 'CSSProperties'
        },
        defaultValue: {
          summary: 'None'
        }
      }
    }
  }
} satisfies Meta<PaginationStoryProps>;

export default meta;

type Story = StoryObj<PaginationStoryProps>;

export const basic: Story = {
  args: {
    totalPages: 7
  }
} satisfies Story;

export const truncated: Story = {
  args: {
    totalPages: 24,
    defaultPage: 12,
    siblingCount: 1,
    boundaryCount: 1
  },
  render: (args) => <Pagination {...args} />
} satisfies Story;

export const controlled: Story = {
  args: {
    totalPages: 12,
    defaultPage: 3
  },
  render: function ControlledStory(args) {
    const resolvedTotalPages = normalizePositiveInt(args.totalPages, 1);
    const initialPage = clampPage(
      normalizePositiveInt(args.defaultPage, 1),
      resolvedTotalPages
    );
    const [page, setPage] = useState(initialPage);

    useEffect(() => {
      if (args.page === undefined) {
        setPage(initialPage);
      }
    }, [args.page, initialPage]);

    const resolvedPage =
      args.page === undefined
        ? clampPage(page, resolvedTotalPages)
        : clampPage(normalizePositiveInt(args.page, 1), resolvedTotalPages);

    const handlePageChange = (nextPage: number) => {
      if (args.page === undefined) {
        setPage(nextPage);
      }

      args.onPageChange?.(nextPage);
    };

    return (
      <div style={{ display: 'grid', gap: 12 }}>
        <div style={{ fontSize: '0.875rem' }}>Current page: {resolvedPage}</div>
        <Pagination
          {...args}
          totalPages={resolvedTotalPages}
          page={resolvedPage}
          onPageChange={handlePageChange}
        />
      </div>
    );
  }
} satisfies Story;

export const custom_labels_and_theme: Story = {
  args: {
    totalPages: 9,
    defaultPage: 5,
    previousLabel: 'Back',
    nextLabel: 'Forward'
  },
  render: (args) => (
    <Pagination
      {...args}
      style={
        {
          ...(args.style ?? {}),
          '--frey-color-primary': 'var(--frey-palette-blue-600)'
        } as React.CSSProperties
      }
    />
  )
} satisfies Story;
