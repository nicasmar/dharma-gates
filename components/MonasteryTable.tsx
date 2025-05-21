import type { Database } from '../lib/database.types';
import MonasteryCard from './MonasteryCard';

type Monastery = Database['public']['Tables']['monasteries']['Row'];

interface MonasteryTableProps {
  monasteries: Monastery[];
  onViewOnMap: (monastery: Monastery) => void;
}

export default function MonasteryTable({ monasteries, onViewOnMap }: MonasteryTableProps) {
  return (
    <div className="grid grid-cols-1 gap-6">
      {monasteries.map((monastery) => (
        <MonasteryCard 
          key={monastery.id} 
          monastery={monastery} 
          onViewOnMap={onViewOnMap}
          admin={false}
        />
            ))}
    </div>
  );
} 