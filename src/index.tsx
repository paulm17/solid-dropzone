import {
  createSignal,
  createEffect,
  createMemo,
  onCleanup,
  splitProps,
  mergeProps,
  ParentComponent,
  Component,
} from "solid-js";
import {
  acceptPropAsAcceptAttr,
  allFilesAccepted,
  composeEventHandlers,
  fileAccepted,
  fileMatchSize,
  canUseFileSystemAccessAPI,
  isAbort,
  isEvtWithFiles,
  isIeOrEdge,
  isPropagationStopped,
  isSecurityError,
  onDocumentDragOver,
  pickerOptionsFromAccept,
  TOO_MANY_FILES_REJECTION,
} from "./utils";
import { DropzoneHookResult, DropzoneInputProps, DropzoneProps, DropzoneRootProps, FileError, FileRejection, FileWithPath, fromEvent, GenericEventHandler } from "./types";

const defaultProps = {
  disabled: false,
  getFilesFromEvent: fromEvent,
  maxSize: Infinity,
  minSize: 0,
  multiple: true,
  maxFiles: 0,
  preventDropOnDocument: true,
  noClick: false,
  noKeyboard: false,
  noDrag: false,
  noDragEventsBubbling: false,
  useFsAccessApi: false,
  autoFocus: false,
};

/**
 * Convenience wrapper component for the `useDropzone` hook
 */
const Dropzone: Component<DropzoneProps> = (props) => {
  const [local, others] = splitProps(props, ['children', 'ref']);
  const dropzoneState = useDropzone(others);

  if (local.ref) {
    local.ref.open = dropzoneState.open;
  }
  
  const c = local.children;
  return (
    <>
      {typeof c === 'function'
        ? c(dropzoneState)
        : c /* just render whatever JSX they passed */}
    </>
  );
};

export default Dropzone;

/**
 * A SolidJS hook that creates a drag 'n' drop area.
 */
export function useDropzone(props: DropzoneProps = {}): DropzoneHookResult {
  const mergedProps = mergeProps(defaultProps, props);
  const [local] = splitProps(mergedProps, [
    'accept',
    'disabled',
    'getFilesFromEvent',
    'maxSize',
    'minSize',
    'multiple',
    'maxFiles',
    'onDragEnter',
    'onDragLeave',
    'onDragOver',
    'onDrop',
    'onDropAccepted',
    'onDropRejected',
    'onFileDialogCancel',
    'onFileDialogOpen',
    'useFsAccessApi',
    'autoFocus',
    'preventDropOnDocument',
    'noClick',
    'noKeyboard',
    'noDrag',
    'noDragEventsBubbling',
    'onError',
    'validator',
  ]);

  // State signals
  const [isFocused, setIsFocused] = createSignal(false);
  const [isFileDialogActive, setIsFileDialogActive] = createSignal(false);
  const [isDragActive, setIsDragActive] = createSignal(false);
  const [isDragAccept, setIsDragAccept] = createSignal(false);
  const [isDragReject, setIsDragReject] = createSignal(false);
  const [acceptedFiles, setAcceptedFiles] = createSignal<File[]>([]);
  const [fileRejections, setFileRejections] = createSignal<FileRejection[]>([]);

  // Refs
  let rootRef: HTMLElement | undefined;
  let inputRef: HTMLInputElement | undefined;
  
  let openCalledInThisTick = false;

  // Memoized values
  const acceptAttr = createMemo(() => acceptPropAsAcceptAttr(local.accept));
  const pickerTypes = createMemo(() => pickerOptionsFromAccept(local.accept));

  const onFileDialogOpenCb = createMemo(() => 
    typeof local.onFileDialogOpen === "function" ? local.onFileDialogOpen : noop
  );
  const onFileDialogCancelCb = createMemo(() => 
    typeof local.onFileDialogCancel === "function" ? local.onFileDialogCancel : noop
  );

  let dragTargets: EventTarget[] = [];
  let fsAccessApiWorks = typeof window !== "undefined" &&
    window.isSecureContext &&
    local.useFsAccessApi &&
    canUseFileSystemAccessAPI();

  // Window focus handler
  const onWindowFocus = () => {
    if (!fsAccessApiWorks && isFileDialogActive()) {
      setTimeout(() => {
        if (inputRef) {
          const { files } = inputRef;
          if (!files?.length) {
            setIsFileDialogActive(false);
            onFileDialogCancelCb()();
          }
        }
      }, 300);
    }
  };

  createEffect(() => {
    window.addEventListener("focus", onWindowFocus, false);
    onCleanup(() => {
      window.removeEventListener("focus", onWindowFocus, false);
    });
  });

  // Document drop prevention
  const onDocumentDrop = (event: Event) => {
    if (rootRef && rootRef.contains(event.target as Node)) {
      return;
    }
    event.preventDefault();
    dragTargets = [];
  };

  createEffect(() => {
    if (local.preventDropOnDocument) {
      document.addEventListener("dragover", onDocumentDragOver, false);
      document.addEventListener("drop", onDocumentDrop, false);
      onCleanup(() => {
        document.removeEventListener("dragover", onDocumentDragOver);
        document.removeEventListener("drop", onDocumentDrop);
      });
    }
  });

  // Auto focus
  createEffect(() => {
    if (!local.disabled && local.autoFocus && rootRef) {
      rootRef.focus();
    }
  });

  const onErrCb = (e: Error) => {
    console.error("[useDropzone] Error:", e);
    if (local.onError) {
      local.onError(e);
    } else {
      console.error(e);
    }
  };

  const onDragEnterCb = (event: DragEvent) => {
    event.preventDefault();
    stopPropagation(event);

    dragTargets = [...dragTargets, event.target!];

    if (isEvtWithFiles(event)) {
      Promise.resolve(local.getFilesFromEvent(event))
        .then((files) => {
          if (isPropagationStopped(event) && !local.noDragEventsBubbling) {
            return;
          }

          const fileCount = files.length;
          const dragAccept =
            fileCount > 0 &&
            allFilesAccepted({
              files: files as File[],
              accept: acceptAttr(),
              minSize: local.minSize,
              maxSize: local.maxSize,
              multiple: local.multiple,
              maxFiles: local.maxFiles,
              validator: local.validator,
            });
          const dragReject = fileCount > 0 && !dragAccept;

          setIsDragAccept(dragAccept);
          setIsDragReject(dragReject);
          setIsDragActive(true);

          if (local.onDragEnter) {
            local.onDragEnter(event);
          }
        })
        .catch((e) => onErrCb(e));
    }
  };

  const onDragOverCb = (event: DragEvent) => {
    event.preventDefault();
    stopPropagation(event);

    const hasFiles = isEvtWithFiles(event);
    if (hasFiles && event.dataTransfer) {
      try {
        event.dataTransfer.dropEffect = "copy";
      } catch {
        // Ignore errors
      }
    }

    if (hasFiles && local.onDragOver) {
      local.onDragOver(event);
    }

    return false;
  };

  const onDragLeaveCb = (event: DragEvent) => {
    event.preventDefault();
    stopPropagation(event);

    // Only deactivate once the dropzone and all children have been left
    const targets = dragTargets.filter(
      (target) => rootRef && rootRef.contains(target as Node)
    );
    
    // Make sure to remove a target present multiple times only once
      // (Firefox may fire dragenter/dragleave multiple times on the same element)
    const targetIdx = targets.indexOf(event.target!);
    if (targetIdx !== -1) {
      targets.splice(targetIdx, 1);
    }
    dragTargets = targets;
    if (targets.length > 0) {
      return;
    }

    setIsDragActive(false);
    setIsDragAccept(false);
    setIsDragReject(false);

    if (isEvtWithFiles(event) && local.onDragLeave) {
      local.onDragLeave(event);
    }
  };

  const setFiles = (files: FileWithPath[], event: DragEvent | Event | null) => {
    const newAcceptedFiles: File[] = [];
    const newFileRejections: FileRejection[] = [];

    files.forEach((file) => {
      const [accepted, acceptError] = fileAccepted(file as File, acceptAttr());
      const [sizeMatch, sizeError] = fileMatchSize(file as File, local.minSize, local.maxSize);
      const customErrors = local.validator ? local.validator(file as File) : null;

      if (accepted && sizeMatch && !customErrors) {
        newAcceptedFiles.push(file as File);
      } else {
        let errors = [acceptError, sizeError].filter((e): e is FileError => e !== null);

        if (customErrors) {
          errors = errors.concat(Array.isArray(customErrors) ? customErrors : [customErrors]);
        }

        newFileRejections.push({ file: file as File, errors });
      }
    });

    if (
      (!local.multiple && newAcceptedFiles.length > 1) ||
      (local.multiple && local.maxFiles >= 1 && newAcceptedFiles.length > local.maxFiles)
    ) {
      newAcceptedFiles.forEach((file) => {
        newFileRejections.push({ file, errors: [TOO_MANY_FILES_REJECTION] });
      });
      newAcceptedFiles.splice(0);
    }

    setAcceptedFiles(newAcceptedFiles);
    setFileRejections(newFileRejections);
    setIsDragReject(newFileRejections.length > 0);

    if (local.onDrop && event) {
      local.onDrop(newAcceptedFiles, newFileRejections, event);
    }

    if (newFileRejections.length > 0 && local.onDropRejected && event) {
      local.onDropRejected(newFileRejections, event);
    }

    if (newAcceptedFiles.length > 0 && local.onDropAccepted && event) {
      local.onDropAccepted(newAcceptedFiles, event);
    }
  };

  const onDropCb = (event: DragEvent | Event) => {
    event.preventDefault();
    // Persist here because we need the event later after getFilesFromEvent() is done
    stopPropagation(event);

    dragTargets = [];

    if (isEvtWithFiles(event)) {
      Promise.resolve(local.getFilesFromEvent(event))
        .then((files) => {
          if (isPropagationStopped(event) && !local.noDragEventsBubbling) {
            return;
          }
          setFiles(files as FileWithPath[], event);
        })
        .catch((e) => onErrCb(e));
    }
    
    // Reset drag state
    setIsDragActive(false);
    setIsDragAccept(false);
    setIsDragReject(false);
  };

  const openFileDialog = () => {
    // No point to use FS access APIs if context is not secure
    // https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts#feature_detection
    if (fsAccessApiWorks) {
      setIsFileDialogActive(true);
      onFileDialogOpenCb()();

      // https://developer.mozilla.org/en-US/docs/Web/API/window/showOpenFilePicker
      const opts = {
        multiple: local.multiple,
        types: pickerTypes(),
      };
      
      (window as any)
        .showOpenFilePicker(opts)
        .then((handles: FileSystemFileHandle[]) => local.getFilesFromEvent(handles))
        .then((files: FileWithPath[]) => {
          setFiles(files, null);
          setIsFileDialogActive(false);
        })
        .catch((e: Error) => {
          // AbortError means the user canceled
          if (isAbort(e)) {
            onFileDialogCancelCb()();
            setIsFileDialogActive(false);
          } else if (isSecurityError(e)) {
            fsAccessApiWorks = false;
            // CORS, so cannot use this API
            // Try using the input
            if (inputRef) {
              inputRef.value = "";
              inputRef.click();
            } else {
              onErrCb(
                new Error(
                  "Cannot open the file picker because the File System Access API is not supported and no <input> was provided."
                )
              );
            }
          } else {
            onErrCb(e);
          }
        });
      return;
    }

    if (inputRef) {
      setIsFileDialogActive(true);
      onFileDialogOpenCb()();
      inputRef.value = "";
      inputRef.click();
    }
  };

  // Cb to open the file dialog when SPACE/ENTER occurs on the dropzone
  const onKeyDownCb = (event: KeyboardEvent) => {
    if (!rootRef || !rootRef.isEqualNode(event.target as Node)) {
      return;
    }

    if (
      event.key === " " ||
      event.key === "Enter" ||
      event.keyCode === 32 ||
      event.keyCode === 13
    ) {
      event.preventDefault();
      openFileDialog();
    }
  };

  // Update focus state for the dropzone
  const onFocusCb = () => {
    setIsFocused(true);
  };

  const onBlurCb = () => {
    setIsFocused(false);
  };

  // Cb to open the file dialog when click occurs on the dropzone
  const onClickCb = () => {
    if (local.noClick || openCalledInThisTick) {
      return;
    }

    // In IE11/Edge the file-browser dialog is blocking, therefore, use setTimeout()
    // to ensure React can handle state changes
    // See: https://github.com/react-dropzone/react-dropzone/issues/450
    if (isIeOrEdge()) {
      setTimeout(openFileDialog, 0);
    } else {
      openFileDialog();
    }
  };

  const composeHandler = <T extends (...args: any[]) => any>(fn: T): T | undefined => {
    return local.disabled ? undefined : fn;
  };

  const composeKeyboardHandler = <T extends (...args: any[]) => any>(fn: T): T | undefined => {
    return local.noKeyboard ? undefined : composeHandler(fn);
  };

  const composeDragHandler = <T extends (...args: any[]) => any>(fn: T): T | undefined => {
    return local.noDrag ? undefined : composeHandler(fn);
  };

  const stopPropagation = (event: DragEvent | Event) => {
    if (local.noDragEventsBubbling) {
      event.stopPropagation();
    }
  };

  const getRootProps = (props: DropzoneRootProps = {}): DropzoneRootProps => {
    const [localProps, restProps] = splitProps(props, [
      'refKey',
      'role',
      'onKeyDown',
      'onFocus',
      'onBlur',
      'onClick',
      'onDragEnter',
      'onDragOver',
      'onDragLeave',
      'onDrop',
    ]);

    const refKey = localProps.refKey || 'ref';

    const rootProps = {
      onKeyDown: composeKeyboardHandler(
        composeEventHandlers(localProps.onKeyDown, onKeyDownCb)
      ),
      onFocus: composeKeyboardHandler(
        composeEventHandlers(localProps.onFocus, onFocusCb)
      ),
      onBlur: composeKeyboardHandler(
        composeEventHandlers(localProps.onBlur, onBlurCb)
      ),
      onClick: composeHandler(
        composeEventHandlers(localProps.onClick, onClickCb)
      ),
      onDragEnter: composeDragHandler(
        composeEventHandlers(localProps.onDragEnter, onDragEnterCb)
      ),
      onDragOver: composeDragHandler(
        composeEventHandlers(localProps.onDragOver, onDragOverCb)
      ),
      onDragLeave: composeDragHandler(
        composeEventHandlers(localProps.onDragLeave, onDragLeaveCb)
      ),
      onDrop: composeDragHandler(
        composeEventHandlers(localProps.onDrop, onDropCb)
      ),
      role: localProps.role ? localProps.role : "presentation",
      [refKey]: (el: HTMLElement) => { rootRef = el; },
      ...(!local.disabled && !local.noKeyboard ? { tabIndex: 0 } : {}),
      ...restProps,
    };

    return rootProps;
  };

  const onInputElementClick = (event: MouseEvent) => {
    event.stopPropagation();
  };

  const getInputProps = (props: DropzoneInputProps = {}): DropzoneInputProps => {
    const [localProps, restProps] = splitProps(props, ['refKey', 'onChange', 'onClick']);
    const refKey = localProps.refKey || 'ref';

    const inputProps = {
      accept: acceptAttr(),
      multiple: local.multiple,
      type: "file" as const,
      style: {
        border: "0px",
        clip: "rect(0, 0, 0, 0)",
        "clip-path": "inset(50%)",
        height: "1px",
        margin: "0px -1px -1px 0px",
        overflow: "hidden",
        padding: "0px",
        position: "absolute" as const,
        width: "1px",
        "white-space": "nowrap" as const,
      },
      onChange: composeHandler(
        composeEventHandlers(localProps.onChange as GenericEventHandler, onDropCb)
      ),
      onClick: composeHandler(
        composeEventHandlers(localProps.onClick as GenericEventHandler, onInputElementClick)
      ),
      tabIndex: -1,
      [refKey]: (el: HTMLInputElement) => { inputRef = el; },
    };

    const finalInputProps = {
      ...inputProps,
      ...restProps,
    };

    return finalInputProps;
  };

  const open = () => {
    if (!local.disabled) {
      openCalledInThisTick = true;
      openFileDialog();
      // Reset the flag in the next tick
      setTimeout(() => {
        openCalledInThisTick = false;
      }, 0);
    }
  };

  return {
    isFocused: () => isFocused() && !local.disabled,
    isFileDialogActive: isFileDialogActive(),
    isDragActive,
    isDragAccept,
    isDragReject,
    acceptedFiles: acceptedFiles,
    fileRejections: fileRejections,
    getRootProps,
    getInputProps,
    rootRef,
    inputRef,
    open,
  };
}

function noop(): void {}

export { ErrorCode } from "./utils";
export * from './types';