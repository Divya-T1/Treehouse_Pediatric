import { supabase } from './supabase';
import AsyncStorage from './storage';

const TABLE = 'user_data';

const fetchUserData = async (userId) => {
  const { data, error } = await supabase
    .from(TABLE)
    .select('saved_activities, custom_categories, choice_board')
    .eq('user_id', userId)
    .single();
  // PGRST116 = no row found (new user), not a real error
  if (error && error.code !== 'PGRST116') {
    console.warn('fetchUserData error:', error.message);
  }
  return data ?? null;
};

export const pushActivities = async (userId, arr) => {
  const { error } = await supabase.from(TABLE).upsert(
    { user_id: userId, saved_activities: arr, updated_at: new Date().toISOString() },
    { onConflict: 'user_id' }
  );
  if (error) console.warn('pushActivities error:', error.message);
};

export const pushCategories = async (userId, arr) => {
  // Only push custom categories — built-ins have require() icons (numbers),
  // which are meaningless outside this app bundle.
  const customOnly = arr.filter(cat => typeof cat.icon === 'string');
  const { error } = await supabase.from(TABLE).upsert(
    { user_id: userId, custom_categories: customOnly, updated_at: new Date().toISOString() },
    { onConflict: 'user_id' }
  );
  if (error) console.warn('pushCategories error:', error.message);
};

export const pushChoiceBoard = async (userId, arr) => {
  const { error } = await supabase.from(TABLE).upsert(
    { user_id: userId, choice_board: arr, updated_at: new Date().toISOString() },
    { onConflict: 'user_id' }
  );
  if (error) console.warn('pushChoiceBoard error:', error.message);
};

// Called once on sign-in: pulls cloud data into local storage so the rest of
// the app can read it via the normal Get* functions without any changes.
export const syncFromCloud = async (userId) => {
  const data = await fetchUserData(userId);
  if (!data) return; // new user — nothing to sync, local storage stays as-is
  if (data.saved_activities !== null)
    await AsyncStorage.setItem('SavedActivities', JSON.stringify(data.saved_activities));
  if (data.custom_categories !== null)
    await AsyncStorage.setItem('CustomCategories', JSON.stringify(data.custom_categories));
  if (data.choice_board !== null)
    await AsyncStorage.setItem('ChoiceBoard', JSON.stringify(data.choice_board));
};
