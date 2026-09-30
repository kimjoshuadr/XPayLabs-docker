import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { CollectRecordVO, CollectRecordForm, CollectRecordQuery } from '@/api/xpay/collectRecord/types';

/**
 * Query on-chain collection record list
 * @param query
 * @returns {*}
 */

export const listCollectRecord = (query?: CollectRecordQuery): AxiosPromise<CollectRecordVO[]> => {
  return request({
    url: '/xpay/collectRecord/list',
    method: 'get',
    params: query
  });
};

/**
 * Query on-chain collection record details
 * @param id
 */
export const getCollectRecord = (id: string | number): AxiosPromise<CollectRecordVO> => {
  return request({
    url: '/xpay/collectRecord/' + id,
    method: 'get'
  });
};

/**
 * Add on-chain collection record
 * @param data
 */
export const addCollectRecord = (data: CollectRecordForm) => {
  return request({
    url: '/xpay/collectRecord',
    method: 'post',
    data: data
  });
};

/**
 * Edit on-chain collection record
 * @param data
 */
export const updateCollectRecord = (data: CollectRecordForm) => {
  return request({
    url: '/xpay/collectRecord',
    method: 'put',
    data: data
  });
};

/**
 * Delete on-chain collection record
 * @param id
 */
export const delCollectRecord = (id: string | number | Array<string | number>) => {
  return request({
    url: '/xpay/collectRecord/' + id,
    method: 'delete'
  });
};
