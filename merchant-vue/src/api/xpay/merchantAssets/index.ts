import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { MerchantAssetsVO, MerchantAssetsForm, MerchantAssetsQuery } from '@/api/xpay/merchantAssets/types';

/**
 * Assets of the current logged-in user
 * @returns {*}
 */
export const merchantAssets = (): AxiosPromise<MerchantAssetsVO[]> => {
  return request({
    url: '/xpay/merchantAssets/merchantAssets',
    method: 'get'
  });
};

/**
 * Query merchant asset list
 * @param query
 * @returns {*}
 */

export const listMerchantAssets = (query?: MerchantAssetsQuery): AxiosPromise<MerchantAssetsVO[]> => {
  return request({
    url: '/xpay/merchantAssets/list',
    method: 'get',
    params: query
  });
};

/**
 * Query merchant asset details
 * @param id
 */
export const getMerchantAssets = (id: string | number): AxiosPromise<MerchantAssetsVO> => {
  return request({
    url: '/xpay/merchantAssets/' + id,
    method: 'get'
  });
};

/**
 * Add merchant asset
 * @param data
 */
export const addMerchantAssets = (data: MerchantAssetsForm) => {
  return request({
    url: '/xpay/merchantAssets',
    method: 'post',
    data: data
  });
};

/**
 * Edit Merchant Assets
 * @param data
 */
export const updateMerchantAssets = (data: MerchantAssetsForm) => {
  return request({
    url: '/xpay/merchantAssets',
    method: 'put',
    data: data
  });
};

/**
 * Delete merchant asset
 * @param id
 */
export const delMerchantAssets = (id: string | number | Array<string | number>) => {
  return request({
    url: '/xpay/merchantAssets/' + id,
    method: 'delete'
  });
};
