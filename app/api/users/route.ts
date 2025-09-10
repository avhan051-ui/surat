import { NextRequest, NextResponse } from 'next/server';
import { getUsers, getUserByNip, createUser, updateUser, deleteUser } from '@/lib/db-utils';
import { User } from '@/app/context/AppContext';
import cache from '@/lib/cache-utils';
import { invalidateCacheByType } from '@/lib/cache-management-utils';

export async function GET() {
  try {
    // Check if we have a cached version
    const cachedData = cache.get('usersData');
    if (cachedData) {
      return NextResponse.json(cachedData);
    }
    
    // Fetch from database if not cached
    const users = await getUsers();
    
    // Cache the result for 5 minutes (300 seconds)
    cache.set('usersData', users, 300);
    
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userData: User = await request.json();
    
    // Validasi data wajib
    if (!userData.nama || !userData.nip || !userData.pangkatGol || !userData.jabatan || !userData.role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Validasi format NIP
    // if (!/^\d{18}$/.test(userData.nip)) {
    if (!userData.nip) {
      // return NextResponse.json({ error: 'NIP must be 18 digits' }, { status: 400 });
      return NextResponse.json({ error: 'NIP Harus di isi' }, { status: 400 });

    }
    
    // Validasi format email jika diisi
    if (userData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }
    
    // Tangani lastLogin null
    if (userData.lastLogin === '-') {
      userData.lastLogin = null;
    }
    
    const newUser = await createUser(userData);
    
    // Invalidate cache after creating new user
    invalidateCacheByType('users');
    
    return NextResponse.json(newUser, { status: 201 });
  } catch (error: any) {
    console.error('Error creating user:', error);
    
    // Tangani error duplikasi
    if (error.code === '23505') { // PostgreSQL duplicate key error
      if (error.detail?.includes('nip')) {
        return NextResponse.json({ error: 'NIP already exists' }, { status: 400 });
      } else if (error.detail?.includes('email')) {
        return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
      }
    }
    
    return NextResponse.json({ error: error.message || 'Failed to create user' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, ...userData }: User & { id: number } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    
    // Validasi data wajib
    if (!userData.nama || !userData.nip || !userData.pangkatGol || !userData.jabatan || !userData.role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Validasi format NIP
    // if (!/^\d{18}$/.test(userData.nip)) {
    if (!userData.nip) {
      // return NextResponse.json({ error: 'NIP must be 18 digits' }, { status: 400 });
      return NextResponse.json({ error: 'NIP Harus Di isi' }, { status: 400 });
    }
    
    // Validasi format email jika diisi
    if (userData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }
    
    const updatedUser = await updateUser(id, userData);
    
    // Invalidate cache after updating user
    invalidateCacheByType('users');
    
    return NextResponse.json(updatedUser);
  } catch (error: any) {
    console.error('Error updating user:', error);
    
    // Tangani error duplikasi
    if (error.code === '23505') { // PostgreSQL duplicate key error
      if (error.detail?.includes('nip')) {
        return NextResponse.json({ error: 'NIP already exists' }, { status: 400 });
      } else if (error.detail?.includes('email')) {
        return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
      }
    }
    
    return NextResponse.json({ error: error.message || 'Failed to update user' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    
    await deleteUser(parseInt(id));
    
    // Invalidate cache after deleting user
    invalidateCacheByType('users');
    
    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}