import request from '@/utils/request';
import { OnlineQuery, OnlineVO } from './types';
import { AxiosPromise } from 'axios';

// Query online user list
export function list(query: OnlineQuery): AxiosPromise<OnlineVO[]> {
  return request({
    url: '/monitor/online/list',
    method: 'get',
    params: query
  });
}

// Force logout user
export function forceLogout(tokenId: string) {
  return request({
    url: '/monitor/online/' + tokenId,
    method: 'delete'
  });
}

// Get online devices of the current logged-in user
export function getOnline() {
  return request({
    url: '/monitor/online',
    method: 'get'
  });
}

// Delete current online device
export function delOnline(tokenId: string) {
  return request({
    url: '/monitor/online/myself/' + tokenId,
    method: 'delete'
  });
}
