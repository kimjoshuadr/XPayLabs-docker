import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { CallbackNoticeVO, CallbackNoticeForm, CallbackNoticeQuery } from '@/api/xpay/callbackNotice/types';

/**
 * Query callback notification list
 * @param query
 * @returns {*}
 */

export const listCallbackNotice = (query?: CallbackNoticeQuery): AxiosPromise<CallbackNoticeVO[]> => {
  return request({
    url: '/xpay/callbackNotice/list',
    method: 'get',
    params: query
  });
};

/**
 * Query callback notification details
 * @param id
 */
export const getCallbackNotice = (id: string | number): AxiosPromise<CallbackNoticeVO> => {
  return request({
    url: '/xpay/callbackNotice/' + id,
    method: 'get'
  });
};

/**
 * Add Callback Notification
 * @param data
 */
export const addCallbackNotice = (data: CallbackNoticeForm) => {
  return request({
    url: '/xpay/callbackNotice',
    method: 'post',
    data: data
  });
};

/**
 * Edit callback notification
 * @param data
 */
export const updateCallbackNotice = (data: CallbackNoticeForm) => {
  return request({
    url: '/xpay/callbackNotice',
    method: 'put',
    data: data
  });
};

/**
 * Delete Callback Notification
 * @param id
 */
export const delCallbackNotice = (id: string | number | Array<string | number>) => {
  return request({
    url: '/xpay/callbackNotice/' + id,
    method: 'delete'
  });
};
