import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { PaymentOrderVO, PaymentOrderForm, PaymentOrderQuery } from '@/api/xpay/paymentOrder/types';

/**
 * Query payment orders list
 * @param query
 * @returns {*}
 */

export const listPaymentOrder = (query?: PaymentOrderQuery): AxiosPromise<PaymentOrderVO[]> => {
  return request({
    url: '/xpay/paymentOrder/list',
    method: 'get',
    params: query
  });
};

/**
 * Query payment order details
 * @param id
 */
export const getPaymentOrder = (id: string | number): AxiosPromise<PaymentOrderVO> => {
  return request({
    url: '/xpay/paymentOrder/' + id,
    method: 'get'
  });
};

/**
 * Add payment order
 * @param data
 */
export const addPaymentOrder = (data: PaymentOrderForm) => {
  return request({
    url: '/xpay/paymentOrder',
    method: 'post',
    data: data
  });
};

/**
 * Edit Payment Order
 * @param data
 */
export const updatePaymentOrder = (data: PaymentOrderForm) => {
  return request({
    url: '/xpay/paymentOrder',
    method: 'put',
    data: data
  });
};

/**
 * Delete payment order
 * @param id
 */
export const delPaymentOrder = (id: string | number | Array<string | number>) => {
  return request({
    url: '/xpay/paymentOrder/' + id,
    method: 'delete'
  });
};
