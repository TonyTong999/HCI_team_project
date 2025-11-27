import { useState } from 'react';
import { TopNavigation } from './components/TopNavigation';
import { ParkingRecommendationCard } from './components/ParkingRecommendationCard';
import { MapView } from './components/MapView';

export default function App() {
  const [viewMode, setViewMode] = useState<'map' | 'satellite'>('map');
  const [selectedParkingId, setSelectedParkingId] = useState<string | null>('p1');
  const [isNavigating, setIsNavigating] = useState(false);

  const handleStartNavigation = () => {
    setIsNavigating(true);
  };

  const handleStopNavigation = () => {
    setIsNavigating(false);
  };

  return (
    <div className="relative h-screen w-full overflow-hidden bg-gray-100">
      <TopNavigation 
        viewMode={viewMode} 
        onViewModeChange={setViewMode}
        isNavigating={isNavigating}
        onStopNavigation={handleStopNavigation}
      />
      
      <MapView 
        key={`map-${viewMode}`}
        viewMode={viewMode}
        selectedParkingId={selectedParkingId}
        onParkingSelect={setSelectedParkingId}
        isNavigating={isNavigating}
      />
      
      <ParkingRecommendationCard 
        selectedParkingId={selectedParkingId}
        onSelect={setSelectedParkingId}
        isNavigating={isNavigating}
        onStartNavigation={handleStartNavigation}
      />
    </div>
  );
}