import AutoImport from 'unplugin-auto-import/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';

export default (path: any) => {
  return AutoImport({
    // Auto-import Vue-related functions
    imports: ['vue', 'vue-router', '@vueuse/core', 'pinia'],
    eslintrc: {
      enabled: true,
      filepath: './.eslintrc-auto-import.json',
      globalsPropValue: true
    },
    resolvers: [
      // Auto-import Element Plus related functions ElMessage, ElMessageBox... (with styles)
      ElementPlusResolver()
    ],
    vueTemplate: true, // Whether to auto-import in Vue templates
    dts: path.resolve(path.resolve(__dirname, '../../src'), 'types', 'auto-imports.d.ts')
  });
};
