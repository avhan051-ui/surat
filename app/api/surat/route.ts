import { NextRequest, NextResponse } from 'next/server';
import { getSurat, createSurat, updateSuratById, deleteSuratById } from '@/lib/db-utils';
import { Surat } from '@/app/context/AppContext';
import cache from '@/lib/cache-utils';
import { invalidateCacheByType } from '@/lib/cache-management-utils';

export async function GET() {
  try {
    // Check if we have a cached version
    const cachedData = cache.get('suratData');
    if (cachedData) {
      return NextResponse.json(cachedData);
    }
    
    // Fetch from database if not cached
    const surat = await getSurat();
    
    // Cache the result for 1 minute (60 seconds) for better responsiveness
    cache.set('suratData', surat, 60);
    
    return NextResponse.json(surat);
  } catch (error) {
    console.error('Error fetching surat:', error);
    return NextResponse.json({ error: 'Failed to fetch surat' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const suratData: Surat = await request.json();
    console.log('Received surat data:', suratData);
    
    const newSurat = await createSurat(suratData);
    console.log('Created surat:', newSurat);
    
    // Invalidate cache after creating new surat
    invalidateCacheByType('surat');
    
    return NextResponse.json(newSurat, { status: 201 });
  } catch (error) {
    console.error('Error creating surat:', error);
    // Return more detailed error information
    if (error instanceof Error) {
      return NextResponse.json({ 
        error: 'Failed to create surat', 
        details: error.message,
        stack: error.stack
      }, { status: 500 });
    }
    return NextResponse.json({ error: 'Failed to create surat' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, ...suratData }: Surat & { id: number } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'Surat ID is required' }, { status: 400 });
    }
    
    const updatedSurat = await updateSuratById(id, suratData);
    
    // Invalidate cache after updating surat
    invalidateCacheByType('surat');
    
    return NextResponse.json(updatedSurat);
  } catch (error) {
    console.error('Error updating surat:', error);
    return NextResponse.json({ error: 'Failed to update surat' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Surat ID is required' }, { status: 400 });
    }
    
    await deleteSuratById(parseInt(id));
    
    // Invalidate cache after deleting surat
    invalidateCacheByType('surat');
    
    return NextResponse.json({ message: 'Surat deleted successfully' });
  } catch (error) {
    console.error('Error deleting surat:', error);
    return NextResponse.json({ error: 'Failed to delete surat' }, { status: 500 });
  }
}