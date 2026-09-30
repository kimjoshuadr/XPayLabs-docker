import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { DemoVO, DemoForm, DemoQuery } from '@/api/demo/demo/types';

/**
 * Query test order list
 * @param query
 * @returns {*}
 */
export const listDemo = (query?: DemoQuery): AxiosPromise<DemoVO[]> => {
  return request({
    url: '/demo/demo/list',
    method: 'get',
    params: query
  });
};

/**
 * Query Test Order Details
 * @param id
 */
export const getDemo = (id: string | number): AxiosPromise<DemoVO> => {
  return request({
    url: '/demo/demo/' + id,
    method: 'get'
  });
};

/**
 * Add Test Order
 * @param data
 */
export const addDemo = (data: DemoForm) => {
  return request({
    url: '/demo/demo',
    method: 'post',
    data: data
  });
};

/**
 * Edit test order
 * @param data
 */
export const updateDemo = (data: DemoForm) => {
  return request({
    url: '/demo/demo',
    method: 'put',
    data: data
  });
};

/**
 * Delete test order
 * @param id
 */
export const delDemo = (id: string | number | Array<string | number>) => {
  return request({
    url: '/demo/demo/' + id,
    method: 'delete'
  });
};
