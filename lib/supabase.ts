import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey) 

type CenterData = Database['public']['Tables']['monasteries']['Insert']

export const getMonasteries = async () => {
  const query = supabase
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

export const updateMonastery = async (id: string, centerData: Partial<CenterData>) => {
  const { data, error } = await supabase
    .from('monasteries')
    .update(centerData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export const submitNewCenter = async (centerData: CenterData) => {
  const { error } = await supabase
    .from('monasteries')
    .insert([{ ...centerData, pending: true }]);

  if (error) {
    throw error;
  }
}