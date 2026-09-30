export interface MerchantCostDetailVO {
  /**
   * Primary key ID
   */
  id: string | number;

  /**
   * Merchant ID
   */
  merchantId: string | number;

  /**
   * Fee type
   */
  costType: string;

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
   * Business ID
   */
  businessId: string | number;

  /**
   * Created At
   */
  createTime: string;

}

export interface MerchantCostDetailForm extends BaseEntity {
  /**
   * Primary key ID
   */
  id?: string | number;

  /**
   * Merchant ID
   */
  merchantId?: string | number;

  /**
   * Fee type
   */
  costType?: string;

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
   * Business ID
   */
  businessId?: string | number;

}

export interface MerchantCostDetailQuery extends PageQuery {

  /**
   * Merchant ID
   */
  merchantId?: string | number;

  /**
   * Fee type
   */
  costType?: string;

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
   * Business ID
   */
  businessId?: string | number;

  /**
   * Created At
   */
  createTime?: string;

    /**
     * Date range parameter
     */
    params?: any;
}



