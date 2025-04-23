import { useEffect, useState } from 'react';
import { getMonasteries, supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type Monastery = Database['public']['Tables']['monasteries']['Row'];
type SortKey = keyof Pick<Monastery, 'name' | 'center_type' | 'buddhist_vehicle'>;
type SortOrder = 'asc' | 'desc';

export default function MonasteryTable() {
  const [monasteries, setMonasteries] = useState<Monastery[]>([]);
  const [filteredMonasteries, setFilteredMonasteries] = useState<Monastery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [vehicleFilter, setVehicleFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [availableVehicles, setAvailableVehicles] = useState<string[]>([]);
  const [availableTypes, setAvailableTypes] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; order: SortOrder }>({ 
    key: 'name', 
    order: 'asc' 
  });

  useEffect(() => {
    async function fetchMonasteries() {
      try {
        setLoading(true);
        const data = await getMonasteries();

        setMonasteries(data || []);
        setFilteredMonasteries(data || []);

        // Extract unique vehicles and types for filters
        const vehicles = Array.from(new Set(
          data?.map(m => m.buddhist_vehicle).filter(Boolean) as string[]
        )).sort();
        setAvailableVehicles(vehicles);

        const types = Array.from(new Set(
          data?.map(m => m.center_type).filter(Boolean) as string[]
        )).sort();
        setAvailableTypes(types);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred while fetching monasteries');
        console.error('Error fetching monasteries:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchMonasteries();
  }, []);

  useEffect(() => {
    // Filter monasteries based on search term and dropdown filters
    const results = monasteries.filter(monastery => {
      // Text search filter
      const matchesSearch = searchTerm === '' || 
        monastery.name?.toLowerCase().startsWith(searchTerm.toLowerCase())
      
      // Vehicle filter
      const matchesVehicle = vehicleFilter === '' || 
        monastery.buddhist_vehicle === vehicleFilter;
      
      // Type filter
      const matchesType = typeFilter === '' || 
        monastery.center_type === typeFilter;
      
      return matchesSearch && matchesVehicle && matchesType;
    });
    
    // Sort the filtered results
    const sortedResults = [...results].sort((a, b) => {
      const aValue = a[sortConfig.key] || '';
      const bValue = b[sortConfig.key] || '';
      
      if (aValue < bValue) {
        return sortConfig.order === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.order === 'asc' ? 1 : -1;
      }
      return 0;
    });
    
    setFilteredMonasteries(sortedResults);
  }, [searchTerm, vehicleFilter, typeFilter, monasteries, sortConfig]);

  const requestSort = (key: SortKey) => {
    setSortConfig(prevConfig => ({
      key,
      order: prevConfig.key === key && prevConfig.order === 'asc' ? 'desc' : 'asc'
    }));
  };

  const clearFilters = () => {
    setSearchTerm('');
    setVehicleFilter('');
    setTypeFilter('');
  };

  const getSortIndicator = (key: SortKey) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.order === 'asc' ? '↑' : '↓';
  };

  if (loading) {
    return (
      <div className="w-full p-12 flex justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-amber-600 border-amber-200 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-amber-900 text-lg font-medium">Loading monasteries...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-12 bg-white rounded-xl border border-rose-200">
        <div className="text-center">
          <p className="text-rose-700 text-lg font-medium mb-4">Error loading monasteries</p>
          <p className="text-rose-600">{error}</p>
          <button 
            onClick={() => setLoading(true)} 
            className="mt-6 px-6 py-2 bg-rose-50 text-rose-700 font-medium rounded-lg hover:bg-rose-100 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (monasteries.length === 0) {
    return (
      <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-lg p-6 text-center">
        <p className="font-medium">No monasteries found in the database.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <div className="flex flex-col md:flex-row gap-6 justify-between">
          <div className="w-full md:w-1/2 lg:w-2/3">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Search monasteries</label>
            <input
              id="search"
              type="search"
              className="w-full p-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Search by name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex flex-col md:flex-row items-end justify-end gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-3 bg-blue-50 text-blue-700 font-medium rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-2"
            >
              {showFilters ? 'Hide Filters' : 'Advanced Filters'}
              <span className="text-xs">{showFilters ? '▲' : '▼'}</span>
            </button>
            
            {(vehicleFilter || typeFilter) && (
              <button 
                onClick={clearFilters}
                className="px-4 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors flex items-center"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
        
        {showFilters && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Advanced Filters</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="vehicle-filter" className="block text-sm font-medium text-gray-700 mb-1">Buddhist Vehicle</label>
                <select
                  id="vehicle-filter"
                  className="w-full p-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition-all"
                  value={vehicleFilter}
                  onChange={(e) => setVehicleFilter(e.target.value)}
                >
                  <option value="">All Vehicles</option>
                  {availableVehicles.map(vehicle => (
                    <option key={vehicle} value={vehicle}>{vehicle}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="type-filter" className="block text-sm font-medium text-gray-700 mb-1">Center Type</label>
                <select
                  id="type-filter"
                  className="w-full p-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition-all"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option value="">All Types</option>
                  {availableTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
        
        <div className="mt-6 text-sm font-medium text-gray-700">
          Showing {filteredMonasteries.length} of {monasteries.length} monasteries
        </div>
      </div>
      
      <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
        <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => requestSort('name')}>
                <div className="flex items-center space-x-2">
                  <span>Name</span>
                  <span>{getSortIndicator('name')}</span>
                </div>
              </th>
              <th scope="col" className="px-6 py-3">
                Price Model
              </th>
              <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => requestSort('center_type')}>
                <div className="flex items-center space-x-2">
                  <span>Type</span>
                  <span>{getSortIndicator('center_type')}</span>
                </div>
              </th>
              <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => requestSort('buddhist_vehicle')}>
                <div className="flex items-center space-x-2">
                  <span>Vehicle</span>
                  <span>{getSortIndicator('buddhist_vehicle')}</span>
                </div>
              </th>
             
              <th scope="col" className="px-6 py-3">
                Contact & Website
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredMonasteries.map((monastery, idx) => (
              <tr key={monastery.id} className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700 border-gray-200">
                <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                  {monastery.name || 'N/A'}
                </th>
                <td className="px-6 py-4">
                  {monastery.price_model || 'N/A'}
                </td>
                <td className="px-6 py-4">
                  {monastery.center_type || 'N/A'}
                </td>
                <td className="px-6 py-4">
                  {monastery.buddhist_vehicle || 'N/A'}
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-2">
                    {monastery.contact_email && (
                      <a href={`mailto:${monastery.contact_email}`} className="font-medium text-blue-600 dark:text-blue-500 hover:underline">
                        Email
                      </a>
                    )}
                    {monastery.contact_phone && (
                      <a href={`tel:${monastery.contact_phone}`} className="font-medium text-blue-600 dark:text-blue-500 hover:underline">
                        Phone
                      </a>
                    )}
                    {monastery.website_url && (
                      <a 
                        href={monastery.website_url}
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                      >
                        Website
                      </a>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {filteredMonasteries.length === 0 && (
        <div className="text-center py-10 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-700 text-lg">No monasteries match the current filters</p>
          <button 
            className="mt-4 px-6 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
            onClick={clearFilters}
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
} 