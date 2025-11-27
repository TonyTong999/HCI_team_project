export interface Parking {
  id: string;
  name: string;
  price: string;
  walkingDistance: string;
  walkingTime: string;
  availability: 'available' | 'moderate' | 'limited';
  availabilityScore: number; // out of 100
  type: 'Garage' | 'Lot' | 'Street' | 'Valet';
  position: { top: string; left: string };
  coordinates: [number, number]; // [lat, lng]
}

// Destination coordinates (Shopping Center in San Francisco)
export const destinationCoordinates: [number, number] = [37.7879, -122.4074];

// Current location coordinates
export const currentLocationCoordinates: [number, number] = [37.7855, -122.4120];

export const parkingData: Parking[] = [
  {
    id: 'p1',
    name: 'Central Parking Garage',
    price: '$8',
    walkingDistance: '300m',
    walkingTime: '4 min',
    availability: 'available',
    availabilityScore: 90,
    type: 'Garage',
    position: { top: '45%', left: '65%' },
    coordinates: [37.7883, -122.4050]
  },
  {
    id: 'p2',
    name: 'Main Street Lot',
    price: '$12',
    walkingDistance: '150m',
    walkingTime: '2 min',
    availability: 'moderate',
    availabilityScore: 45,
    type: 'Lot',
    position: { top: '60%', left: '35%' },
    coordinates: [37.7872, -122.4090]
  },
  {
    id: 'p3',
    name: 'North Plaza Parking',
    price: '$15',
    walkingDistance: '450m',
    walkingTime: '6 min',
    availability: 'limited',
    availabilityScore: 15,
    type: 'Garage',
    position: { top: '25%', left: '45%' },
    coordinates: [37.7895, -122.4080]
  },
  {
    id: 'p4',
    name: 'East Side Garage',
    price: '$10',
    walkingDistance: '250m',
    walkingTime: '3 min',
    availability: 'available',
    availabilityScore: 85,
    type: 'Garage',
    position: { top: '50%', left: '75%' },
    coordinates: [37.7878, -122.4040]
  },
  {
    id: 'p5',
    name: 'West Street Parking',
    price: '$6',
    walkingDistance: '500m',
    walkingTime: '7 min',
    availability: 'moderate',
    availabilityScore: 55,
    type: 'Street',
    position: { top: '70%', left: '25%' },
    coordinates: [37.7865, -122.4105]
  }
];