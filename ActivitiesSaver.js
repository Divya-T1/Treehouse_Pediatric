// ActivitiesSaver.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'SavedActivities';

// Overwrite with full list
export const SaveActivities = async (activitiesArray) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(activitiesArray || []));
  } catch (e) {
    console.warn('SaveActivities error:', e);
  }
};

// Read full list
export const GetActivities = async () => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.warn('GetActivities error:', e);
    return [];
  }
};

export const clearData = async () => {
  try {
    await AsyncStorage.clear()
  } catch(e) {
    // clear error
  }

  console.log('Done.')
}

// Append one key (optional helper)
export const AddActivity = async (key) => {
  const current = await GetActivities();
  const next = [...current, key];
  await SaveActivities(next);
  return next;
};

// Clear all (optional helper)
export const ClearActivities = async () => {
  await SaveActivities([]);
};
