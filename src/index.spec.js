import { render, fireEvent, cleanup } from "@solidjs/testing-library";
import { createSignal, createEffect } from "solid-js";
import { fromEvent } from "file-selector";
import * as utils from "./utils";
import Dropzone, { createDropzone } from "./index";

// Mocking createRoot which is an internal detail of solid-testing-library
jest.mock("solid-js/web", () => ({
  ...jest.requireActual("solid-js/web"),
  createRoot: (fn) => fn(() => {}),
}));

describe("createDropzone()", () => {
  let files;
  let images;

  beforeEach(() => {
    files = [createFile("file1.pdf", 1111, "application/pdf")];
    images = [
      createFile("cats.gif", 1234, "image/gif"),
      createFile("dogs.gif", 2345, "image/jpeg"),
    ];
  });

  afterEach(cleanup);

  describe("behavior", () => {
    it("renders the root and input nodes with the necessary props", () => {
      const { container } = render(() => (
        <Dropzone>
          {({ getRootProps, getInputProps }) => (
            <div {...getRootProps()}>
              <input {...getInputProps()} />
            </div>
          )}
        </Dropzone>
      ));
      expect(container.innerHTML).toMatchSnapshot();
    });

    it("sets {accept} prop on the <input>", () => {
      const accept = { "image/jpeg": [] };
      const { container } = render(() => (
        <Dropzone accept={accept}>
          {({ getRootProps, getInputProps }) => (
            <div {...getRootProps()}>
              <input {...getInputProps()} />
            </div>
          )}
        </Dropzone>
      ));
      expect(container.querySelector("input")).toHaveAttribute(
        "accept",
        "image/jpeg"
      );
    });

    it("updates {accept} prop on the <input> when it changes", async () => {
      const [accept, setAccept] = createSignal({ "image/jpeg": [] });
      const { container } = render(() => (
        <Dropzone accept={accept()}>
          {({ getRootProps, getInputProps }) => (
            <div {...getRootProps()}>
              <input {...getInputProps()} />
            </div>
          )}
        </Dropzone>
      ));

      expect(container.querySelector("input")).toHaveAttribute(
        "accept",
        "image/jpeg"
      );

      setAccept({ "image/png": [] });
      await Promise.resolve(); // Wait for effect to run

      expect(container.querySelector("input")).toHaveAttribute(
        "accept",
        "image/png"
      );
    });

    it("sets {multiple} prop on the <input>", () => {
      const { container } = render(() => (
        <Dropzone multiple>
          {({ getRootProps, getInputProps }) => (
            <div {...getRootProps()}>
              <input {...getInputProps()} />
            </div>
          )}
        </Dropzone>
      ));
      expect(container.querySelector("input")).toHaveAttribute("multiple");
    });

    it("updates {multiple} prop on the <input> when it changes", async () => {
      const [multiple, setMultiple] = createSignal(false);
      const { container } = render(() => (
        <Dropzone multiple={multiple()}>
          {({ getRootProps, getInputProps }) => (
            <div {...getRootProps()}>
              <input {...getInputProps()} />
            </div>
          )}
        </Dropzone>
      ));

      expect(container.querySelector("input")).not.toHaveAttribute("multiple");
      setMultiple(true);
      await Promise.resolve();
      expect(container.querySelector("input")).toHaveAttribute("multiple");
    });

    it("runs the custom callback handlers provided to the root props getter", async () => {
      const event = createDtWithFiles(files);
      const rootProps = {
        onClick: jest.fn(),
        onKeyDown: jest.fn(),
        onFocus: jest.fn(),
        onBlur: jest.fn(),
        onDragEnter: jest.fn(),
        onDragOver: jest.fn(),
        onDragLeave: jest.fn(),
        onDrop: jest.fn(),
      };

      const { container } = render(() => (
        <Dropzone>
          {({ getRootProps, getInputProps }) => (
            <div {...getRootProps(rootProps)}>
              <input {...getInputProps()} />
            </div>
          )}
        </Dropzone>
      ));

      const dropzone = container.querySelector("div");
      await fireEvent.click(dropzone);
      expect(rootProps.onClick).toHaveBeenCalled();

      // Other events...
    });

    // NOTE: Many of the other tests follow a similar conversion pattern:
    // 1. Use `render(() => <Component/>)` from `@solidjs/testing-library`.
    // 2. For testing prop changes, use `createSignal` and update the signal.
    // 3. `fireEvent` is often async, so `await` it.
    // 4. `ref`s are plain variables or objects, not created with a hook.
    // 5. Logic from `renderHook` is tested by rendering a test component that uses the `createDropzone` composable.

    test("click events originating from <label> should not trigger file dialog open twice", async () => {
        let active;
        const onClickSpy = jest.spyOn(HTMLInputElement.prototype, "click", "set");

        const { container } = render(() => (
          <Dropzone>
            {({ getRootProps, getInputProps, isFileDialogActive }) => (
              <label {...getRootProps()}>
                <input {...getInputProps()} />
                <div ref={active} style:display={isFileDialogActive ? 'block' : 'none'}>
                    I am active
                </div>
              </label>
            )}
          </Dropzone>
        ));

        const dropzone = container.querySelector("label");

        await fireEvent.click(dropzone);

        expect(active).not.toBeNull();
        expect(dropzone).toContainElement(active);
        expect(onClickSpy).toHaveBeenCalledTimes(1);
        onClickSpy.mockRestore();
      });
  });
});


// Helper functions (createDtWithFiles, createFile, etc.) remain the same
function createDtWithFiles(files = []) {
  return {
    dataTransfer: {
      files,
      items: files.map((file) => ({
        kind: "file",
        size: file.size,
        type: file.type,
        getAsFile: () => file,
      })),
      types: ["Files"],
    },
  };
}

function createFile(name, size, type) {
  const file = new File([], name, { type });
  Object.defineProperty(file, "size", {
    get() {
      return size;
    },
  });
  return file;
}
