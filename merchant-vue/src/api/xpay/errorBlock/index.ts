import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { ErrorBlockVO, ErrorBlockForm, ErrorBlockQuery } from '@/api/xpay/errorBlock/types';

/**
 * Query Error Block List
 * @param query
 * @returns {*}
 */

export const listErrorBlock = (query?: ErrorBlockQuery): AxiosPromise<ErrorBlockVO[]> => {
  return request({
    url: '/xpay/errorBlock/list',
    method: 'get',
    params: query
  });
};

/**
 * Query Failed Block Details
 * @param id
 */
export const getErrorBlock = (id: string | number): AxiosPromise<ErrorBlockVO> => {
  return request({
    url: '/xpay/errorBlock/' + id,
    method: 'get'
  });
};

/**
 * Add error block
 * @param data
 */
export const addErrorBlock = (data: ErrorBlockForm) => {
  return request({
    url: '/xpay/errorBlock',
    method: 'post',
    data: data
  });
};

/**
 * Correct erroneous block
 * @param data
 */
export const updateErrorBlock = (data: ErrorBlockForm) => {
  return request({
    url: '/xpay/errorBlock',
    method: 'put',
    data: data
  });
};

/**
 * Delete Error Block
 * @param id
 */
export const delErrorBlock = (id: string | number | Array<string | number>) => {
  return request({
    url: '/xpay/errorBlock/' + id,
    method: 'delete'
  });
};
