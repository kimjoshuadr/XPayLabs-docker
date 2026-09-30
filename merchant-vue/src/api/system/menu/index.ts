import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { MenuQuery, MenuVO, MenuForm, MenuTreeOption, RoleMenuTree } from './types';

// Query menu list
export const listMenu = (query?: MenuQuery): AxiosPromise<MenuVO[]> => {
  return request({
    url: '/system/menu/list',
    method: 'get',
    params: query
  });
};

// Query menu details
export const getMenu = (menuId: string | number): AxiosPromise<MenuVO> => {
  return request({
    url: '/system/menu/' + menuId,
    method: 'get'
  });
};

// Query menu dropdown tree
export const treeselect = (): AxiosPromise<MenuTreeOption[]> => {
  return request({
    url: '/system/menu/treeselect',
    method: 'get'
  });
};

// Query the menu dropdown tree structure by role ID
export const roleMenuTreeselect = (roleId: string | number): AxiosPromise<RoleMenuTree> => {
  return request({
    url: '/system/menu/roleMenuTreeselect/' + roleId,
    method: 'get'
  });
};

// Query the menu dropdown tree structure by role ID
export const tenantPackageMenuTreeselect = (packageId: string | number): AxiosPromise<RoleMenuTree> => {
  return request({
    url: '/system/menu/tenantPackageMenuTreeselect/' + packageId,
    method: 'get'
  });
};

// Add Menu
export const addMenu = (data: MenuForm) => {
  return request({
    url: '/system/menu',
    method: 'post',
    data: data
  });
};

// Edit menu
export const updateMenu = (data: MenuForm) => {
  return request({
    url: '/system/menu',
    method: 'put',
    data: data
  });
};

// Delete menu
export const delMenu = (menuId: string | number) => {
  return request({
    url: '/system/menu/' + menuId,
    method: 'delete'
  });
};

// Cascade delete menu
export const cascadeDelMenu = (menuIds: Array<string | number>) => {
  return request({
    url: '/system/menu/cascade/' + menuIds,
    method: 'delete'
  });
};
