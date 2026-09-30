import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { BlockHeightTrackerVO, BlockHeightTrackerForm, BlockHeightTrackerQuery } from '@/api/xpay/blockHeightTracker/types';

/**
 * Query block listener height tracking list
 * @param query
 * @returns {*}
 */

export const listBlockHeightTracker = (query?: BlockHeightTrackerQuery): AxiosPromise<BlockHeightTrackerVO[]> => {
  return request({
    url: '/xpay/blockHeightTracker/list',
    method: 'get',
    params: query
  });
};

/**
 * Query block monitoring height tracking details
 * @param id
 */
export const getBlockHeightTracker = (id: string | number): AxiosPromise<BlockHeightTrackerVO> => {
  return request({
    url: '/xpay/blockHeightTracker/' + id,
    method: 'get'
  });
};

/**
 * Add Block Listening Height Tracking
 * @param data
 */
export const addBlockHeightTracker = (data: BlockHeightTrackerForm) => {
  return request({
    url: '/xpay/blockHeightTracker',
    method: 'post',
    data: data
  });
};

/**
 * Edit block listener height tracking
 * @param data
 */
export const updateBlockHeightTracker = (data: BlockHeightTrackerForm) => {
  return request({
    url: '/xpay/blockHeightTracker',
    method: 'put',
    data: data
  });
};

/**
 * Delete Block Listening Height Tracking
 * @param id
 */
export const delBlockHeightTracker = (id: string | number | Array<string | number>) => {
  return request({
    url: '/xpay/blockHeightTracker/' + id,
    method: 'delete'
  });
};
