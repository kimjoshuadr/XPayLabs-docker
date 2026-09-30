export interface ErrorBlockVO {
  /**
   * Primary key ID
   */
  id: string | number;

  /**
   * Error height
   */
  blockNumber: number;

}

export interface ErrorBlockForm extends BaseEntity {
  /**
   * Primary key ID
   */
  id?: string | number;

  /**
   * Error height
   */
  blockNumber?: number;

}

export interface ErrorBlockQuery extends PageQuery {

  /**
   * Error height
   */
  blockNumber?: number;

    /**
     * Date range parameter
     */
    params?: any;
}



