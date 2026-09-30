import { defineStore } from 'pinia';

export const useDictStore = defineStore('dict', () => {
  const dict = ref<Map<string, DictDataOption[]>>(new Map());

  /**
   * Get Dictionary
   * @param _key Dictionary key
   */
  const getDict = (_key: string): DictDataOption[] | null => {
    if (!_key) {
      return null;
    }
    return dict.value.get(_key) || null;
  };

  /**
   * Set Dictionary
   * @param _key Dictionary key
   * @param _value Dictionary value
   */
  const setDict = (_key: string, _value: DictDataOption[]) => {
    if (!_key) {
      return false;
    }
    try {
      dict.value.set(_key, _value);
      return true;
    } catch (e) {
      console.error('Error in setDict:', e);
      return false;
    }
  };

  /**
   * Delete Dictionary
   * @param _key
   */
  const removeDict = (_key: string): boolean => {
    if (!_key) {
      return false;
    }
    try {
      return dict.value.delete(_key);
    } catch (e) {
      console.error('Error in removeDict:', e);
      return false;
    }
  };

  /**
   * Clear dictionary
   */
  const cleanDict = (): void => {
    dict.value.clear();
  };

  return {
    dict,
    getDict,
    setDict,
    removeDict,
    cleanDict
  };
});
