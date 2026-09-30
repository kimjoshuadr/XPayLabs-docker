<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="Plan Name" prop="packageName">
              <el-input v-model="queryParams.packageName" placeholder="Please enter package name" clearable @keyup.enter="handleQuery" />
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
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button v-hasPermi="['system:tenantPackage:add']" type="primary" plain icon="Plus" @click="handleAdd"> Add </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['system:tenantPackage:edit']" type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()">
              Edit
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['system:tenantPackage:remove']" type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()">
              Delete
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['system:tenantPackage:export']" type="warning" plain icon="Download" @click="handleExport">Export </el-button>
          </el-col>
          <right-toolbar v-model:show-search="showSearch" @query-table="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" border :data="tenantPackageList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column v-if="false" label="Tenant Plan ID" align="center" prop="packageId" />
        <el-table-column label="Plan Name" align="center" prop="packageName" />
        <el-table-column label="Remark" align="center" prop="remark" />
        <el-table-column label="Status" align="center" prop="status">
          <template #default="scope">
            <el-switch v-model="scope.row.status" active-value="0" inactive-value="1" @click="handleStatusChange(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="Actions" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="Edit" placement="top">
              <el-button v-hasPermi="['system:tenantPackage:edit']" link type="primary" icon="Edit" @click="handleUpdate(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip content="Delete" placement="top">
              <el-button v-hasPermi="['system:tenantPackage:remove']" link type="primary" icon="Delete" @click="handleDelete(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" :total="total" @pagination="getList" />
    </el-card>

    <!-- Add or Edit Tenant Package Dialog -->
    <el-dialog v-model="dialog.visible" :title="dialog.title" width="500px" append-to-body>
      <el-form ref="tenantPackageFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="Plan Name" prop="packageName">
          <el-input v-model="form.packageName" placeholder="Please enter package name" />
        </el-form-item>
        <el-form-item label="Linked Menu">
          <el-checkbox v-model="menuExpand" @change="handleCheckedTreeExpand($event, 'menu')">Expand/Collapse</el-checkbox>
          <el-checkbox v-model="menuNodeAll" @change="handleCheckedTreeNodeAll($event, 'menu')">Select All/Deselect All </el-checkbox>
          <el-checkbox v-model="form.menuCheckStrictly" @change="handleCheckedTreeConnect($event, 'menu')">Parent-Child Cascade </el-checkbox>
          <el-tree
            ref="menuTreeRef"
            class="tree-border"
            :data="menuOptions"
            show-checkbox
            node-key="id"
            :check-strictly="!form.menuCheckStrictly"
            empty-text="Loading, please wait"
            :props="{ label: 'label', children: 'children' } as any"
          ></el-tree>
        </el-form-item>
        <el-form-item label="Remark" prop="remark">
          <el-input v-model="form.remark" placeholder="Please enter remark" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button :loading="buttonLoading" type="primary" @click="submitForm">Confirm</el-button>
          <el-button @click="cancel">Cancel</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="TenantPackage" lang="ts">
import {
  listTenantPackage,
  getTenantPackage,
  delTenantPackage,
  addTenantPackage,
  updateTenantPackage,
  changePackageStatus
} from '@/api/system/tenantPackage';
import { treeselect as menuTreeselect, tenantPackageMenuTreeselect } from '@/api/system/menu';
import { TenantPkgForm, TenantPkgQuery, TenantPkgVO } from '@/api/system/tenantPackage/types';
import { MenuTreeOption } from '@/api/system/menu/types';
import to from 'await-to-js';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const tenantPackageList = ref<TenantPkgVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const menuExpand = ref(false);
const menuNodeAll = ref(false);
const menuOptions = ref<MenuTreeOption[]>([]);

const menuTreeRef = ref<ElTreeInstance>();
const queryFormRef = ref<ElFormInstance>();
const tenantPackageFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: TenantPkgForm = {
  packageId: undefined,
  packageName: '',
  menuIds: '',
  remark: '',
  menuCheckStrictly: true
};
const data = reactive<PageData<TenantPkgForm, TenantPkgQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    packageName: ''
  },
  rules: {
    packageId: [{ required: true, message: 'Tenant plan ID cannot be empty', trigger: 'blur' }],
    packageName: [{ required: true, message: 'Plan name cannot be empty', trigger: 'blur' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** Query menu tree structure */
const getMenuTreeselect = async () => {
  const { data } = await menuTreeselect();
  menuOptions.value = data;
};

// All menu node data
const getMenuAllCheckedKeys = (): any => {
  // Currently selected menu node
  const checkedKeys = menuTreeRef.value?.getCheckedKeys();
  // Half-checked menu node
  const halfCheckedKeys = menuTreeRef.value?.getHalfCheckedKeys();
  if (halfCheckedKeys) {
    checkedKeys?.unshift(...halfCheckedKeys);
  }
  return checkedKeys;
};

/** Query menu tree structure by tenant package ID */
const getPackageMenuTreeselect = async (packageId: string | number) => {
  const res = await tenantPackageMenuTreeselect(packageId);
  menuOptions.value = res.data.menus;
  return Promise.resolve(res);
};

/** Query tenant package list */
const getList = async () => {
  loading.value = true;
  const res = await listTenantPackage(queryParams.value);
  tenantPackageList.value = res.rows;
  total.value = res.total;
  loading.value = false;
};

// Tenant package status modification
const handleStatusChange = async (row: TenantPkgVO) => {
  const text = row.status === '0' ? 'Enable' : 'Disable';
  const [err] = await to(proxy?.$modal.confirm('Confirm to "' + text + '""' + row.packageName + '"Plan?') as Promise<any>);
  if (err) {
    row.status = row.status === '0' ? '1' : '0';
  } else {
    await changePackageStatus(row.packageId, row.status);
    proxy?.$modal.msgSuccess(text + 'Success');
  }
};

// Cancel button
const cancel = () => {
  reset();
  dialog.visible = false;
};

// Reset form
const reset = () => {
  menuTreeRef.value?.setCheckedKeys([]);
  menuExpand.value = false;
  menuNodeAll.value = false;
  form.value = { ...initFormData };
  tenantPackageFormRef.value?.resetFields();
};

/** Search button action */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};

/** Reset button action */
const resetQuery = () => {
  queryFormRef.value?.resetFields();
  handleQuery();
};

// Checkbox selected data
const handleSelectionChange = (selection: TenantPkgVO[]) => {
  ids.value = selection.map((item) => item.packageId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

// Tree permission (expand/collapse)
const handleCheckedTreeExpand = (value: CheckboxValueType, type: string) => {
  if (type == 'menu') {
    const treeList = menuOptions.value;
    for (let i = 0; i < treeList.length; i++) {
      if (menuTreeRef.value) {
        menuTreeRef.value.store.nodesMap[treeList[i].id].expanded = value as boolean;
      }
    }
  }
};

// Tree permissions (select all / deselect all)
const handleCheckedTreeNodeAll = (value: CheckboxValueType, type: string) => {
  if (type == 'menu') {
    menuTreeRef.value?.setCheckedNodes(value ? (menuOptions.value as any) : []);
  }
};

// Tree permission (parent-child linkage)
const handleCheckedTreeConnect = (value: CheckboxValueType, type: string) => {
  if (type == 'menu') {
    form.value.menuCheckStrictly = value as boolean;
  }
};

/** Add button action */
const handleAdd = () => {
  reset();
  getMenuTreeselect();
  dialog.visible = true;
  dialog.title = 'Add Tenant Package';
};

/** Edit button action */
const handleUpdate = async (row?: TenantPkgVO) => {
  reset();
  const _packageId = row?.packageId || ids.value[0];
  const response = await getTenantPackage(_packageId);
  form.value = response.data;
  const res = await getPackageMenuTreeselect(_packageId);
  dialog.visible = true;
  dialog.title = 'Edit Tenant Package';
  res.data.checkedKeys.forEach((v) => {
    nextTick(() => {
      menuTreeRef.value?.setChecked(v, true, false);
    });
  });
};

/** Submit button */
const submitForm = () => {
  tenantPackageFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      form.value.menuIds = getMenuAllCheckedKeys();
      if (form.value.packageId != null) {
        await updateTenantPackage(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addTenantPackage(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('Operation successful');
      dialog.visible = false;
      await getList();
    }
  });
};

/** Delete button action */
const handleDelete = async (row?: TenantPkgVO) => {
  const _packageIds = row?.packageId || ids.value;
  await proxy?.$modal.confirm('Are you sure you want to delete the tenant package ID "' + _packageIds + '" items?').finally(() => {
    loading.value = false;
  });
  await delTenantPackage(_packageIds);
  loading.value = true;
  await getList();
  proxy?.$modal.msgSuccess('Deleted successfully');
};

/** Export button action */
const handleExport = () => {
  proxy?.download(
    'system/tenant/package/export',
    {
      ...queryParams.value
    },
    `tenantPackage_${new Date().getTime()}.xlsx`
  );
};

onMounted(() => {
  getList();
});
</script>
