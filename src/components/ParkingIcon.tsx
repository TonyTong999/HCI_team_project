import { ParkingSquare, Navigation } from 'lucide-react';

interface Parking {
  id: string;
  name: string;
  price: string;
  walkingDistance: string;
  walkingTime: string;
  availability: 'available' | 'moderate' | 'limited';
  availabilityScore: number;
  type: 'Garage' | 'Lot' | 'Street' | 'Valet';
  position: { top: string; left: string };
}

interface ParkingIconProps {
  parking: Parking;
  isSelected: boolean;
  onClick: () => void;
  showPath: boolean;
  isNavigating: boolean;
}

export function ParkingIcon({ parking, isSelected, onClick, showPath, isNavigating }: ParkingIconProps) {
  const availabilityColors = {
    available: { border: 'border-green-500', bg: 'bg-green-500', text: 'text-green-600' },
    moderate: { border: 'border-yellow-500', bg: 'bg-yellow-500', text: 'text-yellow-600' },
    limited: { border: 'border-red-500', bg: 'bg-red-500', text: 'text-red-600' }
  };

  const colors = availabilityColors[parking.availability];

  return (
    <>
      {/* Walking Path Line (when selected, but not navigating) */}
      {showPath && (
        <svg className="absolute inset-0 pointer-events-none z-10" style={{ width: '100%', height: '100%' }}>
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="#3B82F6" />
            </marker>
          </defs>
          <path
            d={`M ${parking.position.left} ${parking.position.top} Q ${parking.position.left === '65%' ? '57%' : '50%'} ${parking.position.top === '25%' ? '40%' : '50%'}, 50% 55%`}
            stroke="#3B82F6"
            strokeWidth="3"
            strokeDasharray="8,4"
            fill="none"
            markerEnd="url(#arrowhead)"
            opacity="0.7"
          />
        </svg>
      )}

      {/* Parking Icon */}
      <div
        className={`absolute z-20 cursor-pointer transition-transform ${isSelected ? 'scale-110' : 'hover:scale-105'}`}
        style={{
          top: parking.position.top,
          left: parking.position.left,
          transform: 'translate(-50%, -50%)'
        }}
        onClick={onClick}
      >
        <div className="relative">
          {/* Icon with colored border */}
          <div className={`w-14 h-14 rounded-xl ${colors.bg} bg-opacity-90 shadow-lg border-4 ${colors.border} flex items-center justify-center backdrop-blur-sm ${isNavigating && isSelected ? 'animate-pulse' : ''}`}>
            <ParkingSquare className="w-8 h-8 text-white" strokeWidth={2.5} />
          </div>
          
          {/* Price tag */}
          <div className="absolute -top-2 -right-2 bg-white rounded-full px-2 py-0.5 shadow-md border-2 border-gray-200">
            <span className="text-xs">{parking.price}</span>
          </div>
          
          {/* Walking time label */}
          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap bg-white px-2 py-1 rounded-lg shadow-md">
            <div className="flex items-center gap-1">
              <Navigation className="w-3 h-3 text-gray-600" />
              <span className="text-xs">{parking.walkingTime}</span>
            </div>
          </div>

          {/* Selection indicator */}
          {isSelected && (
            <div className={`absolute -inset-2 border-3 ${isNavigating ? 'border-blue-600' : 'border-blue-500'} rounded-2xl ${isNavigating ? '' : 'animate-pulse'}`} />
          )}
        </div>
      </div>
    </>
  );
}