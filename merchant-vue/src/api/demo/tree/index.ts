import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { TreeVO, TreeForm, TreeQuery } from '@/api/demo/tree/types';

/**
 * Query Test Tree List
 * @param query
 * @returns {*}
 */
export const listTree = (query?: TreeQuery): AxiosPromise<TreeVO[]> => {
  return request({
    url: '/demo/tree/list',
    method: 'get',
    params: query
  });
};

/**
 * Query test tree details
 * @param id
 */
export const getTree = (id: string | number): AxiosPromise<TreeVO> => {
  return request({
    url: '/demo/tree/' + id,
    method: 'get'
  });
};

/**
 * Add Test Tree
 * @param data
 */
export const addTree = (data: TreeForm) => {
  return request({
    url: '/demo/tree',
    method: 'post',
    data: data
  });
};

/**
 * Edit Test Tree
 * @param data
 */
export const updateTree = (data: TreeForm) => {
  return request({
    url: '/demo/tree',
    method: 'put',
    data: data
  });
};

/**
 * Delete test tree
 * @param id
 */
export const delTree = (id: string | number | Array<string | number>) => {
  return request({
    url: '/demo/tree/' + id,
    method: 'delete'
  });
};
