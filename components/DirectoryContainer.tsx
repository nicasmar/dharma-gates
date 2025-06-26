import { useState, useEffect, useCallback } from 'react';
import MonasteryTable from "./MonasteryTable";
import MonasteryCard from "./MonasteryCard";
import MapWrapper from './MapWrapper';
import FilterPanel from "./FilterPanel";
import { getMonasteries } from '../lib/supabase';
import type { Database } from '../lib/database.types';
import ButtonsContainer from './ButtonsContainer';
import SuggestCenterForm from './SuggestCenterForm';
import { useFilterOptions } from '../hooks/useFilterOptions';

type Monastery = Database['public']['Tables']['monasteries']['Row'];

interface DirectoryContainerProps {
  admin?: boolean;
  onEditMonastery?: (monastery: Monastery) => void;
  onDeleteMonastery?: (monastery: Monastery) => void;
}

export default function DirectoryContainer({ admin = false, onEditMonastery, onDeleteMonastery }: DirectoryContainerProps) {
  const [activeTab, setActiveTab] = useState<'map' | 'table'>('map');
  const [showSuggestForm, setShowSuggestForm] = useState(false);
  const [monasteries, setMonasteries] = useState<Monastery[]>([]);
  const [filteredMonasteries, setFilteredMonasteries] = useState<Monastery[]>([]);
  const [selectedMonastery, setSelectedMonastery] = useState<Monastery | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use the custom hook for filter options
  const filterOptions = useFilterOptions(monasteries);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const data = await getMonasteries().then(data => data.filter(m => !m.pending));
        
        if (data) {
          setMonasteries(data);
          setFilteredMonasteries(data);
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

  const handleSelectMonastery = useCallback((monastery: Monastery) => {
    setSelectedMonastery(monastery);
  }, []);

  return (
    <div className="flex flex-col w-full h-full">
      <div className="flex-1">
        <div className="w-full border border-gray-200 rounded-xl p-6 bg-white shadow-lg">
          {showSuggestForm ? (
            <SuggestCenterForm 
              showSuggestForm={showSuggestForm} 
              setShowSuggestForm={setShowSuggestForm}
              availableVehicles={filterOptions.availableVehicles}
              availableTypes={filterOptions.availableTypes}
              availableSettings={filterOptions.availableSettings}
              availablePriceModels={filterOptions.availablePriceModels}
              availableGenderPolicies={filterOptions.availableGenderPolicies}
              availableTraditions={filterOptions.availableTraditions}
              availableDiets={filterOptions.availableDiets}
            />
          ) : (
            <div className="flex gap-8">
              <div className="w-1/4" id="filter-panel">
                <FilterPanel
                  monasteries={monasteries}
                  {...filterOptions}
                  onFilter={handleFilter}
                />
              </div>
              
              <div className="flex-1">
                <div className="border-b border-gray-200 mb-6" id="data-view">
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

                {loading ? (
                  <div className="h-[600px] rounded-lg overflow-hidden">
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-16 h-16 border-4 border-t-[#286B88] border-[#286B88]/20 rounded-full animate-spin mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading monasteries...</p>
                      </div>
                    </div>
                  </div>
                ) : error ? (
                  <div className="h-[600px] rounded-lg overflow-hidden">
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-rose-700 text-lg font-medium mb-4">Error loading monasteries</p>
                        <p className="text-rose-600">{error}</p>
                      </div>
                    </div>
                  </div>
                ) : activeTab === 'map' ? (
                  <div className="space-y-4 max-h-[1200px] overflow-y-auto">
                    <div className="h-[700px] rounded-lg overflow-hidden">
                      <MapWrapper 
                        selectedMonastery={selectedMonastery}
                        monasteries={filteredMonasteries}
                        onSelectMonastery={handleSelectMonastery}
                        onEditMonastery={onEditMonastery}
                        onDeleteMonastery={onDeleteMonastery}
                        admin={admin}
                      />
                    </div>
                    {selectedMonastery && (
                      <div className="max-h-[350px] overflow-y-auto">
                        <MonasteryCard 
                          monastery={selectedMonastery}
                          onViewOnMap={handleViewOnMap}
                          onEditMonastery={onEditMonastery}
                          onDeleteMonastery={onDeleteMonastery}
                          admin={admin}
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="max-h-[800px] overflow-y-auto">
                    <MonasteryTable 
                      monasteries={filteredMonasteries} 
                      onViewOnMap={handleViewOnMap}
                      onEditMonastery={onEditMonastery}
                      onDeleteMonastery={onDeleteMonastery}
                      admin={admin}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      {!admin && <ButtonsContainer onSuggestCenter={() => setShowSuggestForm(true)} />}
    </div>
  );
} 