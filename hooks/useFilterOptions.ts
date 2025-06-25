import { useState, useEffect } from 'react';
import type { Database } from '../lib/database.types';

type Monastery = Database['public']['Tables']['monasteries']['Row'];

// Function to normalize text by removing accents and converting to lowercase
const normalizeText = (text: string): string => {
  return text
    .normalize('NFD')  // Decompose characters with accents
    .replace(/[\u0300-\u036f]/g, '')  // Remove accents
    .toLowerCase()  // Convert to lowercase
    .trim();  // Remove leading/trailing whitespace
};

// Function to group similar values
const groupSimilarValues = (values: string[]): Map<string, string[]> => {
  const groups = new Map<string, string[]>();
  
  values.forEach(value => {
    if (!value) return;
    const normalized = normalizeText(value);
    const existing = groups.get(normalized);
    if (existing) {
      if (!existing.includes(value)) {
        existing.push(value);
      }
    } else {
      groups.set(normalized, [value]);
    }
  });
  
  return groups;
};

export interface FilterOptions {
  availableVehicles: string[];
  availableTypes: string[];
  availableSettings: string[];
  availablePriceModels: string[];
  availableGenderPolicies: string[];
  availableTraditions: string[];
}

export function useFilterOptions(monasteries: Monastery[]): FilterOptions {
  const [availableVehicles, setAvailableVehicles] = useState<string[]>([]);
  const [availableTypes, setAvailableTypes] = useState<string[]>([]);
  const [availableSettings, setAvailableSettings] = useState<string[]>([]);
  const [availablePriceModels, setAvailablePriceModels] = useState<string[]>([]);
  const [availableGenderPolicies, setAvailableGenderPolicies] = useState<string[]>([]);
  const [availableTraditions, setAvailableTraditions] = useState<string[]>([]);

  useEffect(() => {
    if (!monasteries.length) return;

    // Group similar values for all filterable fields
    const vehicleGroups = groupSimilarValues(
      monasteries.map(m => m.vehicle).filter(Boolean) as string[]
    );
    const vehicles = Array.from(vehicleGroups.values())
      .map(group => group[0])
      .sort();
    setAvailableVehicles(vehicles);

    const typeGroups = groupSimilarValues(
      monasteries.map(m => m.center_type).filter(Boolean) as string[]
    );
    const types = Array.from(typeGroups.values())
      .map(group => group[0])
      .sort();
    setAvailableTypes(types);

    const settingGroups = groupSimilarValues(
      monasteries.map(m => m.setting).filter(Boolean) as string[]
    );
    const settings = Array.from(settingGroups.values())
      .map(group => group[0])
      .sort();
    setAvailableSettings(settings);

    const priceModelGroups = groupSimilarValues(
      monasteries.map(m => m.price_model).filter(Boolean) as string[]
    );
    const priceModels = Array.from(priceModelGroups.values())
      .map(group => group[0])
      .sort();
    setAvailablePriceModels(priceModels);

    const genderPolicyGroups = groupSimilarValues(
      monasteries.map(m => m.gender_policy).filter(Boolean) as string[]
    );
    const genderPolicies = Array.from(genderPolicyGroups.values())
      .map(group => group[0])
      .sort();
    setAvailableGenderPolicies(genderPolicies);

    // Collect and normalize traditions from all monasteries
    const allTraditions = monasteries.flatMap(m => m.traditions || []);
    const traditionGroups = groupSimilarValues(allTraditions);
    const traditions = Array.from(traditionGroups.values())
      .map(group => group[0])
      .sort();
    setAvailableTraditions(traditions);
  }, [monasteries]);

  return {
    availableVehicles,
    availableTypes,
    availableSettings,
    availablePriceModels,
    availableGenderPolicies,
    availableTraditions,
  };
} 