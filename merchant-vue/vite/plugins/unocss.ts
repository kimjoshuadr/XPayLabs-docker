import UnoCss from 'unocss/vite';

export default () => {
  return UnoCss({
    hmrTopLevelAwait: false // unocss defaults to true; older browsers do not support it and will throw an error after startup
  });
};
