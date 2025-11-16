// ActivitiesSaver.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY_ACTIVITIES = 'SavedActivities';
const STORAGE_KEY_CATEGORIES = 'CustomCategories';

// Save regular activities
export const SaveActivities = async (activitiesArray) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY_ACTIVITIES, JSON.stringify(activitiesArray || []));
  } catch (e) {
    console.warn('SaveActivities error:', e);
  }
};

export const GetActivities = async () => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY_ACTIVITIES);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.warn('GetActivities error:', e);
    return [];
  }
};

// Clear all data
export const clearData = async () => {
  try {
    await AsyncStorage.clear();
  } catch (e) {}
  console.log('Done.');
};

// Custom Categories
export const GetCustomCategories = async () => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY_CATEGORIES);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.warn('GetCustomCategories error:', e);
    return [];
  }
};

export const SaveCustomCategories = async (categoriesArray) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(categoriesArray || []));
  } catch (e) {
    console.warn('SaveCustomCategories error:', e);
  }
};

// Add new category
export const AddCategory = async (categoryName, icon) => {
  const cats = await GetCustomCategories();
  const next = [...cats, { categoryName, icon, activities: [] }];
  await SaveCustomCategories(next);
  return next;
};

// Add activity to custom category
export const AddActivityToCategory = async (categoryName, activity) => {
  const cats = await GetCustomCategories();
  const updated = cats.map(c => {
    if (c.categoryName === categoryName) {
      return { ...c, activities: [...c.activities, activity] };
    }
    return c;
  });
  await SaveCustomCategories(updated);
  return updated;
};
