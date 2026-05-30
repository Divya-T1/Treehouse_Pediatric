// Supabase operations for the activity share-code feature.
// Requires the shared_items table — see shared_items_migration.sql.
import { supabase } from './supabase';

const SHARE_TABLE = 'shared_items';
const MAX_PAYLOAD_CHARS = 2 * 1024 * 1024; // 2 MB
// Omit visually ambiguous characters (0, O, I, 1) to make codes easier to transcribe.
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const CODE_LENGTH = 8;
const EXPIRY_HOURS = 24;

function generateCode() {
  let code = '';
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  }
  return code;
}

// Creates a share record in Supabase and returns the 8-char code.
// Retries up to 5 times on the rare chance of a code collision (unique_violation).
export const createShare = async (userId, activities) => {
  const payload = JSON.stringify(activities);
  if (payload.length > MAX_PAYLOAD_CHARS) {
    throw new Error('payload_too_large');
  }

  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateCode();
    const expiresAt = new Date(Date.now() + EXPIRY_HOURS * 60 * 60 * 1000).toISOString();

    const { error } = await supabase.from(SHARE_TABLE).insert({
      share_code: code,
      shared_by: userId,
      item_type: 'activities',
      data: activities,
      expires_at: expiresAt,
    });

    if (!error) return code;
    if (error.code !== '23505') throw error; // not a collision — bail
  }
  throw new Error('Could not generate a unique share code. Please try again.');
};

// Fetches a shared item by code. Returns null if not found or expired.
// Expiry is enforced server-side via the .gt() filter.
export const importShare = async (shareCode) => {
  const { data, error } = await supabase
    .from(SHARE_TABLE)
    .select('data, item_type, expires_at')
    .eq('share_code', shareCode.toUpperCase().trim())
    .gt('expires_at', new Date().toISOString())
    .single();

  if (error || !data) return null;
  return data;
};
