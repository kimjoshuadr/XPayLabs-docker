import type { PropType as VuePropType, ComponentInternalInstance as ComponentInstance } from 'vue';
import { LanguageEnum } from '@/enums/LanguageEnum';

declare global {
  /** vue Instance */
  declare type ComponentInternalInstance = ComponentInstance;

  /**
   * UI field hidden attribute
   */
  declare interface FieldOption {
    key: number;
    label: string;
    visible: boolean;
    children?: Array<FieldOption>;
  }

  /**
   * Dialog properties
   */
  declare interface DialogOption {
    /**
     * Dialog Title
     */
    title?: string;
    /**
     * Whether to display
     */
    visible: boolean;
  }

  declare interface UploadOption {
    /** Set request headers for upload */
    headers: { [key: string]: any };

    /** Upload URL */
    url: string;
  }

  /**
   * Import attributes
   */
  declare interface ImportOption extends UploadOption {
    /** Whether to show popup layer */
    open: boolean;
    /** Dialog title */
    title: string;
    /** Whether to disable upload */
    isUploading: boolean;

    updateSupport: number;

    /** Other parameters */
    [key: string]: any;
  }
  /**
   * Dictionary data  Data configuration
   */
  declare interface DictDataOption {
    label: string;
    value: string;
    elTagType?: ElTagType;
    elTagClass?: string;
  }

  declare interface BaseEntity {
    createBy?: any;
    createDept?: any;
    createTime?: string;
    updateBy?: any;
    updateTime?: any;
  }

  /**
   * Pagination data
   * T : Form data
   * D : Query parameter
   */
  declare interface PageData<T, D> {
    form: T;
    queryParams: D;
    rules: ElFormRules;
  }
  /**
   * Pagination query parameters
   */
  declare interface PageQuery {
    pageNum: number;
    pageSize: number;
  }
  declare interface LayoutSetting {
    /**
     * Whether to show top navigation
     */
    topNav: boolean;

    /**
     * Whether to show multi-tab navigation
     */
    tagsView: boolean;
    /**
     * Show tab icon
     */
    tagsIcon: boolean;
    /**
     * Whether to fix the header
     */
    fixedHeader: boolean;
    /**
     * Whether to show the sidebar Logo
     */
    sidebarLogo: boolean;
    /**
     * Whether to show dynamic title
     */
    dynamicTitle: boolean;
    /**
     * Sidebar theme theme-dark | theme-light
     */
    sideTheme: string;
    /**
     * Theme Mode
     */
    theme: string;
  }

  declare interface DefaultSettings extends LayoutSetting {
    /**
     * Page title
     */
    title: string;

    /**
     * Whether to display system layout settings
     */
    showSettings: boolean;

    /**
     * Navigation bar layout
     */
    layout: string;

    /**
     * Layout Size
     */
    size: 'large' | 'default' | 'small';

    /**
     * Language
     */
    language: LanguageEnum;

    /**
     * Whether to enable animation effects
     */
    animationEnable: boolean;
    /**
     *  Whether to enable dark mode
     *
     * true: dark mode
     * false: Light mode
     */
    dark: boolean;
  }
}
export {};
