import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { TaskQuery, FlowTaskVO, TaskOperationBo } from '@/api/workflow/task/types';

/**
 * Query To-Do List
 * @param query
 * @returns {*}
 */
export const pageByTaskWait = (query: TaskQuery): AxiosPromise<FlowTaskVO[]> => {
  return request({
    url: '/workflow/task/pageByTaskWait',
    method: 'get',
    params: query
  });
};

/**
 * Query completed tasks list
 * @param query
 * @returns {*}
 */
export const pageByTaskFinish = (query: TaskQuery): AxiosPromise<FlowTaskVO[]> => {
  return request({
    url: '/workflow/task/pageByTaskFinish',
    method: 'get',
    params: query
  });
};

/**
 * Query current user's CC list
 * @param query
 * @returns {*}
 */
export const pageByTaskCopy = (query: TaskQuery): AxiosPromise<FlowTaskVO[]> => {
  return request({
    url: '/workflow/task/pageByTaskCopy',
    method: 'get',
    params: query
  });
};

/**
 * All pending tasks of the current tenant
 * @param query
 * @returns {*}
 */
export const pageByAllTaskWait = (query: TaskQuery): AxiosPromise<FlowTaskVO[]> => {
  return request({
    url: '/workflow/task/pageByAllTaskWait',
    method: 'get',
    params: query
  });
};

/**
 * All completed tasks of the current tenant
 * @param query
 * @returns {*}
 */
export const pageByAllTaskFinish = (query: TaskQuery): AxiosPromise<FlowTaskVO[]> => {
  return request({
    url: '/workflow/task/pageByAllTaskFinish',
    method: 'get',
    params: query
  });
};

/**
 * Start process
 * @param data
 * @returns {*}
 */
export const startWorkFlow = (data: object): any => {
  return request({
    url: '/workflow/task/startWorkFlow',
    method: 'post',
    data: data
  });
};

/**
 * Process handling
 * @param data
 * @returns {*}
 */
export const completeTask = (data: object) => {
  return request({
    url: '/workflow/task/completeTask',
    method: 'post',
    data: data
  });
};

/**
 * Task rejection
 * @param data
 * @returns {*}
 */
export const backProcess = (data: any): any => {
  return request({
    url: '/workflow/task/backProcess',
    method: 'post',
    data: data
  });
};

/**
 * Get current task
 * @param taskId
 * @returns
 */
export const getTask = (taskId: string) => {
  return request({
    url: '/workflow/task/getTask/' + taskId,
    method: 'get'
  });
};

/**
 * Modify task assignee
 * @param taskIdList
 * @param userId
 * @returns
 */
export const updateAssignee = (taskIdList: Array<string>, userId: string) => {
  return request({
    url: `/workflow/task/updateAssignee/${userId}`,
    method: 'put',
    data: taskIdList
  });
};

/**
 * Terminate task
 * @returns
 */
export const terminationTask = (data: any) => {
  return request({
    url: `/workflow/task/terminationTask`,
    method: 'post',
    data: data
  });
};

/**
 * Get rejectable task nodes
 * @returns
 */
export const getBackTaskNode = (definitionId: string, nodeCode: string) => {
  return request({
    url: `/workflow/task/getBackTaskNode/${definitionId}/${nodeCode}`,
    method: 'get'
  });
};

/**
 * Task operation; operation type: delegate delegateTask, transfer transferTask, add approver addSignature, remove approver reductionSignature
 * @returns
 */
export const taskOperation = (data: TaskOperationBo, operation: string) => {
  return request({
    url: `/workflow/task/taskOperation/${operation}`,
    method: 'post',
    data: data
  });
};

/**
 * Get current task assignee
 * @param taskId Task ID
 * @returns
 */
export const currentTaskAllUser = (taskId: string | number) => {
  return request({
    url: `/workflow/task/currentTaskAllUser/${taskId}`,
    method: 'get'
  });
};

/**
 * Get next node write
 * @param data Parameter
 * @returns
 */
export const getNextNodeList = (data: any): any => {
  return request({
    url: '/workflow/task/getNextNodeList',
    method: 'post',
    data: data
  });
};
