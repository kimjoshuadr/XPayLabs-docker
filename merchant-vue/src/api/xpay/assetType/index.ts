import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { AssetTypeVO, AssetTypeForm, AssetTypeQuery } from '@/api/xpay/assetType/types';

/**
 * Query supported currency asset type list
 * @param query
 * @returns {*}
 */

export const listAssetType = (query?: AssetTypeQuery): AxiosPromise<AssetTypeVO[]> => {
  return request({
    url: '/xpay/assetType/list',
    method: 'get',
    params: query
  });
};

/**
 * Query supported currency asset type details
 * @param id
 */
export const getAssetType = (id: string | number): AxiosPromise<AssetTypeVO> => {
  return request({
    url: '/xpay/assetType/' + id,
    method: 'get'
  });
};

/**
 * Add supported currency asset type
 * @param data
 */
export const addAssetType = (data: AssetTypeForm) => {
  return request({
    url: '/xpay/assetType',
    method: 'post',
    data: data
  });
};

/**
 * Edit Supported Currency Asset Types
 * @param data
 */
export const updateAssetType = (data: AssetTypeForm) => {
  return request({
    url: '/xpay/assetType',
    method: 'put',
    data: data
  });
};

/**
 * Delete supported currency asset type
 * @param id
 */
export const delAssetType = (id: string | number | Array<string | number>) => {
  return request({
    url: '/xpay/assetType/' + id,
    method: 'delete'
  });
};
