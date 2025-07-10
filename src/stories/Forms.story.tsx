import { useDropzone } from "solid-dropzone";
import { For, JSX } from "solid-js";

export default {
  title: "Forms",
};

interface CustomDropzoneProps {
  name: string;
  required?: boolean;
}

function Dropzone(props: CustomDropzoneProps) {
  const { required, name } = props;

  let hiddenInputRef: HTMLInputElement | undefined;

  const { getRootProps, getInputProps, open, acceptedFiles } = useDropzone({
    onDrop: (incomingFiles) => {
      if (hiddenInputRef) {
        const dataTransfer = new DataTransfer();
        incomingFiles.forEach((file) => {
          dataTransfer.items.add(file);
        });
        hiddenInputRef.files = dataTransfer.files;

        hiddenInputRef.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }
  });

  return (
    <div class="container">
      <div {...getRootProps({ class: 'dropzone' })}>
        <input
          type="file"
          name={name}
          required={required}
          ref={hiddenInputRef}
          style={{
            display: 'none'
          }}
        />
        <input {...getInputProps()} />
        <p>Drag 'n' drop some files here</p>
        <button type="button" onClick={open}>
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
  );
}

export function Usage() {
  const handleSubmit: JSX.EventHandlerUnion<HTMLFormElement, Event> = (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.currentTarget);
    const file = formData.get("my-file");

    if (file instanceof File) {
      alert(`File selected: ${file.name}`);
    } else {
      alert("No file selected or the form value is not a file.");
    }
  };

  return (
    <div>
      <h2>FileDialog</h2>
      <form onSubmit={handleSubmit}>
        <Dropzone name="my-file" required />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}