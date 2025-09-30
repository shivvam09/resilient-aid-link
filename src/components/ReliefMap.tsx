import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Shield, Heart, Users, Navigation, Layers, Compass } from "lucide-react";

declare global {
  interface Window {
    google: typeof google;
    initMap: () => void;
  }
}

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
  const [isMapLoaded, setIsMapLoaded] = useState<boolean>(false);
  const [compass, setCompass] = useState<number>(0);
  const [googleMapsApiKey, setGoogleMapsApiKey] = useState<string>('');
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<google.maps.Map | null>(null);
  const markers = useRef<google.maps.Marker[]>([]);

  // Mock data - In real app, this would come from GPS/offline database
  const mapLocations: MapLocation[] = [
    // Shelters
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
      name: 'Red Cross Emergency Shelter',
      type: 'shelter',
      latitude: 28.6179,
      longitude: 77.2110,
      capacity: 300,
      available: true,
      distance: 2.8,
      resources: ['Food', 'Water', 'Blankets']
    },
    {
      id: '3',
      name: 'Community Center Shelter',
      type: 'shelter',
      latitude: 28.6099,
      longitude: 77.2050,
      capacity: 200,
      available: false,
      distance: 1.9,
      resources: ['Food', 'Medical']
    },
    {
      id: '4',
      name: 'School Emergency Shelter',
      type: 'shelter',
      latitude: 28.6159,
      longitude: 77.2130,
      capacity: 400,
      available: true,
      distance: 3.1,
      resources: ['Food', 'Water', 'Medical', 'Education']
    },
    {
      id: '5',
      name: 'NGO Relief Shelter',
      type: 'shelter',
      latitude: 28.6119,
      longitude: 77.2070,
      capacity: 250,
      available: true,
      distance: 2.5,
      resources: ['Food', 'Water', 'Clothing']
    },

    // Safe Zones
    {
      id: '6',
      name: 'Central Park Safe Zone',
      type: 'safe_zone',
      latitude: 28.6129,
      longitude: 77.2290,
      distance: 1.8,
    },
    {
      id: '7',
      name: 'Stadium Safe Zone',
      type: 'safe_zone',
      latitude: 28.6199,
      longitude: 77.2150,
      distance: 2.4,
    },
    {
      id: '8',
      name: 'University Campus Safe Zone',
      type: 'safe_zone',
      latitude: 28.6089,
      longitude: 77.2190,
      distance: 1.6,
    },
    {
      id: '9',
      name: 'Metro Station Safe Zone',
      type: 'safe_zone',
      latitude: 28.6169,
      longitude: 77.2030,
      distance: 2.1,
    },
    {
      id: '10',
      name: 'Hospital Compound Safe Zone',
      type: 'safe_zone',
      latitude: 28.6109,
      longitude: 77.2110,
      distance: 1.4,
    },

    // Resource Centers
    {
      id: '11',
      name: 'Red Cross Resource Center',
      type: 'resource_center',
      latitude: 28.6239,
      longitude: 77.2190,
      distance: 3.1,
      resources: ['Medicine', 'Blankets', 'Food Packets']
    },
    {
      id: '12',
      name: 'WHO Medical Supply Center',
      type: 'resource_center',
      latitude: 28.6059,
      longitude: 77.2140,
      distance: 1.7,
      resources: ['Medicine', 'First Aid', 'Oxygen']
    },
    {
      id: '13',
      name: 'Food Distribution Center',
      type: 'resource_center',
      latitude: 28.6189,
      longitude: 77.2070,
      distance: 2.6,
      resources: ['Food Packets', 'Water', 'Baby Food']
    },
    {
      id: '14',
      name: 'Clothing Distribution Hub',
      type: 'resource_center',
      latitude: 28.6149,
      longitude: 77.2210,
      distance: 2.9,
      resources: ['Clothing', 'Blankets', 'Shoes']
    },
    {
      id: '15',
      name: 'Emergency Supply Depot',
      type: 'resource_center',
      latitude: 28.6079,
      longitude: 77.2030,
      distance: 1.3,
      resources: ['Water', 'Emergency Kits', 'Tools']
    },

    // Volunteer Hubs
    {
      id: '16',
      name: 'Main Volunteer Coordination Hub',
      type: 'volunteer_hub',
      latitude: 28.6339,
      longitude: 77.2390,
      distance: 4.2,
    },
    {
      id: '17',
      name: 'Youth Volunteer Center',
      type: 'volunteer_hub',
      latitude: 28.6219,
      longitude: 77.2250,
      distance: 3.5,
    },
    {
      id: '18',
      name: 'Community Volunteer Base',
      type: 'volunteer_hub',
      latitude: 28.6299,
      longitude: 77.2170,
      distance: 3.8,
    },
    {
      id: '19',
      name: 'NGO Volunteer Center',
      type: 'volunteer_hub',
      latitude: 28.6379,
      longitude: 77.2310,
      distance: 4.5,
    },
    {
      id: '20',
      name: 'Emergency Response Team Hub',
      type: 'volunteer_hub',
      latitude: 28.6259,
      longitude: 77.2290,
      distance: 3.6,
    },

    // Emergency Zones
    {
      id: '21',
      name: 'Flood Affected Area',
      type: 'emergency',
      latitude: 28.6039,
      longitude: 77.1990,
      distance: 1.2,
    },
    {
      id: '22',
      name: 'Building Collapse Site',
      type: 'emergency',
      latitude: 28.6279,
      longitude: 77.2350,
      distance: 3.9,
    }
  ];

  useEffect(() => {
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
  }, []);

  useEffect(() => {
    if (!googleMapsApiKey) return;

    const loadGoogleMaps = () => {
      // Remove existing script if any
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existingScript) {
        existingScript.remove();
      }

      // Create and load Google Maps script
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&libraries=places&callback=initMap`;
      script.async = true;
      script.defer = true;

      // Define the callback function
      window.initMap = () => {
        initializeMap();
      };

      document.head.appendChild(script);
    };

    loadGoogleMaps();
  }, [googleMapsApiKey]);

  const initializeMap = () => {
    if (!mapContainer.current) return;

    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(location);
          createMap(location);
        },
        (error) => {
          console.error('Error getting location:', error);
          // Fallback to default location (New Delhi)
          const defaultLocation = { lat: 28.6139, lng: 77.2090 };
          setUserLocation(defaultLocation);
          createMap(defaultLocation);
        }
      );
    } else {
      // Fallback to default location if geolocation is not available
      const defaultLocation = { lat: 28.6139, lng: 77.2090 };
      setUserLocation(defaultLocation);
      createMap(defaultLocation);
    }
  };

  const createMap = (location: {lat: number, lng: number}) => {
    if (!mapContainer.current || !window.google) return;

    // Clear existing markers
    markers.current.forEach(marker => marker.setMap(null));
    markers.current = [];

    const mapOptions: google.maps.MapOptions = {
      center: { lat: location.lat, lng: location.lng },
      zoom: 12,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
    };

    map.current = new google.maps.Map(mapContainer.current, mapOptions);

    // Add user location marker
    const userMarker = new google.maps.Marker({
      position: { lat: location.lat, lng: location.lng },
      map: map.current,
      title: 'Your Location',
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 15,
        fillColor: '#ef4444',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 3,
      },
    });

    const userInfoWindow = new google.maps.InfoWindow({
      content: `
        <div style="padding: 12px; min-width: 180px;">
          <h3 style="font-weight: 600; color: #2563eb; margin-bottom: 4px;">📍 Your Current Location</h3>
          <p style="font-size: 14px; color: #6b7280;">Lat: ${location.lat.toFixed(6)}</p>
          <p style="font-size: 14px; color: #6b7280;">Lng: ${location.lng.toFixed(6)}</p>
          <p style="font-size: 12px; color: #16a34a; margin-top: 8px;">✅ GPS Active</p>
        </div>
      `,
    });

    userMarker.addListener('click', () => {
      userInfoWindow.open(map.current, userMarker);
    });

    markers.current.push(userMarker);

    // Add markers for relief locations
    filteredLocations.forEach((loc) => {
      const color = getLocationColor(loc.type);
      
      const marker = new google.maps.Marker({
        position: { lat: loc.latitude, lng: loc.longitude },
        map: map.current,
        title: loc.name,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 12,
          fillColor: color,
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        },
      });

      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 12px; min-width: 200px;">
            <h3 style="font-weight: 600; color: #111827; margin-bottom: 4px;">${loc.name}</h3>
            <p style="font-size: 14px; color: #6b7280; margin-bottom: 8px; text-transform: capitalize;">${loc.type.replace('_', ' ')}</p>
            ${loc.distance ? `<p style="font-size: 12px; color: #2563eb; font-weight: 500;">📍 ${loc.distance} km away</p>` : ''}
            ${loc.capacity ? `<p style="font-size: 12px; color: #16a34a;">👥 Capacity: ${loc.capacity}</p>` : ''}
            ${loc.available !== undefined ? `<p style="font-size: 12px; color: ${loc.available ? '#16a34a' : '#dc2626'};">
              ${loc.available ? '✅ Available' : '❌ Full'}
            </p>` : ''}
            ${loc.resources ? `<div style="margin-top: 8px;">
              <p style="font-size: 12px; font-weight: 500; color: #374151;">Available Resources:</p>
              <p style="font-size: 12px; color: #6b7280;">${loc.resources.join(', ')}</p>
            </div>` : ''}
          </div>
        `,
      });

      marker.addListener('click', () => {
        infoWindow.open(map.current, marker);
      });

      markers.current.push(marker);
    });

    setIsMapLoaded(true);
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

  const getLocationColor = (type: string): string => {
    switch (type) {
      case 'shelter': return '#16a34a';
      case 'safe_zone': return '#2563eb';
      case 'resource_center': return '#ea580c';
      case 'volunteer_hub': return '#7c3aed';
      case 'emergency': return '#dc2626';
      default: return '#6b7280';
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
              Relief Map
            </CardTitle>
            <Badge variant={googleMapsApiKey && userLocation ? "default" : "secondary"} className="gap-1">
              <MapPin className="w-3 h-3" />
              {googleMapsApiKey && userLocation ? "GPS Active" : "GPS Inactive"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {!googleMapsApiKey && (
            <div className="space-y-2">
              <Label htmlFor="google-maps-key">Google Maps API Key</Label>
              <div className="text-sm text-muted-foreground mb-2">
                Get your API key from <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="text-primary underline">Google Cloud Console</a> → APIs & Services → Credentials
              </div>
              <Input
                id="google-maps-key"
                type="password"
                placeholder="AIzaSyABcDeFgHiJkLmNoPqRsTuVwXyZ1234567"
                value={googleMapsApiKey}
                onChange={(e) => setGoogleMapsApiKey(e.target.value)}
              />
            </div>
          )}
          
          <div className="flex flex-wrap gap-2">
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
            <Button 
              size="sm" 
              variant={selectedType === 'volunteer_hub' ? 'default' : 'outline'}
              onClick={() => setSelectedType('volunteer_hub')}
              className="gap-1"
            >
              <Users className="w-3 h-3" />
              Volunteers
            </Button>
            <Button 
              size="sm" 
              variant={selectedType === 'emergency' ? 'default' : 'outline'}
              onClick={() => setSelectedType('emergency')}
              className="gap-1"
            >
              <Navigation className="w-3 h-3" />
              Emergency
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Map Container */}
      <Card>
        <CardContent className="p-0">
          <div 
            ref={mapContainer}
            className="w-full h-96 rounded-lg"
            style={{ minHeight: '400px' }}
          />
        </CardContent>
      </Card>

      {/* Compass */}
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <div className="flex items-center gap-4">
            <div 
              className="w-16 h-16 border-4 border-primary rounded-full flex items-center justify-center relative"
              style={{ transform: `rotate(${compass}deg)` }}
            >
              <Compass className="w-6 h-6 text-primary" />
              <div className="absolute -top-2 w-1 h-4 bg-red-500 rounded-full" />
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Compass Heading</p>
              <p className="font-bold text-lg">{Math.round(compass)}°</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Nearby Locations List */}
      <Card>
        <CardHeader>
          <CardTitle>Nearby Locations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredLocations.slice(0, 5).map((location) => {
              const IconComponent = getLocationIcon(location.type);
              return (
                <div key={location.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full`} style={{ backgroundColor: getLocationColor(location.type) }}>
                      <IconComponent className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h4 className="font-medium">{location.name}</h4>
                      <p className="text-sm text-muted-foreground capitalize">
                        {location.type.replace('_', ' ')} 
                        {location.distance && ` • ${location.distance} km away`}
                      </p>
                      {location.available !== undefined && (
                        <Badge variant={location.available ? "default" : "destructive"} className="text-xs">
                          {location.available ? "Available" : "Full"}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    Navigate
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Map Legend */}
      <Card>
        <CardHeader>
          <CardTitle>Map Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#16a34a' }}></div>
              <span className="text-sm">Shelters</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#2563eb' }}></div>
              <span className="text-sm">Safe Zones</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#ea580c' }}></div>
              <span className="text-sm">Resource Centers</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#7c3aed' }}></div>
              <span className="text-sm">Volunteer Hubs</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#dc2626' }}></div>
              <span className="text-sm">Emergency Zones</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#ef4444' }}></div>
              <span className="text-sm">Your Location</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReliefMap;