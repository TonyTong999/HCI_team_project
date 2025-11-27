// components/ParkingRecommendationCard.tsx
import { Navigation, MapPin } from 'lucide-react';
import { parkingSpots, getAvailabilityStatus } from './MapView';

interface ParkingRecommendationCardProps {
  selectedParkingId: string | null;
  onSelect: (id: string) => void;
  isNavigating: boolean;
  onStartNavigation: () => void;
}

const destination = { name: 'Downtown Plaza' };

export function ParkingRecommendationCard({
  selectedParkingId,
  onSelect,
  isNavigating,
  onStartNavigation,
}: ParkingRecommendationCardProps) {
  if (isNavigating) return null;

  const selectedSpot = selectedParkingId ? parkingSpots[selectedParkingId as keyof typeof parkingSpots] : null;

  return (
    <div className="absolute bottom-0 left-0 right-0 z-20 bg-white rounded-t-3xl shadow-2xl p-4">
      <div className="w-14 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
      
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm text-gray-500">Parking near {destination.name}</h2>
      </div>
      
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {Object.entries(parkingSpots).map(([id, spot]) => {
          const status = getAvailabilityStatus(spot.available, spot.total);
          return (
            <div
              key={id}
              onClick={() => onSelect(id)}
              className={`p-3 rounded-xl cursor-pointer transition-colors ${
                selectedParkingId === id ? 'bg-blue-50 border-2 border-blue-500' : 'bg-gray-50 border-2 border-transparent'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm text-gray-700">{spot.name}</h3>
                    {spot.type === 'street' && (
                      <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">Street</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs mb-1">
                    <span className="text-gray-500">{spot.distance} drive</span>
                    <span className="text-blue-600 font-medium">{spot.walkToDestination} walk</span>
                    <span className="text-gray-500">{spot.rate}</span>
                  </div>
                  <div className={`text-xs font-medium ${
                    status.color === 'green' ? 'text-green-600' : 
                    status.color === 'yellow' ? 'text-yellow-600' : 
                    'text-red-600'
                  }`}>
                    {status.label} ({spot.available}/{spot.total})
                  </div>
                </div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  selectedParkingId === id ? 'bg-blue-500' : 'bg-gray-300'
                }`}>
                  <MapPin className={`w-4 h-4 ${selectedParkingId === id ? 'text-white' : 'text-gray-600'}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {selectedSpot && (
        <button
          onClick={onStartNavigation}
          className="w-full mt-4 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
        >
          <Navigation className="w-5 h-5" />
          Start Navigation
        </button>
      )}
    </div>
  );
}