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

  // Specify external dependencies. These are not bundled with your library.
  external: Object.keys(umdGlobals),

  plugins: [
    // 1. Locates modules in node_modules
    nodeResolve({ extensions }),

    // 2. Converts CommonJS modules to ES6
    commonjs({ include: "**/node_modules/**" }),

    // 3. Transpiles TypeScript to JavaScript.
    // It will automatically look for a `tsconfig.json` file.
    typescript({
      tsconfig: "./tsconfig.json",
      sourceMap: true,
      inlineSources: true,
      // The following options are added to fix the build error.
      // We override the `declarationDir` from tsconfig.json to align with Rollup's output directory.
      declaration: true,
      declarationDir: "dist/",
    }),

    // 4. Transpiles modern JavaScript to browser-compatible versions using Babel.
    // NOTE: Ensure your Babel config is set up for SolidJS (e.g., using 'babel-preset-solid').
    babel({
      extensions, // Process the same files as other plugins
      exclude: "**/node_modules/**",
      babelHelpers: "bundled", // Bundles Babel helpers
      presets: ["babel-preset-solid", "@babel/preset-typescript"],
    }),

    // 5. Minifies the output bundle for production.
    terser(),
  ],

  output: {
    file: "dist/index.js",
    format: "umd",
    name: "solidDropzone", // The global variable name for the UMD build (updated for Solid)
    globals: umdGlobals,
    sourcemap: "inline", // Generates an inline sourcemap for easier debugging
    exports: "named",
  },
};
