<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="Role Name" prop="roleName">
              <el-input v-model="queryParams.roleName" placeholder="Please enter role name" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Permission String" prop="roleKey">
              <el-input v-model="queryParams.roleKey" placeholder="Enter permission key" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Status" prop="status">
              <el-select v-model="queryParams.status" placeholder="Role Status" clearable>
                <el-option v-for="dict in sys_normal_disable" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="Created At" style="width: 308px">
              <el-date-picker
                v-model="dateRange"
                value-format="YYYY-MM-DD HH:mm:ss"
                type="daterange"
                range-separator="-"
                start-placeholder="Start Date"
                end-placeholder="End Date"
                :default-time="[new Date(2000, 1, 1, 0, 0, 0), new Date(2000, 1, 1, 23, 59, 59)]"
              ></el-date-picker>
            </el-form-item>

            <el-form-item>
              <el-button type="primary" icon="Search" @click="handleQuery">Search</el-button>
              <el-button icon="Refresh" @click="resetQuery">Reset</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </div>
    </transition>

    <el-card shadow="hover">
      <template #header>
        <el-row :gutter="10">
          <el-col :span="1.5">
            <el-button v-hasPermi="['system:role:add']" type="primary" plain icon="Plus" @click="handleAdd()">Add</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['system:role:edit']" type="success" plain :disabled="single" icon="Edit" @click="handleUpdate()">Edit</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['system:role:delete']" type="danger" plain :disabled="ids.length === 0" @click="handleDelete()">Delete</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['system:role:export']" type="warning" plain icon="Download" @click="handleExport">Export</el-button>
          </el-col>
          <right-toolbar v-model:show-search="showSearch" @query-table="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table ref="roleTableRef" border v-loading="loading" :data="roleList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column v-if="false" label="Role No." prop="roleId" width="120" />
        <el-table-column label="Role Name" prop="roleName" :show-overflow-tooltip="true" width="150" />
        <el-table-column label="Permission String" prop="roleKey" :show-overflow-tooltip="true" width="200" />
        <el-table-column label="Display Order" prop="roleSort" width="100" />
        <el-table-column label="Status" align="center" width="100">
          <template #default="scope">
            <el-switch v-model="scope.row.status" active-value="0" inactive-value="1" @change="handleStatusChange(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="Created At" align="center" prop="createTime">
          <template #default="scope">
            <span>{{ proxy.parseTime(scope.row.createTime) }}</span>
          </template>
        </el-table-column>

        <el-table-column fixed="right" label="Actions" width="180">
          <template #default="scope">
            <el-tooltip v-if="scope.row.roleId !== 1" content="Edit" placement="top">
              <el-button v-hasPermi="['system:role:edit']" link type="primary" icon="Edit" @click="handleUpdate(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip v-if="scope.row.roleId !== 1" content="Delete" placement="top">
              <el-button v-hasPermi="['system:role:remove']" link type="primary" icon="Delete" @click="handleDelete(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip v-if="scope.row.roleId !== 1" content="Data Permission" placement="top">
              <el-button v-hasPermi="['system:role:edit']" link type="primary" icon="CircleCheck" @click="handleDataScope(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip v-if="scope.row.roleId !== 1" content="Assign User" placement="top">
              <el-button v-hasPermi="['system:role:edit']" link type="primary" icon="User" @click="handleAuthUser(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination
        v-if="total > 0"
        v-model:total="total"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        @pagination="getList"
      />
    </el-card>

    <el-dialog v-model="dialog.visible" :title="dialog.title" width="500px" append-to-body>
      <el-form ref="roleFormRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="Role Name" prop="roleName">
          <el-input v-model="form.roleName" placeholder="Please enter role name" />
        </el-form-item>
        <el-form-item prop="roleKey">
          <template #label>
            <span>
              <el-tooltip content="Permission string defined in the controller, e.g.: @SaCheckRole('admin')" placement="top">
                <el-icon><question-filled /></el-icon>
              </el-tooltip>
              Permission String
            </span>
          </template>
          <el-input v-model="form.roleKey" placeholder="Enter permission key" />
        </el-form-item>
        <el-form-item label="Role Order" prop="roleSort">
          <el-input-number v-model="form.roleSort" controls-position="right" :min="0" />
        </el-form-item>
        <el-form-item label="Status">
          <el-radio-group v-model="form.status">
            <el-radio v-for="dict in sys_normal_disable" :key="dict.value" :value="dict.value">{{ dict.label }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="Menu Permissions">
          <el-checkbox v-model="menuExpand" @change="handleCheckedTreeExpand($event, 'menu')">Expand/Collapse</el-checkbox>
          <el-checkbox v-model="menuNodeAll" @change="handleCheckedTreeNodeAll($event, 'menu')">Select All/Deselect All</el-checkbox>
          <el-checkbox v-model="form.menuCheckStrictly" @change="handleCheckedTreeConnect($event, 'menu')">Parent-Child Cascade</el-checkbox>
          <el-tree
            ref="menuRef"
            class="tree-border"
            :data="menuOptions"
            show-checkbox
            node-key="id"
            :check-strictly="!form.menuCheckStrictly"
            empty-text="Loading, please wait"
            :props="{ label: 'label', children: 'children' } as any"
          ></el-tree>
        </el-form-item>
        <el-form-item label="Remark">
          <el-input v-model="form.remark" type="textarea" placeholder="Enter content"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">Confirm</el-button>
          <el-button @click="cancel">Cancel</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- Assign Role Data Permission Dialog -->
    <el-dialog v-model="openDataScope" :title="dialog.title" width="500px" append-to-body>
      <el-form ref="dataScopeRef" :model="form" label-width="80px">
        <el-form-item label="Role Name">
          <el-input v-model="form.roleName" :disabled="true" />
        </el-form-item>
        <el-form-item label="Permission String">
          <el-input v-model="form.roleKey" :disabled="true" />
        </el-form-item>
        <el-form-item label="Permission Scope">
          <el-select v-model="form.dataScope" @change="dataScopeSelectChange">
            <el-option v-for="item in dataScopeOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-show="form.dataScope === '2'" label="Data Permission">
          <el-checkbox v-model="deptExpand" @change="handleCheckedTreeExpand($event, 'dept')">Expand/Collapse</el-checkbox>
          <el-checkbox v-model="deptNodeAll" @change="handleCheckedTreeNodeAll($event, 'dept')">Select All/Deselect All</el-checkbox>
          <el-checkbox v-model="form.deptCheckStrictly" @change="handleCheckedTreeConnect($event, 'dept')">Parent-Child Cascade</el-checkbox>
          <el-tree
            ref="deptRef"
            class="tree-border"
            :data="deptOptions"
            show-checkbox
            default-expand-all
            node-key="id"
            :check-strictly="!form.deptCheckStrictly"
            empty-text="Loading, please wait"
            :props="{ label: 'label', children: 'children' } as any"
          ></el-tree>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitDataScope">Confirm</el-button>
          <el-button @click="cancelDataScope">Cancel</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Role" lang="ts">
import { addRole, changeRoleStatus, dataScope, delRole, getRole, listRole, updateRole, deptTreeSelect } from '@/api/system/role';
import { roleMenuTreeselect, treeselect as menuTreeselect } from '@/api/system/menu/index';
import { RoleVO, RoleForm, RoleQuery, DeptTreeOption } from '@/api/system/role/types';
import { MenuTreeOption, RoleMenuTree } from '@/api/system/menu/types';

const router = useRouter();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { sys_normal_disable } = toRefs<any>(proxy?.useDict('sys_normal_disable'));

const roleList = ref<RoleVO[]>();
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const dateRange = ref<[DateModelType, DateModelType]>(['', '']);
const menuOptions = ref<MenuTreeOption[]>([]);
const menuExpand = ref(false);
const menuNodeAll = ref(false);
const deptExpand = ref(true);
const deptNodeAll = ref(false);
const deptOptions = ref<DeptTreeOption[]>([]);
const openDataScope = ref(false);

/** Data scope options */
const dataScopeOptions = ref([
  { value: '1', label: 'All Data Permissions' },
  { value: '2', label: 'Custom Data Permission' },
  { value: '3', label: 'Department Data permission' },
  { value: '4', label: 'Data permissions for this department and below' },
  { value: '5', label: 'Own Data Only permission' },
  { value: '6', label: 'Data permission for department and below, or self' }
]);

const queryFormRef = ref<ElFormInstance>();
const roleFormRef = ref<ElFormInstance>();
const dataScopeRef = ref<ElFormInstance>();
const menuRef = ref<ElTreeInstance>();
const deptRef = ref<ElTreeInstance>();

const initForm: RoleForm = {
  roleId: undefined,
  roleSort: 1,
  status: '0',
  roleName: '',
  roleKey: '',
  menuCheckStrictly: true,
  deptCheckStrictly: true,
  remark: '',
  dataScope: '1',
  menuIds: [],
  deptIds: []
};

const data = reactive<PageData<RoleForm, RoleQuery>>({
  form: { ...initForm },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    roleName: '',
    roleKey: '',
    status: ''
  },
  rules: {
    roleName: [{ required: true, message: 'Role name cannot be empty', trigger: 'blur' }],
    roleKey: [{ required: true, message: 'Permission string cannot be empty', trigger: 'blur' }],
    roleSort: [{ required: true, message: 'Role order cannot be empty', trigger: 'blur' }]
  }
});
const { form, queryParams, rules } = toRefs(data);

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

/**
 * Query role list
 */
const getList = () => {
  loading.value = true;
  listRole(proxy?.addDateRange(queryParams.value, dateRange.value)).then((res) => {
    roleList.value = res.rows;
    total.value = res.total;
    loading.value = false;
  });
};

/**
 * Search button action
 */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};

/** Reset */
const resetQuery = () => {
  dateRange.value = ['', ''];
  queryFormRef.value?.resetFields();
  handleQuery();
};
/**Delete button action */
const handleDelete = async (row?: RoleVO) => {
  const roleids = row?.roleId || ids.value;
  await proxy?.$modal.confirm('Are you sure you want to delete the role with ID ' + roleids + 'Data Items');
  await delRole(roleids);
  getList();
  proxy?.$modal.msgSuccess('Deleted successfully');
};

/** Export button action */
const handleExport = () => {
  proxy?.download(
    'system/role/export',
    {
      ...queryParams.value
    },
    `role_${new Date().getTime()}.xlsx`
  );
};
/** Checkbox selected data */
const handleSelectionChange = (selection: RoleVO[]) => {
  ids.value = selection.map((item: RoleVO) => item.roleId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** Role status update */
const handleStatusChange = async (row: RoleVO) => {
  const text = row.status === '0' ? 'Enable' : 'Disable';
  try {
    await proxy?.$modal.confirm('Confirm to "' + text + '""' + row.roleName + '" role?');
    await changeRoleStatus(row.roleId, row.status);
    proxy?.$modal.msgSuccess(text + 'Success');
  } catch {
    row.status = row.status === '0' ? '1' : '0';
  }
};

/** Assign Users */
const handleAuthUser = (row: RoleVO) => {
  router.push('/system/role-auth/user/' + row.roleId);
};

/** Query menu tree structure */
const getMenuTreeselect = async () => {
  const res = await menuTreeselect();
  menuOptions.value = res.data;
};
/** All department node data */
const getDeptAllCheckedKeys = (): any => {
  // Currently selected department node
  const checkedKeys = deptRef.value?.getCheckedKeys();
  // Indeterminate department node
  const halfCheckedKeys = deptRef.value?.getHalfCheckedKeys();
  if (halfCheckedKeys) {
    checkedKeys?.unshift(...halfCheckedKeys);
  }
  return checkedKeys;
};
/** Reset the add form and other data */
const reset = () => {
  menuRef.value?.setCheckedKeys([]);
  menuExpand.value = false;
  menuNodeAll.value = false;
  deptExpand.value = true;
  deptNodeAll.value = false;
  form.value = { ...initForm };
  roleFormRef.value?.resetFields();
};

/** Add role */
const handleAdd = () => {
  reset();
  getMenuTreeselect();
  dialog.visible = true;
  dialog.title = 'Add Role';
};
/** Edit role */
const handleUpdate = async (row?: RoleVO) => {
  reset();
  const roleId = row?.roleId || ids.value[0];
  const { data } = await getRole(roleId);
  Object.assign(form.value, data);
  form.value.roleSort = Number(form.value.roleSort);
  const res = await getRoleMenuTreeselect(roleId);
  dialog.title = 'Edit Role';
  dialog.visible = true;
  res.checkedKeys.forEach((v) => {
    nextTick(() => {
      menuRef.value?.setChecked(v, true, false);
    });
  });
};
/** Query menu tree structure by role ID */
const getRoleMenuTreeselect = (roleId: string | number) => {
  return roleMenuTreeselect(roleId).then((res): RoleMenuTree => {
    menuOptions.value = res.data.menus;
    return res.data;
  });
};
/** Query department tree structure by role ID */
const getRoleDeptTreeSelect = async (roleId: string | number) => {
  const res = await deptTreeSelect(roleId);
  deptOptions.value = res.data.depts;
  return res.data;
};
/** Tree permission (expand/collapse) */
const handleCheckedTreeExpand = (value: boolean, type: string) => {
  if (type == 'menu') {
    const treeList = menuOptions.value;
    for (let i = 0; i < treeList.length; i++) {
      if (menuRef.value) {
        menuRef.value.store.nodesMap[treeList[i].id].expanded = value;
      }
    }
  } else if (type == 'dept') {
    const treeList = deptOptions.value;
    for (let i = 0; i < treeList.length; i++) {
      if (deptRef.value) {
        deptRef.value.store.nodesMap[treeList[i].id].expanded = value;
      }
    }
  }
};
/** Tree permission (select all/deselect all) */
const handleCheckedTreeNodeAll = (value: any, type: string) => {
  if (type == 'menu') {
    menuRef.value?.setCheckedNodes(value ? (menuOptions.value as any) : []);
  } else if (type == 'dept') {
    deptRef.value?.setCheckedNodes(value ? (deptOptions.value as any) : []);
  }
};
/** Tree permission (parent-child linkage) */
const handleCheckedTreeConnect = (value: any, type: string) => {
  if (type == 'menu') {
    form.value.menuCheckStrictly = value;
  } else if (type == 'dept') {
    form.value.deptCheckStrictly = value;
  }
};
/** All menu node data */
const getMenuAllCheckedKeys = (): any => {
  // Currently selected menu node
  const checkedKeys = menuRef.value?.getCheckedKeys();
  // Half-checked menu node
  const halfCheckedKeys = menuRef.value?.getHalfCheckedKeys();
  if (halfCheckedKeys) {
    checkedKeys?.unshift(...halfCheckedKeys);
  }
  return checkedKeys;
};
/** Submit button */
const submitForm = () => {
  roleFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      form.value.menuIds = getMenuAllCheckedKeys();
      form.value.roleId ? await updateRole(form.value) : await addRole(form.value);
      proxy?.$modal.msgSuccess('Operation successful');
      dialog.visible = false;
      getList();
    }
  });
};
/** Cancel button */
const cancel = () => {
  reset();
  dialog.visible = false;
};
/** Triggered when selecting role permission scope */
const dataScopeSelectChange = (value: string) => {
  if (value !== '2') {
    deptRef.value?.setCheckedKeys([]);
  }
};
/** Assign data permission action */
const handleDataScope = async (row: RoleVO) => {
  const response = await getRole(row.roleId);
  Object.assign(form.value, response.data);
  const res = await getRoleDeptTreeSelect(row.roleId);
  openDataScope.value = true;
  dialog.title = 'Assign Data Permissions';
  await nextTick(() => {
    deptRef.value?.setCheckedKeys(res.checkedKeys);
  });
};
/** Submit button (data permission) */
const submitDataScope = async () => {
  if (form.value.roleId) {
    form.value.deptIds = getDeptAllCheckedKeys();
    await dataScope(form.value);
    proxy?.$modal.msgSuccess('Updated successfully');
    openDataScope.value = false;
    getList();
  }
};
/** Cancel button (data permission) */
const cancelDataScope = () => {
  dataScopeRef.value?.resetFields();
  form.value = { ...initForm };
  openDataScope.value = false;
};

onMounted(() => {
  getList();
});
</script>
