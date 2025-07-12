import babel from '@rollup/plugin-babel';
import nodeResolve from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';

const extensions = ['.js', '.jsx', '.ts', '.tsx'];

const external = [
  'solid-js',
  'solid-js/jsx-runtime',
  'file-selector'
];


export default {
  input: 'src/index.tsx',

  output: [
    {
      format: 'es',
      sourcemap: true,
      preserveModules: true, 
      dir: 'dist'
    }
  ],

  external: (id) => external.some(dep => id.startsWith(dep)),

  plugins: [
    nodeResolve({
      extensions,
    }),

    babel({
      babelHelpers: 'bundled',
      include: ['src/**/*'],
      extensions,
    }),

    terser(),
  ],
};
