import { Navigation, Layers, X } from 'lucide-react';

interface TopNavigationProps {
  viewMode: 'map' | 'satellite';
  onViewModeChange: (mode: 'map' | 'satellite') => void;
  isNavigating: boolean;
  onStopNavigation: () => void;
}

export function TopNavigation({ viewMode, onViewModeChange, isNavigating, onStopNavigation }: TopNavigationProps) {
  return (
    <div className="absolute top-0 left-0 right-0 z-30 bg-white shadow-md">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {isNavigating ? (
              <>
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center animate-pulse">
                  <Navigation className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-sm text-blue-600">Navigating...</div>
                  <div className="text-xs text-gray-500">8 min (1.2 mi)</div>
                </div>
              </>
            ) : (
              <>
                <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                  <Navigation className="w-4 h-4 text-gray-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-600">4 min (0.4 mi)</div>
                </div>
              </>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {isNavigating && (
              <button
                onClick={onStopNavigation}
                className="flex items-center gap-1 px-3 py-2 bg-red-50 text-red-600 rounded-full hover:bg-red-100 transition-colors"
              >
                <X className="w-4 h-4" />
                <span className="text-sm">Stop</span>
              </button>
            )}
            <button
              onClick={() => onViewModeChange(viewMode === 'map' ? 'satellite' : 'map')}
              className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
            >
              <Layers className="w-4 h-4 text-gray-700" />
              <span className="text-sm text-gray-700">
                {viewMode === 'map' ? 'Map' : 'Satellite'}
              </span>
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className={`flex-1 rounded-lg px-3 py-2 ${isNavigating ? 'bg-blue-50 border-2 border-blue-200' : 'bg-gray-50'}`}>
            <div className="text-xs text-gray-500">
              {isNavigating ? 'Heading to' : 'Current route via Main St'}
            </div>
            <div className="text-sm">→ Downtown Shopping Center</div>
          </div>
        </div>
      </div>
    </div>
  );
}