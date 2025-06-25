import * as React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { Database } from '../lib/database.types';
import { useEffect } from 'react';

// Fix for default marker icons in Next.js
const icon = L.icon({
  iconUrl: '/images/marker-icon.png',
  iconRetinaUrl: '/images/marker-icon-2x.png',
  shadowUrl: '/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});

type Monastery = Database['public']['Tables']['monasteries']['Row'];
type MonasteryWithCoordinates = Monastery & { latitude: number; longitude: number };

interface MonasteryMapProps {
  monasteries: Monastery[];
  selectedMonastery: Monastery | null;
  onEditMonastery?: (monastery: Monastery) => void;
  onDeleteMonastery?: (monastery: Monastery) => void;
  admin?: boolean;
}

function MapController({ selectedMonastery }: { selectedMonastery: Monastery | null }) {
  const map = useMap();

  useEffect(() => {
    if (selectedMonastery && selectedMonastery.latitude && selectedMonastery.longitude) {
      map.setView([selectedMonastery.latitude, selectedMonastery.longitude], 8);
    }
  }, [selectedMonastery, map]);

  return null;
}

export default function MonasteryMap({ monasteries, selectedMonastery, onEditMonastery, onDeleteMonastery, admin }: MonasteryMapProps) {
  const validMonasteries = monasteries.filter(
          (m): m is MonasteryWithCoordinates => 
            m.latitude !== null && m.longitude !== null
        );

  return (
    <div className="bg-gray-100 w-full h-full">
        <MapContainer
        center={[20, 0]}
          zoom={2}
          minZoom={2}
          maxZoom={8}
          maxBounds={[[-90, -180], [90, 180]]}
          maxBoundsViscosity={1.0}
        >
        <MapController selectedMonastery={selectedMonastery} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          tileSize={256}
          maxZoom={19}
          />
        {validMonasteries.map((monastery) => (
            <Marker
              key={monastery.id}
            position={[monastery.latitude, monastery.longitude]}
              icon={icon}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-bold text-lg">{monastery.name}</h3>
                  {monastery.description && (
                  <p className="text-gray-600">{monastery.description}</p>
                  )}
                  <div className="mt-2 flex flex-col gap-1">
                  {admin && onEditMonastery && onDeleteMonastery ? (
                    <>
                      <button
                        onClick={() => onEditMonastery(monastery)}
                        className="px-2 py-1 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDeleteMonastery(monastery)}
                        className="px-2 py-1 text-sm bg-rose-600 text-white rounded hover:bg-rose-700"
                      >
                        Delete
                      </button>
                    </>
                  ) : (
                    <>
                      {monastery.website && (
                        <a
                        href={monastery.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline"
                        >
                          Visit Website
                        </a>
                      )}
                    </>
                  )}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
    </div>
  );
}
