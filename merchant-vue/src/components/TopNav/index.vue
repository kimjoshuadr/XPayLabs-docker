<template>
  <el-menu :default-active="activeMenu" mode="horizontal" :ellipsis="false" @select="handleSelect">
    <template v-for="(item, index) in topMenus">
      <el-menu-item v-if="index < visibleNumber" :key="index" :style="{ '--theme': theme }" :index="item.path"
        ><svg-icon v-if="item.meta && item.meta.icon && item.meta.icon !== '#'" :icon-class="item.meta ? item.meta.icon : ''" />
        {{ item.meta?.title }}</el-menu-item
      >
    </template>

    <!-- Collapse Overflowing Top Menu Items -->
    <el-sub-menu v-if="topMenus.length > visibleNumber" :style="{ '--theme': theme }" index="more">
      <template #title>More Menu</template>
      <template v-for="(item, index) in topMenus">
        <el-menu-item v-if="index >= visibleNumber" :key="index" :index="item.path"
          ><svg-icon :icon-class="item.meta ? item.meta.icon : ''" /> {{ item.meta?.title }}</el-menu-item
        >
      </template>
    </el-sub-menu>
  </el-menu>
</template>

<script setup lang="ts">
import { constantRoutes } from '@/router';
import { isHttp } from '@/utils/validate';
import { useAppStore } from '@/store/modules/app';
import { useSettingsStore } from '@/store/modules/settings';
import { usePermissionStore } from '@/store/modules/permission';
import { RouteRecordRaw } from 'vue-router';

// Initial number of top bar items
const visibleNumber = ref<number>(-1);
// Index of the currently active menu
const currentIndex = ref<string>();
// Hidden sidebar route
const hideList = ['/index', '/user/profile'];

const appStore = useAppStore();
const settingsStore = useSettingsStore();
const permissionStore = usePermissionStore();
const route = useRoute();
const router = useRouter();

// Theme Color
const theme = computed(() => settingsStore.theme);
// All route information
const routers = computed(() => permissionStore.getTopbarRoutes());

// Top menu display
const topMenus = computed(() => {
  const topMenus: RouteRecordRaw[] = [];
  routers.value.map((menu) => {
    if (menu.hidden !== true) {
      // Support internal navigation of top bar first-level menu
      if (menu.path === '/' && menu.children) {
        topMenus.push(menu.children ? menu.children[0] : menu);
      } else {
        topMenus.push(menu);
      }
    }
  });
  return topMenus;
});

// Set child routes
const childrenMenus = computed(() => {
  const childrenMenus: RouteRecordRaw[] = [];
  routers.value.map((router) => {
    router.children?.forEach((item) => {
      if (item.parentPath === undefined) {
        if (router.path === '/') {
          item.path = '/' + item.path;
        } else {
          if (!isHttp(item.path)) {
            item.path = router.path + '/' + item.path;
          }
        }
        item.parentPath = router.path;
      }
      childrenMenus.push(item);
    });
  });
  return constantRoutes.concat(childrenMenus);
});

// Default active menu
const activeMenu = computed(() => {
  let path = route.path;
  if (path === '/index') {
    path = '/system/user';
  }
  let activePath = path;
  if (path !== undefined && path.lastIndexOf('/') > 0 && hideList.indexOf(path) === -1) {
    const tmpPath = path.substring(1, path.length);
    if (!route.meta.link) {
      activePath = '/' + tmpPath.substring(0, tmpPath.indexOf('/'));
      appStore.toggleSideBarHide(false);
    }
  } else if (!route.children) {
    activePath = path;
    appStore.toggleSideBarHide(true);
  }
  activeRoutes(activePath);
  return activePath;
});

const setVisibleNumber = () => {
  const width = document.body.getBoundingClientRect().width / 3;
  visibleNumber.value = parseInt(String(width / 85));
};

const handleSelect = (key: string) => {
  currentIndex.value = key;
  const route = routers.value.find((item) => item.path === key);
  if (isHttp(key)) {
    // Open http(s):// paths in a new window
    window.open(key, '_blank');
  } else if (!route || !route.children) {
    // Open internally when there is no child route path
    const routeMenu = childrenMenus.value.find((item) => item.path === key);
    if (routeMenu && routeMenu.query) {
      const query = JSON.parse(routeMenu.query);
      router.push({ path: key, query: query });
    } else {
      router.push({ path: key });
    }
    appStore.toggleSideBarHide(true);
  } else {
    // Show left linked menu
    activeRoutes(key);
    appStore.toggleSideBarHide(false);
  }
};

const activeRoutes = (key: string) => {
  const routes: RouteRecordRaw[] = [];
  if (childrenMenus.value && childrenMenus.value.length > 0) {
    childrenMenus.value.map((item) => {
      if (key == item.parentPath || (key == 'index' && '' == item.path)) {
        routes.push(item);
      }
    });
  }
  if (routes.length > 0) {
    permissionStore.setSidebarRouters(routes);
  } else {
    appStore.toggleSideBarHide(true);
  }
  return routes;
};

onMounted(() => {
  window.addEventListener('resize', setVisibleNumber);
});
onBeforeUnmount(() => {
  window.removeEventListener('resize', setVisibleNumber);
});

onMounted(() => {
  setVisibleNumber();
});
</script>

<style lang="scss">
.topmenu-container.el-menu--horizontal > .el-menu-item {
  float: left;
  height: 50px !important;
  line-height: 50px !important;
  color: #999093 !important;
  padding: 0 5px !important;
  margin: 0 10px !important;
}

.topmenu-container.el-menu--horizontal > .el-menu-item.is-active,
.el-menu--horizontal > .el-sub-menu.is-active .el-submenu__title {
  border-bottom: 2px solid #{'var(--theme)'} !important;
  color: #303133;
}

/* sub-menu item */
.topmenu-container.el-menu--horizontal > .el-sub-menu .el-sub-menu__title {
  float: left;
  height: 50px !important;
  line-height: 50px !important;
  color: #999093 !important;
  padding: 0 5px !important;
  margin: 0 10px !important;
}

/* Hide background color */
.topmenu-container.el-menu--horizontal > .el-menu-item:not(.is-disabled):focus,
.topmenu-container.el-menu--horizontal > .el-menu-item:not(.is-disabled):hover,
.topmenu-container.el-menu--horizontal > .el-submenu .el-submenu__title:hover {
  background-color: #ffffff !important;
}

/* Icon right margin */
.topmenu-container .svg-icon {
  margin-right: 4px;
}
</style>
