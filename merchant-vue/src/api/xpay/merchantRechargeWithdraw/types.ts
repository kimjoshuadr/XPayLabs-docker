export interface MerchantRechargeWithdrawVO {
  /**
   * Primary key ID
   */
  id: string | number;

  /**
   * Merchant ID
   */
  merchantId: string | number;

  /**
   * Record type: Recharge, Withdrawal
   */
  type: string;

  /**
   * Chain
   */
  chain: string;

  /**
   * Currency
   */
  symbol: string;

  /**
   * Payment address
   */
  payAddress: string;

  /**
   * Receiving Address
   */
  receiveAddress: string;

  /**
   * Quantity
   */
  amount: number;

  /**
   * Status: PENDING,SUCCESS,FAILED;
   */
  status: string;

  /**
   * Failure Reason
   */
  reason: string;

  /**
   * txId
   */
  txId: string | number;

  /**
   * GAS Fee
   */
  txGas: number;

  /**
   * Platform Fee
   */
  fee: number;

  /**
   * Created At
   */
  createTime: string;

}

export interface MerchantRechargeWithdrawForm extends BaseEntity {
  /**
   * Primary key ID
   */
  id?: string | number;

  /**
   * Merchant ID
   */
  merchantId?: string | number;

  /**
   * Record type: Recharge, Withdrawal
   */
  type?: string;

  /**
   * Chain
   */
  chain?: string;

  /**
   * Currency
   */
  symbol?: string;

  /**
   * Payment address
   */
  payAddress?: string;

  /**
   * Receiving Address
   */
  receiveAddress?: string;

  /**
   * Quantity
   */
  amount?: number;

  /**
   * Status: PENDING,SUCCESS,FAILED;
   */
  status?: string;

  /**
   * Failure Reason
   */
  reason?: string;

  /**
   * txId
   */
  txId?: string | number;

  /**
   * GAS Fee
   */
  txGas?: number;

  /**
   * Platform Fee
   */
  fee?: number;

}

export interface MerchantRechargeWithdrawQuery extends PageQuery {

  /**
   * Merchant ID
   */
  merchantId?: string | number;

  /**
   * Record type: Recharge, Withdrawal
   */
  type?: string;

  /**
   * Chain
   */
  chain?: string;

  /**
   * Currency
   */
  symbol?: string;

  /**
   * Payment address
   */
  payAddress?: string;

  /**
   * Receiving Address
   */
  receiveAddress?: string;

  /**
   * Quantity
   */
  amount?: number;

  /**
   * Status: PENDING,SUCCESS,FAILED;
   */
  status?: string;

  /**
   * Failure Reason
   */
  reason?: string;

  /**
   * txId
   */
  txId?: string | number;

  /**
   * GAS Fee
   */
  txGas?: number;

  /**
   * Platform Fee
   */
  fee?: number;

  /**
   * Created At
   */
  createTime?: string;

    /**
     * Date range parameter
     */
    params?: any;
}



