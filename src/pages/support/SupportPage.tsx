import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TicketList } from '../../components/support/TicketList';
import { TicketFilters } from '../../components/support/TicketFilters';
import { Plus } from 'lucide-react';

export const SupportPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">نظام التذاكر والدعم</h1>
        <button
          onClick={() => navigate('/dashboard/support/new')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          تذكرة جديدة
        </button>
      </div>

      <TicketFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
      />

      <TicketList
        searchTerm={searchTerm}
        statusFilter={statusFilter}
      />
    </div>
  );
};