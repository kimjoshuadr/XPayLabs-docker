import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { DashboardAdminOverviewVO, DashboardRange, DashboardStatsVO } from './types';

export const getAdminOverview = (): AxiosPromise<DashboardAdminOverviewVO> => {
  return request({
    url: '/xpay/dashboard/admin/overview',
    method: 'get'
  });
};

export const getDashboardStats = (
  range: DashboardRange = 'today',
  merchantId?: number | string
): AxiosPromise<DashboardStatsVO> => {
  return request({
    url: '/xpay/dashboard/stats',
    method: 'get',
    params: { range, merchantId }
  });
};
