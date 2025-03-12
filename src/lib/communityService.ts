import { supabase } from './supabase';
import { 
  CommunityChannel, 
  ChannelMember, 
  Post, 
  PostInteraction,
  UserFollow
} from '../types/supabase';

export interface ChannelInput {
  name: string;
  description?: string;
  logo_url?: string;
}

export interface PostInput {
  user_id: string;
  channel_id: string;
  content?: string;
  title?: string;
  location?: string;
}

export interface PostInteractionInput {
  post_id: string;
  user_id: string;
  interaction_type: 'like' | 'share' | 'comment';
  comment_text?: string;
}

// CHANNELS

// Get all community channels
export const getChannels = async (): Promise<CommunityChannel[]> => {
  const { data, error } = await supabase
    .from('community_channels')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching community channels:', error);
    throw error;
  }

  return data || [];
};

// Get a single channel by ID
export const getChannelById = async (id: string): Promise<CommunityChannel | null> => {
  const { data, error } = await supabase
    .from('community_channels')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Error fetching channel with ID ${id}:`, error);
    throw error;
  }

  return data;
};

// Create a new channel
export const createChannel = async (channel: ChannelInput, logoFile?: File): Promise<CommunityChannel> => {
  let logoUrl = channel.logo_url;

  // Upload logo if provided
  if (logoFile) {
    try {
      const fileExt = logoFile.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('post_media')
        .upload(filePath, logoFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Error uploading logo:', uploadError);
        throw uploadError;
      }

      const { data: publicUrlData } = supabase.storage
        .from('post_media')
        .getPublicUrl(filePath);

      logoUrl = publicUrlData.publicUrl;
    } catch (error) {
      console.error('Error handling logo upload:', error);
      console.warn('Continuing with channel creation without logo.');
    }
  }

  // Create channel with logo URL (or null if upload failed)
  const { data, error } = await supabase
    .from('community_channels')
    .insert([{ ...channel, logo_url: logoUrl, member_count: 0 }])
    .select()
    .single();

  if (error) {
    console.error('Error creating channel:', error);
    throw error;
  }

  return data;
};

// Update an existing channel
export const updateChannel = async (id: string, channel: Partial<ChannelInput>, logoFile?: File): Promise<CommunityChannel> => {
  let updates: any = { ...channel };

  // Upload new logo if provided
  if (logoFile) {
    try {
      const fileExt = logoFile.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('post_media')
        .upload(filePath, logoFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Error uploading logo:', uploadError);
        throw uploadError;
      }

      const { data: publicUrlData } = supabase.storage
        .from('post_media')
        .getPublicUrl(filePath);

      updates.logo_url = publicUrlData.publicUrl;
    } catch (error) {
      console.error('Error handling logo upload:', error);
      console.warn('Continuing with channel update without new logo.');
    }
  }

  // Update channel with new data
  const { data, error } = await supabase
    .from('community_channels')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating channel with ID ${id}:`, error);
    throw error;
  }

  return data;
};

// Delete a channel
export const deleteChannel = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('community_channels')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Error deleting channel with ID ${id}:`, error);
    throw error;
  }
};

// CHANNEL MEMBERSHIP

// Join a channel
export const joinChannel = async (channelId: string, userId: string): Promise<void> => {
  // First check if already a member
  const { data: existingMembership } = await supabase
    .from('channel_members')
    .select('id')
    .eq('channel_id', channelId)
    .eq('user_id', userId)
    .single();

  if (existingMembership) {
    // Already a member, no need to join again
    return;
  }

  // Add membership
  const { error } = await supabase
    .from('channel_members')
    .insert([{
      channel_id: channelId,
      user_id: userId
    }]);

  if (error) {
    console.error(`Error joining channel ${channelId}:`, error);
    throw error;
  }

  // Increment member count
  await supabase.rpc('increment_channel_member_count', {
    p_channel_id: channelId
  });
};

// Leave a channel
export const leaveChannel = async (channelId: string, userId: string): Promise<void> => {
  const { error } = await supabase
    .from('channel_members')
    .delete()
    .eq('channel_id', channelId)
    .eq('user_id', userId);

  if (error) {
    console.error(`Error leaving channel ${channelId}:`, error);
    throw error;
  }

  // Decrement member count
  await supabase.rpc('decrement_channel_member_count', {
    p_channel_id: channelId
  });
};

// Get channels a user is a member of
export const getUserChannels = async (userId: string): Promise<CommunityChannel[]> => {
  const { data, error } = await supabase
    .from('channel_members')
    .select('channel_id')
    .eq('user_id', userId);

  if (error) {
    console.error(`Error fetching channel memberships for user ${userId}:`, error);
    throw error;
  }

  if (!data || data.length === 0) {
    return [];
  }

  // Get the channel IDs
  const channelIds = data.map(item => item.channel_id);

  // Fetch the actual channel data
  const { data: channelsData, error: channelsError } = await supabase
    .from('community_channels')
    .select('*')
    .in('id', channelIds);

  if (channelsError) {
    console.error(`Error fetching channels for user ${userId}:`, channelsError);
    throw channelsError;
  }

  return channelsData || [];
};

// Get members of a channel
export const getChannelMembers = async (channelId: string): Promise<any[]> => {
  const { data, error } = await supabase
    .from('channel_members')
    .select(`
      user_id,
      joined_at,
      users(full_name, profile_image_url)
    `)
    .eq('channel_id', channelId);

  if (error) {
    console.error(`Error fetching members for channel ${channelId}:`, error);
    throw error;
  }

  return data || [];
};

// POSTS

// Get posts for a channel
export const getChannelPosts = async (channelId: string): Promise<Post[]> => {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('channel_id', channelId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error(`Error fetching posts for channel ${channelId}:`, error);
    throw error;
  }

  return data || [];
};

// Get posts by a user
export const getUserPosts = async (userId: string): Promise<Post[]> => {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error(`Error fetching posts for user ${userId}:`, error);
    throw error;
  }

  return data || [];
};

// Get a single post by ID
export const getPostById = async (id: string): Promise<Post | null> => {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Error fetching post with ID ${id}:`, error);
    throw error;
  }

  return data;
};

// Create a new post
export const createPost = async (post: PostInput, mediaFile?: File): Promise<Post> => {
  let mediaUrl = null;
  let isVideo = false;

  // Upload media if provided
  if (mediaFile) {
    try {
      const fileExt = mediaFile.name.split('.').pop()?.toLowerCase();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `${fileName}`;

      // Check if it's a video or image
      isVideo = ['mp4', 'mov', 'avi', 'webm'].includes(fileExt || '');

      const { error: uploadError } = await supabase.storage
        .from('post_media')
        .upload(filePath, mediaFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Error uploading media:', uploadError);
        throw uploadError;
      }

      const { data: publicUrlData } = supabase.storage
        .from('post_media')
        .getPublicUrl(filePath);

      mediaUrl = publicUrlData.publicUrl;
    } catch (error) {
      console.error('Error handling media upload:', error);
      console.warn('Continuing with post creation without media.');
    }
  }

  // Create post with media URL (or null if upload failed)
  const postData: any = { ...post };
  
  if (mediaUrl) {
    if (isVideo) {
      postData.video_url = mediaUrl;
    } else {
      postData.image_url = mediaUrl;
    }
  }

  const { data, error } = await supabase
    .from('posts')
    .insert([postData])
    .select()
    .single();

  if (error) {
    console.error('Error creating post:', error);
    throw error;
  }

  return data;
};

// Update an existing post
export const updatePost = async (id: string, post: Partial<PostInput>): Promise<Post> => {
  const { data, error } = await supabase
    .from('posts')
    .update(post)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating post with ID ${id}:`, error);
    throw error;
  }

  return data;
};

// Delete a post
export const deletePost = async (id: string): Promise<void> => {
  // First get the post to find media URLs
  const post = await getPostById(id);
  
  // Delete the record
  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Error deleting post with ID ${id}:`, error);
    throw error;
  }

  // If there was media and it was stored in our bucket, try to delete it
  const mediaUrl = post?.image_url || post?.video_url;
  if (mediaUrl) {
    try {
      const mediaPath = mediaUrl.split('/').pop();
      if (mediaPath) {
        const { error: storageError } = await supabase.storage
          .from('post_media')
          .remove([mediaPath]);
          
        if (storageError) {
          // Just log the error but don't throw - the post record is already deleted
          console.error('Error deleting media:', storageError);
        }
      }
    } catch (err) {
      console.error('Error parsing media URL for deletion:', err);
    }
  }
};

// POST INTERACTIONS

// Get interactions for a post
export const getPostInteractions = async (postId: string): Promise<PostInteraction[]> => {
  const { data, error } = await supabase
    .from('post_interactions')
    .select('*')
    .eq('post_id', postId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error(`Error fetching interactions for post ${postId}:`, error);
    throw error;
  }

  return data || [];
};

// Get comments for a post
export const getPostComments = async (postId: string): Promise<PostInteraction[]> => {
  const { data, error } = await supabase
    .from('post_interactions')
    .select('*')
    .eq('post_id', postId)
    .eq('interaction_type', 'comment')
    .order('created_at', { ascending: true });

  if (error) {
    console.error(`Error fetching comments for post ${postId}:`, error);
    throw error;
  }

  return data || [];
};

// Add an interaction to a post
export const addPostInteraction = async (interaction: PostInteractionInput): Promise<PostInteraction> => {
  const { data, error } = await supabase
    .from('post_interactions')
    .insert([interaction])
    .select()
    .single();

  if (error) {
    console.error('Error adding post interaction:', error);
    throw error;
  }

  return data;
};

// Delete an interaction
export const deletePostInteraction = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('post_interactions')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Error deleting interaction with ID ${id}:`, error);
    throw error;
  }
};

// USER FOLLOWS

// Follow a user
export const followUser = async (followerId: string, followedId: string): Promise<void> => {
  const { error } = await supabase
    .from('user_follows')
    .insert([{
      follower_id: followerId,
      followed_id: followedId
    }]);

  if (error) {
    console.error(`Error following user ${followedId}:`, error);
    throw error;
  }
};

// Unfollow a user
export const unfollowUser = async (followerId: string, followedId: string): Promise<void> => {
  const { error } = await supabase
    .from('user_follows')
    .delete()
    .eq('follower_id', followerId)
    .eq('followed_id', followedId);

  if (error) {
    console.error(`Error unfollowing user ${followedId}:`, error);
    throw error;
  }
};

// Get users followed by a user
export const getFollowing = async (userId: string): Promise<any[]> => {
  const { data, error } = await supabase
    .from('user_follows')
    .select(`
      followed_id,
      users!user_follows_followed_id_fkey(full_name, profile_image_url)
    `)
    .eq('follower_id', userId);

  if (error) {
    console.error(`Error fetching following for user ${userId}:`, error);
    throw error;
  }

  return data || [];
};

// Get followers of a user
export const getFollowers = async (userId: string): Promise<any[]> => {
  const { data, error } = await supabase
    .from('user_follows')
    .select(`
      follower_id,
      users!user_follows_follower_id_fkey(full_name, profile_image_url)
    `)
    .eq('followed_id', userId);

  if (error) {
    console.error(`Error fetching followers for user ${userId}:`, error);
    throw error;
  }

  return data || [];
}; 