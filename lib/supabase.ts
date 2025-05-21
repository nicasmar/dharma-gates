import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey) 

export const getMonasteries = async () => {
  let query = supabase
    .from('monasteries')
    .select('*');

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data;
}

export const updateMonasteryPendingStatus = async (id: string, pending: boolean) => {
  const { error } = await supabase
    .from('monasteries')
    .update({ pending })
    .eq('id', id);

  if (error) {
    throw error;
  }
}

export const deleteMonastery = async (id: string) => {
  const { error } = await supabase
    .from('monasteries')
    .delete()
    .eq('id', id);

  if (error) {
    throw error;
  }
}

export const submitNewCenter = async (centerData: any) => {
  const { error } = await supabase
    .from('monasteries')
    .insert([{ ...centerData, pending: true }]);

  if (error) {
    throw error;
  }
}