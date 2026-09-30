export interface UserAddressVO {
  /**
   * Primary key ID
   */
  id: string | number;

  /**
   * Merchant ID
   */
  merchantId: string | number;

  /**
   * User ID
   */
  userId: string | number;

  /**
   * Chain
   */
  chain: string;

  /**
   * Address
   */
  address: string;

  /**
   * Collectible
   */
  collectible: string;

}

export interface UserAddressForm extends BaseEntity {
  /**
   * Primary key ID
   */
  id?: string | number;

  /**
   * Merchant ID
   */
  merchantId?: string | number;

  /**
   * User ID
   */
  userId?: string | number;

  /**
   * Chain
   */
  chain?: string;

  /**
   * Address
   */
  address?: string;

  /**
   * Collectible
   */
  collectible?: string;

}

export interface UserAddressQuery extends PageQuery {

  /**
   * Merchant ID
   */
  merchantId?: string | number;

  /**
   * User ID
   */
  userId?: string | number;

  /**
   * Chain
   */
  chain?: string;

  /**
   * Address
   */
  address?: string;

  /**
   * Collectible
   */
  collectible?: string;

    /**
     * Date range parameter
     */
    params?: any;
}


/**
 * Pending Sweep Balance Info
 */
export interface PendingCollectionVO {
  /**
   * Chain + currency
   */
  chainSymbol: number;
  
  /**
   * Pending Collection USDT Balance
   */
  totalAmount: number;
}