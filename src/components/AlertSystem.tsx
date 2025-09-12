import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Shield, Clock, MapPin, Volume2, VolumeX, Wifi } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Alert {
  id: string;
  type: 'emergency' | 'weather' | 'safety' | 'resource' | 'evacuation';
  title: string;
  message: string;
  location: string;
  timestamp: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  source: 'government' | 'ngo' | 'community' | 'weather_service';
  isActive: boolean;
  actionRequired?: boolean;
}

const AlertSystem = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const { toast } = useToast();

  // Mock alerts data
  const mockAlerts: Alert[] = [
    {
      id: '1',
      type: 'emergency',
      title: 'Flood Warning - Immediate Evacuation',
      message: 'Water levels rising rapidly in Sector 12-15. Evacuate to higher ground immediately. Relief teams deployed.',
      location: 'Sectors 12, 13, 14, 15',
      timestamp: '5 minutes ago',
      priority: 'critical',
      source: 'government',
      isActive: true,
      actionRequired: true
    },
    {
      id: '2',
      type: 'safety',
      title: 'New Shelter Opened',
      message: 'Additional emergency shelter now available at Community Center, Zone A. Capacity for 200 people.',
      location: 'Zone A Community Center',
      timestamp: '15 minutes ago',
      priority: 'medium',
      source: 'ngo',
      isActive: true,
      actionRequired: false
    },
    {
      id: '3',
      type: 'weather',
      title: 'Heavy Rain Alert',
      message: 'Continuous rainfall expected for next 6 hours. Avoid low-lying areas and stay indoors.',
      location: 'Entire District',
      timestamp: '1 hour ago',
      priority: 'high',
      source: 'weather_service',
      isActive: true,
      actionRequired: false
    },
    {
      id: '4',
      type: 'resource',
      title: 'Medical Supplies Available',
      message: 'Emergency medical kits and medicines available at Red Cross center. Free distribution ongoing.',
      location: 'Red Cross Center, Main Road',
      timestamp: '2 hours ago',
      priority: 'medium',
      source: 'ngo',
      isActive: true,
      actionRequired: false
    },
  ];

  useEffect(() => {
    setAlerts(mockAlerts);
    
    // Simulate real-time alerts
    const interval = setInterval(() => {
      // Add occasional test alerts
      const testAlert: Alert = {
        id: Date.now().toString(),
        type: 'safety',
        title: 'System Status Update',
        message: 'All emergency services are operational. Help is available.',
        location: 'System Wide',
        timestamp: 'Just now',
        priority: 'low',
        source: 'government',
        isActive: true,
        actionRequired: false
      };
      
      setAlerts(prev => [testAlert, ...prev.slice(0, 9)]); // Keep latest 10
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'emergency': return AlertTriangle;
      case 'weather': return '🌧️';
      case 'safety': return Shield;
      case 'resource': return '📦';
      case 'evacuation': return '🚨';
      default: return AlertTriangle;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-emergency text-emergency-foreground animate-pulse-emergency';
      case 'high': return 'bg-warning text-warning-foreground';
      case 'medium': return 'bg-primary text-primary-foreground';
      case 'low': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getSourceBadge = (source: string) => {
    switch (source) {
      case 'government': return { label: 'GOV', color: 'bg-shelter text-shelter-foreground' };
      case 'ngo': return { label: 'NGO', color: 'bg-resource text-resource-foreground' };
      case 'weather_service': return { label: 'WEATHER', color: 'bg-warning text-warning-foreground' };
      case 'community': return { label: 'COMM', color: 'bg-safe text-safe-foreground' };
      default: return { label: 'SYS', color: 'bg-muted text-muted-foreground' };
    }
  };

  const filteredAlerts = filterPriority === 'all' 
    ? alerts 
    : alerts.filter(alert => alert.priority === filterPriority);

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, isActive: false } : alert
    ));
    
    toast({
      title: "Alert Acknowledged",
      description: "You've confirmed receipt of this alert.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Alert Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning" />
              Emergency Alert System
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="gap-2"
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                Sound
              </Button>
              <Badge variant="secondary" className="gap-1">
                <Wifi className="w-3 h-3" />
                SMS Mode
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant={filterPriority === 'all' ? 'default' : 'outline'}
              onClick={() => setFilterPriority('all')}
            >
              All Alerts ({alerts.length})
            </Button>
            <Button
              size="sm"
              variant={filterPriority === 'critical' ? 'default' : 'outline'}
              onClick={() => setFilterPriority('critical')}
              className="gap-1"
            >
              Critical ({alerts.filter(a => a.priority === 'critical').length})
            </Button>
            <Button
              size="sm"
              variant={filterPriority === 'high' ? 'default' : 'outline'}
              onClick={() => setFilterPriority('high')}
              className="gap-1"
            >
              High ({alerts.filter(a => a.priority === 'high').length})
            </Button>
            <Button
              size="sm"
              variant={filterPriority === 'medium' ? 'default' : 'outline'}
              onClick={() => setFilterPriority('medium')}
              className="gap-1"
            >
              Medium ({alerts.filter(a => a.priority === 'medium').length})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Active Alerts List */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-foreground">
          Active Alerts ({filteredAlerts.filter(a => a.isActive).length})
        </h3>

        {filteredAlerts.length === 0 ? (
          <Card className="border-safe/20 bg-safe/5">
            <CardContent className="pt-6 text-center">
              <Shield className="w-12 h-12 mx-auto mb-4 text-safe" />
              <h4 className="font-medium text-foreground mb-2">No Active Alerts</h4>
              <p className="text-sm text-muted-foreground">
                System is monitoring for emergency updates. Stay safe!
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredAlerts.map((alert) => {
            const Icon = getAlertIcon(alert.type);
            const sourceBadge = getSourceBadge(alert.source);
            
            return (
              <Card 
                key={alert.id} 
                className={`${alert.priority === 'critical' ? 'border-emergency shadow-emergency' : ''} 
                           ${alert.isActive ? '' : 'opacity-60'}`}
              >
                <CardContent className="pt-4">
                  <div className="flex gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      alert.priority === 'critical' ? 'bg-emergency/10' :
                      alert.priority === 'high' ? 'bg-warning/10' :
                      'bg-primary/10'
                    }`}>
                      {typeof Icon === 'string' ? (
                        <div className="text-xl">{Icon}</div>
                      ) : (
                        <Icon className={`w-5 h-5 ${
                          alert.priority === 'critical' ? 'text-emergency' :
                          alert.priority === 'high' ? 'text-warning' :
                          'text-primary'
                        }`} />
                      )}
                    </div>
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-foreground">{alert.title}</h4>
                            <Badge className={`text-xs ${getPriorityColor(alert.priority)}`}>
                              {alert.priority.toUpperCase()}
                            </Badge>
                            <Badge className={`text-xs ${sourceBadge.color}`}>
                              {sourceBadge.label}
                            </Badge>
                          </div>
                          <p className="text-sm text-foreground mb-2">{alert.message}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {alert.location}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {alert.timestamp}
                            </div>
                          </div>
                        </div>
                        
                        {alert.isActive && (
                          <div className="flex flex-col gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => acknowledgeAlert(alert.id)}
                            >
                              Acknowledge
                            </Button>
                            {alert.actionRequired && (
                              <Badge variant="destructive" className="text-xs text-center">
                                ACTION REQUIRED
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Offline Mode Notice */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-4">
          <div className="flex items-center gap-3">
            <Wifi className="w-5 h-5 text-primary" />
            <div className="flex-1">
              <h4 className="font-medium text-foreground">Offline Alert System</h4>
              <p className="text-sm text-muted-foreground">
                Alerts are received via SMS when internet is unavailable. GPS coordinates included for precise emergency response.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AlertSystem;