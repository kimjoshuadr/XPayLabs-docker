import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { MerchantAssetDetailsVO, MerchantAssetDetailsForm, MerchantAssetDetailsQuery } from '@/api/xpay/merchantAssetDetails/types';

/**
 * Query asset change detail list
 * @param query
 * @returns {*}
 */

export const listMerchantAssetDetails = (query?: MerchantAssetDetailsQuery): AxiosPromise<MerchantAssetDetailsVO[]> => {
  return request({
    url: '/xpay/merchantAssetDetails/list',
    method: 'get',
    params: query
  });
};

/**
 * Query asset change details
 * @param id
 */
export const getMerchantAssetDetails = (id: string | number): AxiosPromise<MerchantAssetDetailsVO> => {
  return request({
    url: '/xpay/merchantAssetDetails/' + id,
    method: 'get'
  });
};

/**
 * Add Asset Change Details
 * @param data
 */
export const addMerchantAssetDetails = (data: MerchantAssetDetailsForm) => {
  return request({
    url: '/xpay/merchantAssetDetails',
    method: 'post',
    data: data
  });
};

/**
 * Edit Asset Change Details
 * @param data
 */
export const updateMerchantAssetDetails = (data: MerchantAssetDetailsForm) => {
  return request({
    url: '/xpay/merchantAssetDetails',
    method: 'put',
    data: data
  });
};

/**
 * Delete asset change details
 * @param id
 */
export const delMerchantAssetDetails = (id: string | number | Array<string | number>) => {
  return request({
    url: '/xpay/merchantAssetDetails/' + id,
    method: 'delete'
  });
};
