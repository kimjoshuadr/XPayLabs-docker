import request from '@/utils/request';
import { TenantForm, TenantQuery, TenantVO } from './types';
import { AxiosPromise } from 'axios';

// Query tenant list
export function listTenant(query: TenantQuery): AxiosPromise<TenantVO[]> {
  return request({
    url: '/system/tenant/list',
    method: 'get',
    params: query
  });
}

// Query tenant details
export function getTenant(id: string | number): AxiosPromise<TenantVO> {
  return request({
    url: '/system/tenant/' + id,
    method: 'get'
  });
}

// Add tenant
export function addTenant(data: TenantForm) {
  return request({
    url: '/system/tenant',
    method: 'post',
    headers: {
      isEncrypt: true,
      repeatSubmit: false
    },
    data: data
  });
}

// Edit tenant
export function updateTenant(data: TenantForm) {
  return request({
    url: '/system/tenant',
    method: 'put',
    data: data
  });
}

// Tenant status update
export function changeTenantStatus(id: string | number, tenantId: string | number, status: string) {
  const data = {
    id,
    tenantId,
    status
  };
  return request({
    url: '/system/tenant/changeStatus',
    method: 'put',
    data: data
  });
}

// Delete Tenant
export function delTenant(id: string | number | Array<string | number>) {
  return request({
    url: '/system/tenant/' + id,
    method: 'delete'
  });
}

// Dynamically switch tenant
export function dynamicTenant(tenantId: string | number) {
  return request({
    url: '/system/tenant/dynamic/' + tenantId,
    method: 'get'
  });
}

// Clear dynamic tenant
export function dynamicClear() {
  return request({
    url: '/system/tenant/dynamic/clear',
    method: 'get'
  });
}

// Sync tenant package
export function syncTenantPackage(tenantId: string | number, packageId: string | number) {
  const data = {
    tenantId,
    packageId
  };
  return request({
    url: '/system/tenant/syncTenantPackage',
    method: 'get',
    params: data
  });
}

// Sync tenant dictionary
export function syncTenantDict() {
  return request({
    url: '/system/tenant/syncTenantDict',
    method: 'get'
  });
}
