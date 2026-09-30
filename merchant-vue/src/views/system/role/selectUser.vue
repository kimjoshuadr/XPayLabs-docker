<template>
  <el-row>
    <el-dialog v-model="visible" title="Select User" width="800px" top="5vh" append-to-body>
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        <el-form-item label="Username" prop="userName">
          <el-input v-model="queryParams.userName" placeholder="Please enter username" clearable @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="Mobile Number" prop="phonenumber">
          <el-input v-model="queryParams.phonenumber" placeholder="Please enter phone number" clearable @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleQuery">Search</el-button>
          <el-button icon="Refresh" @click="resetQuery">Reset</el-button>
        </el-form-item>
      </el-form>
      <el-row>
        <el-table ref="tableRef" border :data="userList" height="260px" @row-click="clickRow" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="55"></el-table-column>
          <el-table-column label="Username" prop="userName" :show-overflow-tooltip="true" />
          <el-table-column label="Nickname" prop="nickName" :show-overflow-tooltip="true" />
          <el-table-column label="Email" prop="email" :show-overflow-tooltip="true" />
          <el-table-column label="Mobile" prop="phonenumber" :show-overflow-tooltip="true" />
          <el-table-column label="Status" align="center" prop="status">
            <template #default="scope">
              <dict-tag :options="sys_normal_disable" :value="scope.row.status" />
            </template>
          </el-table-column>
          <el-table-column label="Created At" align="center" prop="createTime" width="180">
            <template #default="scope">
              <span>{{ proxy.parseTime(scope.row.createTime) }}</span>
            </template>
          </el-table-column>
        </el-table>
        <pagination v-if="total > 0" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" :total="total" @pagination="getList" />
      </el-row>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="handleSelectUser">Confirm</el-button>
          <el-button @click="visible = false">Cancel</el-button>
        </div>
      </template>
    </el-dialog>
  </el-row>
</template>

<script setup name="SelectUser" lang="ts">
import { authUserSelectAll, unallocatedUserList } from '@/api/system/role';
import { UserVO } from '@/api/system/user/types';
import { UserQuery } from '@/api/system/user/types';

const props = defineProps({
  roleId: {
    type: [Number, String],
    required: true
  }
});

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { sys_normal_disable } = toRefs<any>(proxy?.useDict('sys_normal_disable'));

const userList = ref<UserVO[]>([]);
const visible = ref(false);
const total = ref(0);
const userIds = ref<Array<string | number>>([]);

const queryParams = reactive<UserQuery>({
  pageNum: 1,
  pageSize: 10,
  roleId: undefined,
  userName: undefined,
  phonenumber: undefined
});

const tableRef = ref<ElTableInstance>();
const queryFormRef = ref<ElFormInstance>();

const show = () => {
  queryParams.roleId = props.roleId;
  getList();
  visible.value = true;
};

/**
 * Select row
 */
const clickRow = (row: any) => {
  // Element UI bug
  tableRef.value?.toggleRowSelection(row, false);
};
/** Checkbox selected data */
const handleSelectionChange = (selection: UserVO[]) => {
  userIds.value = selection.map((item: UserVO) => item.userId);
};

/** Query data */
const getList = async () => {
  const res = await unallocatedUserList(queryParams);
  userList.value = res.rows;
  total.value = res.total;
};
/** Search button action */
const handleQuery = () => {
  queryParams.pageNum = 1;
  getList();
};
/** Reset button action */
const resetQuery = () => {
  queryFormRef.value?.resetFields();
  getList();
};

const emit = defineEmits(['ok']);
/** Select authorized user action */
const handleSelectUser = async () => {
  const roleId = queryParams.roleId;
  const ids = userIds.value.join(',');
  if (ids == '') {
    proxy?.$modal.msgError('Select the user to assign');
    return;
  }
  await authUserSelectAll({ roleId, userIds: ids });
  proxy?.$modal.msgSuccess('Assigned successfully');
  emit('ok');
  visible.value = false;
};
// Expose
defineExpose({
  show
});
</script>
