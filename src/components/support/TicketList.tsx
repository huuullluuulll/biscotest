import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { useTickets } from '../../hooks/useTickets';
import { TicketStatusBadge } from './TicketStatusBadge';
import { TicketPriorityBadge } from './TicketPriorityBadge';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface TicketListProps {
  searchTerm: string;
  statusFilter: string;
}

export const TicketList: React.FC<TicketListProps> = ({ searchTerm, statusFilter }) => {
  const navigate = useNavigate();
  const { tickets, loading, error } = useTickets();

  console.log('Current tickets:', tickets); // Debug log

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = 
      ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="text-center py-10">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10 text-red-600 dark:text-red-400">
        حدث خطأ أثناء تحميل التذاكر: {error}
      </div>
    );
  }

  if (filteredTickets.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500 dark:text-gray-400">
        لا توجد تذاكر مطابقة للبحث
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {filteredTickets.map((ticket) => (
        <div
          key={ticket.id}
          onClick={() => navigate(`/dashboard/support/${ticket.id}`)}
          className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer border border-gray-200 dark:border-gray-700"
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-1">
                {ticket.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2">
                {ticket.description}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <TicketStatusBadge status={ticket.status} />
                <TicketPriorityBadge priority={ticket.priority} />
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {format(new Date(ticket.created_at), 'dd MMMM yyyy HH:mm', { locale: ar })}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
              <MessageCircle className="w-4 h-4" />
              <span className="text-sm">{ticket.messages_count || 0}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};