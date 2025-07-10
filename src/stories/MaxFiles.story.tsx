import { useDropzone } from "solid-dropzone";
import { For } from "solid-js";

export default {
  title: "MaxFiles",
};

export function Usage() {
  const {
    acceptedFiles,
    fileRejections,
    getRootProps,
    getInputProps
  } = useDropzone({    
    maxFiles: 2
  });

  return (
    <section class="container">
      <div {...getRootProps({ class: 'dropzone' })}>
        <input {...getInputProps()} />
        <p>Drag 'n' drop some files here, or click to select files</p>
        <em>(2 files are the maximum number of files you can drop here)</em>
      </div>
      <aside>
        <h4>Accepted files</h4>
        <ul>
          <For each={acceptedFiles()}>
            {(file) => (
              <li>
                {file.name} - {file.size} bytes
              </li>
            )}
          </For>
        </ul>
        <h4>Rejected files</h4>
        <ul>
          <For each={fileRejections()}>
            {(rejection) => (
              <li>
                {rejection.file.name} - {rejection.file.size} bytes
                <ul>
                  <For each={rejection.errors}>
                    {(error) => <li>{error.message}</li>}
                  </For>
                </ul>
              </li>
            )}
          </For>
        </ul>
      </aside>
    </section>
  );
}