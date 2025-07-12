import { useDropzone } from "solid-dropzone";
import { For } from "solid-js";

export default {
  title: "Validator",
};

const maxLength = 20;

function nameLengthValidator(file: File) {
  if (!file || !file.name) {
    return null;
  }

  if (file.name.length > maxLength) {
    return {
      code: "name-too-large",
      message: `Name is larger than ${maxLength} characters`
    };
  }

  return null;
}

export function Usage() {
  const {
    acceptedFiles,
    fileRejections,
    getRootProps,
    getInputProps
  } = useDropzone({
    validator: nameLengthValidator
  });

  return (
    <section class="container">
      <div {...getRootProps({ class: 'dropzone' })}>
        <input {...getInputProps()} />
        <p>Drag 'n' drop some files here, or click to select files</p>
        <em>(Only files with name less than 20 characters will be accepted)</em>
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
            {({ file, errors }) => (
              <li>
                {file.name} - {file.size} bytes
                <ul>
                  <For each={errors}>
                    {(e) => (
                      <li>{e.message}</li>
                    )}
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