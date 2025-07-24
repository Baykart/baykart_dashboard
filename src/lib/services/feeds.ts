import { supabase } from '@/lib/supabase';
import { Feed, CreateFeedInput, AgriServiceCategory } from '@/types/feeds'

export async function getFeeds(): Promise<Feed[]> {
  const { data, error } = await supabase
    .from('feeds')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function createFeed(feed: CreateFeedInput): Promise<Feed> {
  const { data, error } = await supabase
    .from('feeds')
    .insert([feed])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateFeed(id: number, feed: CreateFeedInput): Promise<Feed> {
  const { data, error } = await supabase
    .from('feeds')
    .update(feed)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteFeed(id: number): Promise<void> {
  const { error } = await supabase
    .from('feeds')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function getAgriServiceCategories(): Promise<AgriServiceCategory[]> {
  const { data, error } = await supabase
    .from('agri_service_categories')
    .select('*')
    .order('name', { ascending: true })

  if (error) throw error
  return data
}

export async function createAgriServiceCategory(category: Omit<AgriServiceCategory, 'id'>): Promise<AgriServiceCategory> {
  const { data, error } = await supabase
    .from('agri_service_categories')
    .insert([category])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateAgriServiceCategory(
  id: number,
  category: Partial<Omit<AgriServiceCategory, 'id'>>
): Promise<AgriServiceCategory> {
  const { data, error } = await supabase
    .from('agri_service_categories')
    .update(category)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteAgriServiceCategory(id: number): Promise<void> {
  const { error } = await supabase
    .from('agri_service_categories')
    .delete()
    .eq('id', id)

  if (error) throw error
} 