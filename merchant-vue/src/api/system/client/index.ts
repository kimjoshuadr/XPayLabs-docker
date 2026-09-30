import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { ClientVO, ClientForm, ClientQuery } from '@/api/system/client/types';

/**
 * Query Client Management List
 * @param query
 * @returns {*}
 */

export const listClient = (query?: ClientQuery): AxiosPromise<ClientVO[]> => {
  return request({
    url: '/system/client/list',
    method: 'get',
    params: query
  });
};

/**
 * Query Client Management Details
 * @param id
 */
export const getClient = (id: string | number): AxiosPromise<ClientVO> => {
  return request({
    url: '/system/client/' + id,
    method: 'get'
  });
};

/**
 * Add Client Management
 * @param data
 */
export const addClient = (data: ClientForm) => {
  return request({
    url: '/system/client',
    method: 'post',
    data: data
  });
};

/**
 * Edit Client Management
 * @param data
 */
export const updateClient = (data: ClientForm) => {
  return request({
    url: '/system/client',
    method: 'put',
    data: data
  });
};

/**
 * Delete client management
 * @param id
 */
export const delClient = (id: string | number | Array<string | number>) => {
  return request({
    url: '/system/client/' + id,
    method: 'delete'
  });
};

/**
 * Status modification
 * @param clientId Client ID
 * @param status Status
 */
export function changeStatus(clientId: string, status: string) {
  const data = {
    clientId,
    status
  };
  return request({
    url: '/system/client/changeStatus',
    method: 'put',
    data: data
  });
}
