import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Shield, Heart, Users, Navigation, Layers } from "lucide-react";

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
    // Get user location for offline mode
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        }
      );
    }
  }, []);

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

          {/* Simulated Map Area - In real app, this would be actual map */}
          <div className="w-full h-64 bg-gradient-map rounded-lg border-2 border-dashed border-border flex items-center justify-center relative overflow-hidden">
            <div className="text-center text-muted-foreground">
              <MapPin className="w-12 h-12 mx-auto mb-2" />
              <div className="text-lg font-semibold">Interactive Map</div>
              <div className="text-sm">GPS + Offline Database</div>
            </div>
            
            {/* Simulated location pins */}
            <div className="absolute inset-0 p-4">
              {filteredLocations.slice(0, 3).map((location, index) => {
                const Icon = getLocationIcon(location.type);
                const color = getLocationColor(location.type);
                return (
                  <div 
                    key={location.id}
                    className={`absolute w-6 h-6 rounded-full flex items-center justify-center ${
                      color === 'shelter' ? 'bg-shelter' :
                      color === 'safe' ? 'bg-safe' :
                      color === 'resource' ? 'bg-resource' :
                      color === 'emergency' ? 'bg-emergency animate-pulse-emergency' :
                      'bg-primary'
                    }`}
                    style={{
                      left: `${20 + index * 25}%`,
                      top: `${30 + index * 15}%`
                    }}
                  >
                    <Icon className="w-3 h-3 text-white" />
                  </div>
                );
              })}
              
              {/* User location */}
              {userLocation && (
                <div className="absolute w-4 h-4 bg-primary rounded-full animate-pulse-subtle" 
                     style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}>
                  <div className="w-2 h-2 bg-white rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                </div>
              )}
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