import { NextRequest, NextResponse } from 'next/server';
import { getKategoriData, updateKategoriData } from '@/lib/db-utils';
import cache from '@/lib/cache-utils';
import { invalidateCacheByType } from '@/lib/cache-management-utils';

// GET /api/kategori - Get all kategori data
export async function GET(request: NextRequest) {
  try {
    // Check if we have a cached version
    const cachedData = cache.get('kategoriData');
    if (cachedData) {
      return NextResponse.json(cachedData);
    }
    
    // Fetch from database if not cached
    const kategoriData = await getKategoriData();
    
    // Cache the result for 5 minutes (300 seconds)
    cache.set('kategoriData', kategoriData, 300);
    
    return NextResponse.json(kategoriData);
  } catch (error) {
    console.error('Error fetching kategori data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch kategori data' },
      { status: 500 }
    );
  }
}

// PUT /api/kategori - Update kategori data
export async function PUT(request: NextRequest) {
  try {
    const kategoriData = await request.json();
    
    // Validate the kategori data
    if (!kategoriData || typeof kategoriData !== 'object') {
      return NextResponse.json(
        { error: 'Invalid kategori data format' },
        { status: 400 }
      );
    }
    
    // Update kategori data in database
    await updateKategoriData(kategoriData);
    
    // Invalidate cache after update
    invalidateCacheByType('kategori');
    
    return NextResponse.json({ 
      message: 'Kategori data updated successfully',
      kategoriData 
    });
  } catch (error) {
    console.error('Error updating kategori data:', error);
    return NextResponse.json(
      { error: 'Failed to update kategori data' },
      { status: 500 }
    );
  }
}