import request from '@/utils/request';
import { PostForm, PostQuery, PostVO } from './types';
import { AxiosPromise } from 'axios';

// Query post list
export function listPost(query: PostQuery): AxiosPromise<PostVO[]> {
  return request({
    url: '/system/post/list',
    method: 'get',
    params: query
  });
}

// Query post details
export function getPost(postId: string | number): AxiosPromise<PostVO> {
  return request({
    url: '/system/post/' + postId,
    method: 'get'
  });
}

// Get post selection list
export function optionselect(deptId?: number | string, postIds?: (number | string)[]): AxiosPromise<PostVO[]> {
  return request({
    url: '/system/post/optionselect',
    method: 'get',
    params: {
      postIds: postIds,
      deptId: deptId
    }
  });
}

// Add post
export function addPost(data: PostForm) {
  return request({
    url: '/system/post',
    method: 'post',
    data: data
  });
}

// Edit post
export function updatePost(data: PostForm) {
  return request({
    url: '/system/post',
    method: 'put',
    data: data
  });
}

// Delete post
export function delPost(postId: string | number | (string | number)[]) {
  return request({
    url: '/system/post/' + postId,
    method: 'delete'
  });
}
