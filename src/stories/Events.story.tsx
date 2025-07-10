import { useDropzone } from "solid-dropzone";
import { For } from "solid-js";

export default {
  title: "Events",
};

export function NestedDropzones() {
  function OuterDropzone() {
    const { getRootProps } = useDropzone({
      onDrop: files => console.log(files)
    });

    return (
      <div class="container">
        <div {...getRootProps({ class: 'dropzone' })} style={{
          border: '2px dashed #cccccc',
          padding: '20px',
          'min-height': '200px'
        }}>
          <InnerDropzone />
          <p>Outer dropzone</p>
        </div>
      </div>
    );
  }

  function InnerDropzone() {
    const { getRootProps } = useDropzone({ noDragEventsBubbling: true });
    return (
      <div {...getRootProps({ class: 'dropzone' })} style={{
        border: '2px dashed #999999',
        padding: '20px',
        margin: '10px',
        'background-color': '#f5f5f5'
      }}>
        <p>Inner dropzone</p>
      </div>
    );
  }

  return <OuterDropzone />;
}

export function DropzoneWithoutClick() {
  const { getRootProps, getInputProps, acceptedFiles } = useDropzone({ noClick: true });

  return (
    <section class="container">
      <div {...getRootProps({ class: 'dropzone' })} style={{
        border: '2px dashed #cccccc',
        'border-radius': '4px',
        padding: '20px',
        'text-align': 'center'
      }}>
        <input {...getInputProps()} />
        <p>Dropzone without click events</p>
      </div>
      <aside>
        <h4>Files</h4>
        <ul>
          <For each={acceptedFiles()}>
            {(file) => <li>{file.name}</li>}
          </For>
        </ul>
      </aside>
    </section>
  );
}

export function DropzoneWithoutKeyboard() {
  const { getRootProps, getInputProps, acceptedFiles } = useDropzone({ noKeyboard: true });

  return (
    <section class="container">
      <div {...getRootProps({ class: 'dropzone' })} style={{
        border: '2px dashed #cccccc',
        'border-radius': '4px',
        padding: '20px',
        'text-align': 'center'
      }}>
        <input {...getInputProps()} />
        <p>Dropzone without keyboard events</p>
        <em>(SPACE/ENTER and focus events are disabled)</em>
      </div>
      <aside>
        <h4>Files</h4>
        <ul>
          <For each={acceptedFiles()}>
            {(file) => <li>{file.name}</li>}
          </For>
        </ul>
      </aside>
    </section>
  );
}

export function DropzoneWithoutInput() {
  const { getRootProps, acceptedFiles } = useDropzone();

  return (
    <section class="container">
      <div {...getRootProps({ class: 'dropzone' })} style={{
        border: '2px dashed #cccccc',
        'border-radius': '4px',
        padding: '20px',
        'text-align': 'center'
      }}>
        <p>Dropzone without click events</p>
      </div>
      <aside>
        <h4>Files</h4>
        <ul>
          <For each={acceptedFiles()}>
            {(file) => <li>{file.name}</li>}
          </For>
        </ul>
      </aside>
    </section>
  );
}

export function DropzoneWithoutDrag() {
  const { getRootProps, getInputProps, acceptedFiles } = useDropzone({ noDrag: true });

  return (
    <section class="container">
      <div {...getRootProps({ class: 'dropzone' })} style={{
        border: '2px dashed #cccccc',
        'border-radius': '4px',
        padding: '20px',
        'text-align': 'center'
      }}>
        <input {...getInputProps()} />
        <p>Dropzone with no drag events</p>
        <em>(Drag 'n' drop is disabled)</em>
      </div>
      <aside>
        <h4>Files</h4>
        <ul>
          <For each={acceptedFiles()}>
            {(file) => <li>{file.name}</li>}
          </For>
        </ul>
      </aside>
    </section>
  );
}