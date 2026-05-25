import localforage from 'localforage';

export default {
  setItem: (key, value) => localforage.setItem(key, value),
  getItem: (key) => localforage.getItem(key),
  removeItem: (key) => localforage.removeItem(key),
  clear: () => localforage.clear(),
};
