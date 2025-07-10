import { Accessor } from "solid-js";
import { JSX } from "solid-js/jsx-runtime";

export interface FileError {
  code: string;
  message: string;
}

export interface FileRejection {
  file: File;
  errors: FileError[];
}

export interface AcceptProp {
  [key: string]: string[];
}

export interface DropEvent extends DragEvent {
  dataTransfer: DataTransfer;
}

export interface DropzoneRef {
  open: () => void;
}

export interface DropzoneRootProps {
  refKey?: string;
  role?: JSX.HTMLAttributes<HTMLElement>['role'];
  onKeyDown?: (event: KeyboardEvent) => void;
  onFocus?: (event: FocusEvent) => void;
  onBlur?: (event: FocusEvent) => void;
  onClick?: (event: MouseEvent) => void;
  onDragEnter?: (event: DragEvent) => void;
  onDragOver?: (event: DragEvent) => void;
  onDragLeave?: (event: DragEvent) => void;
  onDrop?: (event: DragEvent) => void;
  [key: string]: any;
}

export interface DropzoneInputProps {
  refKey?: string;
  onChange?: (event: Event) => void;
  onClick?: (event: MouseEvent) => void;
  [key: string]: any;
}

export interface DropzoneState {
  isFocused: () => boolean;
  isFileDialogActive: boolean;
  isDragActive: () => boolean;
  isDragAccept: () => boolean;
  isDragReject: () => boolean;
  acceptedFiles: Accessor<File[]>;
  fileRejections: Accessor<FileRejection[]>;
}

export interface DropzoneMethods {
  getRootProps: (props?: DropzoneRootProps) => DropzoneRootProps;
  getInputProps: (props?: DropzoneInputProps) => DropzoneInputProps;
  open: () => void;
  rootRef: HTMLElement | undefined;
  inputRef: HTMLInputElement | undefined;
}

export type DropzoneHookResult = DropzoneState & DropzoneMethods;

export interface DropzoneProps {
  ref?: Partial<DropzoneRef>; 
  accept?: AcceptProp;
  multiple?: boolean;
  preventDropOnDocument?: boolean;
  noClick?: boolean;
  noKeyboard?: boolean;
  noDrag?: boolean;
  noDragEventsBubbling?: boolean;
  minSize?: number;
  maxSize?: number;
  maxFiles?: number;
  disabled?: boolean;
  getFilesFromEvent?: (event: DragEvent | Event | FileSystemFileHandle[]) => File[] | Promise<File[]>;
  onFileDialogCancel?: () => void;
  onFileDialogOpen?: () => void;
  useFsAccessApi?: boolean;
  autoFocus?: boolean;
  onDragEnter?: (event: DragEvent) => void;
  onDragLeave?: (event: DragEvent) => void;
  onDragOver?: (event: DragEvent) => void;
  onDrop?: (acceptedFiles: File[], fileRejections: FileRejection[], event: DragEvent | Event) => void;
  onDropAccepted?: (files: File[], event: DragEvent | Event) => void;
  onDropRejected?: (fileRejections: FileRejection[], event: DragEvent | Event) => void;
  onError?: (error: Error) => void;
  validator?: (file: File) => FileError | FileError[] | null;
  children?: 
    | JSX.Element           // allow normal JSX children
    | ((state: DropzoneHookResult) => JSX.Element);
}