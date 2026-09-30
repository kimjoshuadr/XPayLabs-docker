import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { CategoryVO, CategoryForm, CategoryQuery, CategoryTreeVO } from '@/api/workflow/category/types';

/**
 * Query process category list
 * @param query
 * @returns {*}
 */

export const listCategory = (query?: CategoryQuery): AxiosPromise<CategoryVO[]> => {
  return request({
    url: '/workflow/category/list',
    method: 'get',
    params: query
  });
};

/**
 * Query process category details
 * @param categoryId
 */
export const getCategory = (categoryId: string | number): AxiosPromise<CategoryVO> => {
  return request({
    url: '/workflow/category/' + categoryId,
    method: 'get'
  });
};

/**
 * Add process category
 * @param data
 */
export const addCategory = (data: CategoryForm) => {
  return request({
    url: '/workflow/category',
    method: 'post',
    data: data
  });
};

/**
 * Edit process category
 * @param data
 */
export const updateCategory = (data: CategoryForm) => {
  return request({
    url: '/workflow/category',
    method: 'put',
    data: data
  });
};

/**
 * Delete Process Category
 * @param categoryId
 */
export const delCategory = (categoryId: string | number | Array<string | number>) => {
  return request({
    url: '/workflow/category/' + categoryId,
    method: 'delete'
  });
};

/**
 * Get Process Category Tree List
 * @param query Process instance id
 * @returns
 */
export const categoryTree = (query?: CategoryForm): AxiosPromise<CategoryTreeVO[]> => {
  return request({
    url: `/workflow/category/categoryTree`,
    method: 'get',
    params: query
  });
};
