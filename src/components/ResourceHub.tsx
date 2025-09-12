import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, Plus, Package, Clock, MapPin, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Resource {
  id: string;
  name: string;
  category: 'food' | 'medical' | 'shelter' | 'clothing' | 'water';
  quantity: string;
  location: string;
  provider: string;
  status: 'available' | 'requested' | 'in_transit';
  urgency: 'low' | 'medium' | 'high';
  timePosted: string;
}

const ResourceHub = () => {
  const [activeTab, setActiveTab] = useState<'available' | 'request'>('available');
  const [newRequest, setNewRequest] = useState('');
  const { toast } = useToast();

  // Mock resource data
  const resources: Resource[] = [
    {
      id: '1',
      name: 'Emergency Food Packets (50 units)',
      category: 'food',
      quantity: '50 packets',
      location: 'Red Cross Center, Sector 15',
      provider: 'Red Cross India',
      status: 'available',
      urgency: 'medium',
      timePosted: '2 hours ago'
    },
    {
      id: '2',
      name: 'First Aid Medical Kits',
      category: 'medical',
      quantity: '25 kits',
      location: 'Government Hospital',
      provider: 'Health Department',
      status: 'available',
      urgency: 'high',
      timePosted: '1 hour ago'
    },
    {
      id: '3',
      name: 'Blankets and Warm Clothing',
      category: 'clothing',
      quantity: '100 pieces',
      location: 'Community Center',
      provider: 'Local NGO',
      status: 'requested',
      urgency: 'high',
      timePosted: '30 minutes ago'
    },
    {
      id: '4',
      name: 'Drinking Water (Bottled)',
      category: 'water',
      quantity: '200 bottles',
      location: 'Relief Camp, Zone A',
      provider: 'Municipal Corporation',
      status: 'in_transit',
      urgency: 'medium',
      timePosted: '45 minutes ago'
    },
  ];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'food': return '🍞';
      case 'medical': return '💊';
      case 'shelter': return '🏠';
      case 'clothing': return '👕';
      case 'water': return '💧';
      default: return '📦';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-safe text-safe-foreground';
      case 'requested': return 'bg-warning text-warning-foreground';
      case 'in_transit': return 'bg-primary text-primary-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'border-l-emergency';
      case 'medium': return 'border-l-warning';
      case 'low': return 'border-l-safe';
      default: return 'border-l-muted';
    }
  };

  const handleRequestResource = () => {
    if (!newRequest.trim()) return;
    
    toast({
      title: "Resource Request Submitted",
      description: "Your request has been shared with nearby relief organizations.",
    });
    
    setNewRequest('');
  };

  const handleOfferResource = () => {
    toast({
      title: "Thank You!",
      description: "Your resource offering has been registered. We'll connect you with those in need.",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-resource" />
            Resource Sharing Hub
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="available">Available Resources</TabsTrigger>
              <TabsTrigger value="request">Request Help</TabsTrigger>
            </TabsList>

            <TabsContent value="available" className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  {resources.filter(r => r.status === 'available').length} resources available nearby
                </div>
                <Button size="sm" className="gap-2" onClick={handleOfferResource}>
                  <Plus className="w-4 h-4" />
                  Offer Resource
                </Button>
              </div>

              <div className="space-y-3">
                {resources.map((resource) => (
                  <Card key={resource.id} className={`border-l-4 ${getUrgencyColor(resource.urgency)} hover:shadow-md transition-shadow`}>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div className="flex gap-3 flex-1">
                          <div className="text-2xl">
                            {getCategoryIcon(resource.category)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-medium text-foreground">{resource.name}</h4>
                              <Badge className={`text-xs ${getStatusColor(resource.status)}`}>
                                {resource.status.replace('_', ' ').toUpperCase()}
                              </Badge>
                            </div>
                            
                            <div className="space-y-1 text-sm text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <Package className="w-3 h-3" />
                                Quantity: {resource.quantity}
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="w-3 h-3" />
                                {resource.location}
                              </div>
                              <div className="flex items-center gap-2">
                                <User className="w-3 h-3" />
                                Provider: {resource.provider}
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="w-3 h-3" />
                                {resource.timePosted}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-2">
                          <Button size="sm" disabled={resource.status !== 'available'}>
                            {resource.status === 'available' ? 'Request' : 
                             resource.status === 'in_transit' ? 'In Transit' : 'Requested'}
                          </Button>
                          {resource.urgency === 'high' && (
                            <Badge variant="destructive" className="text-xs text-center">
                              URGENT
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="request" className="space-y-4">
              <Card className="border-warning/20 bg-warning/5">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-foreground mb-2">Request Emergency Resources</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Describe what resources you urgently need. Your request will be shared with nearby relief organizations and volunteers.
                      </p>
                    </div>
                    
                    <div className="space-y-3">
                      <Input
                        placeholder="e.g., Need 10 food packets for stranded family..."
                        value={newRequest}
                        onChange={(e) => setNewRequest(e.target.value)}
                        className="w-full"
                      />
                      <Button 
                        onClick={handleRequestResource}
                        className="w-full gap-2"
                        disabled={!newRequest.trim()}
                      >
                        <Heart className="w-4 h-4" />
                        Submit Resource Request
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Request Categories */}
              <div>
                <h4 className="font-medium text-foreground mb-3">Quick Request Categories</h4>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { category: 'food', label: 'Food & Water', icon: '🍞' },
                    { category: 'medical', label: 'Medical Aid', icon: '💊' },
                    { category: 'shelter', label: 'Shelter', icon: '🏠' },
                    { category: 'clothing', label: 'Clothing', icon: '👕' }
                  ].map((item) => (
                    <Button 
                      key={item.category}
                      variant="outline" 
                      className="h-16 flex-col gap-2"
                      onClick={() => setNewRequest(`Need ${item.label.toLowerCase()} urgently. `)}
                    >
                      <div className="text-xl">{item.icon}</div>
                      <div className="text-sm">{item.label}</div>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Recent Requests */}
              <div>
                <h4 className="font-medium text-foreground mb-3">Recent Community Requests</h4>
                <div className="space-y-2">
                  {resources.filter(r => r.status === 'requested').map((resource) => (
                    <Card key={resource.id} className="border-warning/20">
                      <CardContent className="pt-3 pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="text-lg">{getCategoryIcon(resource.category)}</div>
                            <div>
                              <div className="text-sm font-medium text-foreground">{resource.name}</div>
                              <div className="text-xs text-muted-foreground">{resource.timePosted}</div>
                            </div>
                          </div>
                          <Button size="sm" variant="outline">
                            Help Provide
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResourceHub;