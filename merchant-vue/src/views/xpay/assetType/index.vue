<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="Chain" prop="chain">
              <el-input v-model="queryParams.chain" placeholder="Please enter chain" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Currency" prop="symbol">
              <el-input v-model="queryParams.symbol" placeholder="Please enter currency" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Contract Address" prop="contractAddress">
              <el-input v-model="queryParams.contractAddress" placeholder="Please enter contract address" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Network" prop="network">
              <el-input v-model="queryParams.network" placeholder="Please enter network" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Enabled" prop="enabled">
              <el-select v-model="queryParams.enabled" placeholder="Select" clearable>
                <el-option label="Enable" value="ENABLED" />
                <el-option label="Disable" value="DISABLED" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" icon="Search" @click="handleQuery">Search</el-button>
              <el-button icon="Refresh" @click="resetQuery">Reset</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </div>
    </transition>

    <el-card shadow="never">
      <template #header>
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['xpay:assetType:add']">Add</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['xpay:assetType:edit']"
              >Edit</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['xpay:assetType:remove']"
              >Delete</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['xpay:assetType:export']">Export</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" border :data="assetTypeList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="ID" align="center" prop="id" width="80" />
        <el-table-column label="Chain" align="center" prop="chain" width="100" />
        <el-table-column label="Currency" align="center" prop="symbol" width="80" />
        <el-table-column label="Contract Address" align="center" prop="contractAddress" show-overflow-tooltip min-width="160" />
        <el-table-column label="Precision" align="center" prop="decimals" width="80" />
        <el-table-column label="Network" align="center" prop="network" width="100" />
        <el-table-column label="Hot Wallet Address" align="center" prop="hotAddress" show-overflow-tooltip min-width="160" />
        <el-table-column label="Cold Wallet Address" align="center" prop="coldAddress" show-overflow-tooltip min-width="160" />
        <el-table-column label="Trigger Collection Quantity" align="center" prop="collectAmount" width="140" />
        <el-table-column label="Confirmations" align="center" prop="confirmedNum" width="80" />
        <el-table-column label="Enabled" align="center" prop="enabled" width="100">
          <template #default="scope">
            <el-tag v-if="scope.row.enabled === 'ENABLED'" type="success">Enable</el-tag>
            <el-tag v-else type="info">Disable</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Actions" align="center" class-name="small-padding fixed-width" width="120">
          <template #default="scope">
            <el-tooltip content="Edit" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['xpay:assetType:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="Delete" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['xpay:assetType:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- Add or Edit Supported Currency Asset Type Dialog -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="assetTypeFormRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="Chain" prop="chain">
          <el-input v-model="form.chain" placeholder="Please enter chain" />
        </el-form-item>
        <el-form-item label="Currency" prop="symbol">
          <el-input v-model="form.symbol" placeholder="Please enter currency" />
        </el-form-item>
        <el-form-item label="Contract Address" prop="contractAddress">
          <el-input v-model="form.contractAddress" placeholder="Please enter contract address" />
        </el-form-item>
        <el-form-item label="Precision" prop="decimals">
          <el-input v-model="form.decimals" placeholder="Please enter precision" />
        </el-form-item>
        <el-form-item label="Network" prop="network">
          <el-input v-model="form.network" placeholder="Please enter network" />
        </el-form-item>
        <el-form-item label="Hot Wallet Address" prop="hotAddress">
          <div class="flex flex-col w-full gap-1">
            <el-input v-model="form.hotAddress" type="textarea" placeholder="Please enter the hot wallet address" disabled />
            <span class="text-gray-400 text-xs">The hot wallet address is generated by the system and cannot be modified</span>
          </div>
        </el-form-item>
        <el-form-item label="Cold Wallet Address" prop="coldAddress">
          <el-input v-model="form.coldAddress" type="textarea" placeholder="Please enter cold wallet address" />
        </el-form-item>
        <el-form-item label="Trigger Collection Quantity" prop="collectAmount">
          <el-input v-model="form.collectAmount" placeholder="Enter trigger collection amount" />
        </el-form-item>
        <el-form-item label="Confirmations" prop="confirmedNum">
          <el-input v-model="form.confirmedNum" placeholder="Please enter confirmation count" />
        </el-form-item>
        <el-form-item label="Enabled" prop="enabled">
          <el-switch v-model="form.enabled" active-value="ENABLED" inactive-value="DISABLED" active-text="Enable" inactive-text="Disable" />
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

<script setup name="AssetType" lang="ts">
import { listAssetType, getAssetType, delAssetType, addAssetType, updateAssetType } from '@/api/xpay/assetType';
import { AssetTypeVO, AssetTypeQuery, AssetTypeForm } from '@/api/xpay/assetType/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const assetTypeList = ref<AssetTypeVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const assetTypeFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: AssetTypeForm = {
  id: undefined,
  chain: undefined,
  symbol: undefined,
  contractAddress: undefined,
  decimals: undefined,
  network: undefined,
  coldAddress: undefined,
  hotAddress: undefined,
  collectAmount: undefined,
  confirmedNum: undefined,
  enabled: 'ENABLED'
};
const data = reactive<PageData<AssetTypeForm, AssetTypeQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    chain: undefined,
    symbol: undefined,
    contractAddress: undefined,
    network: undefined,
    enabled: undefined,
    params: {}
  },
  rules: {
    chain: [{ required: true, message: 'Chain cannot be empty', trigger: 'blur' }],
    symbol: [{ required: true, message: 'Currency cannot be empty', trigger: 'blur' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

const getList = async () => {
  loading.value = true;
  const res = await listAssetType(queryParams.value);
  assetTypeList.value = res.rows;
  total.value = res.total;
  loading.value = false;
};

const cancel = () => {
  reset();
  dialog.visible = false;
};

const reset = () => {
  form.value = { ...initFormData };
  assetTypeFormRef.value?.resetFields();
};

const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};

const resetQuery = () => {
  queryFormRef.value?.resetFields();
  handleQuery();
};

const handleSelectionChange = (selection: AssetTypeVO[]) => {
  ids.value = selection.map((item) => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = 'Add Supported Currency Asset Types';
};

const handleUpdate = async (row?: AssetTypeVO) => {
  reset();
  const _id = row?.id || ids.value[0];
  const res = await getAssetType(_id);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = 'Edit Supported Currency Asset Types';
};

const submitForm = () => {
  assetTypeFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        await updateAssetType(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addAssetType(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('Operation successful');
      dialog.visible = false;
      await getList();
    }
  });
};

const handleDelete = async (row?: AssetTypeVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('Are you sure you want to delete the supported currency asset type with ID "' + _ids + '" items?').finally(() => (loading.value = false));
  await delAssetType(_ids);
  proxy?.$modal.msgSuccess('Deleted successfully');
  await getList();
};

const handleExport = () => {
  proxy?.download(
    'xpay/assetType/export',
    {
      ...queryParams.value
    },
    `assetType_${new Date().getTime()}.xlsx`
  );
};

onMounted(() => {
  getList();
});
</script>
