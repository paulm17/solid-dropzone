import { useDropzone } from "solid-dropzone";
import { Component, createMemo } from "solid-js";

export default {
 title: "Styling",
};

const baseStyle = {
 flex: 1,
 display: 'flex',
 flexDirection: 'column',
 alignItems: 'center',
 padding: '20px',
 borderWidth: 2,
 borderRadius: 2,
 borderColor: '#eeeeee',
 borderStyle: 'dashed',
 backgroundColor: '#fafafa',
 color: '#bdbdbd',
 outline: 'none',
 transition: 'border .24s ease-in-out'
};

const focusedStyle = {
 borderColor: '#2196f3'
};

const acceptStyle = {
 borderColor: '#00e676'
};

const rejectStyle = {
 borderColor: '#ff1744'
};

const StyledDropzone: Component = (props) => {
 const {
   getRootProps,
   getInputProps,
   isFocused,
   isDragAccept,
   isDragReject
 } = useDropzone({accept: {'image/*': []}});

 const style = createMemo(() => ({
   ...baseStyle,
   ...(isFocused() ? focusedStyle : {}),
   ...(isDragAccept() ? acceptStyle : {}),
   ...(isDragReject() ? rejectStyle : {})
 }));

 return (
   <div class="container">
     <div {...getRootProps({style: style()})}>
       <input {...getInputProps()} />
       <p>Drag 'n' drop some files here, or click to select files</p>
     </div>
   </div>
 );
}

export function Usage() {
 return <StyledDropzone />;
}