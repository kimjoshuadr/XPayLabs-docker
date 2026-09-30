import request from '@/utils/request';
import { LoginInfoQuery, LoginInfoVO } from './types';
import { AxiosPromise } from 'axios';

// Query login log list
export function list(query: LoginInfoQuery): AxiosPromise<LoginInfoVO[]> {
  return request({
    url: '/app/logininfor/list',
    method: 'get',
    params: query
  });
}

// Delete login log
export function delLoginInfo(infoId: string | number | Array<string | number>) {
  return request({
    url: '/app/logininfor/' + infoId,
    method: 'delete'
  });
}

// Unlock user login status
export function unlockLoginInfo(userName: string | Array<string>) {
  return request({
    url: '/app/logininfor/unlock/' + userName,
    method: 'get'
  });
}

// Clear login logs
export function cleanLoginInfo() {
  return request({
    url: '/app/logininfor/clean',
    method: 'delete'
  });
}
