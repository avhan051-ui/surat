import { NextResponse } from 'next/server';
import { getCategories } from '@/lib/db-utils';
import cache from '@/lib/cache-utils';
import { invalidateCacheByType } from '@/lib/cache-management-utils';

export async function GET() {
  try {
    // Check if we have a cached version
    const cachedData = cache.get('categoriesData');
    if (cachedData) {
      return NextResponse.json(cachedData);
    }
    
    // Fetch from database if not cached
    const categories = await getCategories();
    
    // Cache the result for 5 minutes (300 seconds)
    cache.set('categoriesData', categories, 300);
    
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}