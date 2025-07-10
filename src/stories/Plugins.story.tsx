import { useDropzone } from "solid-dropzone";
import { For } from "solid-js";

declare global {
  interface File {
    myProp?: boolean;
  }
}

export default {
  title: "Plugins",
};

export function Usage() {
  const props = useDropzone({
    getFilesFromEvent: (event) => myCustomFileGetter(event),
  });

  return (
    <section class="container">
      <div {...props.getRootProps({ class: "dropzone" })}>
        <input {...props.getInputProps()} />
        <p>Drag 'n' drop some files here, or click to select files</p>
      </div>
      <aside>
        <h4>Files</h4>
        <ul>
          <For each={props.acceptedFiles()}>
            {(file) => (
              <li>
                {file.name} has <strong>myProp</strong>:{" "}
                {file.myProp === true ? "YES" : "NO"}
              </li>
            )}
          </For>
        </ul>
      </aside>
    </section>
  );
}

async function myCustomFileGetter(
  event: DragEvent | Event | FileSystemFileHandle[]
): Promise<File[]> {
  let fileList: FileList | null = null;
  const files: File[] = [];

  if (Array.isArray(event)) {
    const fileHandles = event as FileSystemFileHandle[];
    const settledFiles = await Promise.all(
      fileHandles.map((handle) => handle.getFile())
    );
    files.push(...settledFiles);
  } else {
    fileList =
      (event as DragEvent).dataTransfer?.files ||
      (event.target as HTMLInputElement)?.files;

    if (fileList) {
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList.item(i);
        if (file) {
          files.push(file);
        }
      }
    }
  }

  for (const file of files) {
    Object.defineProperty(file, "myProp", {
      value: true,
      writable: true, 
    });
  }

  return files;
}