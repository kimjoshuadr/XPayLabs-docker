export interface TreeVO {
  /**
   * Primary key
   */
  id: string | number;

  /**
   * Parent id
   */
  parentId: string | number;

  /**
   * Department ID
   */
  deptId: string | number;

  /**
   * User ID
   */
  userId: string | number;

  /**
   * Value
   */
  treeName: string;

  /**
   * Child object
   */
  children: TreeVO[];
}

export interface TreeForm extends BaseEntity {
  /**
   * Primary key
   */
  id?: string | number;

  /**
   * Parent id
   */
  parentId?: string | number;

  /**
   * Department ID
   */
  deptId?: string | number;

  /**
   * User ID
   */
  userId?: string | number;

  /**
   * Value
   */
  treeName?: string;
}

export interface TreeQuery {
  /**
   * Parent id
   */
  parentId?: string | number;

  /**
   * Department ID
   */
  deptId?: string | number;

  /**
   * User ID
   */
  userId?: string | number;

  /**
   * Value
   */
  treeName?: string;
}
