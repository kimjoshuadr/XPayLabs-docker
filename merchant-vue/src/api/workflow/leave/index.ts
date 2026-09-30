import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { LeaveVO, LeaveQuery, LeaveForm } from '@/api/workflow/leave/types';

/**
 * Query leave request list
 * @param query
 * @returns {*}
 */

export const listLeave = (query?: LeaveQuery): AxiosPromise<LeaveVO[]> => {
  return request({
    url: '/workflow/leave/list',
    method: 'get',
    params: query
  });
};

/**
 * Query leave request details
 * @param id
 */
export const getLeave = (id: string | number): AxiosPromise<LeaveVO> => {
  return request({
    url: '/workflow/leave/' + id,
    method: 'get'
  });
};

/**
 * Add Leave Request
 * @param data
 */
export const addLeave = (data: LeaveForm): AxiosPromise<LeaveVO> => {
  return request({
    url: '/workflow/leave',
    method: 'post',
    data: data
  });
};

/**
 * Edit Leave Request
 * @param data
 */
export const updateLeave = (data: LeaveForm): AxiosPromise<LeaveVO> => {
  return request({
    url: '/workflow/leave',
    method: 'put',
    data: data
  });
};

/**
 * Delete leave request
 * @param id
 */
export const delLeave = (id: string | number | Array<string | number>) => {
  return request({
    url: '/workflow/leave/' + id,
    method: 'delete'
  });
};
