export interface TxRecordVO {
  /**
   * ID
   */
  id: string | number;

  /**
   * Order number
   */
  orderId: string | number;

  /**
   * Height
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
   * Contract Address
   */
  contractAddress: string;

  /**
   * Transaction Type
   */
  txType: string;

  /**
   * GAS
   */
  txFee: number;

  /**
   * Confirmations
   */
  confirmedNum: number;

  /**
   * Transaction status
   */
  status: string;

  /**
   * Block Time
   */
  blockTime: number;

}

export interface TxRecordForm extends BaseEntity {
  /**
   * ID
   */
  id?: string | number;

  /**
   * Order number
   */
  orderId?: string | number;

  /**
   * Height
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
   * Contract Address
   */
  contractAddress?: string;

  /**
   * Transaction Type
   */
  txType?: string;

  /**
   * GAS
   */
  txFee?: number;

  /**
   * Confirmations
   */
  confirmedNum?: number;

  /**
   * Transaction status
   */
  status?: string;

  /**
   * Block Time
   */
  blockTime?: number;

}

export interface TxRecordQuery extends PageQuery {

  /**
   * Order number
   */
  orderId?: string | number;

  /**
   * Height
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
   * Contract Address
   */
  contractAddress?: string;

  /**
   * Transaction Type
   */
  txType?: string;

  /**
   * GAS
   */
  txFee?: number;

  /**
   * Confirmations
   */
  confirmedNum?: number;

  /**
   * Transaction status
   */
  status?: string;

  /**
   * Block Time
   */
  blockTime?: number;

  /**
   * Create Actual
   */
  createTime?: string;

    /**
     * Date range parameter
     */
    params?: any;
}



