import { useState, useEffect, useCallback } from 'react';
import MonasteryTable from "./MonasteryTable";
import MapWrapper from './MapWrapper';
import FilterPanel from "./FilterPanel";
import { getMonasteries } from '../lib/supabase';
import type { Database } from '../lib/database.types';
import ButtonsContainer from './ButtonsContainer';
import SuggestCenterForm from './SuggestCenterForm';

type Monastery = Database['public']['Tables']['monasteries']['Row'];

export default function DirectoryContainer() {
  const [activeTab, setActiveTab] = useState<'map' | 'table'>('table');
  const [showSuggestForm, setShowSuggestForm] = useState(false);
  const [availableVehicles, setAvailableVehicles] = useState<string[]>([]);
  const [availableTypes, setAvailableTypes] = useState<string[]>([]);
  const [monasteries, setMonasteries] = useState<Monastery[]>([]);
  const [filteredMonasteries, setFilteredMonasteries] = useState<Monastery[]>([]);
  const [selectedMonastery, setSelectedMonastery] = useState<Monastery | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const data = await getMonasteries().then(data => data.filter(m => !m.pending));
        
        if (data) {
          setMonasteries(data);
          setFilteredMonasteries(data);
          
          // Extract unique vehicles and types for filters
          const vehicles = Array.from(new Set(
            data.map(m => m.vehicle).filter(Boolean) as string[]
          )).sort();
          setAvailableVehicles(vehicles);

          const types = Array.from(new Set(
            data.map(m => m.center_type).filter(Boolean) as string[]
          )).sort();
          setAvailableTypes(types);
        }
      } catch (err) {
        console.error('Error fetching monasteries:', err);
        setError(err instanceof Error ? err.message : 'An error occurred while fetching monasteries');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleFilter = useCallback((filtered: Monastery[]) => {
    setFilteredMonasteries(filtered);
  }, []);

  const handleViewOnMap = useCallback((monastery: Monastery) => {
    setSelectedMonastery(monastery);
    setActiveTab('map');
  }, []);

  return (
    <div className="flex flex-col w-full h-full">
      <div className="flex-1">
        <div className="w-full border border-gray-200 rounded-xl p-6 bg-white shadow-lg">
          {showSuggestForm ? (
            <SuggestCenterForm showSuggestForm={showSuggestForm} setShowSuggestForm={setShowSuggestForm} />
          ) : (
            <div className="flex gap-8">
              <div className="w-1/4" id="filter-panel">
                <FilterPanel
                  monasteries={monasteries}
                  availableVehicles={availableVehicles}
                  availableTypes={availableTypes}
                  onFilter={handleFilter}
                />
              </div>
              
              <div className="flex-1">
                <div className="border-b border-gray-200 mb-6" id="data-view">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex gap-2">
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
                    </div>
                  </div>
                </div>

                <div className="h-[600px] rounded-lg overflow-hidden">
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
                    <div className="w-full h-full">
                      <MapWrapper
                        selectedMonastery={selectedMonastery}
                        monasteries={filteredMonasteries}
                      />
                    </div>
                  ) : (
                    <div className="w-full h-full overflow-auto pr-2">
                      <MonasteryTable 
                        monasteries={filteredMonasteries} 
                        onViewOnMap={handleViewOnMap}
                      />
                    </div>
                  )}
                </div>
                <ButtonsContainer onSuggestCenter={() => setShowSuggestForm(true)} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 