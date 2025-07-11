import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { babel } from '@rollup/plugin-babel';
import { terser } from 'rollup-plugin-terser';
import pkg from './package.json';

const extensions = ['.js', '.jsx', '.ts', '.tsx'];

const umdGlobals = {
  'solid-js': 'solid',
  'file-selector': 'fileSelector'
};

export default {
  input: 'src/index.tsx',
  external: Object.keys(umdGlobals),
  plugins: [
    nodeResolve({ extensions }),
    commonjs({ include: '**/node_modules/**' }),
    babel({
      extensions,
      exclude: '**/node_modules/**',
      babelHelpers: 'bundled',
      presets: ['babel-preset-solid', '@babel/preset-typescript'],
    }),
    terser(),
  ],
  output: [
    {
      file: pkg.main,
      format: 'umd',
      name: 'SolidDropzone',
      globals: umdGlobals,
      sourcemap: 'inline',
      exports: 'named',
    },
  ],
};