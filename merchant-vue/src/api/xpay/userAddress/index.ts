import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { UserAddressVO, UserAddressForm, UserAddressQuery, PendingCollectionVO } from '@/api/xpay/userAddress/types';

/**
 * Get Pending Collection Balance
 * @returns {*}
 */
export const getPendingCollectionBalances = (): AxiosPromise<PendingCollectionVO[]> => {
  return request({                  
    url: '/xpay/userAddress/getPendingCollectionBalances',
    method: 'get'
  });
}

/**
 * Query User Address List
 * @param query
 * @returns {*}
 */

export const listUserAddress = (query?: UserAddressQuery): AxiosPromise<UserAddressVO[]> => {
  return request({
    url: '/xpay/userAddress/list',
    method: 'get',
    params: query
  });
};

/**
 * Query user address details
 * @param id
 */
export const getUserAddress = (id: string | number): AxiosPromise<UserAddressVO> => {
  return request({
    url: '/xpay/userAddress/' + id,
    method: 'get'
  });
};

/**
 * Add user address
 * @param data
 */
export const addUserAddress = (data: UserAddressForm) => {
  return request({
    url: '/xpay/userAddress',
    method: 'post',
    data: data
  });
};

/**
 * Edit user address
 * @param data
 */
export const updateUserAddress = (data: UserAddressForm) => {
  return request({
    url: '/xpay/userAddress',
    method: 'put',
    data: data
  });
};

/**
 * Delete User Address
 * @param id
 */
export const delUserAddress = (id: string | number | Array<string | number>) => {
  return request({
    url: '/xpay/userAddress/' + id,
    method: 'delete'
  });
};
