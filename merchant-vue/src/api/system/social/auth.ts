import request from '@/utils/request';

// Bind account
export function authBinding(source: string, tenantId: string) {
  return request({
    url: '/auth/binding/' + source,
    method: 'get',
    params: {
      tenantId: tenantId,
      domain: window.location.host
    }
  });
}

// Unbind account
export function authUnlock(authId: string) {
  return request({
    url: '/auth/unlock/' + authId,
    method: 'delete'
  });
}
// Get authorization list
export function getAuthList() {
  return request({
    url: '/system/social/list',
    method: 'get'
  });
}
