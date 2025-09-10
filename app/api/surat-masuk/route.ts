import { NextRequest, NextResponse } from 'next/server';
import { getSuratMasuk, createSuratMasuk, updateSuratMasukById, deleteSuratMasukById } from '@/lib/db-utils';
import { SuratMasuk } from '@/app/context/AppContext';
import cache from '@/lib/cache-utils';
import { invalidateCacheByType } from '@/lib/cache-management-utils';

export async function GET() {
  try {
    // Check if we have a cached version
    const cachedData = cache.get('suratMasukData');
    if (cachedData) {
      return NextResponse.json(cachedData);
    }
    
    // Fetch from database if not cached
    const suratMasuk = await getSuratMasuk();
    
    // Cache the result for 1 minute (60 seconds) for better responsiveness
    cache.set('suratMasukData', suratMasuk, 60);
    
    return NextResponse.json(suratMasuk);
  } catch (error) {
    console.error('Error fetching surat masuk:', error);
    return NextResponse.json({ error: 'Failed to fetch surat masuk' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const suratMasukData: Omit<SuratMasuk, 'id' | 'createdAt'> = await request.json();
    console.log('Received surat masuk data:', suratMasukData);
    
    const newSuratMasuk = await createSuratMasuk(suratMasukData);
    console.log('Created surat masuk:', newSuratMasuk);
    
    // Invalidate cache after creating new surat masuk
    invalidateCacheByType('suratMasuk');
    
    return NextResponse.json(newSuratMasuk, { status: 201 });
  } catch (error) {
    console.error('Error creating surat masuk:', error);
    // Return more detailed error information
    if (error instanceof Error) {
      return NextResponse.json({ 
        error: 'Failed to create surat masuk', 
        details: error.message,
        stack: error.stack
      }, { status: 500 });
    }
    return NextResponse.json({ error: 'Failed to create surat masuk' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, ...suratMasukData }: SuratMasuk & { id: number } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'Surat Masuk ID is required' }, { status: 400 });
    }
    
    const updatedSuratMasuk = await updateSuratMasukById(id, suratMasukData);
    
    // Invalidate cache after updating surat masuk
    invalidateCacheByType('suratMasuk');
    
    return NextResponse.json(updatedSuratMasuk);
  } catch (error) {
    console.error('Error updating surat masuk:', error);
    return NextResponse.json({ error: 'Failed to update surat masuk' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Surat Masuk ID is required' }, { status: 400 });
    }
    
    await deleteSuratMasukById(parseInt(id));
    
    // Invalidate cache after deleting surat masuk
    invalidateCacheByType('suratMasuk');
    
    return NextResponse.json({ message: 'Surat masuk deleted successfully' });
  } catch (error) {
    console.error('Error deleting surat masuk:', error);
    return NextResponse.json({ error: 'Failed to delete surat masuk' }, { status: 500 });
  }
}