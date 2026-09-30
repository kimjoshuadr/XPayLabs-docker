import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { FiatcurrencyOrderVO, FiatcurrencyOrderForm, FiatcurrencyOrderQuery } from '@/api/xpay/fiatcurrencyOrder/types';

/**
 * Query Fiat Order List
 * @param query
 * @returns {*}
 */

export const listFiatcurrencyOrder = (query?: FiatcurrencyOrderQuery): AxiosPromise<FiatcurrencyOrderVO[]> => {
  return request({
    url: '/xpay/fiatcurrencyOrder/list',
    method: 'get',
    params: query
  });
};

/**
 * Query fiat order details
 * @param id
 */
export const getFiatcurrencyOrder = (id: string | number): AxiosPromise<FiatcurrencyOrderVO> => {
  return request({
    url: '/xpay/fiatcurrencyOrder/' + id,
    method: 'get'
  });
};

/**
 * Add fiat order
 * @param data
 */
export const addFiatcurrencyOrder = (data: FiatcurrencyOrderForm) => {
  return request({
    url: '/xpay/fiatcurrencyOrder',
    method: 'post',
    data: data
  });
};

/**
 * Edit fiat order
 * @param data
 */
export const updateFiatcurrencyOrder = (data: FiatcurrencyOrderForm) => {
  return request({
    url: '/xpay/fiatcurrencyOrder',
    method: 'put',
    data: data
  });
};

/**
 * Delete fiat order
 * @param id
 */
export const delFiatcurrencyOrder = (id: string | number | Array<string | number>) => {
  return request({
    url: '/xpay/fiatcurrencyOrder/' + id,
    method: 'delete'
  });
};
