export interface MerchantAssetDetailsVO {
  /**
   * 
   */
  id: string | number;

  /**
   * Transaction No.
   */
  transactionNo: string;

  /**
   * Merchant ID
   */
  merchantId: string | number;

  /**
   * Currency symbol
   */
  symbol: string;

  /**
   * Change Amount
   */
  amount: number;

  /**
   * Available balance before change
   */
  oldBalance: number;

  /**
   * Available balance after change
   */
  newBalance: number;

  /**
   * Frozen balance before change
   */
  oldFrozen: number;

  /**
   * Frozen balance after change
   */
  newFrozen: number;

  /**
   * Type: deposit/withdraw/payin/payout
   */
  type: string;

  /**
   * Income/Expense IN/OUT
   */
  inOut: string;

  /**
   * Fee
   */
  fee: number;

  /**
   * Fee rate
   */
  feerate: number;

  /**
   * Fee Currency
   */
  feeSymbol: string;

  /**
   * Exchange rate (only valid for exchange type)
   */
  rate: number;

  /**
   * Remark
   */
  remark: string;

}

export interface MerchantAssetDetailsForm extends BaseEntity {
  /**
   * 
   */
  id?: string | number;

  /**
   * Transaction No.
   */
  transactionNo?: string;

  /**
   * Merchant ID
   */
  merchantId?: string | number;

  /**
   * Currency symbol
   */
  symbol?: string;

  /**
   * Change Amount
   */
  amount?: number;

  /**
   * Available balance before change
   */
  oldBalance?: number;

  /**
   * Available balance after change
   */
  newBalance?: number;

  /**
   * Frozen balance before change
   */
  oldFrozen?: number;

  /**
   * Frozen balance after change
   */
  newFrozen?: number;

  /**
   * Type: deposit/withdraw/payin/payout
   */
  type?: string;

  /**
   * Income/Expense IN/OUT
   */
  inOut?: string;

  /**
   * Fee
   */
  fee?: number;

  /**
   * Fee rate
   */
  feerate?: number;

  /**
   * Fee Currency
   */
  feeSymbol?: string;

  /**
   * Exchange rate (only valid for exchange type)
   */
  rate?: number;

  /**
   * Remark
   */
  remark?: string;

}

export interface MerchantAssetDetailsQuery extends PageQuery {

  /**
   * Transaction No.
   */
  transactionNo?: string;

  /**
   * Merchant ID
   */
  merchantId?: string | number;

  /**
   * Currency symbol
   */
  symbol?: string;

  /**
   * Change Amount
   */
  amount?: number;

  /**
   * Available balance before change
   */
  oldBalance?: number;

  /**
   * Available balance after change
   */
  newBalance?: number;

  /**
   * Frozen balance before change
   */
  oldFrozen?: number;

  /**
   * Frozen balance after change
   */
  newFrozen?: number;

  /**
   * Type: deposit/withdraw/payin/payout
   */
  type?: string;

  /**
   * Income/Expense IN/OUT
   */
  inOut?: string;

  /**
   * Fee
   */
  fee?: number;

  /**
   * Fee rate
   */
  feerate?: number;

  /**
   * Fee Currency
   */
  feeSymbol?: string;

  /**
   * Exchange rate (only valid for exchange type)
   */
  rate?: number;

    /**
     * Date range parameter
     */
    params?: any;
}



