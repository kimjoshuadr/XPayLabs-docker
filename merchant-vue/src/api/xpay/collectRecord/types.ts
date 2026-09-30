export interface CollectRecordVO {
  /**
   * ID
   */
  id: string | number;

  /**
   * Merchant ID
   */
  merchantId: string | number;

  /**
   * Block height
   */
  blockNumber: number;

  /**
   * Payout Address
   */
  fromAddress: string;

  /**
   * Receiving address
   */
  toAddress: string;

  /**
   * Chain
   */
  chain: string;

  /**
   * Currency
   */
  symbol: string;

  /**
   * Quantity
   */
  amount: number;

  /**
   * Hash
   */
  txId: string | number;

  /**
   * Contract
   */
  contractAddress: string;

  /**
   * GAS Fee
   */
  txFee: number;

  /**
   * Number of confirmations
   */
  confirmedNum: number;

  /**
   * Transaction status
   */
  status: string;

  /**
   * Confirmation time
   */
  blockTime: number;

  /**
   * Estimated transfer quantity
   */
  collectAmount: number;

  /**
   * Platform Fee
   */
  fee: number;

  /**
   * Platform fee rate
   */
  feeRatio: number;

  /**
   * Created At
   */
  createTime: string;

}

export interface CollectRecordForm extends BaseEntity {
  /**
   * ID
   */
  id?: string | number;

  /**
   * Merchant ID
   */
  merchantId?: string | number;

  /**
   * Block height
   */
  blockNumber?: number;

  /**
   * Payout Address
   */
  fromAddress?: string;

  /**
   * Receiving address
   */
  toAddress?: string;

  /**
   * Chain
   */
  chain?: string;

  /**
   * Currency
   */
  symbol?: string;

  /**
   * Quantity
   */
  amount?: number;

  /**
   * Hash
   */
  txId?: string | number;

  /**
   * Contract
   */
  contractAddress?: string;

  /**
   * GAS Fee
   */
  txFee?: number;

  /**
   * Number of confirmations
   */
  confirmedNum?: number;

  /**
   * Transaction status
   */
  status?: string;

  /**
   * Confirmation time
   */
  blockTime?: number;

  /**
   * Estimated transfer quantity
   */
  collectAmount?: number;

  /**
   * Platform Fee
   */
  fee?: number;

  /**
   * Platform fee rate
   */
  feeRatio?: number;

}

export interface CollectRecordQuery extends PageQuery {

  /**
   * Merchant ID
   */
  merchantId?: string | number;

  /**
   * Block height
   */
  blockNumber?: number;

  /**
   * Payout Address
   */
  fromAddress?: string;

  /**
   * Receiving address
   */
  toAddress?: string;

  /**
   * Chain
   */
  chain?: string;

  /**
   * Currency
   */
  symbol?: string;

  /**
   * Quantity
   */
  amount?: number;

  /**
   * Hash
   */
  txId?: string | number;

  /**
   * Contract
   */
  contractAddress?: string;

  /**
   * GAS Fee
   */
  txFee?: number;

  /**
   * Number of confirmations
   */
  confirmedNum?: number;

  /**
   * Transaction status
   */
  status?: string;

  /**
   * Confirmation time
   */
  blockTime?: number;

  /**
   * Estimated transfer quantity
   */
  collectAmount?: number;

  /**
   * Platform Fee
   */
  fee?: number;

  /**
   * Platform fee rate
   */
  feeRatio?: number;

  /**
   * Created At
   */
  createTime?: string;

    /**
     * Date range parameter
     */
    params?: any;
}



