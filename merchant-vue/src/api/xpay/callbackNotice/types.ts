export interface CallbackNoticeVO {
  /**
   * Primary key ID
   */
  id: string | number;

  /**
   * Order ID
   */
  orderId: string | number;

  /**
   * Callback URL
   */
  callbackUrl: string;

  /**
   * Callback notification status
   */
  notifyStatus: string;

  /**
   * Notification time
   */
  notifyTime: string;

  /**
   * Created At
   */
  createTime: string;

}

export interface CallbackNoticeForm extends BaseEntity {
  /**
   * Primary key ID
   */
  id?: string | number;

  /**
   * Order ID
   */
  orderId?: string | number;

  /**
   * Callback URL
   */
  callbackUrl?: string;

  /**
   * Callback notification status
   */
  notifyStatus?: string;

  /**
   * Notification time
   */
  notifyTime?: string;

}

export interface CallbackNoticeQuery extends PageQuery {

  /**
   * Order ID
   */
  orderId?: string | number;

  /**
   * Callback URL
   */
  callbackUrl?: string;

  /**
   * Callback notification status
   */
  notifyStatus?: string;

  /**
   * Notification time
   */
  notifyTime?: string;

  /**
   * Created At
   */
  createTime?: string;

    /**
     * Date range parameter
     */
    params?: any;
}



