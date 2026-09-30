<template>
  <component :is="currentComponent" />
</template>

<script setup lang="ts">
import { shallowRef, onMounted, defineAsyncComponent } from 'vue';
import { merchantInfo } from '@/api/xpay/merchant';
import { useUserStore } from '@/store/modules/user';

// Dynamic component reference - use shallowRef to avoid making the component reactive
const currentComponent = shallowRef();

// Asynchronously load component
const IndexV3 = defineAsyncComponent(() => import('@/views/index-v3.vue'));
const IndexV2 = defineAsyncComponent(() => import('@/views/index-v2.vue'));

onMounted(async () => {
  try {
    const userStore = useUserStore();

    // Check whether the user is superadmin
    if (userStore.roles.includes('superadmin')) {
      currentComponent.value = IndexV3;
      return;
    }
    
    // Get merchant info
    const { data: merchant } = await merchantInfo();
    
    // Determine which component to use based on merchantSysVersion
    if (merchant?.merchantSysVersion === 'V3') {
      currentComponent.value = IndexV3;
    } else {
      // V2 or other versions use index-v2.vue
      currentComponent.value = IndexV2;
    }
  } catch (error) {
    console.error('Failed to get merchant information, using default version:', error);
    // Default to V3 version on error
    currentComponent.value = IndexV3;
  }
});
</script>