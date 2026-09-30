import modal from './modal';
import tab from './tab';
import download from './download';
import cache from './cache';
import auth from './auth';
// Preset animations
import animate from '@/animate';

import { download as dl } from '@/utils/request';
import { useDict } from '@/utils/dict';
import { getConfigKey, updateConfigByKey } from '@/api/system/config';
import { parseTime, addDateRange, handleTree, selectDictLabel, selectDictLabels } from '@/utils/ruoyi';

import { App } from 'vue';

export default function installPlugin(app: App) {
  // Tab action
  app.config.globalProperties.$tab = tab;

  // Modal box object
  app.config.globalProperties.$modal = modal;

  // Cache object
  app.config.globalProperties.$cache = cache;

  // Download file
  app.config.globalProperties.$download = download;

  // Authentication object
  app.config.globalProperties.$auth = auth;

  // Global method mounting
  app.config.globalProperties.useDict = useDict;
  app.config.globalProperties.getConfigKey = getConfigKey;
  app.config.globalProperties.updateConfigByKey = updateConfigByKey;
  app.config.globalProperties.download = dl;
  app.config.globalProperties.parseTime = parseTime;
  app.config.globalProperties.handleTree = handleTree;
  app.config.globalProperties.addDateRange = addDateRange;
  app.config.globalProperties.selectDictLabel = selectDictLabel;
  app.config.globalProperties.selectDictLabels = selectDictLabels;
  app.config.globalProperties.animate = animate;
}
