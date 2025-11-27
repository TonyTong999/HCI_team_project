// components/MapView.tsx
import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapViewProps {
  viewMode: 'map' | 'satellite';
  selectedParkingId: string | null;
  onParkingSelect: (id: string | null) => void;
  isNavigating: boolean;
}

// Destination
const destination = { lat: 37.2868, lng: -121.9490, name: 'Downtown Plaza' };

// Parking locations data
export const parkingSpots = {
  p1: { 
    lat: 37.2872, 
    lng: -121.9502, 
    name: 'Main Street Garage', 
    distance: '0.3 mi', 
    walkToDestination: '150 m',
    available: 25, 
    total: 50, 
    rate: '$2/hr',
    type: 'garage'
  },
  p2: { 
    lat: 37.2865, 
    lng: -121.9485, 
    name: 'City Center Lot', 
    distance: '0.4 mi', 
    walkToDestination: '200 m',
    available: 5, 
    total: 30, 
    rate: '$3/hr',
    type: 'lot'
  },
  p3: { 
    lat: 37.2855, 
    lng: -121.9495, 
    name: 'West Avenue Street Parking', 
    distance: '0.5 mi', 
    walkToDestination: '280 m',
    available: 2, 
    total: 8, 
    rate: '$1.5/hr',
    type: 'street',
    streetZone: [
      { lat: 37.2854, lng: -121.9493 },
      { lat: 37.2854, lng: -121.9497 },
    ]
  },
  p4: { 
    lat: 37.2870, 
    lng: -121.9488, 
    name: 'Oak Street Parking', 
    distance: '0.2 mi', 
    walkToDestination: '120 m',
    available: 4, 
    total: 6, 
    rate: '$1/hr',
    type: 'street',
    streetZone: [
      { lat: 37.2871, lng: -121.9487 },
      { lat: 37.2869, lng: -121.9487 },
    ]
  },
  p5: { 
    lat: 37.2863, 
    lng: -121.9498, 
    name: 'Park Boulevard Parking', 
    distance: '0.35 mi', 
    walkToDestination: '180 m',
    available: 6, 
    total: 10, 
    rate: '$1/hr',
    type: 'street',
    streetZone: [
      { lat: 37.2862, lng: -121.9496 },
      { lat: 37.2862, lng: -121.9500 },
    ]
  },
  p6: { 
    lat: 37.2878, 
    lng: -121.9495, 
    name: 'North Main Street Parking', 
    distance: '0.15 mi', 
    walkToDestination: '200 m',
    available: 8, 
    total: 12, 
    rate: '$1.5/hr',
    type: 'street',
    streetZone: [
      { lat: 37.2879, lng: -121.9494 },
      { lat: 37.2879, lng: -121.9498 },
    ]
  },
  p7: { 
    lat: 37.2867, 
    lng: -121.9492, 
    name: 'Central Avenue Parking', 
    distance: '0.25 mi', 
    walkToDestination: '140 m',
    available: 3, 
    total: 8, 
    rate: '$1/hr',
    type: 'street',
    streetZone: [
      { lat: 37.2868, lng: -121.9491 },
      { lat: 37.2866, lng: -121.9491 },
    ]
  },
  p8: { 
    lat: 37.2860, 
    lng: -121.9480, 
    name: 'East Plaza Street Parking', 
    distance: '0.45 mi', 
    walkToDestination: '160 m',
    available: 5, 
    total: 7, 
    rate: '$1.5/hr',
    type: 'street',
    streetZone: [
      { lat: 37.2861, lng: -121.9479 },
      { lat: 37.2859, lng: -121.9479 },
    ]
  },
};

const currentLocation = { lat: 37.2876, lng: -121.9497 };

// Get availability status
export const getAvailabilityStatus = (available: number, total: number) => {
  const ratio = available / total;
  if (ratio > 0.5) return { color: 'green', label: 'Plenty of parking left' };
  if (ratio > 0.2) return { color: 'yellow', label: 'Moderate parking' };
  return { color: 'red', label: 'Limited parking' };
};

export function MapView({ viewMode, selectedParkingId, onParkingSelect, isNavigating }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});
  const streetParkingLayersRef = useRef<{ [key: string]: L.Polyline }>({});
  const currentMarkerRef = useRef<L.Marker | null>(null);
  const destinationMarkerRef = useRef<L.Marker | null>(null);
  const routeLayerRef = useRef<L.Polyline | null>(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);

  // Fetch real route from OSRM
  const fetchRoute = async (start: { lat: number; lng: number }, end: { lat: number; lng: number }) => {
    setIsLoadingRoute(true);
    try {
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`
      );

      if (!response.ok) {
        throw new Error('OSRM request failed');
      }

      const data = await response.json();
      const coordinates = data.routes[0].geometry.coordinates;
      
      return coordinates.map((coord: number[]) => [coord[1], coord[0]]) as [number, number][];
    } catch (error) {
      console.error('Route fetching failed:', error);
      return [[start.lat, start.lng], [end.lat, end.lng]] as [number, number][];
    } finally {
      setIsLoadingRoute(false);
    }
  };

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      zoomControl: false,
      attributionControl: false,
    }).setView([currentLocation.lat, currentLocation.lng], 15);

    const tileLayer = viewMode === 'satellite'
      ? L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { maxZoom: 19 })
      : L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 });

    tileLayer.addTo(map);
    mapInstanceRef.current = map;

    // Current location marker
    const blueIcon = L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="position: relative;">
          <div style="width: 20px; height: 20px; background: #3b82f6; border: 3px solid white; border-radius: 50%; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>
          <div class="pulse-ring"></div>
        </div>
      `,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });

    currentMarkerRef.current = L.marker([currentLocation.lat, currentLocation.lng], {
      icon: blueIcon,
      zIndexOffset: 1000,
    }).addTo(map);

    // Destination marker
    const destinationIcon = L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="position: relative;">
          <div style="width: 40px; height: 50px; display: flex; align-items: center; justify-content: center;">
            <svg width="40" height="50" viewBox="0 0 40 50" style="filter: drop-shadow(0 2px 8px rgba(0,0,0,0.3));">
              <path d="M20 0C11.716 0 5 6.716 5 15c0 8.284 15 35 15 35s15-26.716 15-35c0-8.284-6.716-15-15-15z" fill="#ef4444"/>
              <circle cx="20" cy="15" r="6" fill="white"/>
            </svg>
          </div>
        </div>
      `,
      iconSize: [40, 50],
      iconAnchor: [20, 50],
    });

    destinationMarkerRef.current = L.marker([destination.lat, destination.lng], {
      icon: destinationIcon,
      zIndexOffset: 999,
    }).addTo(map);

    // Add parking spots
    Object.entries(parkingSpots).forEach(([id, spot]) => {
      if (spot.type === 'street' && spot.streetZone) {
        // Render street parking as a line overlay
        const status = getAvailabilityStatus(spot.available, spot.total);
        const isSelected = id === selectedParkingId;
        
        const polyline = L.polyline(
          spot.streetZone.map(coord => [coord.lat, coord.lng]),
          {
            color: isSelected ? '#3b82f6' : (status.color === 'green' ? '#22c55e' : status.color === 'yellow' ? '#eab308' : '#ef4444'),
            weight: 8,
            opacity: 0.8,
            lineCap: 'round',
          }
        ).addTo(map);

        polyline.on('click', () => onParkingSelect(id));
        streetParkingLayersRef.current[id] = polyline;

        // Add label for street parking
        const midPoint = {
          lat: (spot.streetZone[0].lat + spot.streetZone[1].lat) / 2,
          lng: (spot.streetZone[0].lng + spot.streetZone[1].lng) / 2,
        };

        const labelIcon = L.divIcon({
          className: 'custom-marker',
          html: `
            <div style="
              background: white;
              padding: 4px 8px;
              border-radius: 4px;
              font-size: 11px;
              font-weight: 600;
              color: #374151;
              box-shadow: 0 2px 4px rgba(0,0,0,0.2);
              white-space: nowrap;
              pointer-events: none;
            ">Street Parking</div>
          `,
          iconSize: [100, 20],
          iconAnchor: [50, -5],
        });

        L.marker([midPoint.lat, midPoint.lng], {
          icon: labelIcon,
          interactive: false,
        }).addTo(map);

      } else {
        // Regular parking markers for garage/lot
        const status = getAvailabilityStatus(spot.available, spot.total);
        const isSelected = id === selectedParkingId;
        
        const markerIcon = L.divIcon({
          className: 'custom-marker',
          html: `
            <div style="width: 36px; height: 36px; background: ${isSelected ? '#3b82f6' : (status.color === 'green' ? '#22c55e' : status.color === 'yellow' ? '#eab308' : '#ef4444')}; border: 3px solid white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; color: white; font-size: 14px; box-shadow: 0 2px 8px rgba(0,0,0,0.3); cursor: pointer;">P</div>
          `,
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        });

        const marker = L.marker([spot.lat, spot.lng], { icon: markerIcon }).addTo(map);
        marker.on('click', () => onParkingSelect(id));
        markersRef.current[id] = marker;
      }
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update tile layer when view mode changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    
    mapInstanceRef.current.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        mapInstanceRef.current?.removeLayer(layer);
      }
    });

    const tileLayer = viewMode === 'satellite'
      ? L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { maxZoom: 19 })
      : L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 });

    tileLayer.addTo(mapInstanceRef.current);
  }, [viewMode]);

  // Update markers, street parking lines, and route
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Update regular parking markers
    Object.entries(markersRef.current).forEach(([id, marker]) => {
      const spot = parkingSpots[id as keyof typeof parkingSpots];
      const status = getAvailabilityStatus(spot.available, spot.total);
      const isSelected = id === selectedParkingId;
      
      const markerIcon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div style="width: 36px; height: 36px; background: ${isSelected ? '#3b82f6' : (status.color === 'green' ? '#22c55e' : status.color === 'yellow' ? '#eab308' : '#ef4444')}; border: 3px solid white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; color: white; font-size: 14px; box-shadow: 0 2px 8px rgba(0,0,0,0.3); cursor: pointer;">P</div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });
      marker.setIcon(markerIcon);
    });

    // Update street parking lines
    Object.entries(streetParkingLayersRef.current).forEach(([id, polyline]) => {
      const spot = parkingSpots[id as keyof typeof parkingSpots];
      const status = getAvailabilityStatus(spot.available, spot.total);
      const isSelected = id === selectedParkingId;
      
      polyline.setStyle({
        color: isSelected ? '#3b82f6' : (status.color === 'green' ? '#22c55e' : status.color === 'yellow' ? '#eab308' : '#ef4444'),
        weight: isSelected ? 10 : 8,
        opacity: isSelected ? 1 : 0.8,
      });
    });

    const drawRoute = async () => {
      if (routeLayerRef.current) {
        mapInstanceRef.current?.removeLayer(routeLayerRef.current);
        routeLayerRef.current = null;
      }

      if (isNavigating && selectedParkingId) {
        const parkingSpot = parkingSpots[selectedParkingId as keyof typeof parkingSpots];
        
        // For street parking, use the midpoint of the zone
        const targetLocation = parkingSpot.type === 'street' && parkingSpot.streetZone
          ? {
              lat: (parkingSpot.streetZone[0].lat + parkingSpot.streetZone[1].lat) / 2,
              lng: (parkingSpot.streetZone[0].lng + parkingSpot.streetZone[1].lng) / 2,
            }
          : parkingSpot;

        const routeCoordinates = await fetchRoute(currentLocation, targetLocation);

        routeLayerRef.current = L.polyline(routeCoordinates, {
          color: '#3b82f6',
          weight: 5,
          opacity: 0.8,
          lineJoin: 'round',
        }).addTo(mapInstanceRef.current!);

        const bounds = L.latLngBounds([
          [currentLocation.lat, currentLocation.lng],
          [targetLocation.lat, targetLocation.lng],
          [destination.lat, destination.lng],
        ]);
        mapInstanceRef.current?.fitBounds(bounds, { padding: [100, 100] });
      } else if (!isNavigating) {
        mapInstanceRef.current?.setView([currentLocation.lat, currentLocation.lng], 15);
      }
    };

    drawRoute();
  }, [selectedParkingId, isNavigating]);

  return (
    <>
      <div ref={mapRef} className="absolute inset-0 z-0" />
      {isLoadingRoute && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-10 bg-white px-4 py-2 rounded-full shadow-lg">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-gray-700">Loading route...</span>
          </div>
        </div>
      )}
      <style>{`
        .pulse-ring {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 40px;
          height: 40px;
          background: rgba(59, 130, 246, 0.2);
          border-radius: 50%;
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0%, 100% {
            opacity: 0.2;
            transform: translate(-50%, -50%) scale(1);
          }
          50% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(1.5);
          }
        }
      `}</style>
    </>
  );
}