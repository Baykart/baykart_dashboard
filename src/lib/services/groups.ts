import { supabase } from '../supabase/client'

export interface CommunityChannel {
  id: string  // Changed from number to string as per schema (UUID)
  name: string
  description: string
  logo_url?: string
  member_count?: { count: number }
  members?: ChannelMember[]
  created_at: string
  updated_at: string
}

interface ChannelMember {
  id: string  // Changed from number to string as per schema (UUID)
  user_id: string
  channel_id: string  // Changed from number to string
  user: {
    id: string
    full_name: string
    email: string
    role: string
  }
}

interface CreateChannelInput {
  name: string
  description: string
  logo_url?: string
}

interface AddChannelMemberInput {
  channel_id: string  // Changed from number to string
  user_id: string
}

export const communityService = {
  async getChannels() {
    const { data, error } = await supabase
      .from('community_channels')
      .select(`
        *,
        member_count:channel_members(count)
      `)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  async getChannelById(id: string) {  // Changed from number to string
    const { data: channel, error: channelError } = await supabase
      .from('community_channels')
      .select(`
        *,
        channel_members(
          id,
          users(
            id,
            full_name,
            email,
            role
          )
        )
      `)
      .eq('id', id)
      .single()

    if (channelError) throw channelError

    // Transform the nested data structure
    return {
      ...channel,
      members: channel.channel_members.map((m: any) => ({
        ...m,
        user: m.users[0] // Flatten the user array to single object
      }))
    }
  },

  async createChannel(input: CreateChannelInput) {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('community_channels')
      .insert({
        ...input
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateChannel(id: string, input: Partial<CreateChannelInput>) {  // Changed from number to string
    const { data, error } = await supabase
      .from('community_channels')
      .update(input)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async deleteChannel(id: string) {  // Changed from number to string
    const { error } = await supabase
      .from('community_channels')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  async addChannelMember(input: AddChannelMemberInput) {
    const { data, error } = await supabase
      .from('channel_members')
      .insert(input)
      .select(`
        id,
        users(
          id,
          full_name,
          email,
          role
        )
      `)
      .single()

    if (error) throw error
    return data
  },

  async removeChannelMember(channelId: string, userId: string) {  // Changed from number to string
    const { error } = await supabase
      .from('channel_members')
      .delete()
      .eq('channel_id', channelId)
      .eq('user_id', userId)

    if (error) throw error
  },

  async getUsers() {
    const { data, error } = await supabase
      .from('users')
      .select('id, full_name, email, role')

    if (error) throw error
    return { data }
  },
} 