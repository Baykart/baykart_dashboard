import { NextResponse } from 'next/server';
import { updateSystemStats } from '@/utils/system-monitor';

// This route should be called by a cron job every minute
export async function GET(request: Request) {
  try {
    // Verify cron secret if needed
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    await updateSystemStats();
    return new NextResponse('OK', { status: 200 });
  } catch (error) {
    console.error('Error updating system stats:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 