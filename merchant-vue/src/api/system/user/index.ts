import { DeptTreeVO, DeptVO } from './../dept/types';
import { RoleVO } from '@/api/system/role/types';
import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { UserForm, UserQuery, UserVO, UserInfoVO } from './types';
import { parseStrEmpty } from '@/utils/ruoyi';

/**
 * Query User List
 * @param query
 */
export const listUser = (query: UserQuery): AxiosPromise<UserVO[]> => {
  return request({
    url: '/system/user/list',
    method: 'get',
    params: query
  });
};

/**
 * Query users by user IDs
 * @param userIds
 */
export const optionSelect = (userIds: (number | string)[]): AxiosPromise<UserVO[]> => {
  return request({
    url: '/system/user/optionselect?userIds=' + userIds,
    method: 'get'
  });
};

/**
 * Get user details
 * @param userId
 */
export const getUser = (userId?: string | number): AxiosPromise<UserInfoVO> => {
  return request({
    url: '/system/user/' + parseStrEmpty(userId),
    method: 'get'
  });
};

/**
 * Add user
 */
export const addUser = (data: UserForm) => {
  return request({
    url: '/system/user',
    method: 'post',
    data: data
  });
};

/**
 * Edit User
 */
export const updateUser = (data: UserForm) => {
  return request({
    url: '/system/user',
    method: 'put',
    data: data
  });
};

/**
 * Delete user
 * @param userId User ID
 */
export const delUser = (userId: Array<string | number> | string | number) => {
  return request({
    url: '/system/user/' + userId,
    method: 'delete'
  });
};

/**
 * User password reset
 * @param userId User ID
 * @param password Password
 */
export const resetUserPwd = (userId: string | number, password: string) => {
  const data = {
    userId,
    password
  };
  return request({
    url: '/system/user/resetPwd',
    method: 'put',
    headers: {
      isEncrypt: true,
      repeatSubmit: false
    },
    data: data
  });
};

/**
 * User status modification
 * @param userId User ID
 * @param status User status
 */
export const changeUserStatus = (userId: number | string, status: string) => {
  const data = {
    userId,
    status
  };
  return request({
    url: '/system/user/changeStatus',
    method: 'put',
    data: data
  });
};

/**
 * Query user profile
 */
export const getUserProfile = (): AxiosPromise<UserInfoVO> => {
  return request({
    url: '/system/user/profile',
    method: 'get'
  });
};

/**
 * Edit User Profile
 * @param data User information
 */
export const updateUserProfile = (data: UserForm) => {
  return request({
    url: '/system/user/profile',
    method: 'put',
    data: data
  });
};

/**
 * User password reset
 * @param oldPassword Old password
 * @param newPassword New password
 */
export const updateUserPwd = (oldPassword: string, newPassword: string) => {
  const data = {
    oldPassword,
    newPassword
  };
  return request({
    url: '/system/user/profile/updatePwd',
    method: 'put',
    headers: {
      isEncrypt: true,
      repeatSubmit: false
    },
    data: data
  });
};

/**
 * User avatar upload
 * @param data Avatar file
 */
export const uploadAvatar = (data: FormData) => {
  return request({
    url: '/system/user/profile/avatar',
    method: 'post',
    data: data
  });
};

/**
 * Query Authorized Roles
 * @param userId User ID
 */
export const getAuthRole = (userId: string | number): AxiosPromise<{ user: UserVO; roles: RoleVO[] }> => {
  return request({
    url: '/system/user/authRole/' + userId,
    method: 'get'
  });
};

/**
 * Save Authorized Roles
 * @param data User ID
 */
export const updateAuthRole = (data: { userId: string; roleIds: string }) => {
  return request({
    url: '/system/user/authRole',
    method: 'put',
    params: data
  });
};

/**
 * Query all user information of the current department
 * @param deptId
 */
export const listUserByDeptId = (deptId: string | number): AxiosPromise<UserVO[]> => {
  return request({
    url: '/system/user/list/dept/' + deptId,
    method: 'get'
  });
};

/**
 * Query Department Dropdown Tree
 */
export const deptTreeSelect = (): AxiosPromise<DeptTreeVO[]> => {
  return request({
    url: '/system/user/deptTree',
    method: 'get'
  });
};

export default {
  listUser,
  getUser,
  optionSelect,
  addUser,
  updateUser,
  delUser,
  resetUserPwd,
  changeUserStatus,
  getUserProfile,
  updateUserProfile,
  updateUserPwd,
  uploadAvatar,
  getAuthRole,
  updateAuthRole,
  deptTreeSelect,
  listUserByDeptId
};
