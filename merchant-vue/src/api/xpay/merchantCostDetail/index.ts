import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { MerchantCostDetailVO, MerchantCostDetailForm, MerchantCostDetailQuery } from '@/api/xpay/merchantCostDetail/types';

/**
 * Query merchant fee details list
 * @param query
 * @returns {*}
 */

export const listMerchantCostDetail = (query?: MerchantCostDetailQuery): AxiosPromise<MerchantCostDetailVO[]> => {
  return request({
    url: '/xpay/merchantCostDetail/list',
    method: 'get',
    params: query
  });
};

/**
 * Query merchant fee details
 * @param id
 */
export const getMerchantCostDetail = (id: string | number): AxiosPromise<MerchantCostDetailVO> => {
  return request({
    url: '/xpay/merchantCostDetail/' + id,
    method: 'get'
  });
};

/**
 * Add merchant fee details
 * @param data
 */
export const addMerchantCostDetail = (data: MerchantCostDetailForm) => {
  return request({
    url: '/xpay/merchantCostDetail',
    method: 'post',
    data: data
  });
};

/**
 * Edit Merchant Fee Details
 * @param data
 */
export const updateMerchantCostDetail = (data: MerchantCostDetailForm) => {
  return request({
    url: '/xpay/merchantCostDetail',
    method: 'put',
    data: data
  });
};

/**
 * Delete merchant fee details
 * @param id
 */
export const delMerchantCostDetail = (id: string | number | Array<string | number>) => {
  return request({
    url: '/xpay/merchantCostDetail/' + id,
    method: 'delete'
  });
};
