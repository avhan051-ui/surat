import { NextRequest, NextResponse } from 'next/server';
import { getKategoriData } from '@/lib/db-utils';
import cache from '@/lib/cache-utils';
import { invalidateCacheByType } from '@/lib/cache-management-utils';

export async function GET() {
  try {
    // Check if we have a cached version
    const cachedData = cache.get('kategoriData');
    if (cachedData) {
      return NextResponse.json(cachedData);
    }
    
    // Fetch from database if not cached
    const kategori = await getKategoriData();
    
    // Cache the result for 1 minute (60 seconds) for better responsiveness
    cache.set('kategoriData', kategori, 60);
    
    return NextResponse.json(kategori);
  } catch (error) {
    console.error('Error fetching kategori:', error);
    return NextResponse.json({ error: 'Failed to fetch kategori' }, { status: 500 });
  }
}