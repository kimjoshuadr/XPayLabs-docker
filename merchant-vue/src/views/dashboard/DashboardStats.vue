<template>
  <div v-loading="loading" class="dashboard-stats">
    <div class="toolbar">
      <el-radio-group v-model="range" @change="load">
        <el-radio-button value="today">Today</el-radio-button>
        <el-radio-button value="7d">Last 7 Days</el-radio-button>
        <el-radio-button value="30d">Last 30 Days</el-radio-button>
      </el-radio-group>
      <el-select
        v-if="isAdmin"
        v-model="merchantId"
        clearable
        filterable
        placeholder="All Merchants"
        style="width: 220px; margin-left: 12px"
        @change="load"
      >
        <el-option v-for="m in merchants" :key="m.id" :label="m.name" :value="m.id" />
      </el-select>
      <el-button style="margin-left: 12px" @click="load">Refresh</el-button>
    </div>

    <div v-if="loadError" class="error-panel">
      <el-alert type="error" :title="errorMsg" show-icon :closable="false" />
      <el-button type="primary" class="retry-btn" @click="load">Retry</el-button>
    </div>

    <template v-else-if="stats">
      <!-- A Transaction Volume -->
      <div class="section-header">Volume</div>
      <el-row :gutter="16" class="metric-row">
        <el-col :xs="24" :sm="12">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-label">Collection</div>
            <div class="bucket-grid">
              <div>
                <div class="stat-sub">Total Count</div>
                <div class="stat-value">{{ trade.collection.totalCount ?? 0 }}</div>
              </div>
              <div>
                <div class="stat-sub">Successful Count</div>
                <div class="stat-value">{{ trade.collection.successCount ?? 0 }}</div>
              </div>
              <div>
                <div class="stat-sub">Success Amount</div>
                <div class="stat-value amount">{{ formatAmount(trade.collection.successAmount) }}</div>
              </div>
              <div>
                <div class="stat-sub">Success Rate</div>
                <div class="stat-value">{{ trade.collection.successRate ?? '0.00%' }}</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="12">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-label">Payout</div>
            <div class="bucket-grid">
              <div>
                <div class="stat-sub">Total Count</div>
                <div class="stat-value">{{ trade.payout.totalCount ?? 0 }}</div>
              </div>
              <div>
                <div class="stat-sub">Successful Count</div>
                <div class="stat-value">{{ trade.payout.successCount ?? 0 }}</div>
              </div>
              <div>
                <div class="stat-sub">Success Amount</div>
                <div class="stat-value amount">{{ formatAmount(trade.payout.successAmount) }}</div>
              </div>
              <div>
                <div class="stat-sub">Success Rate</div>
                <div class="stat-value">{{ trade.payout.successRate ?? '0.00%' }}</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
      <el-card shadow="hover" class="table-card">
        <template #header>By Currency</template>
        <el-table :data="trade.bySymbol" border empty-text="No Data">
          <el-table-column prop="symbol" label="Currency" min-width="100" />
          <el-table-column label="Type" min-width="100">
            <template #default="{ row }">{{ orderTypeLabel(row.orderType) }}</template>
          </el-table-column>
          <el-table-column prop="successCount" label="Successful Count" min-width="110" />
          <el-table-column label="Success Amount" min-width="140">
            <template #default="{ row }">{{ formatAmount(row.successAmount) }}</template>
          </el-table-column>
        </el-table>
      </el-card>

      <!-- B Funds -->
      <div class="section-header">Funds</div>
      <el-row :gutter="16" class="metric-row">
        <el-col :xs="24" :sm="12" :md="8">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-label">Recharge</div>
            <div class="bucket-grid two">
              <div>
                <div class="stat-sub">Successful Count</div>
                <div class="stat-value">{{ fund.recharge.successCount ?? 0 }}</div>
              </div>
              <div>
                <div class="stat-sub">Success Amount</div>
                <div class="stat-value amount">{{ formatAmount(fund.recharge.successAmount) }}</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-label">Withdrawal</div>
            <div class="bucket-grid two">
              <div>
                <div class="stat-sub">Successful Count</div>
                <div class="stat-value">{{ fund.withdraw.successCount ?? 0 }}</div>
              </div>
              <div>
                <div class="stat-sub">Success Amount</div>
                <div class="stat-value amount">{{ formatAmount(fund.withdraw.successAmount) }}</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-label">Total Fee</div>
            <div class="stat-value amount">{{ formatAmount(fund.feeTotal) }}</div>
          </el-card>
        </el-col>
      </el-row>
      <el-card shadow="hover" class="table-card">
        <template #header>By Currency</template>
        <el-table :data="fund.bySymbol" border empty-text="No Data">
          <el-table-column prop="symbol" label="Currency" min-width="100" />
          <el-table-column label="Type" min-width="100">
            <template #default="{ row }">{{ orderTypeLabel(row.orderType) }}</template>
          </el-table-column>
          <el-table-column prop="successCount" label="Successful Count" min-width="110" />
          <el-table-column label="Success Amount" min-width="140">
            <template #default="{ row }">{{ formatAmount(row.successAmount) }}</template>
          </el-table-column>
        </el-table>
      </el-card>

      <!-- C Health -->
      <div class="section-header">Operational Health</div>
      <el-row :gutter="16" class="metric-row">
        <el-col :xs="24" :sm="12" :md="6">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-label">Failed Orders</div>
            <div class="stat-value" :class="{ warn: (health.failedOrderCount ?? 0) > 0 }">
              {{ health.failedOrderCount ?? 0 }}
            </div>
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="12" :md="6">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-label">Expired Orders</div>
            <div class="stat-value" :class="{ warn: (health.expiredOrderCount ?? 0) > 0 }">
              {{ health.expiredOrderCount ?? 0 }}
            </div>
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="12" :md="6">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-label">Callback Failed</div>
            <div class="stat-value" :class="{ warn: (health.callbackFailCount ?? 0) > 0 }">
              {{ health.callbackFailCount ?? 0 }}
            </div>
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="12" :md="6">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-label">Pending Confirmation</div>
            <div class="stat-value">{{ health.pendingConfirmCount ?? 0 }}</div>
          </el-card>
        </el-col>
      </el-row>

      <template v-if="isAdmin">
        <el-row :gutter="16" class="metric-row">
          <el-col :xs="24" :sm="12">
            <el-card shadow="hover" class="stat-card clickable" @click="goTo('/xpay/errorBlock')">
              <div class="stat-label">Error Block</div>
              <div class="stat-value" :class="{ warn: (health.errorBlockCount ?? 0) > 0 }">
                {{ health.errorBlockCount ?? 0 }}
              </div>
              <div class="stat-hint">Click to view the error block</div>
            </el-card>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-card shadow="hover" class="stat-card clickable" @click="goTo('/xpay/blockHeightTracker')">
              <div class="stat-label">Expired Tracker</div>
              <div class="stat-value" :class="{ warn: staleTrackers.length > 0 }">
                {{ staleTrackers.length }}
              </div>
              <div class="stat-hint">Click to view block height tracking</div>
            </el-card>
          </el-col>
        </el-row>
        <el-card shadow="hover" class="table-card">
          <template #header>
            <div class="card-header">
              <span>Expired Chain Tracker</span>
              <el-button link type="primary" @click="goTo('/xpay/blockHeightTracker')">View All</el-button>
            </div>
          </template>
          <el-table :data="staleTrackers" border empty-text="No expired trackers">
            <el-table-column prop="chain" label="Chain" min-width="120" />
            <el-table-column prop="lastHeight" label="Latest Height" min-width="140" />
            <el-table-column prop="updateTime" label="Updated At" min-width="180" />
          </el-table>
        </el-card>
      </template>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { getDashboardStats } from '@/api/xpay/dashboard';
import type { DashboardRange, DashboardStatsVO } from '@/api/xpay/dashboard/types';
import { listMerchant } from '@/api/xpay/merchant';
import type { MerchantVO } from '@/api/xpay/merchant/types';

const props = defineProps<{
  isAdmin: boolean;
}>();

const router = useRouter();
const loading = ref(false);
const loadError = ref(false);
const errorMsg = ref('Failed to load statistics');
const range = ref<DashboardRange>('today');
const merchantId = ref<number | string | undefined>(undefined);
const merchants = ref<MerchantVO[]>([]);
const stats = ref<DashboardStatsVO | null>(null);

const emptyBucket = () => ({
  totalCount: 0,
  successCount: 0,
  successAmount: 0,
  successRate: '0.00%'
});

const trade = computed(
  () =>
    stats.value?.trade ?? {
      collection: emptyBucket(),
      payout: emptyBucket(),
      bySymbol: []
    }
);

const fund = computed(
  () =>
    stats.value?.fund ?? {
      recharge: emptyBucket(),
      withdraw: emptyBucket(),
      feeTotal: 0,
      bySymbol: []
    }
);

const health = computed(
  () =>
    stats.value?.health ?? {
      failedOrderCount: 0,
      expiredOrderCount: 0,
      callbackFailCount: 0,
      pendingConfirmCount: 0,
      errorBlockCount: 0,
      staleTrackers: []
    }
);

const staleTrackers = computed(() => (props.isAdmin ? (health.value.staleTrackers ?? []) : []));

/** Avoid displaying BigDecimal in scientific notation (e.g. 0E-8) directly */
const formatAmount = (v: number | string | null | undefined) => {
  if (v === null || v === undefined || v === '') return '0';
  const s = String(v).trim();
  if (/e/i.test(s)) {
    const n = Number(s);
    if (!Number.isFinite(n)) return '0';
    return n === 0 ? '0' : n.toLocaleString('en-US', { maximumFractionDigits: 18, useGrouping: false });
  }
  return s;
};

const orderTypeLabel = (type?: string) => {
  const map: Record<string, string> = {
    COLLECTION: 'Collection',
    PAYOUT: 'Payout',
    RECHARGE: 'Recharge',
    WITHDRAW: 'Withdrawal'
  };
  return type ? map[type] ?? type : '-';
};

const loadMerchants = async () => {
  try {
    const res = await listMerchant({ pageNum: 1, pageSize: 500 });
    merchants.value = res.rows ?? [];
  } catch {
    merchants.value = [];
  }
};

const load = async () => {
  loading.value = true;
  loadError.value = false;
  try {
    const { data } = await getDashboardStats(range.value, merchantId.value || undefined);
    stats.value = data ?? null;
  } catch (e: any) {
    loadError.value = true;
    stats.value = null;
    errorMsg.value = e?.message || 'Failed to load statistics';
    ElMessage.error(errorMsg.value);
  } finally {
    loading.value = false;
  }
};

const goTo = (path: string) => {
  router.push(path).catch(() => {
    ElMessage.warning('Page route is temporarily unavailable, please enter from the sidebar menu');
  });
};

onMounted(() => {
  if (props.isAdmin) {
    loadMerchants();
  }
  load();
});
</script>

<style scoped>
.dashboard-stats {
  min-height: 200px;
  padding: 4px 0 16px;
}

.toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  margin-bottom: 16px;
}

.error-panel {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
  padding: 24px 8px;
}

.retry-btn {
  margin-left: 0;
}

.section-header {
  margin: 8px 0 12px;
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.metric-row {
  margin-bottom: 16px;
}

.stat-card {
  margin-bottom: 12px;
}

.stat-card.clickable {
  cursor: pointer;
}

.stat-card.clickable:hover {
  border-color: var(--el-color-primary-light-5);
}

.stat-label {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  margin-bottom: 8px;
}

.stat-sub {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
  margin-bottom: 4px;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  line-height: 1.2;
  color: var(--el-text-color-primary);
  word-break: break-all;
}

.stat-value.amount {
  font-size: 20px;
}

.stat-value.warn {
  color: var(--el-color-danger);
}

.stat-hint {
  margin-top: 8px;
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}

.bucket-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px 8px;
}

.bucket-grid.two {
  grid-template-columns: 1fr 1fr;
}

.table-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>
