'use client';

import { useState, useEffect } from 'react';
import { useAppContext } from '@/app/context/AppContext';
import TableSkeleton from '@/app/components/TableSkeleton';
import dynamic from 'next/dynamic';

// Dynamically import DataTable with lazy loading
const DataTable = dynamic(() => import('@/app/components/DataTable'), {
  loading: () => <TableSkeleton />,
  ssr: false
});

export default function DataSuratPage() {
  const { surat, kategoriData, deleteSurat, updateSurat, users, currentUser } = useAppContext();
  const [dataSurat, setDataSurat] = useState(surat);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    // Simulate data loading optimization with minimal delay
    if (initialLoad) {
      const timer = setTimeout(() => {
        setDataSurat(surat);
        setLoading(false);
        setInitialLoad(false);
      }, 50); // Minimal delay for better UX
  
      return () => clearTimeout(timer);
    } else {
      setDataSurat(surat);
      setLoading(false);
    }
  }, [surat, initialLoad]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {loading ? (
        <TableSkeleton />
      ) : (
        <DataTable 
          surat={dataSurat}
          kategoriData={kategoriData}
          deleteSurat={deleteSurat}
          updateSurat={updateSurat}
          users={users}
          currentUser={currentUser}
        />
      )}
    </div>
  );
}