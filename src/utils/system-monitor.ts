import { supabase } from '@/lib/supabase/client'
import os from 'os';

export async function updateSystemStats() {
  // Calculate server load based on CPU usage
  const cpus = os.cpus();
  const load = cpus.reduce((acc, cpu) => {
    const total = Object.values(cpu.times).reduce((a, b) => a + b);
    const idle = cpu.times.idle;
    return acc + ((total - idle) / total) * 100;
  }, 0) / cpus.length;

  // Get active users (users who were active in the last 5 minutes)
  const fiveMinutesAgo = new Date();
  fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5);
  
  const { count } = await supabase
    .from('farmers')
    .select('*', { count: 'exact', head: true })
    .gt('last_active_at', fiveMinutesAgo.toISOString());

  // Update system stats
  await supabase
    .from('system_stats')
    .update({
      server_load: Math.round(load),
      active_users: count || 0,
      last_update: new Date().toISOString()
    })
    .eq('id', (await supabase.from('system_stats').select('id').single()).data?.id);
}

// Function to log activity
export async function logActivity(type: string, description: string, userId?: string) {
  await supabase
    .from('activity_log')
    .insert({
      type,
      description,
      user_id: userId
    });
}

// Function to increment app downloads
export async function incrementAppDownloads() {
  await supabase.rpc('increment_downloads');
} 