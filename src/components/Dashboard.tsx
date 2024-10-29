import React, { useState, useEffect } from 'react';
import { FileText, Download, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { UKAgenda } from './Calendar/UKHolidays';

interface Document {
  id: string;
  name: string;
  type: string;
  file_url: string;
  status: 'pending' | 'completed';
}

export const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (user?.id) {
      fetchDocuments();
    }
  }, [user?.id]);

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConsultation = () => {
    window.open('https://calendly.com/hululgroup/support', '_blank');
  };

  const handleDownload = async (fileUrl: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .download(fileUrl);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileUrl.split('/').pop() || 'document';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading document:', error);
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Documents Summary Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 transition-all hover:shadow-md">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">المستندات</h2>
            <FileText className="w-7 h-7 text-blue-600 dark:text-blue-400" />
          </div>
          
          {loading ? (
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              ))}
            </div>
          ) : documents.length > 0 ? (
            <ul className="space-y-4">
              {documents.map((doc) => (
                <li 
                  key={doc.id} 
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <span className="text-gray-700 dark:text-gray-300">{doc.name}</span>
                  <button
                    onClick={() => handleDownload(doc.file_url)}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">
              لا توجد مستندات متاحة
            </p>
          )}

          <div className="mt-6 space-y-3">
            <button
              onClick={() => navigate('/dashboard/documents/request')}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              طلب مستند جديد
            </button>
            <button
              onClick={() => navigate('/dashboard/documents')}
              className="w-full px-6 py-3 text-blue-600 dark:text-blue-400 border border-blue-600 dark:border-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/50 transition-colors flex items-center justify-center gap-2"
            >
              عرض جميع المستندات
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Actions Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 transition-all hover:shadow-md">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            إجراءات سريعة
          </h2>
          
          <div className="space-y-4">
            <button 
              onClick={() => navigate('/dashboard/documents/request')}
              className="w-full px-6 py-4 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              طلب مستند جديد
            </button>
            <button 
              onClick={handleConsultation}
              className="w-full px-6 py-4 text-blue-600 dark:text-blue-400 border-2 border-blue-600 dark:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/50 rounded-lg transition-colors"
            >
              جدولة استشارة
            </button>
            <button 
              onClick={() => navigate('/dashboard/company')}
              className="w-full px-6 py-4 text-gray-700 dark:text-gray-300 border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              تحديث معلومات الشركة
            </button>
          </div>
        </div>
      </div>

      {/* UK Agenda Section */}
      <UKAgenda />
    </div>
  );
};