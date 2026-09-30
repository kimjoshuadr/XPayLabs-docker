<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="search">
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
      </div>
    </transition>
    <el-card shadow="never">
      <template #header>
        <el-row :gutter="10">
          <el-col :span="1.5">
            <el-button v-hasPermi="['system:role:add']" type="primary" plain icon="Plus" @click="openSelectUser">Add User</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['system:role:remove']" type="danger" plain icon="CircleClose" :disabled="multiple" @click="cancelAuthUserAll">
              Batch Revoke Authorization
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Close" @click="handleClose">Close</el-button>
          </el-col>
          <right-toolbar v-model:show-search="showSearch" :search="true" @query-table="getList"></right-toolbar>
        </el-row>
      </template>
      <el-table v-loading="loading" border :data="userList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
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
            <span>{{ scope.row.createTime }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Actions" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="Revoke Authorization" placement="top">
              <el-button v-hasPermi="['system:role:remove']" link type="primary" icon="CircleClose" @click="cancelAuthUser(scope.row)"> </el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" :total="total" @pagination="getList" />
      <select-user ref="selectRef" :role-id="queryParams.roleId" @ok="handleQuery" />
    </el-card>
  </div>
</template>

<script setup name="AuthUser" lang="ts">
import { allocatedUserList, authUserCancel, authUserCancelAll } from '@/api/system/role';
import { UserQuery } from '@/api/system/user/types';
import { UserVO } from '@/api/system/user/types';
import SelectUser from './selectUser.vue';
import { RouteLocationNormalized } from 'vue-router';

const route = useRoute();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { sys_normal_disable } = toRefs<any>(proxy?.useDict('sys_normal_disable'));

const userList = ref<UserVO[]>([]);
const loading = ref(true);
const showSearch = ref(true);
const multiple = ref(true);
const total = ref(0);
const userIds = ref<Array<string | number>>([]);

const queryFormRef = ref<ElFormInstance>();
const selectRef = ref<InstanceType<typeof SelectUser>>();

const queryParams = reactive<UserQuery>({
  pageNum: 1,
  pageSize: 10,
  roleId: route.params.roleId as string,
  userName: undefined,
  phonenumber: undefined
});

/** Query authorized user list */
const getList = async () => {
  loading.value = true;
  const res = await allocatedUserList(queryParams);
  userList.value = res.rows;
  total.value = res.total;
  loading.value = false;
};
// Back button
const handleClose = () => {
  const obj: RouteLocationNormalized = {
    path: '/system/role',
    fullPath: '',
    hash: '',
    matched: [],
    meta: undefined,
    name: undefined,
    params: undefined,
    query: undefined,
    redirectedFrom: undefined
  };
  proxy?.$tab.closeOpenPage(obj);
};
/** Search button action */
const handleQuery = () => {
  queryParams.pageNum = 1;
  getList();
};
/** Reset button action */
const resetQuery = () => {
  queryFormRef.value?.resetFields();
  handleQuery();
};
// Checkbox selected data
const handleSelectionChange = (selection: UserVO[]) => {
  userIds.value = selection.map((item) => item.userId);
  multiple.value = !selection.length;
};
/** Open authorized users dialog */
const openSelectUser = () => {
  selectRef.value?.show();
};
/** Cancel authorization button action */
const cancelAuthUser = async (row: UserVO) => {
  await proxy?.$modal.confirm('Confirm to cancel this user "' + row.userName + '" role?');
  await authUserCancel({ userId: row.userId, roleId: queryParams.roleId });
  await getList();
  proxy?.$modal.msgSuccess('Authorization cancelled successfully');
};
/** Bulk cancel authorization button action */
const cancelAuthUserAll = async () => {
  const roleId = queryParams.roleId;
  const uIds = userIds.value.join(',');
  await proxy?.$modal.confirm('Deselect the user\'s authorized data items?');
  await authUserCancelAll({ roleId: roleId, userIds: uIds });
  await getList();
  proxy?.$modal.msgSuccess('Authorization cancelled successfully');
};

onMounted(() => {
  getList();
});
</script>
