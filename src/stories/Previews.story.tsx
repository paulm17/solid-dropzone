import { useDropzone } from "solid-dropzone";
import { For, createSignal, createEffect, onCleanup } from "solid-js";
import type { JSX } from "solid-js";

export default {
  title: "Previews",
};

type PreviewFile = File & {
  preview: string;
};

const thumbsContainer: JSX.CSSProperties = {
  display: 'flex',
  "flex-direction": 'row',
  "flex-wrap": 'wrap',
  "margin-top": '16px'
};

const thumb: JSX.CSSProperties = {
  display: 'inline-flex',
  "border-radius": '2px',
  border: '1px solid #eaeaea',
  "margin-bottom": '8px',
  "margin-right": '8px',
  width: '100px',
  height: '100px',
  padding: '4px',
  "box-sizing": 'border-box'
};

const thumbInner: JSX.CSSProperties = {
  display: 'flex',
  "min-width": 0,
  overflow: 'hidden'
};

const img: JSX.CSSProperties = {
  display: 'block',
  width: 'auto',
  height: '100%'
};

export function Usage() {
  const [files, setFiles] = createSignal<PreviewFile[]>([]);
  
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': []
    },
    onDrop: acceptedFiles => {
      setFiles(acceptedFiles.map(file => Object.assign(file, {
        preview: URL.createObjectURL(file)
      })));
    }
  });

  createEffect(() => {
    const currentFiles = files();
    onCleanup(() => {
      currentFiles.forEach(file => URL.revokeObjectURL(file.preview));
    });
  });

  return (
    <section class="container">
      <div {...getRootProps({ class: 'dropzone' })}>
        <input {...getInputProps()} />
        <p>Drag 'n' drop some files here, or click to select files</p>
      </div>
      <aside style={thumbsContainer}>
        <For each={files()}>
          {(file) => (
            <div style={thumb}>
              <div style={thumbInner}>
                <img
                  src={file.preview}
                  style={img}
                />
              </div>
            </div>
          )}
        </For>
      </aside>
    </section>
  );
}