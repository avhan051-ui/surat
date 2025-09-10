// Enhanced in-memory cache implementation with better error handling and features
class EnhancedCache {
  private cache: Map<string, { data: any; expiry: number; createdAt: number }>;
  
  constructor() {
    this.cache = new Map();
    // Clean expired entries every 5 minutes
    setInterval(() => {
      this.clean();
    }, 5 * 60 * 1000);
  }
  
  // Get data from cache if it exists and hasn't expired
  get(key: string): any | null {
    try {
      const cached = this.cache.get(key);
      
      if (!cached) {
        return null;
      }
      
      // Check if cache has expired
      if (Date.now() > cached.expiry) {
        this.cache.delete(key);
        return null;
      }
      
      return cached.data;
    } catch (error) {
      console.error('Error getting cache:', error);
      return null;
    }
  }
  
  // Set data in cache with expiry time (in seconds)
  set(key: string, data: any, ttl: number = 300): void {
    try {
      const expiry = Date.now() + (ttl * 1000); // Convert to milliseconds
      const createdAt = Date.now();
      this.cache.set(key, { data, expiry, createdAt });
    } catch (error) {
      console.error('Error setting cache:', error);
    }
  }
  
  // Delete specific cache entry
  delete(key: string): boolean {
    try {
      return this.cache.delete(key);
    } catch (error) {
      console.error('Error deleting cache:', error);
      return false;
    }
  }
  
  // Clear all cache entries
  clear(): void {
    try {
      this.cache.clear();
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }
  
  // Clean expired entries
  clean(): number {
    try {
      const now = Date.now();
      let count = 0;
      
      for (const [key, value] of this.cache.entries()) {
        if (now > value.expiry) {
          this.cache.delete(key);
          count++;
        }
      }
      
      return count;
    } catch (error) {
      console.error('Error cleaning cache:', error);
      return 0;
    }
  }
  
  // Get cache statistics
  stats(): { size: number; entries: Array<{ key: string; ttl: number }> } {
    try {
      const now = Date.now();
      const entries = Array.from(this.cache.entries()).map(([key, value]) => ({
        key,
        ttl: Math.max(0, Math.floor((value.expiry - now) / 1000))
      }));
      
      return {
        size: this.cache.size,
        entries
      };
    } catch (error) {
      console.error('Error getting cache stats:', error);
      return { size: 0, entries: [] };
    }
  }
  
  // Check if key exists in cache (without updating expiry)
  has(key: string): boolean {
    try {
      return this.cache.has(key);
    } catch (error) {
      console.error('Error checking cache:', error);
      return false;
    }
  }
}

// Create a singleton instance
const cache = new EnhancedCache();

export default cache;