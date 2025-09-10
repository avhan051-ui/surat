'use client';

import React from 'react';

const StatsCardSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-gray-200 rounded-2xl shadow-xl p-6 h-32 animate-pulse"></div>
      ))}
    </div>
  );
};

export default StatsCardSkeleton;