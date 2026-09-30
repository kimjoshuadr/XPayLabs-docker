import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { CacheVO } from './types';

// Query cache details
export function getCache(): AxiosPromise<CacheVO> {
  return request({
    url: '/monitor/cache',
    method: 'get'
  });
}

// Query cache name list
export function listCacheName() {
  return request({
    url: '/monitor/cache/getNames',
    method: 'get'
  });
}

// Query cache key name list
export function listCacheKey(cacheName: string) {
  return request({
    url: '/monitor/cache/getKeys/' + cacheName,
    method: 'get'
  });
}

// Query cache contents
export function getCacheValue(cacheName: string, cacheKey: string) {
  return request({
    url: '/monitor/cache/getValue/' + cacheName + '/' + cacheKey,
    method: 'get'
  });
}

// Clear cache by specified name
export function clearCacheName(cacheName: string) {
  return request({
    url: '/monitor/cache/clearCacheName/' + cacheName,
    method: 'delete'
  });
}

// Clear cache for specified key
export function clearCacheKey(cacheName: string, cacheKey: string) {
  return request({
    url: '/monitor/cache/clearCacheKey/' + cacheName + '/' + cacheKey,
    method: 'delete'
  });
}

// Clear all caches
export function clearCacheAll() {
  return request({
    url: '/monitor/cache/clearCacheAll',
    method: 'delete'
  });
}
