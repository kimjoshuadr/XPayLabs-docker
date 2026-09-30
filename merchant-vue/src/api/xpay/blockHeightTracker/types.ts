export interface BlockHeightTrackerVO {
  /**
   * ID
   */
  id: string | number;

  /**
   * Chain
   */
  chain: string;

  /**
   * Current height
   */
  lastHeight: number;

}

export interface BlockHeightTrackerForm extends BaseEntity {
  /**
   * ID
   */
  id?: string | number;

  /**
   * Chain
   */
  chain?: string;

  /**
   * Current height
   */
  lastHeight?: number;

}

export interface BlockHeightTrackerQuery extends PageQuery {

  /**
   * Chain
   */
  chain?: string;

  /**
   * Current height
   */
  lastHeight?: number;

    /**
     * Date range parameter
     */
    params?: any;
}



