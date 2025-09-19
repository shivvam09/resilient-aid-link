import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Shield, Heart, Users, Navigation, Layers, Compass } from "lucide-react";

// Google Maps type declarations
declare global {
  interface Window {
    google: any;
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
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const markers = useRef<any[]>([]);

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
    // Load Google Maps API
    const loadGoogleMaps = () => {
      if (window.google) {
        setIsMapLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY'}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => setIsMapLoaded(true);
      document.head.appendChild(script);
    };

    loadGoogleMaps();

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
    if (!isMapLoaded) return;

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
          if (mapContainer.current && !map.current) {
            initializeMap(location);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          // Fallback to default location (New Delhi)
          const defaultLocation = { lat: 28.6139, lng: 77.2090 };
          setUserLocation(defaultLocation);
          if (mapContainer.current && !map.current) {
            initializeMap(defaultLocation);
          }
        }
      );
    } else {
      // Fallback to default location if geolocation is not available
      const defaultLocation = { lat: 28.6139, lng: 77.2090 };
      setUserLocation(defaultLocation);
      if (mapContainer.current && !map.current) {
        initializeMap(defaultLocation);
      }
    }
  }, [isMapLoaded]);

  const initializeMap = (location: {lat: number, lng: number}) => {
    if (!mapContainer.current || !window.google) return;

    // Clear existing markers
    markers.current.forEach(marker => marker.setMap(null));
    markers.current = [];

    // Initialize Google Map
    map.current = new window.google.maps.Map(mapContainer.current, {
      center: location,
      zoom: 12,
      mapTypeId: window.google.maps.MapTypeId.HYBRID,
      styles: [
        {
          featureType: "poi",
          elementType: "labels",
          stylers: [{ visibility: "off" }]
        }
      ],
      scrollwheel: true,
      gestureHandling: 'greedy'
    });

    // Add pulsing animation styles
    const userLocationStyle = document.createElement('style');
    userLocationStyle.textContent = `
      @keyframes userLocationPulse {
        0% { 
          transform: scale(1);
          box-shadow: 0 0 20px rgba(239, 68, 68, 0.6);
        }
        50% { 
          transform: scale(1.1);
          box-shadow: 0 0 30px rgba(239, 68, 68, 0.8);
        }
        100% { 
          transform: scale(1);
          box-shadow: 0 0 20px rgba(239, 68, 68, 0.6);
        }
      }
      @keyframes emergencyPulse {
        0% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.7); }
        70% { box-shadow: 0 0 0 10px rgba(220, 38, 38, 0); }
        100% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0); }
      }
    `;
    document.head.appendChild(userLocationStyle);

    // Create user location marker
    const userMarkerElement = document.createElement('div');
    userMarkerElement.style.cssText = `
      width: 40px;
      height: 40px;
      background: radial-gradient(circle, #ef4444 40%, transparent 70%);
      border: 4px solid #ef4444;
      border-radius: 50%;
      cursor: pointer;
      position: relative;
      animation: userLocationPulse 2s infinite;
    `;

    const userMarker = new window.google.maps.Marker({
      position: location,
      map: map.current,
      title: "Your Current Location",
      icon: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient id="grad" cx="50%" cy="50%" r="50%">
                <stop offset="40%" style="stop-color:#ef4444;stop-opacity:1" />
                <stop offset="70%" style="stop-color:#ef4444;stop-opacity:0" />
              </radialGradient>
            </defs>
            <circle cx="20" cy="20" r="16" fill="url(#grad)" stroke="#ef4444" stroke-width="4"/>
          </svg>
        `),
        scaledSize: new window.google.maps.Size(40, 40),
        anchor: new window.google.maps.Point(20, 20)
      }
    });

    const userInfoWindow = new window.google.maps.InfoWindow({
      content: `
        <div style="padding: 12px; min-width: 180px;">
          <h3 style="font-weight: 600; color: #2563eb; margin-bottom: 4px;">📍 Your Current Location</h3>
          <p style="font-size: 14px; color: #6b7280;">Lat: ${location.lat.toFixed(6)}</p>
          <p style="font-size: 14px; color: #6b7280;">Lng: ${location.lng.toFixed(6)}</p>
          <p style="font-size: 12px; color: #16a34a; margin-top: 8px;">✅ GPS Active</p>
        </div>
      `
    });

    userMarker.addListener('click', () => {
      userInfoWindow.open(map.current, userMarker);
    });

    markers.current.push(userMarker);

    // Add location markers
    mapLocations.forEach((loc) => {
      const color = loc.type === 'shelter' ? '#16a34a' : 
                   loc.type === 'safe_zone' ? '#2563eb' :
                   loc.type === 'resource_center' ? '#ea580c' :
                   loc.type === 'volunteer_hub' ? '#7c3aed' :
                   '#dc2626';

      const markerElement = document.createElement('div');
      markerElement.style.cssText = `
        width: 30px;
        height: 30px;
        background-color: ${color};
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        ${loc.type === 'emergency' ? 'animation: emergencyPulse 2s infinite;' : ''}
      `;

      const iconElement = document.createElement('div');
      iconElement.style.cssText = `
        color: white;
        font-size: 12px;
        font-weight: bold;
      `;
      iconElement.innerHTML = loc.type === 'shelter' ? '🏠' : 
                             loc.type === 'safe_zone' ? '🛡️' :
                             loc.type === 'resource_center' ? '📦' :
                             loc.type === 'volunteer_hub' ? '👥' :
                             '⚠️';
      markerElement.appendChild(iconElement);

      const marker = new window.google.maps.Marker({
        position: { lat: loc.latitude, lng: loc.longitude },
        map: map.current,
        title: loc.name,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="30" height="30" xmlns="http://www.w3.org/2000/svg">
              <circle cx="15" cy="15" r="12" fill="${color}" stroke="white" stroke-width="3"/>
              <text x="15" y="20" text-anchor="middle" font-size="12" fill="white">
                ${loc.type === 'shelter' ? '🏠' : 
                  loc.type === 'safe_zone' ? '🛡️' :
                  loc.type === 'resource_center' ? '📦' :
                  loc.type === 'volunteer_hub' ? '👥' :
                  '⚠️'}
              </text>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(30, 30),
          anchor: new window.google.maps.Point(15, 15)
        }
      });

      const infoWindow = new window.google.maps.InfoWindow({
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
        `
      });

      marker.addListener('click', () => {
        infoWindow.open(map.current, marker);
      });

      markers.current.push(marker);
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
          <div className="relative w-full h-96 rounded-lg overflow-hidden border touch-none">
            <div ref={mapContainer} className="absolute inset-0 touch-none" />
            
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