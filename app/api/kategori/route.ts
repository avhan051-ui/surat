import { NextRequest, NextResponse } from 'next/server';
import { getKategoriData, updateKategoriData } from '@/lib/db-utils';

// GET /api/kategori - Get all kategori data
export async function GET() {
  try {
    const kategoriData = await getKategoriData();
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