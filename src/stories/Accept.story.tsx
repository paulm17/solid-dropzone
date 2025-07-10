import { useDropzone } from "solid-dropzone";
import { For } from "solid-js";

export default {
  title: "Accept",
};

export function Usage() {
  const props = useDropzone({
    accept: {
      'image/jpeg': [],
      'image/png': []
    }
  });

  return (
    <section class="container">
      <div {...props.getRootProps({className: 'dropzone'})}>
        <input {...props.getInputProps()} />
        <p>Drag 'n' drop some files here, or click to select files</p>
        <em>(Only *.jpeg and *.png images will be accepted)</em>
      </div>
      <aside>
        <h4>Accepted files</h4>
        <ul>
          <For each={props.acceptedFiles()}>
            {(file) => (
              <li>
                {file.name} - {file.size} bytes
              </li>
            )}
          </For>
        </ul>
        <h4>Rejected files</h4>
        <ul>
          <For each={props.fileRejections()}>
            {({ file, errors }) => (
              <li>
                {file.name} - {file.size} bytes
                <ul>
                  <For each={errors}>
                    {(e) => <li>{e.message}</li>}
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