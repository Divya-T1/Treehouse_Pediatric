// ActivitiesSaver.js
import AsyncStorage from './storage';
import { CameraType } from 'expo-image-picker';
import { supabase } from './supabase';
import { pushActivities, pushCategories, pushChoiceBoard } from './cloudSync';
import { DEFAULT_ACTIVITIES } from './activities';

const BUILTIN_ICONS = {};
for (const cat of DEFAULT_ACTIVITIES) {
  for (const act of cat.activities) {
    BUILTIN_ICONS[act.id] = act.icon;
  }
}

const resolveIcons = (activities) =>
  (activities || []).map(act =>
    BUILTIN_ICONS[act.id] !== undefined ? { ...act, icon: BUILTIN_ICONS[act.id] } : act
  );

const getUserId = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user?.id ?? null;
};

const cloudPush = (pushFn, data) => {
  getUserId().then(id => {
    if (id) pushFn(id, data).catch(e => console.warn('cloud push error:', e));
  }).catch(() => {});
};

const STORAGE_KEY_ACTIVITIES = 'SavedActivities';
const STORAGE_KEY_CATEGORIES = 'CustomCategories';
const STORAGE_KEY_CHOICE_BOARD = 'ChoiceBoard';

// -------------------- Activities --------------------

// Save regular activities
export const SaveActivities = async (activitiesArray) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY_ACTIVITIES, JSON.stringify(activitiesArray || []));
  } catch (e) {
    console.warn('SaveActivities error:', e);
  }
  cloudPush(pushActivities, activitiesArray || []);
};

// Get regular activities
export const GetActivities = async () => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY_ACTIVITIES);
    return resolveIcons(raw ? JSON.parse(raw) : []);
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
  cloudPush(pushCategories, categoriesArray || []);
};

// Add a new category (prevents duplicates)
export const AddCategory = async (categoryName, icon, activities = []) => {
  const cats = await GetCustomCategories();

  // Prevent duplicate category names
  if (cats.some(c => c.categoryName === categoryName)) {
    return cats;
  }

  const next = [...cats, { categoryName, icon, activities }];
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

// -------------------- Choice Board Activities --------------------

// Save choice board activities
export const SaveChoiceBoard = async (choiceBoardActivities) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY_CHOICE_BOARD, JSON.stringify(choiceBoardActivities || []));
  } catch (e) {
    console.warn('SaveChoiceBoard error:', e);
  }
  cloudPush(pushChoiceBoard, choiceBoardActivities || []);
};

export const GetChoiceBoard = async () => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY_CHOICE_BOARD);
    return resolveIcons(raw ? JSON.parse(raw) : []);
  } catch (e) {
    console.warn('GetChoiceBoard error:', e);
    return [];
  }
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

// -------------------- Clear only activity data (ONLY WORKS FOR WEB) --------------------
export const clearActivities = async () => {
  const cats = await GetCustomCategories();
  console.log(cats);
  clearData();
  SaveCustomCategories(Array.isArray(cats) ? cats : []);
}
