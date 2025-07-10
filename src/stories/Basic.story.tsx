import { useDropzone } from "solid-dropzone";
import { For } from "solid-js";

export default {
  title: "Basic",
};

export function Usage() {
  const { acceptedFiles, getRootProps, getInputProps } = useDropzone();

  return (
    <div>
      <div {...getRootProps()} style={{
        border: '2px dashed #cccccc',
        'border-radius': '4px',
        padding: '20px',
        'text-align': 'center',
        cursor: 'pointer'
      }}>
        <input {...getInputProps()} />
        <p>Drag 'n' drop some files here, or click to select files</p>
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
  );
}

export function Disabled() {
  const { acceptedFiles, getRootProps, getInputProps } = useDropzone({
    disabled: true
  });

  return (
    <div>
      <div {...getRootProps()} style={{
        border: '2px dashed #cccccc',
        'border-radius': '4px',
        padding: '20px',
        'text-align': 'center',
        cursor: 'not-allowed',
        opacity: '0.6'
      }}>
        <input {...getInputProps()} />
        <p>Drag 'n' drop some files here, or click to select files</p>
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
  );
}