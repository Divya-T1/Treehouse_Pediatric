import { supabase } from './supabase';
import AsyncStorage from './storage';
import { DEFAULT_ACTIVITIES } from './activities';

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
  // Built-in category icons are require() results — not serializable to Supabase JSON.
  // For built-ins, we store only the user-added activities (which have string icons)
  // under a '__builtin__' sentinel. syncFromCloud merges them back with DEFAULT_ACTIVITIES.
  const toStore = arr.flatMap(cat => {
    if (typeof cat.icon === 'string') return [cat]; // fully custom category
    const customActivities = (cat.activities || []).filter(a => typeof a.icon === 'string');
    if (customActivities.length === 0) return []; // unmodified built-in — skip
    return [{ categoryName: cat.categoryName, icon: '__builtin__', activities: customActivities }];
  });
  const { error } = await supabase.from(TABLE).upsert(
    { user_id: userId, custom_categories: toStore, updated_at: new Date().toISOString() },
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
  if (data.custom_categories !== null) {
    // Map of categoryName -> user-added activities for modified built-ins
    const builtinExtras = new Map(
      data.custom_categories
        .filter(cat => cat.icon === '__builtin__')
        .map(cat => [cat.categoryName, cat.activities])
    );
    const fullyCustom = data.custom_categories.filter(cat => cat.icon !== '__builtin__');

    // Write all built-ins first in DEFAULT_ACTIVITIES order (so AddCategory seeding
    // is a no-op and the order is always correct), then fully custom categories.
    const restored = [
      ...DEFAULT_ACTIVITIES.map(d => ({
        categoryName: d.categoryName,
        icon: d.icon,
        activities: [...d.activities, ...(builtinExtras.get(d.categoryName) || [])],
      })),
      ...fullyCustom,
    ];
    await AsyncStorage.setItem('CustomCategories', JSON.stringify(restored));
  }
  if (data.choice_board !== null)
    await AsyncStorage.setItem('ChoiceBoard', JSON.stringify(data.choice_board));
};
