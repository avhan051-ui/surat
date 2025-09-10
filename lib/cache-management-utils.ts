// Utility functions for cache management
import cache from '@/lib/cache-utils';

// Invalidate all related caches
export const invalidateAllCaches = () => {
  cache.delete('kategoriData');
  cache.delete('suratData');
  cache.delete('suratMasukData');
  cache.delete('usersData');
  cache.delete('categoriesData');
};

// Invalidate specific cache based on data type
export const invalidateCacheByType = (type: 'kategori' | 'surat' | 'suratMasuk' | 'users' | 'categories') => {
  switch (type) {
    case 'kategori':
      cache.delete('kategoriData');
      break;
    case 'surat':
      cache.delete('suratData');
      break;
    case 'suratMasuk':
      cache.delete('suratMasukData');
      break;
    case 'users':
      cache.delete('usersData');
      break;
    case 'categories':
      cache.delete('categoriesData');
      break;
    default:
      console.warn(`Unknown cache type: ${type}`);
  }
};

// Get cache statistics
export const getCacheStats = () => {
  return cache.stats();
};

// Clean expired cache entries
export const cleanExpiredCache = () => {
  return cache.clean();
};