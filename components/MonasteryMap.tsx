import * as React from 'react';
import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { getMonasteries } from '@/lib/supabase';
import type { Tables } from '@/lib/database.types';
import 'leaflet/dist/leaflet.css';

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

type Monastery = Tables<'monasteries'>;
type MonasteryWithCoordinates = Monastery & { latitude: number; longitude: number };

export default function MonasteryMap() {
  const [monasteries, setMonasteries] = useState<MonasteryWithCoordinates[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMonasteries = async () => {
      try {
        const data = await getMonasteries();
        console.log('Fetched monasteries:', data);
        const validMonasteries = data.filter(
          (m): m is MonasteryWithCoordinates => 
            m.latitude !== null && m.longitude !== null
        );
        console.log('Valid monasteries:', validMonasteries);
        setMonasteries(validMonasteries);
      } catch (err) {
        console.error('Error fetching monasteries:', err);
        setError('Failed to load monasteries. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchMonasteries();
  }, []);


  if (loading) {
    return (
      <div className="w-full h-[600px] flex items-center justify-center bg-gray-100">
        Loading monasteries...
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-[600px] flex items-center justify-center text-red-500 bg-gray-100">
        {error}
      </div>
    );
  }


  return (
    <div className="w-full flex justify-center overflow-x-hidden">
      <div className="w-[600px] h-[400px] bg-gray-100 border border-gray-300 rounded-lg overflow-hidden">
        <MapContainer
          center={[20, 0] as L.LatLngExpression}
          zoom={2}
          minZoom={2}
          maxZoom={8}
          style={{ height: '500px', width: '1000px' }}
          maxBounds={[[-90, -180], [90, 180]]}
          maxBoundsViscosity={1.0}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {monasteries.map((monastery) => (
            <Marker
              key={monastery.id}
              position={[monastery.latitude, monastery.longitude] as L.LatLngExpression}
              icon={icon}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-bold text-lg">{monastery.name}</h3>
                  {monastery.buddhist_vehicle && (
                    <p className="text-gray-600">Vehicle: {monastery.buddhist_vehicle}</p>
                  )}
                  {monastery.traditions && monastery.traditions.length > 0 && (
                    <p className="text-gray-600">Traditions: {monastery.traditions.join(', ')}</p>
                  )}
                  {monastery.price_model && (
                    <p className="text-green-500 font-medium">Price Model: {monastery.price_model}</p>
                  )}
                  {monastery.description && (
                    <p className="text-green-500 font-medium">Description: {monastery.description}</p>
                  )}
                  <div className="mt-2 flex flex-col gap-1">
                    {monastery.website_url && (
                      <a
                        href={monastery.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        Visit Website
                      </a>
                    )}
                    {monastery.contact_email && (
                      <a
                        href={`mailto:${monastery.contact_email}`}
                        className="text-blue-500 hover:underline"
                      >
                        Contact via Email
                      </a>
                    )}
                    {monastery.contact_phone && (
                      <a
                        href={`tel:${monastery.contact_phone}`}
                        className="text-blue-500 hover:underline"
                      >
                        Contact via Phone
                      </a>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
