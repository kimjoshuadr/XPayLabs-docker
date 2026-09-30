import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default () => {
  return nodePolyfills({
    // Whether to polyfill `node:` protocol imports.
    protocolImports: true,
  });
};
