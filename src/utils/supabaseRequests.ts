import { createClerkSupabaseClient } from './supabaseClient';

export const getUser = async ({ userID }: { userID: string }) => {
  const supabase = await createClerkSupabaseClient();

  const { data, error } = await supabase
    .from('user')
    .select('*')
    .eq('clerk_user_id', userID)
    .single();

  if (error) {
    throw new Error(`Error fetching user: ${error.message}`);
  }

  return data;
};
