import request from '@/utils/request';
import { FlowInstanceQuery, FlowInstanceVO } from '@/api/workflow/instance/types';
import { AxiosPromise } from 'axios';

/**
 * Query Running Instance List
 * @param query
 * @returns {*}
 */
export const pageByRunning = (query: FlowInstanceQuery): AxiosPromise<FlowInstanceVO[]> => {
  return request({
    url: '/workflow/instance/pageByRunning',
    method: 'get',
    params: query
  });
};

/**
 * Query completed instance list
 * @param query
 * @returns {*}
 */
export const pageByFinish = (query: FlowInstanceQuery): AxiosPromise<FlowInstanceVO[]> => {
  return request({
    url: '/workflow/instance/pageByFinish',
    method: 'get',
    params: query
  });
};

/**
 * Get historical process diagram by business ID
 */
export const flowHisTaskList = (businessId: string | number) => {
  return request({
    url: `/workflow/instance/flowHisTaskList/${businessId}` + '?t' + Math.random(),
    method: 'get'
  });
};

/**
 * Paginated query of the current login user's documents
 * @param query
 * @returns {*}
 */
export const pageByCurrent = (query: FlowInstanceQuery): AxiosPromise<FlowInstanceVO[]> => {
  return request({
    url: '/workflow/instance/pageByCurrent',
    method: 'get',
    params: query
  });
};

/**
 * Revoke Process
 * @param data Parameter
 * @returns
 */
export const cancelProcessApply = (data: any) => {
  return request({
    url: `/workflow/instance/cancelProcessApply`,
    method: 'put',
    data: data
  });
};

/**
 * Get process variables
 * @param instanceId Instance ID
 * @returns
 */
export const instanceVariable = (instanceId: string | number) => {
  return request({
    url: `/workflow/instance/instanceVariable/${instanceId}`,
    method: 'get'
  });
};

/**
 * Delete
 * @param instanceIds Process instance ID
 * @returns
 */
export const deleteByInstanceIds = (instanceIds: Array<string | number> | string | number) => {
  return request({
    url: `/workflow/instance/deleteByInstanceIds/${instanceIds}`,
    method: 'delete'
  });
};
/**
 * Void Process
 * @param data Parameter
 * @returns
 */
export const invalid = (data: any) => {
  return request({
    url: `/workflow/instance/invalid`,
    method: 'post',
    data: data
  });
};
