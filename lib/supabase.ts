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

// Feedback functions
type FeedbackData = Database['public']['Tables']['feedback']['Insert']

export const submitFeedback = async (feedbackData: FeedbackData) => {
  const { error } = await supabase
    .from('feedback')
    .insert([feedbackData]);

  if (error) {
    throw error;
  }
}

export const getFeedback = async () => {
  const { data, error } = await supabase
    .from('feedback')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data;
}

// Monastery feedback functions
type MonasteryFeedbackData = Database['public']['Tables']['monastery_feedback']['Insert']

export const submitMonasteryFeedback = async (feedbackData: MonasteryFeedbackData) => {
  const { error } = await supabase
    .from('monastery_feedback')
    .insert([feedbackData]);

  if (error) {
    throw error;
  }
}

export const getMonasteryFeedback = async () => {
  const { data, error } = await supabase
    .from('monastery_feedback')
    .select(`
      *,
      monasteries (
        name,
        address
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data;
}

export const updateMonasteryFeedbackNotes = async (
  id: string, 
  adminNotes: string
) => {
  const { error } = await supabase
    .from('monastery_feedback')
    .update({ 
      admin_notes: adminNotes
    })
    .eq('id', id);

  if (error) {
    throw error;
  }
}

export const clearMonasteryFeedback = async (id: string) => {
  const { error } = await supabase
    .from('monastery_feedback')
    .update({ 
      admin_status: 'cleared',
      reviewed_at: new Date().toISOString()
    })
    .eq('id', id);

  if (error) {
    throw error;
  }
}