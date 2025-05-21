import { Database } from '@/lib/database.types';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

const DynamicMonasteryMap = dynamic(() => import('./MonasteryMap'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-gray-100 flex items-center justify-center">Loading map...</div>
});

type Monastery = Database['public']['Tables']['monasteries']['Row'];

interface MapWrapperProps {
  selectedMonastery: Monastery | null;
  monasteries: Monastery[];
}

export default function MapWrapper({ selectedMonastery, monasteries }: MapWrapperProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-full h-full bg-gray-100 flex items-center justify-center">Loading map...</div>;
  }

  return <DynamicMonasteryMap selectedMonastery={selectedMonastery} monasteries={monasteries} />;
}
