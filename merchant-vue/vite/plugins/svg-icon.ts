import { createSvgIconsPlugin } from 'vite-plugin-svg-icons-ng';

export default (path: any) => {
  return createSvgIconsPlugin({
    // Specify the icon folder to cache
    iconDirs: [path.resolve(path.resolve(__dirname, '../../src'), 'assets/icons/svg')],
    // Specify symbolId format
    symbolId: 'icon-[dir]-[name]'
  });
};
