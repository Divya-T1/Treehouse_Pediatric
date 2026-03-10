// ActivitiesSaver.js
import {
  Set_Encrypted_AsyncStorage,
  Get_Encrypted_AsyncStorage,
} from 'react-native-encrypted-asyncstorage';

// -------------------- Encryption Key --------------------
const ENCRYPTION_KEY = 'w8rT4zPq9vL1sX2mK6bH3nQ0yF7eJ5uD'; // replace with your own secure key
//HARDCODED FOR NOW, SHOULD BE GENERATED AND STORED SECURELY IN PRODUCTION

// -------------------- Storage Keys --------------------
const STORAGE_KEY_ACTIVITIES = 'SavedActivities';
const STORAGE_KEY_CATEGORIES = 'CustomCategories';
const STORAGE_KEY_CHOICE_BOARD = 'ChoiceBoard';

// -------------------- Activities --------------------
export const SaveActivities = async (activitiesArray) => {
  try {
    await Set_Encrypted_AsyncStorage(
      'object',
      STORAGE_KEY_ACTIVITIES,
      activitiesArray || [],
      ENCRYPTION_KEY
    );
  } catch (e) {
    console.warn('SaveActivities error:', e);
  }
};

export const GetActivities = async () => {
  try {
    const data = await Get_Encrypted_AsyncStorage(
      'object',
      STORAGE_KEY_ACTIVITIES,
      ENCRYPTION_KEY
    );
    return data || [];
  } catch (e) {
    console.warn('GetActivities error:', e);
    return [];
  }
};

// -------------------- Custom Categories --------------------
export const SaveCustomCategories = async (categoriesArray) => {
  try {
    await Set_Encrypted_AsyncStorage(
      'object',
      STORAGE_KEY_CATEGORIES,
      categoriesArray || [],
      ENCRYPTION_KEY
    );
  } catch (e) {
    console.warn('SaveCustomCategories error:', e);
  }
};

export const GetCustomCategories = async () => {
  try {
    const data = await Get_Encrypted_AsyncStorage(
      'object',
      STORAGE_KEY_CATEGORIES,
      ENCRYPTION_KEY
    );
    return data || [];
  } catch (e) {
    console.warn('GetCustomCategories error:', e);
    return [];
  }
};

// Add a new category (prevents duplicates)
export const AddCategory = async (categoryName, icon, activities = []) => {
  const cats = await GetCustomCategories();

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
    console.warn(`AddActivityToCategory: category "${categoryName}" not found`);
    return categories;
  }

  const existingActivity = categories[catIndex].activities.find(a => a.name === activity.name);
  if (!existingActivity) {
    categories[catIndex].activities.push(activity);
  }

  await SaveCustomCategories(categories);
  return categories;
};

// -------------------- Choice Board Activities --------------------
export const SaveChoiceBoard = async (choiceBoardActivities) => {
  try {
    await Set_Encrypted_AsyncStorage(
      'object',
      STORAGE_KEY_CHOICE_BOARD,
      choiceBoardActivities || [],
      ENCRYPTION_KEY
    );
  } catch (e) {
    console.warn('SaveChoiceBoard error:', e);
  }
};

export const GetChoiceBoard = async () => {
  try {
    const data = await Get_Encrypted_AsyncStorage(
      'object',
      STORAGE_KEY_CHOICE_BOARD,
      ENCRYPTION_KEY
    );
    return data || [];
  } catch (e) {
    console.warn('GetChoiceBoard error:', e);
    return [];
  }
};

// -------------------- Clear all data --------------------
export const clearData = async () => {
  try {
    await Set_Encrypted_AsyncStorage('object', STORAGE_KEY_ACTIVITIES, [], ENCRYPTION_KEY);
    await Set_Encrypted_AsyncStorage('object', STORAGE_KEY_CATEGORIES, [], ENCRYPTION_KEY);
    await Set_Encrypted_AsyncStorage('object', STORAGE_KEY_CHOICE_BOARD, [], ENCRYPTION_KEY);
    console.log('All data cleared');
  } catch (e) {
    console.warn('clearData error:', e);
  }
};