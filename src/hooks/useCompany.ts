import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

interface CompanyStatus {
  company_status: string;
  current_plan: string;
  renewal_date: string;
}

export const useCompanyStatus = () => {
  const [companyStatus, setCompanyStatus] = useState<CompanyStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchCompanyStatus = async () => {
      if (!user?.id) return;

      try {
        const { data, error: statusError } = await supabase
          .from('companies')
          .select(`
            status as company_status,
            company_subscriptions (
              plan as current_plan,
              renewal_date
            )
          `)
          .eq('user_id', user.id)
          .single();

        if (statusError) throw statusError;

        if (data) {
          setCompanyStatus({
            company_status: data.company_status,
            current_plan: data.company_subscriptions?.[0]?.current_plan || 'starter',
            renewal_date: data.company_subscriptions?.[0]?.renewal_date || new Date().toISOString()
          });
        }
      } catch (err: any) {
        console.error('Error fetching company status:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyStatus();
  }, [user?.id]);

  return { companyStatus, loading, error };
};