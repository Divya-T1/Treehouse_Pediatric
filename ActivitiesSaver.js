// ActivitiesSaver.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY_ACTIVITIES = 'SavedActivities';
const STORAGE_KEY_CATEGORIES = 'CustomCategories';

// -------------------- Activities --------------------

// Save regular activities
export const SaveActivities = async (activitiesArray) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY_ACTIVITIES, JSON.stringify(activitiesArray || []));
  } catch (e) {
    console.warn('SaveActivities error:', e);
  }
};

// Get regular activities
export const GetActivities = async () => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY_ACTIVITIES);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.warn('GetActivities error:', e);
    return [];
  }
};

// -------------------- Custom Categories --------------------

// Get custom categories
export const GetCustomCategories = async () => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY_CATEGORIES);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.warn('GetCustomCategories error:', e);
    return [];
  }
};

// Save custom categories
export const SaveCustomCategories = async (categoriesArray) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(categoriesArray || []));
  } catch (e) {
    console.warn('SaveCustomCategories error:', e);
  }
};

// Add a new category (prevents duplicates)
export const AddCategory = async (categoryName, icon) => {
  const cats = await GetCustomCategories();

  // Prevent duplicate category names
  if (cats.some(c => c.categoryName === categoryName)) {
    return cats;
  }

  const next = [...cats, { categoryName, icon, activities: [] }];
  await SaveCustomCategories(next);
  return next;
};

// Add activity to an existing category (does NOT create new categories)
export const AddActivityToCategory = async (categoryName, activity) => {
  const categories = await GetCustomCategories();
  const catIndex = categories.findIndex(c => c.categoryName === categoryName);

  if (catIndex === -1) {
    // Category does not exist → do NOT create it
    console.warn(`AddActivityToCategory: category "${categoryName}" not found`);
    return categories;
  }

  // Add activity if it doesn't already exist in the category
  const existingActivity = categories[catIndex].activities.find(a => a.name === activity.name);
  if (!existingActivity) {
    categories[catIndex].activities.push(activity);
  }

  await SaveCustomCategories(categories);
  return categories;
};

// -------------------- Clear all data --------------------
export const clearData = async () => {
  try {
    await AsyncStorage.clear();
    console.log('All data cleared');
  } catch (e) {
    console.warn('clearData error:', e);
  }
};
