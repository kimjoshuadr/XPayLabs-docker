import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { MerchantVO, MerchantForm, MerchantQuery, Google2fa, Verify2faForm, Verify2faSuccess, ApiKeyVo, WithdrawalForm, updateColdAddressForm, UpdateCallbackUrlForm, setWhitelistIpForm, setEnergyApikeyForm } from '@/api/xpay/merchant/types';

export const assetTypeList = (): AxiosPromise<any> => {
  return request({
    url: '/xpay/merchant/assetTypeList',
    method: 'get'
  });
};

export const setEnergyApikey = (data: setEnergyApikeyForm): AxiosPromise<any> => {
  return request({
    url: '/xpay/merchant/setEnergyApikey',
    method: 'post',
    data: data
  });
};

export const energyPlatformInfo = (): AxiosPromise<any> => {
  return request({
    url: '/xpay/merchant/energyPlatformInfo',
    method: 'get'
  });
};

export const testUserGetOrderStatus = (orderNo: string): AxiosPromise<any> => {
  return request({
    url: `/xpay/merchant/testUserGetOrderStatus/` + orderNo,
    method: 'get'
  });
};
export const testUserRecharge = (data: any): AxiosPromise<any> => {
  return request({
    url: '/xpay/merchant/testUserRecharge',
    method: 'post',
    data: data
  });
};

export const setWhitelistIp = (data: setWhitelistIpForm): AxiosPromise<any> => {
  return request({
    url: '/xpay/merchant/setWhitelistIp',
    method: 'post',
    data: data
  });
};

export const updateCallbackUrl = (data: UpdateCallbackUrlForm): AxiosPromise<any> => {
  return request({
    url: '/xpay/merchant/updateCallbackUrl',
    method: 'post',
    data: data
  });
};

export const updateColdAddress = (data: updateColdAddressForm): AxiosPromise<any> => {
  return request({
    url: '/xpay/merchant/updateColdAddress',
    method: 'post',
    data: data
  });
};

export const withdrawal = (data: WithdrawalForm): AxiosPromise<any> => {
  return request({
    url: '/xpay/merchant/withdrawal',
    method: 'post',
    data: data
  });
};

/**
 * Get merchant API key
 * @returns {*}
 */
export const merchantApiKey = (code: number): AxiosPromise<ApiKeyVo> => {
  return request({
    url: '/xpay/merchant/merchantApiKey',
    method: 'get',
    params: code
  });
};

/**
 * Bind Google verification code
 * @returns {*}
 */
export const bind2fa = (): AxiosPromise<Google2fa> => {
  return request({
    url: '/xpay/merchant/bind2fa',
    method: 'get'
  });
};
/**
 * Verify Google verification code
 * @param data 
 * @returns 
 */
export const verify2fa = (data: Verify2faForm): AxiosPromise<Verify2faSuccess> => {
  return request({
    url: '/xpay/merchant/verify2fa',
    method: 'post',
    data: data
  });
};

/**
 * Query merchant information details
 * @param id
 */
export const merchantInfo = (): AxiosPromise<MerchantVO> => {
  return request({
    url: '/xpay/merchant/merchantInfo',
    method: 'get'
  });
};

/**
 * Query merchant info list
 * @param query
 * @returns {*}
 */

export const listMerchant = (query?: MerchantQuery): AxiosPromise<MerchantVO[]> => {
  return request({
    url: '/xpay/merchant/list',
    method: 'get',
    params: query
  });
};

/**
 * Query merchant information details
 * @param id
 */
export const getMerchant = (id: string | number): AxiosPromise<MerchantVO> => {
  return request({
    url: '/xpay/merchant/' + id,
    method: 'get'
  });
};

/**
 * Add merchant information
 * @param data
 */
export const addMerchant = (data: MerchantForm) => {
  return request({
    url: '/xpay/merchant',
    method: 'post',
    data: data
  });
};

/**
 * Edit merchant information
 * @param data
 */
export const updateMerchant = (data: MerchantForm) => {
  return request({
    url: '/xpay/merchant',
    method: 'put',
    data: data
  });
};

/**
 * Delete merchant information
 * @param id
 */
export const delMerchant = (id: string | number | Array<string | number>) => {
  return request({
    url: '/xpay/merchant/' + id,
    method: 'delete'
  });
};
