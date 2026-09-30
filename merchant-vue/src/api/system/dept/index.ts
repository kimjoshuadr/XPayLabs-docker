import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { DeptForm, DeptQuery, DeptTreeVO, DeptVO } from './types';

// Query department list
export const listDept = (query?: DeptQuery) => {
  return request({
    url: '/system/dept/list',
    method: 'get',
    params: query
  });
};

/**
 * Query Departments by deptIds
 * @param deptIds
 */
export const optionSelect = (deptIds: (number | string)[]): AxiosPromise<DeptVO[]> => {
  return request({
    url: '/system/dept/optionselect?deptIds=' + deptIds,
    method: 'get'
  });
};

// Query department list (excluding nodes)
export const listDeptExcludeChild = (deptId: string | number): AxiosPromise<DeptVO[]> => {
  return request({
    url: '/system/dept/list/exclude/' + deptId,
    method: 'get'
  });
};

// Query department details
export const getDept = (deptId: string | number): AxiosPromise<DeptVO> => {
  return request({
    url: '/system/dept/' + deptId,
    method: 'get'
  });
};

// Query department dropdown tree structure
export const treeselect = (): AxiosPromise<DeptTreeVO[]> => {
  return request({
    url: '/system/dept/treeselect',
    method: 'get'
  });
};

// Add department
export const addDept = (data: DeptForm) => {
  return request({
    url: '/system/dept',
    method: 'post',
    data: data
  });
};

// Edit department
export const updateDept = (data: DeptForm) => {
  return request({
    url: '/system/dept',
    method: 'put',
    data: data
  });
};

// Delete department
export const delDept = (deptId: number | string) => {
  return request({
    url: '/system/dept/' + deptId,
    method: 'delete'
  });
};
