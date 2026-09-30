<template>
  <div ref="container" class="w-full h-[calc(100vh-88px)]">
    <iframe ref="iframe" :src="iframeUrl" frameborder="0" height="100%" style="height: 100%; width: inherit"></iframe>
  </div>
</template>

<script setup name="WarmFlow" lang="ts">
const { proxy } = getCurrentInstance();
import { onMounted } from 'vue';
import { getToken } from '@/utils/auth';

// definitionId is the process definition ID to query,
// disabled indicates whether it is editable, e.g.: not editable and not saveable when viewing
const iframeUrl = ref('');
const baseUrl = import.meta.env.VITE_APP_BASE_API;
const iframeLoaded = () => {
  // iframe listens for the designer save event inside the component
  window.onmessage = (event) => {
    switch (event.data.method) {
      case 'close':
        close();
        break;
    }
  };
};
const open = async (definitionId, disabled) => {
  const url = baseUrl + `/warm-flow-ui/index.html?id=${definitionId}&disabled=${disabled}`;
  iframeUrl.value = url + '&Authorization=Bearer ' + getToken() + '&clientId=' + import.meta.env.VITE_APP_CLIENT_ID;
};
/** Close button */
function close() {
  const obj = { path: '/workflow/processDefinition', query: { activeName: proxy.$route.query.activeName } };
  proxy.$tab.closeOpenPage(obj);
}

onMounted(() => {
  iframeLoaded();
  open(proxy.$route.query.definitionId, proxy.$route.query.disabled);
});
/**
 * Expose Child Component Methods
 */
defineExpose({
  open
});
</script>
