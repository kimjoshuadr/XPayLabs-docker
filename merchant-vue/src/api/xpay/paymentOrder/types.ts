export interface PaymentOrderVO {
  /**
   * ID
   */
  id: string | number;

  /**
   * Merchant ID
   */
  merchantId: string | number;

  /**
   * Order number
   */
  merchantOrderId: string | number;

  /**
   * uid
   */
  uid: string | number;

  /**
   * Order Type
   */
  orderType: string;

  /**
   * Chain
   */
  chain: string;

  /**
   * Currency
   */
  symbol: string;

  /**
   * Payout Address
   */
  payAddress: string;

  /**
   * Receiving address
   */
  receiveAddress: string;

  /**
   * Quantity
   */
  amount: number;

  /**
   * Expiration time
   */
  expiredTime: number;

  /**
   * Status
   */
  status: string;

  /**
   * Failure Reason
   */
  reason: string;

  /**
   * Hash
   */
  txId: string | number;

  /**
   * GAS
   */
  txGas: number;

  /**
   * Callback Status
   */
  notifyStatus: string;

  /**
   * Callback URL
   */
  callbackUrl: string;

  /**
   * Callback Time
   */
  notifyTime: string;

  /**
   * Created At
   */
  createTime: string;

}

export interface PaymentOrderForm extends BaseEntity {
  /**
   * ID
   */
  id?: string | number;

  /**
   * Merchant ID
   */
  merchantId?: string | number;

  /**
   * Order number
   */
  merchantOrderId?: string | number;

  /**
   * uid
   */
  uid?: string | number;

  /**
   * Order Type
   */
  orderType?: string;

  /**
   * Payment Currency ID
   */
  assetTypeId?: string | number;

  /**
   * Chain
   */
  chain?: string;

  /**
   * Currency
   */
  symbol?: string;

  /**
   * Payout Address
   */
  payAddress?: string;

  /**
   * Receiving address
   */
  receiveAddress?: string;

  /**
   * Quantity
   */
  amount?: number;

  handingFee?: number;
  handingRate?: number;

  /**
   * Expiration time
   */
  expiredTime?: number;

  /**
   * Status
   */
  status?: string;

  /**
   * Failure Reason
   */
  reason?: string;

  /**
   * Hash
   */
  txId?: string | number;

  /**
   * GAS
   */
  txGas?: number;

  /**
   * Callback Status
   */
  notifyStatus?: string;

  /**
   * Callback URL
   */
  callbackUrl?: string;

  /**
   * Callback Time
   */
  notifyTime?: string;

}

export interface PaymentOrderQuery extends PageQuery {

  /**
   * Merchant ID
   */
  merchantId?: string | number;

  /**
   * Order number
   */
  merchantOrderId?: string | number;

  /**
   * uid
   */
  uid?: string | number;

  /**
   * Order Type
   */
  orderType?: string;

  /**
   * Payment Currency ID
   */
  assetTypeId?: string | number;

  /**
   * Chain
   */
  chain?: string;

  /**
   * Currency
   */
  symbol?: string;

  /**
   * Payout Address
   */
  payAddress?: string;

  /**
   * Receiving address
   */
  receiveAddress?: string;

  /**
   * Quantity
   */
  amount?: number;

  /**
   * Expiration time
   */
  expiredTime?: number;

  /**
   * Status
   */
  status?: string;

  /**
   * Failure Reason
   */
  reason?: string;

  /**
   * Hash
   */
  txId?: string | number;

  /**
   * GAS
   */
  txGas?: number;

  /**
   * Callback Status
   */
  notifyStatus?: string;

  /**
   * Callback URL
   */
  callbackUrl?: string;

  /**
   * Callback Time
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



