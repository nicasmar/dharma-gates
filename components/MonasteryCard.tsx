import type { Database } from '../lib/database.types';

type Monastery = Database['public']['Tables']['monasteries']['Row'];

interface MonasteryCardProps {
  monastery: Monastery;
  onViewOnMap: (monastery: Monastery) => void;
  admin: boolean;
}

export default function MonasteryCard({ monastery, onViewOnMap, admin = false }: MonasteryCardProps) {
  const {
    name,
    center_type,
    vehicle,
    description,
    website,
    address,
    email,
    phone,
    beginner_friendly,
    community_size,
    dietary_info,
    gender_policy,
    involvement_method,
    languages_spoken,
    length_of_stay,
    lineages,
    practices,
    price_details,
    price_model,
    setting,
    teachers,
    traditions
  } = monastery;

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300">
      <div className="p-4">
        {/* Header Section */}
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">{name}</h3>
            <div className="flex gap-1.5">
              <span className="px-2 py-0.5 text-xs font-semibold bg-[#286B88]/10 text-[#286B88] rounded-full border border-[#286B88]/20">
                {center_type}
              </span>
              <span className="px-2 py-0.5 text-xs font-semibold bg-[#286B88]/10 text-[#286B88] rounded-full border border-[#286B88]/20">
                {vehicle}
              </span>
              {beginner_friendly && (
                <span className="px-2 py-0.5 text-xs font-semibold bg-[#286B88]/10 text-[#286B88] rounded-full border border-[#286B88]/20">
                  Beginner Friendly
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        {description && (
          <p className="text-sm text-gray-600 mb-2 line-clamp-2">{description}</p>
        )}

        {/* Key Information Grid */}
        <div className="grid grid-cols-2 gap-2 mb-2">
          {address && (
            <div className="space-y-0.5">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Address</h4>
              <p className="text-sm text-gray-900">{address}</p>
            </div>
          )}
          {setting && (
            <div className="space-y-0.5">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Setting</h4>
              <p className="text-sm text-gray-900">{setting}</p>
            </div>
          )}
          {community_size && (
            <div className="space-y-0.5">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Community Size</h4>
              <p className="text-sm text-gray-900">{community_size}</p>
            </div>
          )}
          {length_of_stay && (
            <div className="space-y-0.5">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Length of Stay</h4>
              <p className="text-sm text-gray-900">{length_of_stay}</p>
            </div>
          )}
          {gender_policy && (
            <div className="space-y-0.5">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Gender Policy</h4>
              <p className="text-sm text-gray-900">{gender_policy}</p>
            </div>
          )}
          {involvement_method && (
            <div className="space-y-0.5">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Involvement Method</h4>
              <p className="text-sm text-gray-900">{involvement_method}</p>
            </div>
          )}
          {dietary_info && (
            <div className="space-y-0.5">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Dietary Information</h4>
              <p className="text-sm text-gray-900">{dietary_info}</p>
            </div>
          )}
          {price_model && (
            <div className="space-y-0.5">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pricing Model</h4>
              <p className="text-sm text-gray-900">{price_model}</p>
            </div>
          )}
          {price_details && (
            <div className="space-y-0.5">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pricing Details</h4>
              <p className="text-sm text-gray-900">{price_details}</p>
            </div>
          )}
        </div>

        {/* Tags Section */}
        <div className="space-y-1.5 mb-2">
          {languages_spoken && languages_spoken.length > 0 && (
            <div className="space-y-0.5">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Languages Spoken</h4>
              <div className="flex flex-wrap gap-1">
                {languages_spoken.map((language, index) => (
                  <span key={index} className="px-1.5 py-0.5 text-xs font-medium bg-gray-50 text-gray-700 rounded-full border border-gray-200">
                    {language}
                  </span>
                ))}
              </div>
            </div>
          )}
          {teachers && teachers.length > 0 && (
            <div className="space-y-0.5">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Teachers</h4>
              <div className="flex flex-wrap gap-1">
                {teachers.map((teacher, index) => (
                  <span key={index} className="px-1.5 py-0.5 text-xs font-medium bg-gray-50 text-gray-700 rounded-full border border-gray-200">
                    {teacher}
                  </span>
                ))}
              </div>
            </div>
          )}
          {practices && practices.length > 0 && (
            <div className="space-y-0.5">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Practices</h4>
              <div className="flex flex-wrap gap-1">
                {practices.map((practice, index) => (
                  <span key={index} className="px-1.5 py-0.5 text-xs font-medium bg-gray-50 text-gray-700 rounded-full border border-gray-200">
                    {practice}
                  </span>
                ))}
              </div>
            </div>
          )}
          {lineages && lineages.length > 0 && (
            <div className="space-y-0.5">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Lineages</h4>
              <div className="flex flex-wrap gap-1">
                {lineages.map((lineage, index) => (
                  <span key={index} className="px-1.5 py-0.5 text-xs font-medium bg-gray-50 text-gray-700 rounded-full border border-gray-200">
                    {lineage}
                  </span>
                ))}
              </div>
            </div>
          )}
          {traditions && traditions.length > 0 && (
            <div className="space-y-0.5">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Traditions</h4>
              <div className="flex flex-wrap gap-1">
                {traditions.map((tradition, index) => (
                  <span key={index} className="px-1.5 py-0.5 text-xs font-medium bg-gray-50 text-gray-700 rounded-full border border-gray-200">
                    {tradition}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Contact Buttons */}
        <div className="flex flex-wrap gap-1.5">
          {!admin ? (
            <>
              <button
                  onClick={() => onViewOnMap(monastery)}
                  className="inline-flex items-center px-2 py-1 text-sm font-semibold text-white bg-[#286B88] rounded-lg hover:bg-[#286B88]/90 transition-colors"
                >
                  View on Map
              </button>
              {website && (
                <a
                  href={website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-2 py-1 text-sm font-semibold text-white bg-[#286B88] rounded-lg hover:bg-[#286B88]/90 transition-colors"
                >
                  Visit Website
                </a>
              )}
              
              {email && (
                <a
                  href={`mailto:${email}`}
                  className="inline-flex items-center px-2 py-1 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Email
                </a>
              )}
              {phone && (
                <a
                  href={`tel:${phone}`}
                  className="inline-flex items-center px-2 py-1 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Call
                </a>
              )}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
} 