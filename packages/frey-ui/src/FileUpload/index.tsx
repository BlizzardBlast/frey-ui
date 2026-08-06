import type React from 'react';
import type { FileUploadProps } from './FileUpload';
import { FileUploadRoot } from './FileUpload';
import { FileUploadDropzone } from './FileUploadDropzone';
import { FileUploadItem } from './FileUploadItem';
import { FileUploadList } from './FileUploadList';
import { FileUploadPreview } from './FileUploadPreview';
import { FileUploadTrigger } from './FileUploadTrigger';

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

export type { FileUploadProps } from './FileUpload';
export type { FileUploadDropzoneProps } from './FileUploadDropzone';
export type { FileUploadItemProps } from './FileUploadItem';
export type { FileUploadListProps } from './FileUploadList';
export type { FileUploadPreviewProps } from './FileUploadPreview';
export type { FileUploadTriggerProps } from './FileUploadTrigger';
export type {
  FileUploadRejected,
  FileUploadRejectionCode,
  FileValidationError,
  FileValidationRule,
} from './fileValidation';
export { FileUpload };
