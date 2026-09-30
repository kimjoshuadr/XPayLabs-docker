import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { MerchantRechargeWithdrawVO, MerchantRechargeWithdrawForm, MerchantRechargeWithdrawQuery } from '@/api/xpay/merchantRechargeWithdraw/types';

/**
 * Query Merchant Recharge/Withdrawal List
 * @param query
 * @returns {*}
 */

export const listMerchantRechargeWithdraw = (query?: MerchantRechargeWithdrawQuery): AxiosPromise<MerchantRechargeWithdrawVO[]> => {
  return request({
    url: '/xpay/merchantRechargeWithdraw/list',
    method: 'get',
    params: query
  });
};

/**
 * Query Merchant Recharge/Withdrawal Details
 * @param id
 */
export const getMerchantRechargeWithdraw = (id: string | number): AxiosPromise<MerchantRechargeWithdrawVO> => {
  return request({
    url: '/xpay/merchantRechargeWithdraw/' + id,
    method: 'get'
  });
};

/**
 * Add Merchant Recharge/Withdrawal
 * @param data
 */
export const addMerchantRechargeWithdraw = (data: MerchantRechargeWithdrawForm) => {
  return request({
    url: '/xpay/merchantRechargeWithdraw',
    method: 'post',
    data: data
  });
};

/**
 * Edit Merchant Recharge/Withdrawal
 * @param data
 */
export const updateMerchantRechargeWithdraw = (data: MerchantRechargeWithdrawForm) => {
  return request({
    url: '/xpay/merchantRechargeWithdraw',
    method: 'put',
    data: data
  });
};

/**
 * Delete Merchant Recharge/Withdrawal
 * @param id
 */
export const delMerchantRechargeWithdraw = (id: string | number | Array<string | number>) => {
  return request({
    url: '/xpay/merchantRechargeWithdraw/' + id,
    method: 'delete'
  });
};

/**
 * Approved
 * @param id
 */
export const approveMerchantRechargeWithdraw = (id: string | number) => {
  return request({
    url: '/xpay/merchantRechargeWithdraw/approve/' + id,
    method: 'post'
  });
};

/**
 * Review Rejected
 * @param id
 * @param reason
 */
export const unapproveMerchantRechargeWithdraw = (id: string | number, reason: string) => {
  return request({
    url: '/xpay/merchantRechargeWithdraw/unapprove/' + id,
    method: 'post',
    params: { reason }
  });
};
