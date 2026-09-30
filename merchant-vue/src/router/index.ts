import { createWebHistory, createRouter, RouteRecordRaw } from 'vue-router';
/* Layout */
import Layout from '@/layout/index.vue';

/**
 * Note: Route configuration item
 *
 * hidden: true                     // When set to true, this route will no longer appear in the sidebar, such as 401, login pages, or some edit pages like /edit/1
 * alwaysShow: true                 // When a route has more than one child route declared, it automatically becomes nested mode--e.g. component pages
 *                                  // When there is only one, that child route is treated as the root route and shown in the sidebar--e.g. guide page
 *                                  // If you want your root route displayed regardless of the number of children declared under the route
 *                                  // You can set alwaysShow: true, which will ignore the previously defined rules and always display the root route
 * redirect: noRedirect             // When noRedirect is set, this route cannot be clicked in the breadcrumb navigation
 * name:'router-name'               // Set the route name; it must be filled in or else<keep-alive>various problems may occur
 * query: '{"id": 1, "name": "ry"}' // Default parameters passed when accessing the route
 * roles: ['admin', 'common']       // Role permissions for accessing routes
 * permissions: ['a:a:a', 'b:b:b']  // Menu permission for accessing the route
 * meta : {
    noCache: true                   // If set to true, it will not be <keep-alive> Cache (default false)
    title: 'title'                  // Set the name of this route displayed in the sidebar and breadcrumb
    icon: 'svg-name'                // Set the route icon, corresponding to path src/assets/icons/svg
    breadcrumb: false               // If set to false, it will not be displayed in the breadcrumb
    activeMenu: '/system/user'      // When this attribute is set on a route, the corresponding sidebar item is highlighted.
  }
 */

// Public routes
export const constantRoutes: RouteRecordRaw[] = [
  {
    path: '/redirect',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '/redirect/:path(.*)',
        component: () => import('@/views/redirect/index.vue')
      }
    ]
  },
  {
    path: '/social-callback',
    hidden: true,
    component: () => import('@/layout/components/SocialCallback/index.vue')
  },
  {
    path: '/login',
    component: () => import('@/views/login.vue'),
    hidden: true
  },
  {
    path: '/register',
    component: () => import('@/views/register.vue'),
    hidden: true
  },
  {
    path: '/:pathMatch(.*)*',
    component: () => import('@/views/error/404.vue'),
    hidden: true
  },
  {
    path: '/401',
    component: () => import('@/views/error/401.vue'),
    hidden: true
  },
  {
    path: '/user-recharge',
    component: () => import('@/views/user-recharge.vue'),
    hidden: true
  },
  {
    path: '',
    component: Layout,
    redirect: '/index',
    children: [
      {
        path: '/index',
        component: () => import('@/views/IndexWrapper.vue'),
        name: 'Index',
        meta: { title: 'Dashboard', icon: 'dashboard', affix: true }
      }
    ]
  },
  {
    path: '/user',
    component: Layout,
    hidden: true,
    redirect: 'noredirect',
    children: [
      {
        path: 'profile',
        component: () => import('@/views/system/user/profile/index.vue'),
        name: 'Profile',
        meta: { title: 'Profile', icon: 'user' }
      }
    ]
  }
];

// Dynamic routes, loaded dynamically based on user permissions
export const dynamicRoutes: RouteRecordRaw[] = [

];

/**
 * Create route
 */
const router = createRouter({
  history: createWebHistory(import.meta.env.VITE_APP_CONTEXT_PATH),
  routes: constantRoutes,
  // Restore scrollbar position on refresh
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    }
    return { top: 0 };
  }
});

export default router;
