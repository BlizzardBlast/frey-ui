import clsx from 'clsx';
import {
  Children,
  type CSSProperties,
  cloneElement,
  createContext,
  type DragEventHandler,
  Fragment,
  forwardRef,
  type HTMLAttributes,
  type MouseEventHandler,
  type ReactNode,
  type RefObject,
  useContext,
} from 'react';
import Field from '../Field';
import styles from './fileUpload.module.css';
import { type FileUploadRejected, formatFileSize } from './fileValidation';
import {
  type UseFileUploadStateOptions,
  useFileUploadState,
} from './useFileUploadState';

export type FileUploadProps = UseFileUploadStateOptions & {
  children?: ReactNode;
  label: string;
  hideLabel?: boolean;
  helperText?: string;
  error?: string;
  required?: boolean;
  id?: string;
  name?: string;
  className?: string;
  style?: CSSProperties;
};

type FileUploadContextValue = {
  files: File[];
  rejected: FileUploadRejected[];
  inputRef: RefObject<HTMLInputElement | null>;
  onInputChange: React.ChangeEventHandler<HTMLInputElement>;
  openFileDialog: () => void;
  removeFile: (file: File) => void;
  isDragOver: boolean;
  onDragEnter: DragEventHandler<HTMLElement>;
  onDragLeave: DragEventHandler<HTMLElement>;
  onDragOver: DragEventHandler<HTMLElement>;
  onDrop: DragEventHandler<HTMLElement>;
  inputId: string;
  labelId: string;
  describedBy?: string;
  hasError: boolean;
  isRequired: boolean;
  disabled: boolean;
  isMultiple: boolean;
};

const FileUploadContext = createContext<FileUploadContextValue | null>(null);

function useFileUploadContext() {
  const value = useContext(FileUploadContext);

  if (!value) {
    throw new Error(
      'FileUpload compound components must be rendered inside <FileUpload>'
    );
  }

  return value;
}

const FileUploadRoot: React.FC<FileUploadProps> = ({
  children,
  label,
  hideLabel,
  helperText,
  error,
  required,
  id,
  name,
  className,
  style,
  ...stateOptions
}: FileUploadProps) => {
  const state = useFileUploadState({
    ...stateOptions,
    disabled: stateOptions.disabled,
  });

  const fieldError =
    error ??
    (state.rejected.length > 0
      ? state.rejected.map((rejected) => rejected.reason).join(', ')
      : undefined);

  return (
    <Field
      label={label}
      hideLabel={hideLabel}
      error={fieldError}
      helperText={helperText}
      required={required}
      disabled={stateOptions.disabled}
      id={id}
      className={className}
      style={style}
      labelElement='span'
    >
      {({ inputId, labelId, describedBy, hasError }) => (
        <>
          <input
            id={inputId}
            name={name}
            type='file'
            ref={state.inputRef}
            onChange={state.onInputChange}
            accept={stateOptions.accept}
            multiple={stateOptions.multiple}
            disabled={stateOptions.disabled}
            required={required && state.files.length === 0}
            className={styles.input}
            tabIndex={-1}
            aria-hidden='true'
          />
          <FileUploadContext.Provider
            value={{
              ...state,
              inputId,
              labelId,
              describedBy,
              hasError,
              isRequired: Boolean(required),
              disabled: Boolean(stateOptions.disabled),
              isMultiple: stateOptions.multiple === true,
            }}
          >
            {children}
          </FileUploadContext.Provider>
        </>
      )}
    </Field>
  );
};

FileUploadRoot.displayName = 'FileUpload';

export type FileUploadDropzoneProps = HTMLAttributes<HTMLButtonElement> & {
  children?: ReactNode;
};

type FileUploadDropzoneComponent = React.ForwardRefExoticComponent<
  Readonly<FileUploadDropzoneProps> & React.RefAttributes<HTMLButtonElement>
>;

const FileUploadDropzone: FileUploadDropzoneComponent = forwardRef<
  HTMLButtonElement,
  Readonly<FileUploadDropzoneProps>
>(function FileUploadDropzone(
  { children, className, style, onClick, ...rest },
  forwardedRef
) {
  const context = useFileUploadContext();

  const handleClick: MouseEventHandler<HTMLButtonElement> = (event) => {
    onClick?.(event);
    context.openFileDialog();
  };

  return (
    <button
      ref={forwardedRef}
      type='button'
      disabled={context.disabled}
      aria-invalid={context.hasError}
      aria-labelledby={context.labelId}
      aria-describedby={context.describedBy}
      id={`${context.inputId}-dropzone`}
      className={clsx(
        styles.dropzone,
        context.isDragOver && styles.dragover,
        className
      )}
      style={style}
      onClick={handleClick}
      onDragEnter={context.onDragEnter}
      onDragLeave={context.onDragLeave}
      onDragOver={context.onDragOver}
      onDrop={context.onDrop}
      {...rest}
    >
      {children ?? (
        <span>
          Click or drag {context.isMultiple ? 'files' : 'a file'} here to upload
        </span>
      )}
    </button>
  );
});

FileUploadDropzone.displayName = 'FileUpload.Dropzone';

export type FileUploadListProps = HTMLAttributes<HTMLUListElement> & {
  children?: ReactNode;
};

type FileUploadListComponent = React.ForwardRefExoticComponent<
  Readonly<FileUploadListProps> & React.RefAttributes<HTMLUListElement>
>;

const FileUploadList: FileUploadListComponent = forwardRef<
  HTMLUListElement,
  Readonly<FileUploadListProps>
>(function FileUploadList(
  { children, className, style, ...rest },
  forwardedRef
) {
  const context = useFileUploadContext();

  const itemTemplate = Children.toArray(children).find(
    (child): child is React.ReactElement<FileUploadItemProps> =>
      child !== null &&
      typeof child === 'object' &&
      'type' in child &&
      child.type === FileUploadItem
  );

  return (
    <ul
      ref={forwardedRef}
      className={clsx(styles.list, className)}
      style={style}
      {...rest}
    >
      {context.files.map((file) => {
        const key = `${file.name}-${file.size}`;
        return itemTemplate ? (
          <Fragment key={key}>{cloneElement(itemTemplate, { file })}</Fragment>
        ) : (
          <FileUploadItem key={key} file={file} />
        );
      })}
    </ul>
  );
});

FileUploadList.displayName = 'FileUpload.List';

export type FileUploadItemProps = Omit<
  HTMLAttributes<HTMLLIElement>,
  'children'
> & {
  file?: File;
  children?: ReactNode | ((file: File, onRemove: () => void) => ReactNode);
};

type FileUploadItemComponent = React.ForwardRefExoticComponent<
  Readonly<FileUploadItemProps> & React.RefAttributes<HTMLLIElement>
>;

const FileUploadItem: FileUploadItemComponent = forwardRef<
  HTMLLIElement,
  Readonly<FileUploadItemProps>
>(function FileUploadItem(
  { file, children, className, style, ...rest },
  forwardedRef
) {
  const context = useFileUploadContext();
  const currentFile = file ?? context.files[0];

  if (!currentFile) {
    return null;
  }

  const onRemove = () => {
    context.removeFile(currentFile);
  };

  return (
    <li
      ref={forwardedRef}
      className={clsx(styles.item, className)}
      style={style}
      {...rest}
    >
      {typeof children === 'function' ? (
        children(currentFile, onRemove)
      ) : (
        <div className={styles.itemContent}>
          <span className={styles.fileName}>{currentFile.name}</span>
          <span className={styles.fileSize}>
            {formatFileSize(currentFile.size)}
          </span>
          <button
            type='button'
            onClick={(event) => {
              event.stopPropagation();
              onRemove();
            }}
            disabled={context.disabled}
            aria-label={`Remove ${currentFile.name}`}
            className={styles.removeButton}
          >
            ×
          </button>
        </div>
      )}
    </li>
  );
});

FileUploadItem.displayName = 'FileUpload.Item';

type FileUploadComponent = React.FC<FileUploadProps> & {
  Dropzone: typeof FileUploadDropzone;
  List: typeof FileUploadList;
  Item: typeof FileUploadItem;
};

const FileUpload = Object.assign(FileUploadRoot, {
  Dropzone: FileUploadDropzone,
  List: FileUploadList,
  Item: FileUploadItem,
}) as FileUploadComponent;

export { FileUpload };
