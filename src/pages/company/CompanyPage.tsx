import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, ArrowUpCircle, MapPin, Phone, Mail, Calendar, FileText, Users, ChevronDown } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface Company {
  id: string;
  name_ar: string;
  name_en: string;
  registration_number: string;
  company_type: string;
  registered_address: string;
  incorporation_date: string;
  status: string;
  vat_number: string;
  utr_number: string;
  auth_code: string;
  directors: any[];
  shareholders: any[];
  subscription?: {
    plan: string;
    renewal_date: string;
    status: string;
  };
}

export const CompanyPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompanies();
  }, [user?.id]);

  const fetchCompanies = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('companies')
        .select(`
          *,
          subscription:company_subscriptions(
            plan,
            renewal_date,
            status
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        setCompanies(data);
        setSelectedCompany(data[0]);
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCompanyTypeLabel = (type: string) => {
    const types = {
      private_limited: 'شركة محدودة خاصة',
      public_limited: 'شركة محدودة عامة',
      sole_trader: 'تاجر فردي',
      partnership: 'شراكة',
      llp: 'شراكة محدودة المسؤولية'
    };
    return types[type as keyof typeof types] || type;
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'suspended':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (companies.length === 0) {
    return (
      <div className="p-8 text-center">
        <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          لا توجد شركات مسجلة
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          لم تقم بتسجيل أي شركة حتى الآن
        </p>
        <button
          onClick={() => navigate('/dashboard/company/register')}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          تسجيل شركة جديدة
        </button>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Company Selector */}
      {companies.length > 1 && (
        <div className="mb-6">
          <div className="relative inline-block">
            <select
              value={selectedCompany?.id}
              onChange={(e) => setSelectedCompany(companies.find(c => c.id === e.target.value) || null)}
              className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg py-2 pl-10 pr-4 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name_ar} ({company.registration_number})
                </option>
              ))}
            </select>
            <ChevronDown className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
      )}

      {selectedCompany && (
        <div className="space-y-6">
          {/* Company Overview */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {selectedCompany.name_ar}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">{selectedCompany.name_en}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass(selectedCompany.status)}`}>
                {selectedCompany.status === 'active' ? 'نشط' : 
                 selectedCompany.status === 'pending' ? 'قيد المراجعة' : 
                 selectedCompany.status === 'suspended' ? 'معلق' : selectedCompany.status}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-500 dark:text-gray-400">رقم التسجيل</label>
                  <p className="text-gray-900 dark:text-white">{selectedCompany.registration_number}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500 dark:text-gray-400">نوع الشركة</label>
                  <p className="text-gray-900 dark:text-white">{getCompanyTypeLabel(selectedCompany.company_type)}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500 dark:text-gray-400">تاريخ التأسيس</label>
                  <p className="text-gray-900 dark:text-white">
                    {format(new Date(selectedCompany.incorporation_date), 'dd MMMM yyyy', { locale: ar })}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-500 dark:text-gray-400">رقم VAT</label>
                  <p className="text-gray-900 dark:text-white">{selectedCompany.vat_number || 'غير متوفر'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500 dark:text-gray-400">رقم UTR</label>
                  <p className="text-gray-900 dark:text-white">{selectedCompany.utr_number || 'غير متوفر'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500 dark:text-gray-400">رمز المصادقة</label>
                  <p className="text-gray-900 dark:text-white">{selectedCompany.auth_code || 'غير متوفر'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Subscription Status */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">حالة الاشتراك</h2>
              <button
                onClick={() => navigate('/dashboard/company/upgrade')}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ArrowUpCircle className="w-4 h-4" />
                ترقية الباقة
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="text-sm text-gray-500 dark:text-gray-400">الباقة الحالية</label>
                <p className="text-gray-900 dark:text-white font-medium">
                  {selectedCompany.subscription?.[0]?.plan === 'starter' ? 'ستارتر' :
                   selectedCompany.subscription?.[0]?.plan === 'professional' ? 'بروفيشنال' :
                   selectedCompany.subscription?.[0]?.plan === 'enterprise' ? 'إنتربرايز' : 'غير متوفر'}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-500 dark:text-gray-400">حالة الاشتراك</label>
                <p className="text-gray-900 dark:text-white font-medium">
                  {selectedCompany.subscription?.[0]?.status === 'active' ? 'نشط' :
                   selectedCompany.subscription?.[0]?.status === 'cancelled' ? 'ملغي' :
                   selectedCompany.subscription?.[0]?.status === 'expired' ? 'منتهي' : 'غير متوفر'}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-500 dark:text-gray-400">تاريخ التجديد</label>
                <p className="text-gray-900 dark:text-white font-medium">
                  {selectedCompany.subscription?.[0]?.renewal_date ?
                    format(new Date(selectedCompany.subscription[0].renewal_date), 'dd MMMM yyyy', { locale: ar }) :
                    'غير متوفر'}
                </p>
              </div>
            </div>
          </div>

          {/* Company Officials */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">المسؤولون</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Directors */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">المدراء</h3>
                <div className="space-y-4">
                  {selectedCompany.directors?.map((director: any, index: number) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <Users className="w-5 h-5 text-gray-400 mt-1" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{director.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          تاريخ التعيين: {format(new Date(director.appointed_date), 'dd MMMM yyyy', { locale: ar })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shareholders */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">المساهمون</h3>
                <div className="space-y-4">
                  {selectedCompany.shareholders?.map((shareholder: any, index: number) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <Users className="w-5 h-5 text-gray-400 mt-1" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{shareholder.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          عدد الأسهم: {shareholder.shares} ({shareholder.share_type})
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Registered Address */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">العنوان المسجل</h2>
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-gray-400 mt-1" />
              <p className="text-gray-900 dark:text-white">{selectedCompany.registered_address}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};