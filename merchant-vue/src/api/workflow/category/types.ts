export interface CategoryTreeVO {
  id: number | string;
  label: string;
  parentId: number | string;
  weight: number;
  children: CategoryTreeVO[];
}
export interface CategoryVO {
  /**
   * Process category ID
   */
  categoryId: string | number;

  /**
   * Parent ID
   */
  parentId: string | number;

  /**
   * Process Category Name
   */
  categoryName: string;

  /**
   * Display order
   */
  orderNum: number;

  /**
   * Created At
   */
  createTime: string;

  /**
   * Child object
   */
  children: CategoryVO[];
}

export interface CategoryForm extends BaseEntity {
  /**
   * Process category ID
   */
  categoryId?: string | number;

  /**
   * Process Category Name
   */
  categoryName?: string;

  /**
   * Parent process category ID
   */
  parentId?: string | number;

  /**
   * Display order
   */
  orderNum?: number;
}

export interface CategoryQuery {
  /**
   * Process Category Name
   */
  categoryName?: string;
}
