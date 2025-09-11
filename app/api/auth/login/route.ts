import { NextRequest, NextResponse } from 'next/server';
import { getUserByNip } from '@/lib/db-utils';
import bcrypt from 'bcrypt';

export async function POST(request: NextRequest) {
  try {
    const { nip, password } = await request.json();
    
    // Validate input
    if (!nip || !password) {
      return NextResponse.json(
        { error: 'NIP dan password harus diisi!' }, 
        { status: 400 }
      );
    }
    
    // Get user from database
    const user = await getUserByNip(nip);
    
    if (!user) {
      return NextResponse.json(
        { error: 'NIP tidak ditemukan!' }, 
        { status: 401 }
      );
    }
    
    // Check password (using bcrypt for secure comparison)
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Password salah!' }, 
        { status: 401 }
      );
    }
    
    // Update last login
    const now = new Date().toISOString();
    const updatedUser = {
      ...user,
      lastLogin: now
    };
    
    // Update user in database
    try {
      const updateResponse = await fetch(`${request.nextUrl.origin}/api/users`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: user.id,
          ...updatedUser
        }),
      });
      
      if (updateResponse.ok) {
        const updatedUserFromApi = await updateResponse.json();
        return NextResponse.json({ user: updatedUserFromApi });
      } else {
        // If update fails, still return the original user
        console.error('Failed to update user last login');
        return NextResponse.json({ user });
      }
    } catch (updateError) {
      console.error('Error updating user last login:', updateError);
      // If update fails, still return the original user
      return NextResponse.json({ user });
    }
  } catch (error) {
    console.error('Error during login:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat login!' }, 
      { status: 500 }
    );
  }
}