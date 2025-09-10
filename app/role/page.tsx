'use client';

import { useState } from 'react';
import { useAppContext } from '@/app/context/AppContext';
import RouteGuard from '@/app/components/RouteGuard';
import { showSuccessToast } from '@/lib/sweetalert-utils';

export default function RoleManagementPage() {
  const { kategoriData, updateKategoriData } = useAppContext();
  
  // Define roles
  const roles = ['Administrator', 'Operator', 'User'];
  
  // Define menu items with their access permissions
  const [menuItems, setMenuItems] = useState([
    {
      id: 'dashboard',
      name: 'Dashboard',
      roles: ['Administrator', 'Operator', 'User']
    },
    {
      id: 'input',
      name: 'Input Surat Baru',
      roles: ['Administrator', 'Operator']
    },
    {
      id: 'data',
      name: 'Data Surat Keluar',
      roles: ['Administrator', 'Operator', 'User']
    },
    {
      id: 'master-data',
      name: 'Master Data',
      roles: ['Administrator']
    },
    {
      id: 'laporan',
      name: 'Laporan',
      roles: ['Administrator', 'Operator', 'User']
    },
    {
      id: 'user',
      name: 'Kelola User',
      roles: ['Administrator']
    },
    {
      id: 'pengaturan',
      name: 'Pengaturan',
      roles: ['Administrator']
    },
    {
      id: 'role',
      name: 'Role',
      roles: ['Administrator']
    }
  ]);

  // Function to toggle role access for a menu item
  const toggleRoleAccess = (menuId: string, role: string) => {
    setMenuItems(prevItems => 
      prevItems.map(item => {
        if (item.id === menuId) {
          const updatedRoles = item.roles.includes(role)
            ? item.roles.filter(r => r !== role) // Remove role if it exists
            : [...item.roles, role]; // Add role if it doesn't exist
          return { ...item, roles: updatedRoles };
        }
        return item;
      })
    );
  };

  // Function to save changes
  const saveChanges = () => {
    showSuccessToast('Pengaturan akses berhasil disimpan!');
    // In a real implementation, you would send this data to your backend
    console.log('Updated menu permissions:', menuItems);
  };

  return (
    <RouteGuard requiredRole="Administrator">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Manajemen Akses Role</h2>
              <p className="text-gray-600 mt-1">Atur hak akses menu untuk setiap role pengguna</p>
            </div>
            <div className="bg-gray-100 p-3 rounded-full">
              <i className="fas fa-user-shield text-gray-600 text-2xl"></i>
            </div>
          </div>

          <div className="mb-8 p-6 bg-blue-50 rounded-xl border border-blue-100">
            <h3 className="font-bold text-blue-800 mb-2 flex items-center">
              <i className="fas fa-info-circle mr-2"></i>Informasi
            </h3>
            <p className="text-blue-700">
              Atur hak akses menu untuk setiap role pengguna. Centang kotak untuk memberikan akses 
              atau hapus centang untuk membatasi akses.
            </p>
          </div>

          {/* Menu Access Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Menu
                  </th>
                  {roles.map(role => (
                    <th key={role} scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {role}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {menuItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{item.name}</div>
                    </td>
                    {roles.map(role => (
                      <td key={`${item.id}-${role}`} className="px-6 py-4 whitespace-nowrap text-center">
                        <input
                          type="checkbox"
                          checked={item.roles.includes(role)}
                          onChange={() => toggleRoleAccess(item.id, role)}
                          className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Save Button */}
          <div className="mt-8 flex justify-end">
            <button 
              onClick={saveChanges}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg font-medium"
            >
              <i className="fas fa-save mr-2"></i>Simpan Perubahan
            </button>
          </div>
        </div>
      </div>
    </RouteGuard>
  );
}