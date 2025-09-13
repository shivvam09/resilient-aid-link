import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Shield, Heart, Users, Navigation, Layers, Compass } from "lucide-react";
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface MapLocation {
  id: string;
  name: string;
  type: 'shelter' | 'safe_zone' | 'resource_center' | 'volunteer_hub' | 'emergency';
  latitude: number;
  longitude: number;
  capacity?: number;
  available?: boolean;
  distance?: number;
  resources?: string[];
}

const ReliefMap = () => {
  const [selectedType, setSelectedType] = useState<string>('all');
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [mapboxToken] = useState<string>('pk.eyJ1IjoiZmxleHk5MCIsImEiOiJjbWZoNHRxM2kwN2hhMmtvaHZ5aHo4a2poIn0.STMCDnXJAAto5kIqslI2Mg');
  const [compass, setCompass] = useState<number>(0);
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  // Mock data - In real app, this would come from GPS/offline database
  const mapLocations: MapLocation[] = [
    {
      id: '1',
      name: 'Government Emergency Shelter',
      type: 'shelter',
      latitude: 28.6139,
      longitude: 77.2090,
      capacity: 500,
      available: true,
      distance: 2.3,
      resources: ['Food', 'Water', 'Medical']
    },
    {
      id: '2',
      name: 'Community Safe Zone',
      type: 'safe_zone',
      latitude: 28.6129,
      longitude: 77.2290,
      distance: 1.8,
    },
    {
      id: '3',
      name: 'Red Cross Resource Center',
      type: 'resource_center',
      latitude: 28.6239,
      longitude: 77.2190,
      distance: 3.1,
      resources: ['Medicine', 'Blankets', 'Food Packets']
    },
    {
      id: '4',
      name: 'Volunteer Coordination Hub',
      type: 'volunteer_hub',
      latitude: 28.6339,
      longitude: 77.2390,
      distance: 4.2,
    },
    {
      id: '5',
      name: 'Active Emergency Zone',
      type: 'emergency',
      latitude: 28.6039,
      longitude: 77.1990,
      distance: 1.2,
    }
  ];

  useEffect(() => {
    // Get user location and initialize map
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(location);
          
          // Initialize map with user location
          if (mapboxToken && mapContainer.current && !map.current) {
            initializeMap(location);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          // Fallback to default location (New Delhi)
          const defaultLocation = { lat: 28.6139, lng: 77.2090 };
          setUserLocation(defaultLocation);
          if (mapboxToken && mapContainer.current && !map.current) {
            initializeMap(defaultLocation);
          }
        }
      );
    }

    // Compass functionality
    if ('DeviceOrientationEvent' in window) {
      const handleOrientation = (event: DeviceOrientationEvent) => {
        if (event.alpha !== null) {
          setCompass(360 - event.alpha);
        }
      };
      window.addEventListener('deviceorientation', handleOrientation);
      return () => window.removeEventListener('deviceorientation', handleOrientation);
    }
  }, [mapboxToken]);

  const initializeMap = (location: {lat: number, lng: number}) => {
    if (!mapContainer.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: [location.lng, location.lat],
      zoom: 12
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    
    // Add user location marker
    new mapboxgl.Marker({ color: '#ef4444' })
      .setLngLat([location.lng, location.lat])
      .setPopup(new mapboxgl.Popup().setHTML('<h3>Your Location</h3>'))
      .addTo(map.current);

    // Add shelter and safe zone markers
    mapLocations.forEach((loc) => {
      const color = loc.type === 'shelter' ? '#22c55e' : 
                   loc.type === 'safe_zone' ? '#3b82f6' :
                   loc.type === 'resource_center' ? '#f59e0b' :
                   loc.type === 'volunteer_hub' ? '#8b5cf6' :
                   '#ef4444';

      new mapboxgl.Marker({ color })
        .setLngLat([loc.longitude, loc.latitude])
        .setPopup(new mapboxgl.Popup().setHTML(`
          <div class="p-2">
            <h3 class="font-semibold">${loc.name}</h3>
            <p class="text-sm text-gray-600">${loc.type.replace('_', ' ').toUpperCase()}</p>
            ${loc.distance ? `<p class="text-xs">Distance: ${loc.distance} km</p>` : ''}
            ${loc.resources ? `<p class="text-xs">Resources: ${loc.resources.join(', ')}</p>` : ''}
          </div>
        `))
        .addTo(map.current!);
    });
  };

  const getLocationIcon = (type: string) => {
    switch (type) {
      case 'shelter': return Shield;
      case 'safe_zone': return MapPin;
      case 'resource_center': return Heart;
      case 'volunteer_hub': return Users;
      case 'emergency': return Navigation;
      default: return MapPin;
    }
  };

  const getLocationColor = (type: string) => {
    switch (type) {
      case 'shelter': return 'shelter';
      case 'safe_zone': return 'safe';
      case 'resource_center': return 'resource';
      case 'volunteer_hub': return 'primary';
      case 'emergency': return 'emergency';
      default: return 'muted';
    }
  };

  const filteredLocations = selectedType === 'all' 
    ? mapLocations 
    : mapLocations.filter(loc => loc.type === selectedType);

  return (
    <div className="space-y-6">
      {/* Map Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Layers className="w-5 h-5" />
              Relief Map (Offline Mode)
            </CardTitle>
            <Badge variant="secondary" className="gap-1">
              <MapPin className="w-3 h-3" />
              GPS Active
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            <Button 
              size="sm" 
              variant={selectedType === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedType('all')}
            >
              All Locations
            </Button>
            <Button 
              size="sm" 
              variant={selectedType === 'shelter' ? 'default' : 'outline'}
              onClick={() => setSelectedType('shelter')}
              className="gap-1"
            >
              <Shield className="w-3 h-3" />
              Shelters
            </Button>
            <Button 
              size="sm" 
              variant={selectedType === 'safe_zone' ? 'default' : 'outline'}
              onClick={() => setSelectedType('safe_zone')}
              className="gap-1"
            >
              <MapPin className="w-3 h-3" />
              Safe Zones
            </Button>
            <Button 
              size="sm" 
              variant={selectedType === 'resource_center' ? 'default' : 'outline'}
              onClick={() => setSelectedType('resource_center')}
              className="gap-1"
            >
              <Heart className="w-3 h-3" />
              Resources
            </Button>
          </div>


          {/* Interactive World Map */}
          <div className="relative w-full h-96 rounded-lg overflow-hidden border">
            <div ref={mapContainer} className="absolute inset-0" />
            
            {/* Compass */}
            <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm rounded-full p-3 shadow-lg">
              <div 
                className="w-8 h-8 flex items-center justify-center transition-transform duration-300"
                style={{ transform: `rotate(${compass}deg)` }}
              >
                <Compass className="w-6 h-6 text-primary" />
              </div>
            </div>

            {/* Map Legend */}
            <div className="absolute bottom-4 right-4 bg-background/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
              <div className="text-xs font-semibold mb-2">Legend</div>
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span>Your Location</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Shelters</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span>Safe Zones</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span>Resources</span>
                </div>
              </div>
            </div>

          </div>
        </CardContent>
      </Card>

      {/* Location List */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-foreground">
          Nearby Locations ({filteredLocations.length})
        </h3>
        {filteredLocations.map((location) => {
          const Icon = getLocationIcon(location.type);
          const color = getLocationColor(location.type);
          
          return (
            <Card key={location.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                  <div className="flex gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      color === 'shelter' ? 'bg-shelter/10' :
                      color === 'safe' ? 'bg-safe/10' :
                      color === 'resource' ? 'bg-resource/10' :
                      color === 'emergency' ? 'bg-emergency/10' :
                      'bg-primary/10'
                    }`}>
                      <Icon className={`w-5 h-5 ${
                        color === 'shelter' ? 'text-shelter' :
                        color === 'safe' ? 'text-safe' :
                        color === 'resource' ? 'text-resource' :
                        color === 'emergency' ? 'text-emergency' :
                        'text-primary'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-foreground">{location.name}</h4>
                        {location.type === 'emergency' && (
                          <Badge variant="destructive" className="text-xs">ACTIVE</Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground mb-2">
                        {location.distance && `${location.distance} km away`}
                        {location.capacity && ` • Capacity: ${location.capacity}`}
                      </div>
                      {location.resources && (
                        <div className="flex flex-wrap gap-1">
                          {location.resources.map((resource, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {resource}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    <Navigation className="w-4 h-4 mr-1" />
                    Navigate
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default ReliefMap;