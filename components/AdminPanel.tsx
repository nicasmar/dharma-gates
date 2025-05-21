'use client';

import { useEffect, useState } from 'react';
import type { Database } from '../lib/database.types';
import { getMonasteries, updateMonasteryPendingStatus, deleteMonastery } from '@/lib/supabase';
import MonasteryCard from './MonasteryCard';

type Monastery = Database['public']['Tables']['monasteries']['Row'];

export default function AdminPanel() {
  const [monasteries, setMonasteries] = useState<Monastery[]>([]);
  const [totalCenters, setTotalCenters] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const data = await getMonasteries(); // Only fetch pending monasteries
        setTotalCenters(data.length);
        setMonasteries(data.filter(m => m.pending));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred while fetching monasteries');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleViewOnMap = (monastery: Monastery) => {
    // TODO: Implement view on map functionality
    console.log('View on map:', monastery);
  };

  const handleAccept = async (monastery: Monastery) => {
    try {
      await updateMonasteryPendingStatus(monastery.id, false);
      // Update local state to remove the accepted monastery
      setMonasteries(monasteries.filter(m => m.id !== monastery.id));
    } catch (err) {
      console.error('Error accepting monastery:', err);
      setError('Failed to accept monastery. Please try again.');
    }
  };

  const handleReject = async (monastery: Monastery) => {
    try {
      await deleteMonastery(monastery.id);
      // Update local state to remove the rejected monastery
      setMonasteries(monasteries.filter(m => m.id !== monastery.id));
      setTotalCenters(totalCenters - 1);
    } catch (err) {
      console.error('Error rejecting monastery:', err);
      setError('Failed to reject monastery. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h1 className="text-2xl font-bold text-[#286B88] mb-6">Admin Dashboard</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-50 rounded-lg p-6 flex flex-col justify-between h-full">
              <h3 className="text-lg font-medium text-gray-900">Total Centers</h3>
              <p className="text-4xl font-bold text-[#286B88] mt-2">{totalCenters}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-6 flex flex-col justify-between h-full">
              <h3 className="text-lg font-medium text-gray-900">Pending Reviews</h3>
              <p className="text-4xl font-bold text-[#286B88] mt-2">{monasteries.length}</p>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Pending Center Reviews</h2>
            {loading ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 border-4 border-t-[#286B88] border-[#286B88]/20 rounded-full animate-spin mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading monasteries...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-rose-700 text-lg font-medium mb-4">Error loading monasteries</p>
                <p className="text-rose-600">{error}</p>
              </div>
            ) : monasteries.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No pending centers to review</p>
              </div>
            ) : (
              <div className="space-y-6">
                {monasteries.map((monastery) => (
                  <div key={monastery.id} className="flex gap-4">
                    <div className="flex-1">
                      <MonasteryCard 
                        monastery={monastery} 
                        onViewOnMap={handleViewOnMap}
                        admin={true}
                      />
                    </div>
                    <div className="flex flex-col justify-center gap-2">
                      <button 
                        onClick={() => handleAccept(monastery)}
                        className="px-4 py-2 text-sm bg-[#286B88] text-white rounded-lg hover:bg-[#286B88]/90"
                      >
                        Accept
                      </button>
                      <button 
                        onClick={() => handleReject(monastery)}
                        className="px-4 py-2 text-sm bg-rose-600 text-white rounded-lg hover:bg-rose-700"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 