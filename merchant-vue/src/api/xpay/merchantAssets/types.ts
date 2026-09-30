export interface MerchantAssetsVO {
  /**
   * 
   */
  id: string | number;

  /**
   * Merchant ID
   */
  merchantId: string | number;

  /**
   * Currency Symbol (USDT, BTC, etc.)
   */
  symbol: string;

  /**
   * Available Balance
   */
  balance: number;

  /**
   * Frozen balance
   */
  frozenBalance: number;

  /**
   * Total balance (redundant)
   */
  totalBalance: number;

}

export interface MerchantAssetsForm extends BaseEntity {
  /**
   * 
   */
  id?: string | number;

  /**
   * Merchant ID
   */
  merchantId?: string | number;

  /**
   * Currency Symbol (USDT, BTC, etc.)
   */
  symbol?: string;

  /**
   * Available Balance
   */
  balance?: number;

  /**
   * Frozen balance
   */
  frozenBalance?: number;

  /**
   * Total balance (redundant)
   */
  totalBalance?: number;

}

export interface MerchantAssetsQuery extends PageQuery {

  /**
   * Merchant ID
   */
  merchantId?: string | number;

  /**
   * Currency Symbol (USDT, BTC, etc.)
   */
  symbol?: string;

  /**
   * Available Balance
   */
  balance?: number;

  /**
   * Frozen balance
   */
  frozenBalance?: number;

  /**
   * Total balance (redundant)
   */
  totalBalance?: number;

  /**
   * Created At
   */
  createTime?: string;

  /**
   * Updated At
   */
  updateTime?: string;

    /**
     * Date range parameter
     */
    params?: any;
}



