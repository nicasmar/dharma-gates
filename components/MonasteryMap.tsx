import * as React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, LayersControl } from 'react-leaflet';
import L from 'leaflet';
import type { Database } from '../lib/database.types';
import { useEffect, useState } from 'react';

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

// Selected monastery icon (different color)
const selectedIcon = L.icon({
  iconUrl: '/images/marker-icon.png',
  iconRetinaUrl: '/images/marker-icon-2x.png',
  shadowUrl: '/images/marker-shadow.png',
  iconSize: [35, 57],
  iconAnchor: [17, 57],
  popupAnchor: [1, -48],
  tooltipAnchor: [16, -28],
  shadowSize: [51, 51]
});

type Monastery = Database['public']['Tables']['monasteries']['Row'];
type MonasteryWithCoordinates = Monastery & { latitude: number; longitude: number };

// Helper function to truncate description for popup display
const truncateDescription = (description: string | null, maxLength: number = 100): string | null => {
  if (!description) return null;
  if (description.length <= maxLength) return description;
  return description.substring(0, maxLength).trim() + '...';
};

// Component to handle initial map bounds - disabled to maintain user control
function MapController({ monasteries }: { monasteries: MonasteryWithCoordinates[] }) {
  // Removed auto-fitting behavior to let users control map position manually
  return null;
}

// Street View component
function StreetViewButton({ lat, lng }: { lat: number, lng: number }) {
  const openStreetView = () => {
    // Open Google Street View in new tab
    const url = `https://www.google.com/maps/@${lat},${lng},3a,75y,90t/data=!3m6!1e1!3m4!1s0!2e0!7i16384!8i8192`;
    window.open(url, '_blank');
  };

  return (
    <button
      onClick={openStreetView}
      className="px-2 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center justify-center gap-1"
    >
      <span>📍</span>
      Street View
    </button>
  );
}

interface MonasteryMapProps {
  monasteries: Monastery[];
  selectedMonastery: Monastery | null;
  onSelectMonastery?: (monastery: Monastery) => void;
  onEditMonastery?: (monastery: Monastery) => void;
  onDeleteMonastery?: (monastery: Monastery) => void;
  admin?: boolean;
}

export default function MonasteryMap({ monasteries, selectedMonastery, onSelectMonastery, onEditMonastery, onDeleteMonastery, admin }: MonasteryMapProps) {
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
        maxZoom={19}
        maxBounds={[[-90, -180], [90, 180]]}
        maxBoundsViscosity={1.0}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
        scrollWheelZoom={true}
      >
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="OpenStreetMap">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              maxZoom={19}
            />
          </LayersControl.BaseLayer>
          
          <LayersControl.BaseLayer name="Satellite">
            <TileLayer
              attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              maxZoom={19}
            />
          </LayersControl.BaseLayer>
          
          <LayersControl.BaseLayer name="Terrain">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
              maxZoom={17}
            />
          </LayersControl.BaseLayer>
        </LayersControl>

        <MapController monasteries={validMonasteries} />

        {validMonasteries.map((monastery) => (
          <Marker
            key={monastery.id}
            position={[monastery.latitude, monastery.longitude]}
            icon={selectedMonastery?.id === monastery.id ? selectedIcon : icon}
            eventHandlers={onSelectMonastery ? {
              click: () => onSelectMonastery(monastery)
            } : undefined}
          >
            <Popup maxWidth={300} minWidth={250}>
              <div className="p-2">
                {/* First photo if available */}
                {monastery.photos && monastery.photos.length > 0 && (
                  <div className="mb-3">
                    <img
                      src={monastery.photos[0]}
                      alt={monastery.name}
                      className="w-full h-32 object-cover rounded-lg"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
                <h3 className="font-bold text-lg mb-2">{monastery.name}</h3>
                {monastery.description && (
                  <p className="text-gray-600 mb-3">{truncateDescription(monastery.description, 150)}</p>
                )}
                
                <div className="flex flex-col gap-2">
                  {/* Street View Button */}
                  <StreetViewButton lat={monastery.latitude} lng={monastery.longitude} />
                  
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
                          className="px-2 py-1 text-sm bg-[#286B88] text-white rounded hover:bg-[#286B88]/90 text-center !text-white"
                        >
                          Visit Website
                        </a>
                      )}
                      <button
                        onClick={() => {
                          // Use address if available, otherwise use coordinates
                          if (monastery.address) {
                            const address = monastery.address.split('|||')[0] || monastery.address;
                            const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
                            window.open(url, '_blank');
                          } else {
                            // Use coordinates directly
                            const url = `https://www.google.com/maps/search/?api=1&query=${monastery.latitude},${monastery.longitude}`;
                            window.open(url, '_blank');
                          }
                        }}
                        className="px-2 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
                      >
                        Get Directions
                      </button>
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
