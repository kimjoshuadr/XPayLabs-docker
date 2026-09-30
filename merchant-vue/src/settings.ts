import { LanguageEnum } from '@/enums/LanguageEnum';

const setting: DefaultSettings = {
  /**
   * Page title
   */
  title: import.meta.env.VITE_APP_TITLE,

  theme: '#409EFF',

  /**
   * Sidebar theme: dark theme theme-dark, light theme theme-light
   */
  sideTheme: 'theme-dark',
  /**
   * Whether it is the system layout configuration
   */
  showSettings: true,

  /**
   * Whether to show top navigation
   */
  topNav: false,

  /**
   * Whether to show tagsView
   */
  tagsView: true,

  /**
   * Show tab icon
   */
  tagsIcon: false,

  /**
   * Whether to fix the header
   */
  fixedHeader: false,

  /**
   * Show Logo
   */
  sidebarLogo: true,

  /**
   * Whether to show dynamic title
   */
  dynamicTitle: false,

  /**
   * Whether to enable animation: on random, off fade in/out
   */
  animationEnable: false,

  /**
   * Dark Mode
   */
  dark: false,

  /**
   * Default language
   */
  language: LanguageEnum.zh_CN,

  /**
   * Default Size
   */
  size: 'default',

  /**
   * Default Layout
   */
  layout: ''
};
export default setting;
