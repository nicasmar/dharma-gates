'use client';

import { useEffect, useState, useCallback } from 'react';
import type { Database } from '../lib/database.types';
import { getMonasteries, updateMonasteryPendingStatus, deleteMonastery, getMonasteryFeedback } from '@/lib/supabase';
import MonasteryCard from './MonasteryCard';
import EditCenterForm from './EditCenterForm';
import MonasteryTable from "./MonasteryTable";
import MapWrapper from './MapWrapper';
import FilterPanel from "./FilterPanel";
import FeedbackPanel from './FeedbackPanel';
import MonasteryFeedbackCard from './MonasteryFeedbackCard';
import { useFilterOptions } from '../hooks/useFilterOptions';

type Monastery = Database['public']['Tables']['monasteries']['Row'];
type MonasteryWithTimestamp = Monastery & { lastUpdated?: number };
type MonasteryFeedback = Database['public']['Tables']['monastery_feedback']['Row'] & {
  monasteries?: {
    name: string;
    address: string | null;
  };
};



export default function AdminPanel() {
  const [monasteries, setMonasteries] = useState<MonasteryWithTimestamp[]>([]);
  const [approvedMonasteries, setApprovedMonasteries] = useState<MonasteryWithTimestamp[]>([]);
  const [filteredApprovedMonasteries, setFilteredApprovedMonasteries] = useState<MonasteryWithTimestamp[]>([]);
  const [monasteryFeedback, setMonasteryFeedback] = useState<MonasteryFeedback[]>([]);
  const [totalCenters, setTotalCenters] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingMonastery, setEditingMonastery] = useState<Monastery | null>(null);
  const [deleteConfirmMonastery, setDeleteConfirmMonastery] = useState<Monastery | null>(null);
  const [activeTab, setActiveTab] = useState<'map' | 'table'>('map');
  const [selectedMonastery, setSelectedMonastery] = useState<Monastery | null>(null);

  // Use the custom hook for filter options
  const filterOptions = useFilterOptions(approvedMonasteries);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [monasteriesData, feedbackData] = await Promise.all([
          getMonasteries(),
          getMonasteryFeedback()
        ]);
        
        setTotalCenters(monasteriesData.length);
        
        const pendingData = monasteriesData.filter(m => m.pending);
        const approvedData = monasteriesData.filter(m => !m.pending);
        
        setMonasteries(pendingData);
        setApprovedMonasteries(approvedData);
        setFilteredApprovedMonasteries(approvedData);
        
        // Filter to show only pending feedback
        const pendingFeedback = feedbackData.filter(f => f.admin_status === 'pending');
        setMonasteryFeedback(pendingFeedback);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred while fetching data');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleViewOnMapPending = (monastery: Monastery) => {
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

  const handleEdit = (monastery: Monastery) => {
    setEditingMonastery(monastery);
  };

  const handleEditSave = (updatedMonastery: Monastery) => {
    // Update the monastery in the local state with a timestamp to force re-render
    setMonasteries(prev => {
      const monasteryWithTimestamp = { 
        ...updatedMonastery, 
        lastUpdated: Date.now() 
      } as Monastery & { lastUpdated: number };
      
      const newMonasteries = prev.map(m => 
        m.id === updatedMonastery.id ? monasteryWithTimestamp : m
      );
      return newMonasteries;
    });
  };

  const handleEditClose = () => {
    setEditingMonastery(null);
  };

  const handleFilter = useCallback((filtered: Monastery[]) => {
    setFilteredApprovedMonasteries(filtered);
  }, []);

  const handleViewOnMap = useCallback((monastery: Monastery) => {
    setSelectedMonastery(monastery);
    setActiveTab('map');
  }, []);

  const handleEditApproved = (monastery: Monastery) => {
    setEditingMonastery(monastery);
  };

  const handleEditSaveApproved = (updatedMonastery: Monastery) => {
    // Update both the full approved list and filtered list
    const monasteryWithTimestamp = { 
      ...updatedMonastery, 
      lastUpdated: Date.now() 
    } as MonasteryWithTimestamp;

    setApprovedMonasteries(prev => 
      prev.map(m => m.id === updatedMonastery.id ? monasteryWithTimestamp : m)
    );
    setFilteredApprovedMonasteries(prev => 
      prev.map(m => m.id === updatedMonastery.id ? monasteryWithTimestamp : m)
    );
  };

  const handleDeleteRequest = (monastery: Monastery) => {
    setDeleteConfirmMonastery(monastery);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmMonastery) return;
    
    try {
      await deleteMonastery(deleteConfirmMonastery.id);
      // Remove from both lists
      setApprovedMonasteries(prev => prev.filter(m => m.id !== deleteConfirmMonastery.id));
      setFilteredApprovedMonasteries(prev => prev.filter(m => m.id !== deleteConfirmMonastery.id));
      setTotalCenters(prev => prev - 1);
      setDeleteConfirmMonastery(null);
    } catch (err) {
      console.error('Error deleting monastery:', err);
      setError('Failed to delete monastery. Please try again.');
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmMonastery(null);
  };

  const handleFeedbackStatusUpdate = async () => {
    // Refresh feedback data after status update
    try {
      const feedbackData = await getMonasteryFeedback();
      const pendingFeedback = feedbackData.filter(f => f.admin_status === 'pending');
      setMonasteryFeedback(pendingFeedback);
    } catch (err) {
      console.error('Error refreshing feedback data:', err);
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
              <p className="text-4xl font-bold text-[#286B88] mt-2">{monasteries.length + monasteryFeedback.length}</p>
              <p className="text-sm text-gray-600 mt-1">
                {monasteries.length} suggested centers, {monasteryFeedback.length} feedback on centers
              </p>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6 mt-6">
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
            ) : monasteries.length === 0 && monasteryFeedback.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No pending centers or feedback to review</p>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Pending Monastery Feedback */}
                {monasteryFeedback.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                      <span>👤 User Feedback on Centers</span>
                      <span className="px-2 py-1 text-xs font-semibold bg-orange-100 text-orange-800 rounded-full">
                        {monasteryFeedback.length} pending
                      </span>
                    </h3>
                    <div className="space-y-4">
                      {monasteryFeedback.map((feedback) => (
                        <MonasteryFeedbackCard
                          key={feedback.id}
                          feedback={feedback}
                          onStatusUpdate={handleFeedbackStatusUpdate}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Pending Suggested Centers */}
                {monasteries.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                      <span>🏛️ Suggested Center Submissions</span>
                      <span className="px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">
                        {monasteries.length} pending
                      </span>
                    </h3>
                    <div className="space-y-6">
                      {monasteries.map((monastery) => (
                        <div key={monastery.id} className="flex gap-4">
                          <div className="flex-1">
                            <MonasteryCard 
                              key={`${monastery.id}-${monastery.lastUpdated || 'initial'}`}
                              monastery={monastery} 
                              onViewOnMap={handleViewOnMapPending}
                              admin={true}
                            />
                          </div>
                          <div className="flex flex-col justify-center gap-2">
                            <button 
                              onClick={() => handleEdit(monastery)}
                              className="px-4 py-2 text-sm bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
                            >
                              Edit
                            </button>
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
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Approved Centers Directory */}
        <div className="bg-white rounded-xl shadow-lg p-6 mt-8">
          <h2 className="text-xl font-medium text-gray-900 mb-6">Approved Centers Directory</h2>
          
          <div className="flex gap-8">
            <div className="w-1/4">
              <FilterPanel
                monasteries={approvedMonasteries}
                {...filterOptions}
                onFilter={handleFilter}
              />
            </div>
            
            <div className="flex-1">
              <div className="border-b border-gray-200 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setActiveTab('map')}
                      className={`px-3 py-1.5 text-sm font-medium rounded-lg ${
                        activeTab === 'map'
                          ? 'bg-[#286B88] text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Map View
                    </button>
                    <button
                      onClick={() => setActiveTab('table')}
                      className={`px-3 py-1.5 text-sm font-medium rounded-lg ${
                        activeTab === 'table'
                          ? 'bg-[#286B88] text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Table View
                    </button>
                  </div>
                </div>
              </div>

              <div className="max-h-[1200px] overflow-y-auto">
                {loading ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 border-4 border-t-[#286B88] border-[#286B88]/20 rounded-full animate-spin mx-auto"></div>
                      <p className="mt-4 text-gray-600">Loading monasteries...</p>
                    </div>
                  </div>
                ) : error ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-rose-700 text-lg font-medium mb-4">Error loading monasteries</p>
                      <p className="text-rose-600">{error}</p>
                    </div>
                  </div>
                ) : activeTab === 'map' ? (
                  <div className="space-y-4">
                    <div className="h-[550px] rounded-lg overflow-hidden">
                      <MapWrapper
                        selectedMonastery={selectedMonastery}
                        monasteries={filteredApprovedMonasteries}
                        onSelectMonastery={setSelectedMonastery}
                        onEditMonastery={handleEditApproved}
                        onDeleteMonastery={handleDeleteRequest}
                        admin={true}
                      />
                    </div>
                    {selectedMonastery && (
                      <div className="max-h-[450px] overflow-y-auto">
                        <MonasteryCard 
                          monastery={selectedMonastery}
                          onViewOnMap={handleViewOnMap}
                          onEditMonastery={handleEditApproved}
                          onDeleteMonastery={handleDeleteRequest}
                          admin={true}
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-full h-full">
                    <MonasteryTable 
                      monasteries={filteredApprovedMonasteries}
                      onViewOnMap={handleViewOnMap}
                      onEditMonastery={handleEditApproved}
                      onDeleteMonastery={handleDeleteRequest}
                      admin={true}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6 mt-6">
            <FeedbackPanel />
          </div>
        </div>
      </div>
      
      {editingMonastery && (
        <EditCenterForm
          monastery={editingMonastery}
          onClose={handleEditClose}
          onSave={editingMonastery.pending ? handleEditSave : handleEditSaveApproved}
          {...filterOptions}
        />
      )}

      {deleteConfirmMonastery && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete &quot;{deleteConfirmMonastery.name}&quot;? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleDeleteCancel}
                className="px-4 py-2 text-sm bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 text-sm bg-rose-600 text-white rounded-lg hover:bg-rose-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 