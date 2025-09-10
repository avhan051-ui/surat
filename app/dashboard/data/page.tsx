'use client';

import { useState, useEffect } from 'react';
import { useAppContext } from '@/app/context/AppContext';
import TableSkeleton from '@/app/components/TableSkeleton';
import dynamic from 'next/dynamic';
import InputSuratForm from '@/app/components/InputSuratForm';

// Dynamically import DataTable with lazy loading
const DataTable = dynamic(() => import('@/app/components/DataTable'), {
  loading: () => <TableSkeleton />,
  ssr: false
});

export default function DataSuratPage() {
  const { surat, kategoriData, deleteSurat, updateSurat, users, currentUser, addSurat } = useAppContext();
  const [dataSurat, setDataSurat] = useState(surat);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [showInputForm, setShowInputForm] = useState(false);

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
      {/* Header with Input Surat Button */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Data Surat Keluar</h2>
            <p className="text-gray-600 mt-1">Kelola dan pantau semua surat keluar</p>
          </div>
          <button 
            onClick={() => setShowInputForm(!showInputForm)}
            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-4 py-2 rounded-lg text-sm transition-all shadow-md"
          >
            <i className={`fas ${showInputForm ? 'fa-times' : 'fa-plus'} mr-2`}></i>
            {showInputForm ? 'Batal' : 'Input Surat Baru'}
          </button>
        </div>
      </div>

      {/* Input Surat Form */}
      {showInputForm && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <InputSuratForm 
            kategoriData={kategoriData}
            users={users}
            addSurat={addSurat}
            onCancel={() => setShowInputForm(false)}
            onSuccess={() => setShowInputForm(false)}
          />
        </div>
      )}

      {/* Data Table */}
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