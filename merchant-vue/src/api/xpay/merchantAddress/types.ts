export interface MerchantAddressVO {
  /**
   * Primary key ID
   */
  id: string | number;

  /**
   * Merchant ID
   */
  merchantId: string | number;

  /**
   * Chain
   */
  chain: string;

  /**
   * Currency
   */
  symbol: string;

  /**
   * Cold Wallet Address
   */
  coldAddress: string;

  /**
   * Sweep Trigger Count
   */
  collectAmount: number;

  /**
   * Hot Wallet Address
   */
  hotAddress: string;

}

export interface MerchantAddressForm extends BaseEntity {
  /**
   * Primary key ID
   */
  id?: string | number;

  /**
   * Merchant ID
   */
  merchantId?: string | number;

  /**
   * Chain
   */
  chain?: string;

  /**
   * Currency
   */
  symbol?: string;

  /**
   * Cold Wallet Address
   */
  coldAddress?: string;

  /**
   * Sweep Trigger Count
   */
  collectAmount?: number;

  /**
   * Hot Wallet Address
   */
  hotAddress?: string;

}

export interface MerchantAddressQuery extends PageQuery {

  /**
   * Merchant ID
   */
  merchantId?: string | number;

  /**
   * Chain
   */
  chain?: string;

  /**
   * Currency
   */
  symbol?: string;

  /**
   * Cold Wallet Address
   */
  coldAddress?: string;

  /**
   * Sweep Trigger Count
   */
  collectAmount?: number;

  /**
   * Hot Wallet Address
   */
  hotAddress?: string;

    /**
     * Date range parameter
     */
    params?: any;
}


