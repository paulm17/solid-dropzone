// rollup.config.js

// Import necessary plugins
const { nodeResolve } = require("@rollup/plugin-node-resolve");
const commonjs = require("@rollup/plugin-commonjs");
const typescript = require("@rollup/plugin-typescript");
const { babel } = require("@rollup/plugin-babel");
const { terser } = require("rollup-plugin-terser");
const pkg = require("./package.json");

// Define globals for the UMD build.
// These are modules that should be available in the global scope for the UMD bundle.
// Updated for SolidJS.
const umdGlobals = {
  "solid-js": "solid",
};

// Define the file extensions Rollup will process.
const extensions = [".js", ".jsx", ".ts", ".tsx"];

module.exports = {
  input: "./src/index.tsx",
  external: Object.keys(umdGlobals),

  plugins: [
    nodeResolve({ extensions }),
    commonjs({ include: "**/node_modules/**" }),
    typescript({
      tsconfig: "./tsconfig.json",
      sourceMap: true,
      inlineSources: true,
      declaration: true,
    }),
    babel({
      extensions,
      exclude: "**/node_modules/**",
      babelHelpers: "bundled",
      presets: ["babel-preset-solid", "@babel/preset-typescript"],
    }),

    terser(),
  ],

  output: {
    file: "dist/index.js",
    format: "umd",
    name: "solidDropzone", 
    globals: umdGlobals,
    sourcemap: "inline",
    exports: "named",
  },
};
