import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, Phone, MapPin, Clock, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const EmergencyButton = () => {
  const [isActivated, setIsActivated] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [location, setLocation] = useState<GeolocationPosition | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => setLocation(position),
        (error) => console.log("Location error:", error)
      );
    }
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && isActivated) {
      // Emergency alert sent
      sendEmergencyAlert();
    }
  }, [countdown, isActivated]);

  const handleEmergencyPress = () => {
    if (!isActivated) {
      setIsActivated(true);
      setCountdown(5); // 5-second countdown to prevent accidental activation
      
      toast({
        title: "Emergency Alert Activating",
        description: "Press again to cancel within 5 seconds",
        variant: "destructive",
      });
    } else {
      // Cancel emergency
      setIsActivated(false);
      setCountdown(0);
      
      toast({
        title: "Emergency Alert Cancelled",
        description: "Stay safe!",
      });
    }
  };

  const sendEmergencyAlert = () => {
    // Simulate emergency alert dispatch
    const alertData = {
      timestamp: new Date().toISOString(),
      location: location ? {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy
      } : null,
      type: "SOS_EMERGENCY",
      verified: false // Will be verified by anti-spam system
    };

    // In real app, this would send to government/NGO APIs
    console.log("Emergency Alert Sent:", alertData);
    
    setIsActivated(false);
    
    toast({
      title: "🚨 Emergency Alert Sent!",
      description: "Rescue teams have been notified of your location. Help is on the way.",
      variant: "destructive",
    });

    // Show verification prompt to prevent spam
    setTimeout(() => {
      toast({
        title: "Verification Required",
        description: "Please be ready to verify your emergency when rescue teams contact you.",
      });
    }, 3000);
  };

  return (
    <div className="flex flex-col items-center space-y-6">
      {/* Main SOS Button */}
      <div className="relative">
        <Button
          onClick={handleEmergencyPress}
          size="lg"
          className={`
            w-40 h-40 rounded-full text-xl font-bold shadow-lg transition-all duration-300
            ${isActivated 
              ? 'bg-warning hover:bg-warning/90 text-warning-foreground animate-pulse-emergency shadow-emergency' 
              : 'bg-gradient-emergency hover:scale-105 text-emergency-foreground shadow-xl'
            }
          `}
        >
          <div className="flex flex-col items-center gap-2">
            <AlertTriangle className="w-12 h-12" />
            {isActivated ? (
              <div className="text-center">
                <div className="text-2xl font-bold">{countdown}</div>
                <div className="text-sm">CANCEL</div>
              </div>
            ) : (
              <div className="text-center">
                <div className="text-lg font-bold">SOS</div>
                <div className="text-sm">EMERGENCY</div>
              </div>
            )}
          </div>
        </Button>
        
        {isActivated && (
          <div className="absolute -inset-4 rounded-full border-4 border-emergency animate-ping" />
        )}
      </div>

      {/* Location Status */}
      {location && (
        <Card className="w-full max-w-md">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="w-4 h-4 text-safe" />
              <div>
                <div className="font-medium text-foreground">Location Acquired</div>
                <div className="text-muted-foreground">
                  Lat: {location.coords.latitude.toFixed(6)}, 
                  Lng: {location.coords.longitude.toFixed(6)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Emergency Actions */}
      <div className="grid grid-cols-2 gap-4 w-full max-w-md">
        <Button variant="outline" className="gap-2">
          <Phone className="w-4 h-4" />
          Call 108
        </Button>
        <Button variant="outline" className="gap-2">
          <Shield className="w-4 h-4" />
          Find Shelter
        </Button>
      </div>

      {/* Anti-Spam Notice */}
      <Card className="w-full max-w-md border-warning/20 bg-warning/5">
        <CardContent className="pt-4">
          <div className="flex gap-3">
            <Shield className="w-5 h-5 text-warning mt-0.5" />
            <div className="text-sm">
              <div className="font-medium text-warning-foreground">Spam Prevention Active</div>
              <div className="text-muted-foreground mt-1">
                All emergency alerts are verified to prevent misuse. False alerts may result in penalties.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmergencyButton;