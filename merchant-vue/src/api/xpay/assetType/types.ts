export interface AssetTypeVO {
  /**
   * ID
   */
  id: string | number;

  /**
   * Chain
   */
  chain: string;

  /**
   * Currency
   */
  symbol: string;

  /**
   * Contract Address
   */
  contractAddress: string;

  /**
   * Precision
   */
  decimals: number;

  /**
   * Network
   */
  network: string;

  /**
   * Hot Wallet Address
   */
  hotAddress: string;

  /**
   * Cold Wallet Address
   */
  coldAddress: string;

  /**
   * Trigger Collection Quantity
   */
  collectAmount: number;

  /**
   * Confirmations
   */
  confirmedNum: number;

  /**
   * Enabled
   */
  enabled: string;
}

export interface AssetTypeForm extends BaseEntity {
  /**
   * ID
   */
  id?: string | number;

  /**
   * Chain
   */
  chain?: string;

  /**
   * Currency
   */
  symbol?: string;

  /**
   * Contract Address
   */
  contractAddress?: string;

  /**
   * Precision
   */
  decimals?: number;

  /**
   * Network
   */
  network?: string;

  /**
   * Hot Wallet Address
   */
  hotAddress?: string;

  /**
   * Cold Wallet Address
   */
  coldAddress?: string;

  /**
   * Trigger Collection Quantity
   */
  collectAmount?: number;

  /**
   * Confirmations
   */
  confirmedNum?: number;

  /**
   * Enabled
   */
  enabled?: string;
}

export interface AssetTypeQuery extends PageQuery {
  /**
   * Chain
   */
  chain?: string;

  /**
   * Currency
   */
  symbol?: string;

  /**
   * Contract Address
   */
  contractAddress?: string;

  /**
   * Precision
   */
  decimals?: number;

  /**
   * Network
   */
  network?: string;

  /**
   * Hot Wallet Address
   */
  hotAddress?: string;

  /**
   * Cold Wallet Address
   */
  coldAddress?: string;

  /**
   * Trigger Collection Quantity
   */
  collectAmount?: number;

  /**
   * Confirmations
   */
  confirmedNum?: number;

  /**
   * Enabled
   */
  enabled?: string;

  /**
   * Date range parameter
   */
  params?: any;
}
