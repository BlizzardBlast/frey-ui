import type React from 'react';
import { FileUploadRoot, type FileUploadProps } from './FileUpload';
import {
  FileUploadDropzone,
  type FileUploadDropzoneProps,
} from './FileUploadDropzone';
import {
  FileUploadItem,
  type FileUploadItemProps,
} from './FileUploadItem';
import {
  FileUploadList,
  type FileUploadListProps,
} from './FileUploadList';
import {
  FileUploadPreview,
  type FileUploadPreviewProps,
} from './FileUploadPreview';
import {
  FileUploadTrigger,
  type FileUploadTriggerProps,
} from './FileUploadTrigger';

type FileUploadComponent = React.FC<Readonly<FileUploadProps>> & {
  Dropzone: typeof FileUploadDropzone;
  Trigger: typeof FileUploadTrigger;
  List: typeof FileUploadList;
  Item: typeof FileUploadItem;
  Preview: typeof FileUploadPreview;
};

const FileUpload: FileUploadComponent = Object.assign(FileUploadRoot, {
  Dropzone: FileUploadDropzone,
  Trigger: FileUploadTrigger,
  List: FileUploadList,
  Item: FileUploadItem,
  Preview: FileUploadPreview,
});

export { FileUpload };
export type {
  FileUploadDropzoneProps,
  FileUploadItemProps,
  FileUploadListProps,
  FileUploadPreviewProps,
  FileUploadProps,
  FileUploadTriggerProps,
};
export type {
  FileUploadRejected,
  FileUploadRejectionCode,
  FileValidationError,
  FileValidationRule,
} from './fileValidation';
