import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { MerchantAddressVO, MerchantAddressForm, MerchantAddressQuery } from '@/api/xpay/merchantAddress/types';


/**
 * Get Address Info of Logged-in Merchant
 * @returns {*}
 */
export const myAddressList = (): AxiosPromise<MerchantAddressVO[]> => {
  return request({                  
    url: '/xpay/merchantAddress/myAddressList',
    method: 'get'
  });
};  

/**
 * Query Merchant Wallet Address List
 * @param query
 * @returns {*}
 */

export const listMerchantAddress = (query?: MerchantAddressQuery): AxiosPromise<MerchantAddressVO[]> => {
  return request({
    url: '/xpay/merchantAddress/list',
    method: 'get',
    params: query
  });
};

/**
 * Query Merchant Wallet Address Details
 * @param id
 */
export const getMerchantAddress = (id: string | number): AxiosPromise<MerchantAddressVO> => {
  return request({
    url: '/xpay/merchantAddress/' + id,
    method: 'get'
  });
};

/**
 * Add merchant wallet address
 * @param data
 */
export const addMerchantAddress = (data: MerchantAddressForm) => {
  return request({
    url: '/xpay/merchantAddress',
    method: 'post',
    data: data
  });
};

/**
 * Edit merchant wallet address
 * @param data
 */
export const updateMerchantAddress = (data: MerchantAddressForm) => {
  return request({
    url: '/xpay/merchantAddress',
    method: 'put',
    data: data
  });
};

/**
 * Delete merchant wallet address
 * @param id
 */
export const delMerchantAddress = (id: string | number | Array<string | number>) => {
  return request({
    url: '/xpay/merchantAddress/' + id,
    method: 'delete'
  });
};
