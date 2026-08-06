import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { FileUpload } from './index';

describe('FileUpload.Trigger asChild validation', () => {
  it('rejects fragments because they cannot receive trigger props or refs', () => {
    expect(() =>
      render(
        <FileUpload label='Attachment'>
          <FileUpload.Trigger asChild>
            <>
              <span>Attach file</span>
              <span aria-hidden='true'>+</span>
            </>
          </FileUpload.Trigger>
        </FileUpload>
      )
    ).toThrow('fragments are not supported');
  });
});
