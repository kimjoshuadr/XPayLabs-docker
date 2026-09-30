import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { TxRecordVO, TxRecordForm, TxRecordQuery } from '@/api/xpay/txRecord/types';

/**
 * Query on-chain transaction records list
 * @param query
 * @returns {*}
 */

export const listTxRecord = (query?: TxRecordQuery): AxiosPromise<TxRecordVO[]> => {
  return request({
    url: '/xpay/txRecord/list',
    method: 'get',
    params: query
  });
};

/**
 * Query on-chain transaction record details
 * @param id
 */
export const getTxRecord = (id: string | number): AxiosPromise<TxRecordVO> => {
  return request({
    url: '/xpay/txRecord/' + id,
    method: 'get'
  });
};

/**
 * Add on-chain transaction record
 * @param data
 */
export const addTxRecord = (data: TxRecordForm) => {
  return request({
    url: '/xpay/txRecord',
    method: 'post',
    data: data
  });
};

/**
 * Edit On-chain Transaction Record
 * @param data
 */
export const updateTxRecord = (data: TxRecordForm) => {
  return request({
    url: '/xpay/txRecord',
    method: 'put',
    data: data
  });
};

/**
 * Delete on-chain transaction record
 * @param id
 */
export const delTxRecord = (id: string | number | Array<string | number>) => {
  return request({
    url: '/xpay/txRecord/' + id,
    method: 'delete'
  });
};
