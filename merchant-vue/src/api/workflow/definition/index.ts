import request from '@/utils/request';
import { FlowDefinitionQuery, definitionXmlVO, FlowDefinitionForm, FlowDefinitionVo } from '@/api/workflow/definition/types';
import { AxiosPromise } from 'axios';

/**
 * Get process definition list
 * @param query Process instance id
 * @returns
 */
export const listDefinition = (query: FlowDefinitionQuery): AxiosPromise<FlowDefinitionVo[]> => {
  return request({
    url: `/workflow/definition/list`,
    method: 'get',
    params: query
  });
};

/**
 * Query Unpublished Process Definition List
 * @param query Process instance id
 * @returns
 */
export const unPublishList = (query: FlowDefinitionQuery): AxiosPromise<FlowDefinitionVo[]> => {
  return request({
    url: `/workflow/definition/unPublishList`,
    method: 'get',
    params: query
  });
};

/**
 * Get XML by process definition id
 * @param definitionId Process definition ID
 * @returns
 */
export const definitionXml = (definitionId: string): AxiosPromise<definitionXmlVO> => {
  return request({
    url: `/workflow/definition/definitionXml/${definitionId}`,
    method: 'get'
  });
};

/**
 * Delete Process Definition
 * @param id Process definition ID
 * @returns
 */
export const deleteDefinition = (id: string | string[]) => {
  return request({
    url: `/workflow/definition/${id}`,
    method: 'delete'
  });
};

/**
 * Suspend/Activate
 * @param definitionId Process definition ID
 * @param activityStatus Status
 * @returns
 */
export const active = (definitionId: string, activityStatus: boolean) => {
  return request({
    url: `/workflow/definition/active/${definitionId}`,
    method: 'put',
    params: {
      active: activityStatus
    }
  });
};

/**
 * Deploy process definition via zip or xml
 * @returns
 */
export function importDef(data: any) {
  return request({
    url: '/workflow/definition/importDef',
    method: 'post',
    data: data,
    headers: {
      repeatSubmit: false
    }
  });
}

/**
 * Publish process definition
 * @param id Process definition ID
 * @returns
 */
export const publish = (id: string) => {
  return request({
    url: `/workflow/definition/publish/${id}`,
    method: 'put'
  });
};

/**
 * Unpublish Process Definition
 * @param id Process definition ID
 * @returns
 */
export const unPublish = (id: string) => {
  return request({
    url: `/workflow/definition/unPublish/${id}`,
    method: 'put'
  });
};

/**
 * Get process definition XML string
 * @param id Process definition ID
 * @returns
 */
export const xmlString = (id: string) => {
  return request({
    url: `/workflow/definition/xmlString/${id}`,
    method: 'get'
  });
};

/**
 * Add
 * @param data Parameter
 * @returns
 */
export const add = (data: FlowDefinitionForm) => {
  return request({
    url: `/workflow/definition`,
    method: 'post',
    data: data
  });
};

/**
 * Edit
 * @param data Parameter
 * @returns
 */
export const edit = (data: FlowDefinitionForm) => {
  return request({
    url: `/workflow/definition`,
    method: 'put',
    data: data
  });
};

/**
 * Query Details
 * @param id Parameter
 * @returns
 */
export const getInfo = (id: number | string) => {
  return request({
    url: `/workflow/definition/${id}`,
    method: 'get'
  });
};

/**
 * Copy process definition
 * @param id Process definition ID
 * @returns
 */
export const copy = (id: string) => {
  return request({
    url: `/workflow/definition/copy/${id}`,
    method: 'post'
  });
};
