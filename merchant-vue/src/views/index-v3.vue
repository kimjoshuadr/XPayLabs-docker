<template>
  <div class="index-v3-shell">
    <el-tabs v-model="activeTab" @tab-change="onTabChange">
      <el-tab-pane label="Overview" name="overview">
        <AdminOverview v-if="isAdmin" />
        <MerchantOverview v-else />
      </el-tab-pane>
      <el-tab-pane label="Statistics" name="stats" lazy>
        <DashboardStats v-if="statsReady" :is-admin="isAdmin" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useUserStore } from '@/store/modules/user';
import MerchantOverview from '@/views/dashboard/MerchantOverview.vue';
import AdminOverview from '@/views/dashboard/AdminOverview.vue';
import DashboardStats from '@/views/dashboard/DashboardStats.vue';

const userStore = useUserStore();
const isAdmin = computed(() => userStore.roles.includes('superadmin'));
const activeTab = ref('overview');
const statsReady = ref(false);

const onTabChange = (name: string | number) => {
  if (name === 'stats') statsReady.value = true;
};
</script>

<style scoped>
.index-v3-shell {
  padding: 0 4px;
}
</style>
