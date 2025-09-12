import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, Shield, MapPin, Users, Heart, Wifi, WifiOff } from "lucide-react";
import EmergencyButton from "@/components/EmergencyButton";
import ReliefMap from "@/components/ReliefMap";
import ResourceHub from "@/components/ResourceHub";
import AlertSystem from "@/components/AlertSystem";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { toast } = useToast();

  const emergencyStats = [
    { label: "Active Shelters", value: "23", icon: Shield, color: "shelter" },
    { label: "Available Resources", value: "156", icon: Heart, color: "resource" },
    { label: "Safe Zones", value: "18", icon: MapPin, color: "safe" },
    { label: "Active Volunteers", value: "89", icon: Users, color: "primary" },
  ];

  return (
    <div className="min-h-screen bg-gradient-map">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-emergency rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">RescueNet</h1>
                <p className="text-sm text-muted-foreground">Emergency Relief Platform</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={isOnline ? "default" : "destructive"} className="gap-2">
                {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
                {isOnline ? "Online" : "Offline Mode"}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Emergency Action Section */}
        <section className="text-center py-8">
          <h2 className="text-3xl font-bold mb-4 text-foreground">
            Need Immediate Help?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            In case of emergency, press the SOS button to alert nearby rescue teams, 
            government agencies, and NGOs with your exact location.
          </p>
          <EmergencyButton />
        </section>

        {/* Statistics Dashboard */}
        <section>
          <h3 className="text-xl font-semibold mb-4 text-foreground">Live Relief Status</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {emergencyStats.map((stat, index) => (
              <Card key={index} className="text-center hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className={`w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center ${
                    stat.color === 'shelter' ? 'bg-shelter/10' :
                    stat.color === 'resource' ? 'bg-resource/10' :
                    stat.color === 'safe' ? 'bg-safe/10' :
                    'bg-primary/10'
                  }`}>
                    <stat.icon className={`w-6 h-6 ${
                      stat.color === 'shelter' ? 'text-shelter' :
                      stat.color === 'resource' ? 'text-resource' :
                      stat.color === 'safe' ? 'text-safe' :
                      'text-primary'
                    }`} />
                  </div>
                  <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Main Features Tabs */}
        <Tabs defaultValue="map" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="map" className="gap-2">
              <MapPin className="w-4 h-4" />
              Relief Map
            </TabsTrigger>
            <TabsTrigger value="resources" className="gap-2">
              <Heart className="w-4 h-4" />
              Resources
            </TabsTrigger>
            <TabsTrigger value="alerts" className="gap-2">
              <AlertTriangle className="w-4 h-4" />
              Alerts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="map" className="space-y-4">
            <ReliefMap />
          </TabsContent>

          <TabsContent value="resources" className="space-y-4">
            <ResourceHub />
          </TabsContent>

          <TabsContent value="alerts" className="space-y-4">
            <AlertSystem />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;