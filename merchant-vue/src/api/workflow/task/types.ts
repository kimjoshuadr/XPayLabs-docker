export interface TaskQuery extends PageQuery {
  nodeName?: string;
  flowCode?: string;
  flowName?: string;
  createByIds?: string[] | number[];
}

export interface ParticipantVo {
  groupIds?: string[] | number[];
  candidate: string[] | number[];
  candidateName: string[];
  claim: boolean;
}
export interface FlowTaskVO {
  id: string | number;
  createTime?: Date;
  updateTime?: Date;
  tenantId?: string;
  definitionId?: string;
  instanceId: string;
  flowName: string;
  businessId: string;
  nodeCode: string;
  nodeName: string;
  flowCode: string;
  flowStatus: string;
  formCustom: string;
  formPath: string;
  nodeType: number;
  nodeRatio: string | number;
  version?: string;
  applyNode?: boolean;
  buttonList?: buttonList[];
}

export interface buttonList {
  code: string;
  show: boolean;
}
export interface VariableVo {
  key: string;
  value: string;
}

export interface TaskOperationBo {
  // User ID of the delegate/transfer assignee (required, for delegate/transfer operations)
  userId?: string;
  // User ID list of add-signer/remove-signer (required, for add-signer/remove-signer operations)
  userIds?: string[];
  // Task ID (required)
  taskId: string | number;
  //Opinion or remark (optional)
  message?: string;
}
