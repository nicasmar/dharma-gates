import type { Database } from '../lib/database.types';
import MonasteryCard from './MonasteryCard';

type Monastery = Database['public']['Tables']['monasteries']['Row'];

// US State abbreviation to full name mapping
const US_STATES: { [key: string]: string } = {
  'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas', 'CA': 'California',
  'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware', 'FL': 'Florida', 'GA': 'Georgia',
  'HI': 'Hawaii', 'ID': 'Idaho', 'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa',
  'KS': 'Kansas', 'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
  'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi', 'MO': 'Missouri',
  'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada', 'NH': 'New Hampshire', 'NJ': 'New Jersey',
  'NM': 'New Mexico', 'NY': 'New York', 'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio',
  'OK': 'Oklahoma', 'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina',
  'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah', 'VT': 'Vermont',
  'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia', 'WI': 'Wisconsin', 'WY': 'Wyoming',
  'DC': 'District of Columbia'
};

// Canadian province abbreviation to full name mapping
const CANADIAN_PROVINCES: { [key: string]: string } = {
  'AB': 'Alberta', 'BC': 'British Columbia', 'MB': 'Manitoba', 'NB': 'New Brunswick',
  'NL': 'Newfoundland and Labrador', 'NS': 'Nova Scotia', 'ON': 'Ontario', 'PE': 'Prince Edward Island',
  'QC': 'Quebec', 'SK': 'Saskatchewan', 'NT': 'Northwest Territories', 'NU': 'Nunavut', 'YT': 'Yukon'
};

// Function to normalize state/province names
const normalizeState = (state: string, country: string): string => {
  const trimmedState = state.trim();
  const upperState = trimmedState.toUpperCase();
  
  // Check for US states
  if (country.toLowerCase().includes('united states') || country.toLowerCase().includes('usa') || country.toLowerCase() === 'us') {
    if (US_STATES[upperState]) {
      return US_STATES[upperState];
    }
    // Check if it's already a full state name (case insensitive)
    const stateValues = Object.values(US_STATES);
    const foundState = stateValues.find(fullName => 
      fullName.toLowerCase() === trimmedState.toLowerCase()
    );
    if (foundState) {
      return foundState;
    }
  }
  
  // Check for Canadian provinces
  if (country.toLowerCase().includes('canada')) {
    if (CANADIAN_PROVINCES[upperState]) {
      return CANADIAN_PROVINCES[upperState];
    }
    // Check if it's already a full province name
    const provinceValues = Object.values(CANADIAN_PROVINCES);
    const foundProvince = provinceValues.find(fullName => 
      fullName.toLowerCase() === trimmedState.toLowerCase()
    );
    if (foundProvince) {
      return foundProvince;
    }
  }
  
  // Return original if no match found, but capitalize properly
  return trimmedState.split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');
};

interface MonasteryTableProps {
  monasteries: Monastery[];
  onViewOnMap: (monastery: Monastery) => void;
  onEditMonastery?: (monastery: Monastery) => void;
  onDeleteMonastery?: (monastery: Monastery) => void;
  admin?: boolean;
}

// Function to parse location from address
const parseLocation = (address: string | null): { country: string; state: string } | null => {
  if (!address) return null;
  
  // Check if address contains structured geocoded data (format: display_name|||country|||state)
  if (address.includes('|||')) {
    const [, country, state] = address.split('|||');
    if (country && state) {
      return { 
        country: country.trim() || 'Unknown', 
        state: state.trim() || 'Unknown'
      };
    }
  }
  
  // Fall back to parsing comma-separated address
  const parts = address.split(',').map(part => part.trim());
  
  if (parts.length >= 2) {
    // Check if last part looks like "STATE ZIP" (e.g., "CA 95482") - indicates missing country
    const lastPart = parts[parts.length - 1];
    let country = lastPart;
    const searchStartIndex = parts.length - 2;
    
    // If last part is "STATE ZIP" pattern, assume USA and extract state
    if (/^[A-Z]{2}\s+\d/.test(lastPart)) {
      country = 'United States';
      const stateAbbr = lastPart.split(/\s+/)[0];
      const normalizedState = normalizeState(stateAbbr, country);
      return { country, state: normalizedState };
    }
    
    // Look for state/province by working backwards through parts
    let state = null;
    
    for (let i = searchStartIndex; i >= 0; i--) {
      const part = parts[i];
      
      // Skip if part looks like a zip code (contains numbers at start or is all numbers)
      if (/^\d/.test(part) || /^\d+$/.test(part)) {
        continue;
      }
      
      // Skip if part contains "state abbreviation + zip code" pattern (e.g., "CA 95482")
      if (/^[A-Z]{2}\s+\d/.test(part)) {
        // Extract just the state abbreviation
        const stateAbbr = part.split(/\s+/)[0];
        state = stateAbbr;
        break;
      }
      
      // Skip if it's obviously a city (common city indicators)
      const cityIndicators = /\b(city|town|village|township|borough|district)\b/i;
      if (cityIndicators.test(part)) {
        continue;
      }
      
      // This looks like a potential state/province
      state = part;
      break;
    }
    
    if (!state) {
      return null; // Couldn't find a valid state
    }
    
    // Normalize the state using our mapping
    const normalizedState = normalizeState(state, country);
    
    return { country, state: normalizedState };
  }
  
  return null; // Can't parse properly
};

// Function to group monasteries by country and state
const groupMonasteries = (monasteries: Monastery[]) => {
  const grouped: { [country: string]: { [state: string]: Monastery[] } } = {};
  const unparseable: Monastery[] = [];
  
  monasteries.forEach(monastery => {
    const location = parseLocation(monastery.address);
    
    if (location) {
      const { country, state } = location;
      
      if (!grouped[country]) {
        grouped[country] = {};
      }
      if (!grouped[country][state]) {
        grouped[country][state] = [];
      }
      
      grouped[country][state].push(monastery);
    } else {
      unparseable.push(monastery);
    }
  });
  
  // Sort monasteries within each state alphabetically by name
  Object.keys(grouped).forEach(country => {
    Object.keys(grouped[country]).forEach(state => {
      grouped[country][state].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    });
  });
  
  return { grouped, unparseable };
};

export default function MonasteryTable({ monasteries, onViewOnMap, onEditMonastery, onDeleteMonastery, admin }: MonasteryTableProps) {
  const { grouped, unparseable } = groupMonasteries(monasteries);
  
  // Sort countries with United States first, then alphabetically
  const sortedCountries = Object.keys(grouped).sort((a, b) => {
    if (a === 'United States') return -1;
    if (b === 'United States') return 1;
    return a.localeCompare(b);
  });
  
  return (
    <div className="space-y-8">
      {sortedCountries.map(country => {
        const sortedStates = Object.keys(grouped[country]).sort();
        
        return (
          <div key={country} className="space-y-6">
            {/* Country Header */}
            <div className="border-b-2 border-[#286B88] pb-2">
              <h2 className="text-2xl font-bold text-[#286B88]">{country}</h2>
            </div>
            
            {sortedStates.map(state => (
              <div key={`${country}-${state}`} className="space-y-4">
                {/* State Subheader */}
                <div className="border-b border-gray-300 pb-1">
                  <h3 className="text-lg font-semibold text-gray-700">{state}</h3>
                </div>
                
                {/* Monasteries in this state */}
                <div className="grid grid-cols-1 gap-4 ml-4">
                  {grouped[country][state].map((monastery) => (
                    <MonasteryCard 
                      key={monastery.id} 
                      monastery={monastery} 
                      onViewOnMap={onViewOnMap}
                      admin={admin || false}
                      onEditMonastery={onEditMonastery}
                      onDeleteMonastery={onDeleteMonastery}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        );
      })}
      
      {/* Unparseable addresses at the end */}
      {unparseable.length > 0 && (
        <div className="space-y-6">
          <div className="border-b-2 border-gray-400 pb-2">
            <h2 className="text-2xl font-bold text-gray-600">Other Locations/Address Unlisted</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 ml-4">
            {unparseable.sort((a, b) => (a.name || '').localeCompare(b.name || '')).map((monastery) => (
              <MonasteryCard 
                key={monastery.id} 
                monastery={monastery} 
                onViewOnMap={onViewOnMap}
                admin={admin || false}
                onEditMonastery={onEditMonastery}
                onDeleteMonastery={onDeleteMonastery}
              />
            ))}
          </div>
        </div>
      )}
      
      {monasteries.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No centers found</p>
        </div>
      )}
    </div>
  );
} 