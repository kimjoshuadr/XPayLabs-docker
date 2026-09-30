export interface DemoVO {
  /**
   * Primary key
   */
  id: string | number;

  /**
   * Department ID
   */
  deptId: string | number;

  /**
   * User ID
   */
  userId: string | number;

  /**
   * Sort order
   */
  orderNum: number;

  /**
   * key
   */
  testKey: string;

  /**
   * Value
   */
  value: string;
}

export interface DemoForm extends BaseEntity {
  /**
   * Primary key
   */
  id?: string | number;

  /**
   * Department ID
   */
  deptId?: string | number;

  /**
   * User ID
   */
  userId?: string | number;

  /**
   * Sort order
   */
  orderNum?: number;

  /**
   * key
   */
  testKey?: string;

  /**
   * Value
   */
  value?: string;
}

export interface DemoQuery extends PageQuery {
  /**
   * Department ID
   */
  deptId?: string | number;

  /**
   * User ID
   */
  userId?: string | number;

  /**
   * Sort order
   */
  orderNum?: number;

  /**
   * key
   */
  testKey?: string;

  /**
   * Value
   */
  value?: string;
}
