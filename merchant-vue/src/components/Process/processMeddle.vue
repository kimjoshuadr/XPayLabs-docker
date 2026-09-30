<template>
  <el-dialog v-model="visible" draggable title="Process Intervention" :width="props.width" :height="props.height" :close-on-click-modal="false">
    <el-descriptions v-loading="loading" class="margin-top" :title="`${task.flowName}(${task.flowCode})`" :column="2" border>
      <el-descriptions-item label="Task Name">{{ task.nodeName }}</el-descriptions-item>
      <el-descriptions-item label="Node Code">{{ task.nodeCode }}</el-descriptions-item>
      <el-descriptions-item label="Start Time">{{ task.createTime }}</el-descriptions-item>
      <el-descriptions-item label="Process Instance ID">{{ task.instanceId }}</el-descriptions-item>
      <el-descriptions-item label="Version">{{ task.version }}.0</el-descriptions-item>
      <el-descriptions-item label="Business ID">{{ task.businessId }}</el-descriptions-item>
    </el-descriptions>
    <template #footer>
      <span class="dialog-footer">
        <el-button v-if="task.flowStatus === 'waiting'" :disabled="buttonDisabled" type="primary" @click="openTransferTask"> Transfer </el-button>
        <el-button
          v-if="task.flowStatus === 'waiting' && Number(task.nodeRatio) > 0"
          :disabled="buttonDisabled"
          type="primary"
          @click="openMultiInstanceUser"
        >
          Add Approver
        </el-button>
        <el-button
          v-if="task.flowStatus === 'waiting' && Number(task.nodeRatio) > 0"
          :disabled="buttonDisabled"
          type="primary"
          @click="handleTaskUser"
        >
          Remove Signer
        </el-button>
        <el-button v-if="task.flowStatus === 'waiting'" :disabled="buttonDisabled" type="danger" @click="handleTerminationTask"> Terminate </el-button>
      </span>
    </template>
    <!-- Transfer -->
    <UserSelect ref="transferTaskRef" :multiple="false" @confirm-call-back="handleTransferTask"></UserSelect>
    <!-- Signature Component -->
    <UserSelect ref="multiInstanceUserRef" :multiple="true" @confirm-call-back="addMultiInstanceUser"></UserSelect>
    <el-dialog v-model="deleteSignatureVisible" draggable title="Remove Approvers" width="700px" height="400px" append-to-body :close-on-click-modal="false"
      ><div>
        <el-table :data="deleteUserList" border>
          <el-table-column prop="nodeName" label="Task Name" />
          <el-table-column prop="nickName" label="Assignee" />
          <el-table-column label="Actions" align="center" width="160">
            <template #default="scope">
              <el-button type="danger" size="small" icon="Delete" @click="deleteMultiInstanceUser(scope.row)">Delete</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-dialog>
  </el-dialog>
</template>
<script setup lang="ts">
import { propTypes } from '@/utils/propTypes';
import { FlowTaskVO, TaskOperationBo } from '@/api/workflow/task/types';
import UserSelect from '@/components/UserSelect';
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
import { getTask, taskOperation, currentTaskAllUser, terminationTask } from '@/api/workflow/task';
const props = defineProps({
  width: propTypes.string.def('50%'),
  height: propTypes.string.def('100%')
});
const emits = defineEmits(['submitCallback']);
const transferTaskRef = ref<InstanceType<typeof UserSelect>>();
const multiInstanceUserRef = ref<InstanceType<typeof UserSelect>>();
// Mask layer
const loading = ref(true);
//Button
const buttonDisabled = ref(true);
const visible = ref(false);
// Remove-signer dialog
const deleteSignatureVisible = ref(false);
// Personnel eligible for sign-off removal
const deleteUserList = ref<any>([]);
//Task
const task = ref<FlowTaskVO>({
  id: undefined,
  createTime: undefined,
  updateTime: undefined,
  tenantId: undefined,
  definitionId: undefined,
  instanceId: undefined,
  flowName: undefined,
  businessId: undefined,
  nodeCode: undefined,
  nodeName: undefined,
  flowCode: undefined,
  flowStatus: undefined,
  formCustom: undefined,
  formPath: undefined,
  nodeType: undefined,
  nodeRatio: undefined,
  version: undefined,
  applyNode: undefined,
  buttonList: []
});

const open = (taskId: string) => {
  visible.value = true;
  getTask(taskId).then((response) => {
    loading.value = false;
    buttonDisabled.value = false;
    task.value = response.data;
  });
};

//Open reassign
const openTransferTask = () => {
  transferTaskRef.value.open();
};
//Reassign
const handleTransferTask = async (data) => {
  if (data && data.length > 0) {
    const taskOperationBo = reactive<TaskOperationBo>({
      userId: data[0].userId,
      taskId: task.value.id,
      message: ''
    });
    await proxy?.$modal.confirm('Confirm submit?');
    loading.value = true;
    buttonDisabled.value = true;
    await taskOperation(taskOperationBo, 'transferTask').finally(() => {
      loading.value = false;
      buttonDisabled.value = false;
    });
    visible.value = false;
    emits('submitCallback');
    proxy?.$modal.msgSuccess('Operation successful');
  } else {
    proxy?.$modal.msgWarning('Please select a user!');
  }
};
// Add approver
const openMultiInstanceUser = async () => {
  multiInstanceUserRef.value.open();
};
// Add approver
const addMultiInstanceUser = async (data) => {
  if (data && data.length > 0) {
    const taskOperationBo = reactive<TaskOperationBo>({
      userIds: data.map((e) => e.userId),
      taskId: task.value.id,
      message: ''
    });
    await proxy?.$modal.confirm('Confirm submit?');
    loading.value = true;
    buttonDisabled.value = true;
    await taskOperation(taskOperationBo, 'addSignature').finally(() => {
      loading.value = false;
      buttonDisabled.value = false;
    });
    visible.value = false;
    emits('submitCallback');
    proxy?.$modal.msgSuccess('Operation successful');
  } else {
    proxy?.$modal.msgWarning('Please select a user!');
  }
};
// Remove approver
const deleteMultiInstanceUser = async (row) => {
  await proxy?.$modal.confirm('Confirm submit?');
  loading.value = true;
  buttonDisabled.value = true;
  const taskOperationBo = reactive<TaskOperationBo>({
    userIds: [row.userId],
    taskId: task.value.id,
    message: ''
  });
  await taskOperation(taskOperationBo, 'reductionSignature').finally(() => {
    loading.value = false;
    buttonDisabled.value = false;
  });
  visible.value = false;
  emits('submitCallback');
  proxy?.$modal.msgSuccess('Operation successful');
};
//Get assignee
const handleTaskUser = async () => {
  const data = await currentTaskAllUser(task.value.id);
  deleteUserList.value = data.data;
  if (deleteUserList.value && deleteUserList.value.length > 0) {
    deleteUserList.value.forEach((e) => {
      e.nodeName = task.value.nodeName;
    });
  }
  deleteSignatureVisible.value = true;
};

//Terminate task
const handleTerminationTask = async () => {
  const params = {
    taskId: task.value.id,
    comment: ''
  };
  await proxy?.$modal.confirm('Are you sure you want to terminate?');
  loading.value = true;
  buttonDisabled.value = true;
  await terminationTask(params).finally(() => {
    loading.value = false;
    buttonDisabled.value = false;
  });
  visible.value = false;
  emits('submitCallback');
  proxy?.$modal.msgSuccess('Operation successful');
};
/**
 * Expose Child Component Methods
 */
defineExpose({
  open
});
</script>
