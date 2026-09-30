import router from '@/router';
import { RouteLocationMatched, RouteLocationNormalized, RouteLocationRaw } from 'vue-router';
import { useTagsViewStore } from '@/store/modules/tagsView';

export default {
  /**
   * Refresh current tab
   * @param obj Tag object
   */
  async refreshPage(obj?: RouteLocationNormalized): Promise<void> {
    const { path, query, matched } = router.currentRoute.value;
    if (obj === undefined) {
      matched.forEach((m: RouteLocationMatched) => {
        if (m.components && m.components.default && m.components.default.name) {
          if (!['Layout', 'ParentView'].includes(m.components.default.name)) {
            obj = {
              name: m.components.default.name,
              path: path,
              query: query,
              matched: undefined,
              fullPath: undefined,
              hash: undefined,
              params: undefined,
              redirectedFrom: undefined,
              meta: undefined
            };
          }
        }
      });
    }
    let query1: undefined | {} = {};
    let path1: undefined | string = '';
    if (obj) {
      query1 = obj.query;
      path1 = obj.path;
    }
    await useTagsViewStore().delCachedView(obj);
    await router.replace({
      path: '/redirect' + path1,
      query: query1
    });
  },
  // Close the current tab and open a new tab
  closeOpenPage(obj: RouteLocationRaw): void {
    useTagsViewStore().delView(router.currentRoute.value);
    if (obj !== undefined) {
      router.push(obj);
    }
  },
  // Close specified tab
  async closePage(obj?: RouteLocationNormalized): Promise<{ visitedViews: RouteLocationNormalized[]; cachedViews: string[] } | any> {
    if (obj === undefined) {
      // prettier-ignore
      const { visitedViews } = await useTagsViewStore().delView(router.currentRoute.value)
      const latestView = visitedViews.slice(-1)[0];
      if (latestView) {
        return router.push(latestView.fullPath);
      }
      return router.push('/');
    }
    return useTagsViewStore().delView(obj);
  },
  // Close all tabs
  closeAllPage() {
    return useTagsViewStore().delAllViews();
  },
  // Close left tab
  closeLeftPage(obj?: RouteLocationNormalized) {
    return useTagsViewStore().delLeftTags(obj || router.currentRoute.value);
  },
  // Close the right tab
  closeRightPage(obj?: RouteLocationNormalized) {
    return useTagsViewStore().delRightTags(obj || router.currentRoute.value);
  },
  // Close other tabs
  closeOtherPage(obj?: RouteLocationNormalized) {
    return useTagsViewStore().delOthersViews(obj || router.currentRoute.value);
  },
  /**
   * Open tab
   * @param url Route address
   * @param title Title
   * @param query Parameters
   */
  openPage(url: string, title?: string, query?: any) {
    const obj = { path: url, query: { ...query, title } };
    return router.push(obj);
  },
  /**
   * Edit tab
   * @param obj Tag object
   */
  updatePage(obj: RouteLocationNormalized) {
    return useTagsViewStore().updateVisitedView(obj);
  }
};
