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

// Parking locations data
const parkingSpots = {
  p1: { lat: 37.2872, lng: -121.9502, name: 'Main Street Garage', distance: '0.3 mi' },
  p2: { lat: 37.2865, lng: -121.9485, name: 'City Center Lot', distance: '0.4 mi' },
  p3: { lat: 37.2855, lng: -121.9495, name: 'West Avenue Parking', distance: '0.5 mi' },
};

// Current location (Campbell, CA)
const currentLocation = { lat: 37.2876, lng: -121.9497 };

export function MapView({ viewMode, selectedParkingId, onParkingSelect, isNavigating }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});
  const currentMarkerRef = useRef<L.Marker | null>(null);
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
      
      // Convert [lng, lat] to [lat, lng] for Leaflet
      return coordinates.map((coord: number[]) => [coord[1], coord[0]]) as [number, number][];
    } catch (error) {
      console.error('Route fetching failed:', error);
      // Return straight line as fallback
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

    // Add tile layer based on view mode
    const tileLayer = viewMode === 'satellite'
      ? L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
          maxZoom: 19,
        })
      : L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
        });

    tileLayer.addTo(map);
    mapInstanceRef.current = map;

    // Add current location marker
    const blueIcon = L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="position: relative;">
          <div style="
            width: 20px;
            height: 20px;
            background: #3b82f6;
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          "></div>
          <div style="
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 40px;
            height: 40px;
            background: rgba(59, 130, 246, 0.2);
            border-radius: 50%;
            animation: pulse 2s infinite;
          "></div>
        </div>
        <style>
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
        </style>
      `,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });

    currentMarkerRef.current = L.marker([currentLocation.lat, currentLocation.lng], {
      icon: blueIcon,
      zIndexOffset: 1000,
    }).addTo(map);

    // Add parking spot markers
    Object.entries(parkingSpots).forEach(([id, spot]) => {
      const markerIcon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div style="
            width: 32px;
            height: 32px;
            background: ${id === selectedParkingId ? '#3b82f6' : '#ef4444'};
            border: 3px solid white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            color: white;
            font-size: 14px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            cursor: pointer;
          ">P</div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([spot.lat, spot.lng], {
        icon: markerIcon,
      }).addTo(map);

      marker.on('click', () => {
        onParkingSelect(id);
      });

      markersRef.current[id] = marker;
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [viewMode]);

  // Update marker styles when selection changes and draw route
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Update marker colors
    Object.entries(markersRef.current).forEach(([id, marker]) => {
      const isSelected = id === selectedParkingId;
      const markerIcon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div style="
            width: 32px;
            height: 32px;
            background: ${isSelected ? '#3b82f6' : '#ef4444'};
            border: 3px solid white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            color: white;
            font-size: 14px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            cursor: pointer;
          ">P</div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });
      marker.setIcon(markerIcon);
    });

    // Draw route if navigating and parking spot is selected
    const drawRoute = async () => {
      // Remove existing route
      if (routeLayerRef.current) {
        mapInstanceRef.current?.removeLayer(routeLayerRef.current);
        routeLayerRef.current = null;
      }

      if (isNavigating && selectedParkingId) {
        const destination = parkingSpots[selectedParkingId as keyof typeof parkingSpots];
        
        // Fetch real route
        const routeCoordinates = await fetchRoute(currentLocation, destination);

        // Draw the route
        routeLayerRef.current = L.polyline(routeCoordinates, {
          color: '#3b82f6',
          weight: 4,
          opacity: 0.7,
          lineJoin: 'round',
        }).addTo(mapInstanceRef.current!);

        // Fit map to show entire route
        const bounds = L.latLngBounds([
          [currentLocation.lat, currentLocation.lng],
          [destination.lat, destination.lng],
        ]);
        mapInstanceRef.current?.fitBounds(bounds, { padding: [50, 50] });
      }
    };

    drawRoute();
  }, [selectedParkingId, isNavigating]);

  return (
    <>
      <div ref={mapRef} style={{ position: 'absolute', inset: 0, zIndex: 0 }} />
      {isLoadingRoute && (
        <div style={{
          position: 'absolute',
          top: '5rem',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10,
          background: 'white',
          padding: '0.5rem 1rem',
          borderRadius: '9999px',
          boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <div style={{
            width: '1rem',
            height: '1rem',
            border: '2px solid #3b82f6',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <span style={{ fontSize: '0.875rem', color: '#374151' }}>Loading route...</span>
        </div>
      )}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}