"use client";
import { supabase } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';

export default function TestSupabase() {
  const [status, setStatus] = useState('Testing...');

  useEffect(() => {
    const test = async () => {
      const { error } = await supabase.from('bookings').select('count', { count: 'exact', head: true });
      if (error) setStatus(`❌ Error: ${error.message}`);
      else setStatus('✅ Success! Supabase is connected and tables are ready.');
    };
    test();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-2xl font-bold">Supabase Connection Test</h1>
      <p className="mt-4">{status}</p>
    </div>
  );
}