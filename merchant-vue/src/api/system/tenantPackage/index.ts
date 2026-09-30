import request from '@/utils/request';
import { TenantPkgForm, TenantPkgQuery, TenantPkgVO } from './types';
import { AxiosPromise } from 'axios';

// Query tenant package list
export function listTenantPackage(query?: TenantPkgQuery): AxiosPromise<TenantPkgVO[]> {
  return request({
    url: '/system/tenant/package/list',
    method: 'get',
    params: query
  });
}

// Query tenant package dropdown list
export function selectTenantPackage(): AxiosPromise<TenantPkgVO[]> {
  return request({
    url: '/system/tenant/package/selectList',
    method: 'get'
  });
}

// Query tenant package details
export function getTenantPackage(packageId: string | number): AxiosPromise<TenantPkgVO> {
  return request({
    url: '/system/tenant/package/' + packageId,
    method: 'get'
  });
}

// Add tenant package
export function addTenantPackage(data: TenantPkgForm) {
  return request({
    url: '/system/tenant/package',
    method: 'post',
    data: data
  });
}

// Edit Tenant Package
export function updateTenantPackage(data: TenantPkgForm) {
  return request({
    url: '/system/tenant/package',
    method: 'put',
    data: data
  });
}

// Tenant package status modification
export function changePackageStatus(packageId: number | string, status: string) {
  const data = {
    packageId,
    status
  };
  return request({
    url: '/system/tenant/package/changeStatus',
    method: 'put',
    data: data
  });
}

// Delete tenant package
export function delTenantPackage(packageId: string | number | Array<string | number>) {
  return request({
    url: '/system/tenant/package/' + packageId,
    method: 'delete'
  });
}
