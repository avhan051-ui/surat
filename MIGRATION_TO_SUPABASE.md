# Migration to Supabase - Documentation

## Overview

This document explains how to migrate the application from using a local PostgreSQL database to Supabase.

## Prerequisites

1. A Supabase account
2. A Supabase project created
3. Supabase project URL and API keys

## Migration Steps

### 1. Set Up Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and create an account
2. Create a new project
3. Note down your project's:
   - Project URL
   - API Key (anon and service_role)

### 2. Configure Environment Variables

Update your `.env.local` file with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Create Database Tables

Run the SQL migration script in your Supabase dashboard:

```
supabase/migrations/001_initial_schema.sql
```

This will create all the necessary tables:
- users
- surat
- surat_masuk
- categories

### 4. Update Dependencies

Install the Supabase JavaScript client:

```bash
npm install @supabase/supabase-js
```

### 5. Code Changes

The migration automatically updates:
- Database connection from PostgreSQL to Supabase
- All database queries to use Supabase client
- API routes to use Supabase utilities
- Context provider to fetch data from Supabase

## Supabase Features Used

1. **Database**: PostgreSQL-compatible database hosted on Supabase
2. **Authentication**: Built-in auth (can be extended for user login)
3. **Realtime**: Realtime subscriptions (optional)
4. **Storage**: File storage (for uploaded documents)

## Benefits of Migration

1. **Managed Service**: No need to maintain your own PostgreSQL server
2. **Scalability**: Automatically scales with your application
3. **Built-in Features**: Authentication, real-time subscriptions, file storage
4. **Global CDN**: Supabase edge network for better performance
5. **Dashboard**: Easy-to-use dashboard for database management

## Testing the Migration

1. Update your environment variables with your Supabase credentials
2. Run the development server:
   ```bash
   npm run dev
   ```
3. Access your application and verify all functionality works as expected

## Troubleshooting

### Common Issues

1. **Environment Variables Not Set**:
   - Ensure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set in your `.env.local` file

2. **Database Connection Errors**:
   - Verify your Supabase credentials are correct
   - Check that your Supabase project is active

3. **Missing Tables**:
   - Run the SQL migration script in your Supabase dashboard

### Getting Help

If you encounter issues:
1. Check the browser console for JavaScript errors
2. Check the terminal for server-side errors
3. Verify your Supabase dashboard for any connection issues
4. Refer to the [Supabase documentation](https://supabase.com/docs)