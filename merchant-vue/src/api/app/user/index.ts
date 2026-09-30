import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { UserVO, UserForm, UserQuery } from '@/api/app/user/types';

/**
 * Query user info list
 * @param query
 * @returns {*}
 */

export const listUser = (query?: UserQuery): AxiosPromise<UserVO[]> => {
  return request({
    url: '/app/user/list',
    method: 'get',
    params: query
  });
};

/**
 * Query user information details
 * @param userId
 */
export const getUser = (userId: string | number): AxiosPromise<UserVO> => {
  return request({
    url: '/app/user/' + userId,
    method: 'get'
  });
};

/**
 * Add user information
 * @param data
 */
export const addUser = (data: UserForm) => {
  return request({
    url: '/app/user',
    method: 'post',
    data: data
  });
};

/**
 * Edit user info
 * @param data
 */
export const updateUser = (data: UserForm) => {
  return request({
    url: '/app/user',
    method: 'put',
    data: data
  });
};

/**
 * Delete user information
 * @param userId
 */
export const delUser = (userId: string | number | Array<string | number>) => {
  return request({
    url: '/app/user/' + userId,
    method: 'delete'
  });
};
