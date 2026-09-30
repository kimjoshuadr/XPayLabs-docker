<template>
  <div class="container">
    <el-dialog v-model="visible" draggable title="Approval Records" :width="props.width" :height="props.height" :close-on-click-modal="false">
      <el-tabs v-model="tabActiveName" class="demo-tabs">
        <el-tab-pane v-loading="loading" label="Flowchart" name="image" style="height: 68vh">
          <flowChart :ins-id="insId" v-if="insId" />
        </el-tab-pane>
        <el-tab-pane v-loading="loading" label="Approval Info" name="info">
          <div>
            <el-table :data="historyList" style="width: 100%" border fit>
              <el-table-column type="index" label="No." align="center" width="60"></el-table-column>
              <el-table-column prop="nodeName" label="Task Name" sortable align="center"></el-table-column>
              <el-table-column prop="approveName" :show-overflow-tooltip="true" label="Assignee" sortable align="center">
                <template #default="scope">
                  <template v-if="scope.row.approveName">
                    <el-tag v-for="(item, index) in scope.row.approveName.split(',')" :key="index" type="success">{{ item }}</el-tag>
                  </template>
                  <template v-else> <el-tag type="success">None</el-tag></template>
                </template>
              </el-table-column>
              <el-table-column prop="flowStatus" label="Status" width="80" sortable align="center">
                <template #default="scope">
                  <dict-tag :options="wf_task_status" :value="scope.row.flowStatus"></dict-tag>
                </template>
              </el-table-column>
              <el-table-column prop="message" label="Approval Comment" :show-overflow-tooltip="true" sortable align="center"></el-table-column>
              <el-table-column prop="createTime" label="Start Time" width="160" :show-overflow-tooltip="true" sortable align="center"></el-table-column>
              <el-table-column prop="updateTime" label="End Time" width="160" :show-overflow-tooltip="true" sortable align="center"></el-table-column>
              <el-table-column
                prop="runDuration"
                label="Runtime Duration"
                width="140"
                :show-overflow-tooltip="true"
                sortable
                align="center"
              ></el-table-column>
              <el-table-column prop="attachmentList" width="120" label="Attachment" align="center">
                <template #default="scope">
                  <el-popover v-if="scope.row.attachmentList && scope.row.attachmentList.length > 0" placement="right" :width="310" trigger="click">
                    <template #reference>
                      <el-button type="primary" style="margin-right: 16px">Attachment</el-button>
                    </template>
                    <el-table border :data="scope.row.attachmentList">
                      <el-table-column prop="originalName" width="202" :show-overflow-tooltip="true" label="Attachment Name"></el-table-column>
                      <el-table-column prop="name" width="80" align="center" :show-overflow-tooltip="true" label="Actions">
                        <template #default="tool">
                          <el-button type="text" @click="handleDownload(tool.row.ossId)">Download</el-button>
                        </template>
                      </el-table-column>
                    </el-table>
                  </el-popover>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-dialog>
  </div>
</template>
<script setup lang="ts">
import { flowHisTaskList } from '@/api/workflow/instance';
import { propTypes } from '@/utils/propTypes';
import { listByIds } from '@/api/system/oss';
import FlowChart from '@/components/Process/flowChart.vue';
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { wf_task_status } = toRefs<any>(proxy?.useDict('wf_task_status'));
const props = defineProps({
  width: propTypes.string.def('80%'),
  height: propTypes.string.def('100%')
});
const loading = ref(false);
const visible = ref(false);
const historyList = ref<Array<any>>([]);
const tabActiveName = ref('image');
const insId = ref(null);

// Initialize query approval records
const init = async (businessId: string | number) => {
  visible.value = true;
  loading.value = true;
  tabActiveName.value = 'image';
  historyList.value = [];
  flowHisTaskList(businessId).then((resp) => {
    if (resp.data) {
      historyList.value = resp.data.list;
      insId.value = resp.data.instanceId;
      if (historyList.value.length > 0) {
        historyList.value.forEach((item) => {
          if (item.ext) {
            getIds(item.ext).then((res) => {
              item.attachmentList = res.data;
            });
          } else {
            item.attachmentList = [];
          }
        });
      }
      loading.value = false;
    }
  });
};
const getIds = async (ids: string | number) => {
  const res = await listByIds(ids);
  return res;
};

/** Download button action */
const handleDownload = (ossId: string) => {
  proxy?.$download.oss(ossId);
};

/**
 * Expose Child Component Methods
 */
defineExpose({
  init
});
</script>
<style lang="scss" scoped>
.container {
  :deep(.el-dialog .el-dialog__body) {
    max-height: calc(100vh - 170px) !important;
    min-height: calc(100vh - 170px) !important;
  }
}
</style>
