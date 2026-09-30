export interface FiatcurrencyOrderVO {
  /**
   * 
   */
  id: string | number;

  /**
   * Merchant order number
   */
  orderNo: string;

  /**
   * Merchant ID
   */
  merchantId: string | number;

  /**
   * Order Type
   */
  orderType: string;

  /**
   * Amount
   */
  amount: number;

  /**
   * Currency
   */
  currency: string;

  /**
   * Payer name
   */
  payerName: string;

  /**
   * Payer Account
   */
  payerAccount: string;

  /**
   * Payer phone number
   */
  payerPhone: string;

  /**
   * Payer Email
   */
  payerEmail: string;

  /**
   * Payment code
   */
  payerCode: string;

  /**
   * Extended field, JSON format
   */
  extra: string;

  /**
   * Payee name
   */
  payeeName: string;

  /**
   * Payee account
   */
  payeeAccount: string;

  /**
   * Payee mobile number
   */
  payeePhone: string;

  /**
   * Payee Email
   */
  payeeEmail: string;

  /**
   * Collection Code
   */
  payeeCode: string;

  /**
   * Order status: INIT,WAIT, PADDING, SUCCESS, FAIL
   */
  status: string;

  /**
   * Payment Channel Code
   */
  channelCode: string;

  /**
   * Merchant Notification Address
   */
  notifyUrl: string;

  /**
   * Remark
   */
  remark: string;

  /**
   * Third-party Response Content
   */
  thirdPartyResponse: string;

  /**
   * Third-party callback content
   */
  callbackContent: string;

}

export interface FiatcurrencyOrderForm extends BaseEntity {
  /**
   * 
   */
  id?: string | number;

  /**
   * Merchant order number
   */
  orderNo?: string;

  /**
   * Merchant ID
   */
  merchantId?: string | number;

  /**
   * Order Type
   */
  orderType?: string;

  /**
   * Amount
   */
  amount?: number;

  /**
   * Currency
   */
  currency?: string;

  /**
   * Payer name
   */
  payerName?: string;

  /**
   * Payer Account
   */
  payerAccount?: string;

  /**
   * Payer phone number
   */
  payerPhone?: string;

  /**
   * Payer Email
   */
  payerEmail?: string;

  /**
   * Payment code
   */
  payerCode?: string;

  /**
   * Extended field, JSON format
   */
  extra?: string;

  /**
   * Payee name
   */
  payeeName?: string;

  /**
   * Payee account
   */
  payeeAccount?: string;

  /**
   * Payee mobile number
   */
  payeePhone?: string;

  /**
   * Payee Email
   */
  payeeEmail?: string;

  /**
   * Collection Code
   */
  payeeCode?: string;

  /**
   * Order status: INIT,WAIT, PADDING, SUCCESS, FAIL
   */
  status?: string;

  /**
   * Payment Channel Code
   */
  channelCode?: string;

  /**
   * Merchant Notification Address
   */
  notifyUrl?: string;

  /**
   * Remark
   */
  remark?: string;

  /**
   * Third-party Response Content
   */
  thirdPartyResponse?: string;

  /**
   * Third-party callback content
   */
  callbackContent?: string;

}

export interface FiatcurrencyOrderQuery extends PageQuery {

  /**
   * Merchant order number
   */
  orderNo?: string;

  /**
   * Merchant ID
   */
  merchantId?: string | number;

  /**
   * Order Type
   */
  orderType?: string;

  /**
   * Amount
   */
  amount?: number;

  /**
   * Currency
   */
  currency?: string;

  /**
   * Payer name
   */
  payerName?: string;

  /**
   * Payer Account
   */
  payerAccount?: string;

  /**
   * Payer phone number
   */
  payerPhone?: string;

  /**
   * Payer Email
   */
  payerEmail?: string;

  /**
   * Payment code
   */
  payerCode?: string;

  /**
   * Extended field, JSON format
   */
  extra?: string;

  /**
   * Payee name
   */
  payeeName?: string;

  /**
   * Payee account
   */
  payeeAccount?: string;

  /**
   * Payee mobile number
   */
  payeePhone?: string;

  /**
   * Payee Email
   */
  payeeEmail?: string;

  /**
   * Collection Code
   */
  payeeCode?: string;

  /**
   * Order status: INIT,WAIT, PADDING, SUCCESS, FAIL
   */
  status?: string;

  /**
   * Payment Channel Code
   */
  channelCode?: string;

  /**
   * Merchant Notification Address
   */
  notifyUrl?: string;

  /**
   * Third-party Response Content
   */
  thirdPartyResponse?: string;

  /**
   * Third-party callback content
   */
  callbackContent?: string;

    /**
     * Date range parameter
     */
    params?: any;
}



