// Utility functions for prefetching data
// This file contains functions to prefetch data when hovering over menu items

// Prefetch surat data
export const prefetchSuratData = async () => {
  try {
    // Check if data is already in cache
    const cacheKey = 'prefetch_suratData';
    const cachedData = sessionStorage.getItem(cacheKey);
    
    if (cachedData) {
      const { data, timestamp } = JSON.parse(cachedData);
      const now = new Date().getTime();
      // Use cached data if it's less than 30 seconds old
      if (now - timestamp < 30000) {
        return data;
      }
    }
    
    // Fetch fresh data
    const response = await fetch('/api/surat');
    if (response.ok) {
      const data = await response.json();
      // Cache the data in sessionStorage
      sessionStorage.setItem(cacheKey, JSON.stringify({
        data,
        timestamp: new Date().getTime()
      }));
      return data;
    }
  } catch (error) {
    console.error('Error prefetching surat data:', error);
  }
  return null;
};

// Prefetch users data
export const prefetchUsersData = async () => {
  try {
    // Check if data is already in cache
    const cacheKey = 'prefetch_usersData';
    const cachedData = sessionStorage.getItem(cacheKey);
    
    if (cachedData) {
      const { data, timestamp } = JSON.parse(cachedData);
      const now = new Date().getTime();
      // Use cached data if it's less than 30 seconds old
      if (now - timestamp < 30000) {
        return data;
      }
    }
    
    // Fetch fresh data
    const response = await fetch('/api/users');
    if (response.ok) {
      const data = await response.json();
      // Cache the data in sessionStorage
      sessionStorage.setItem(cacheKey, JSON.stringify({
        data,
        timestamp: new Date().getTime()
      }));
      return data;
    }
  } catch (error) {
    console.error('Error prefetching users data:', error);
  }
  return null;
};

// Prefetch kategori data
export const prefetchKategoriData = async () => {
  try {
    // Check if data is already in cache
    const cacheKey = 'prefetch_kategoriData';
    const cachedData = sessionStorage.getItem(cacheKey);
    
    if (cachedData) {
      const { data, timestamp } = JSON.parse(cachedData);
      const now = new Date().getTime();
      // Use cached data if it's less than 30 seconds old
      if (now - timestamp < 30000) {
        return data;
      }
    }
    
    // Fetch fresh data
    const response = await fetch('/api/kategori');
    if (response.ok) {
      const data = await response.json();
      // Cache the data in sessionStorage
      sessionStorage.setItem(cacheKey, JSON.stringify({
        data,
        timestamp: new Date().getTime()
      }));
      return data;
    }
  } catch (error) {
    console.error('Error prefetching kategori data:', error);
  }
  return null;
};

// Prefetch all data for a specific page
export const prefetchPageData = async (page: string) => {
  switch (page) {
    case 'data':
      // Prefetch data for Data Surat page
      return Promise.all([
        prefetchSuratData(),
        prefetchKategoriData()
      ]);
    case 'input':
      // Prefetch data for Input Surat page
      return Promise.all([
        prefetchKategoriData(),
        prefetchUsersData()
      ]);
    case 'laporan':
      // Prefetch data for Laporan page
      return Promise.all([
        prefetchSuratData(),
        prefetchKategoriData()
      ]);
    case 'user':
      // Prefetch data for User page
      return prefetchUsersData();
    case 'master-data':
      // Prefetch data for Master Data page
      return prefetchKategoriData();
    default:
      // For dashboard and other pages, prefetch commonly used data
      return Promise.all([
        prefetchSuratData(),
        prefetchUsersData(),
        prefetchKategoriData()
      ]);
  }
};

// Clear prefetch cache
export const clearPrefetchCache = () => {
  Object.keys(sessionStorage).forEach(key => {
    if (key.startsWith('prefetch_')) {
      sessionStorage.removeItem(key);
    }
  });
};