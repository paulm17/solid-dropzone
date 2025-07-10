import { useDropzone } from "solid-dropzone";
import Dropzone from "solid-dropzone";
import { For } from "solid-js";
import { DropzoneRef } from "../types";

export default {
  title: "FileDialog",
};

export function Usage() {
  const props = useDropzone({
    noClick: true,
    noKeyboard: true
  });

  return (
    <div class="container">
      <div {...props.getRootProps({ class: 'dropzone' })}>
        <input {...props.getInputProps()} />
        <p>Drag 'n' drop some files here</p>
        <button type="button" onClick={props.open}>
          Open File Dialog
        </button>
      </div>
      <aside>
        <h4>Files</h4>
        <ul>
          <For each={props.acceptedFiles()}>
            {(file) => (
              <li>
                {file.name} - {file.size} bytes
              </li>
            )}
          </For>
        </ul>
      </aside>
    </div>
  );
}

export function WithRef() {
  const dropzoneRef: Partial<DropzoneRef> = {};
  
  const openDialog = () => {
    if (dropzoneRef.open) {
      dropzoneRef.open();
    }
  };

  return (
    <Dropzone ref={dropzoneRef} noClick noKeyboard>
      {({ getRootProps, getInputProps, acceptedFiles }) => (
        <div class="container">
          <div {...getRootProps({ class: 'dropzone' })}>
            <input {...getInputProps()} />
            <p>Drag 'n' drop some files here</p>
            <button
              type="button"
              onClick={openDialog}
            >
              Open File Dialog
            </button>
          </div>
          <aside>
            <h4>Files</h4>
            <ul>
              <For each={acceptedFiles()}>
                {(file) => (
                  <li>
                    {file.name} - {file.size} bytes
                  </li>
                )}
              </For>
            </ul>
          </aside>
        </div>
      )}
    </Dropzone>
  );
}