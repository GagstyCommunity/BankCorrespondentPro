import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { 
  MapPin, 
  AlertTriangle, 
  Filter, 
  Info, 
  Layers, 
  Eye, 
  EyeOff, 
  Loader2,
  RefreshCw
} from "lucide-react";
import { MAP_CENTER, DEFAULT_ZOOM } from "@/lib/constants";
import { formatCurrency, formatDateTime, getStatusColor } from "@/lib/utils";

// Mock data for the map
const generateMockLocations = () => {
  const india = { lat: 20.5937, lng: 78.9629 };
  const locations = [];
  
  for (let i = 0; i < 100; i++) {
    // Generate random coordinates within India's approximate boundaries
    const lat = india.lat + (Math.random() * 14) - 7;
    const lng = india.lng + (Math.random() * 20) - 10;
    
    // Assign risk levels: 70% low, 20% medium, 10% high
    let riskLevel;
    const rand = Math.random();
    if (rand < 0.7) riskLevel = "low";
    else if (rand < 0.9) riskLevel = "medium";
    else riskLevel = "high";
    
    locations.push({
      id: i + 1,
      lat,
      lng,
      riskLevel,
      cspId: Math.floor(Math.random() * 10000) + 1,
      cspName: `CSP-${Math.floor(Math.random() * 10000)}`,
      lastActivity: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)),
      transactionCount: Math.floor(Math.random() * 200) + 1,
      transactionVolume: Math.floor(Math.random() * 5000000) + 10000,
    });
  }
  
  return locations;
};

export function FraudDetectionMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [googleMap, setGoogleMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [mapType, setMapType] = useState<string>("roadmap");
  const [viewMode, setViewMode] = useState<string>("risk");
  const [riskThreshold, setRiskThreshold] = useState<number[]>([50]);
  const [showLowRisk, setShowLowRisk] = useState(true);
  const [showMediumRisk, setShowMediumRisk] = useState(true);
  const [showHighRisk, setShowHighRisk] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Fetch locations data
  const { data: locations, isLoading, refetch } = useQuery({
    queryKey: ['/api/locations/risk'],
    queryFn: () => Promise.resolve(generateMockLocations()),
    staleTime: 60000, // 1 minute
  });

  // Load Google Maps
  useEffect(() => {
    if (!mapLoaded && !window.google) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.GOOGLE_MAPS_API_KEY || ""}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => setMapLoaded(true);
      document.head.appendChild(script);
    } else if (window.google && !googleMap && mapRef.current) {
      const map = new window.google.maps.Map(mapRef.current, {
        center: MAP_CENTER,
        zoom: DEFAULT_ZOOM,
        mapTypeId: mapType,
        mapTypeControl: false,
        fullscreenControl: true,
        streetViewControl: false,
        zoomControl: true,
      });
      setGoogleMap(map);
      setMapLoaded(true);
    }
  }, [mapLoaded, googleMap, mapType]);

  // Handle refreshing map data
  const handleRefresh = () => {
    setIsRefreshing(true);
    refetch().then(() => {
      setTimeout(() => setIsRefreshing(false), 500);
    });
  };

  // Update markers on the map when data changes or filters are applied
  useEffect(() => {
    if (!googleMap || !locations) return;
    
    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));
    
    // Filter locations based on risk levels
    const filteredLocations = locations.filter(loc => {
      if (loc.riskLevel === "low" && !showLowRisk) return false;
      if (loc.riskLevel === "medium" && !showMediumRisk) return false;
      if (loc.riskLevel === "high" && !showHighRisk) return false;
      return true;
    });
    
    // Create new markers for each location
    const newMarkers = filteredLocations.map(location => {
      // Set marker color based on risk level
      let pinColor = "#10B981"; // low - green
      if (location.riskLevel === "medium") pinColor = "#FBBF24"; // medium - yellow
      if (location.riskLevel === "high") pinColor = "#EF4444"; // high - red
      
      // Create marker
      const marker = new window.google.maps.Marker({
        position: { lat: location.lat, lng: location.lng },
        map: googleMap,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          fillColor: pinColor,
          fillOpacity: 0.8,
          strokeColor: "#FFFFFF",
          strokeWeight: 1,
          scale: 8,
        },
        title: `CSP #${location.cspId}`,
      });
      
      // Add click listener
      marker.addListener("click", () => {
        setSelectedLocation(location);
      });
      
      return marker;
    });
    
    setMarkers(newMarkers);
  }, [googleMap, locations, showLowRisk, showMediumRisk, showHighRisk]);

  // Update map type when it changes
  useEffect(() => {
    if (googleMap) {
      googleMap.setMapTypeId(mapType);
    }
  }, [googleMap, mapType]);

  // Render risk level badge
  const renderRiskBadge = (risk: string) => {
    let badgeClass = "";
    switch (risk) {
      case "low":
        badgeClass = "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
        break;
      case "medium":
        badgeClass = "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
        break;
      case "high":
        badgeClass = "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
        break;
    }
    return <Badge className={badgeClass}>{risk.toUpperCase()}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Fraud Detection Map</h1>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
          {isRefreshing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
          Refresh Data
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Risk Monitoring Map</CardTitle>
                  <CardDescription>
                    Geographical distribution of CSPs with risk indicators
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Select value={mapType} onValueChange={setMapType}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Map Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="roadmap">Road Map</SelectItem>
                      <SelectItem value="satellite">Satellite</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                      <SelectItem value="terrain">Terrain</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Map display */}
              <div 
                ref={mapRef} 
                className="h-[500px] w-full rounded-md overflow-hidden border" 
                style={{ position: "relative" }}
              >
                {!mapLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                )}
                
                {/* Custom map controls */}
                <div className="absolute top-4 left-4 z-10">
                  <Card className="shadow-lg">
                    <CardContent className="p-3">
                      <div className="space-y-3">
                        <div className="font-medium flex items-center">
                          <Filter className="mr-2 h-4 w-4" />
                          Risk Levels
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <Checkbox 
                              id="low-risk"
                              checked={showLowRisk}
                              onCheckedChange={setShowLowRisk}
                            />
                            <label
                              htmlFor="low-risk"
                              className="ml-2 flex items-center text-sm font-medium"
                            >
                              <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
                              Low Risk
                            </label>
                          </div>
                          <div className="flex items-center">
                            <Checkbox 
                              id="medium-risk"
                              checked={showMediumRisk}
                              onCheckedChange={setShowMediumRisk}
                            />
                            <label
                              htmlFor="medium-risk"
                              className="ml-2 flex items-center text-sm font-medium"
                            >
                              <div className="h-3 w-3 rounded-full bg-yellow-500 mr-2"></div>
                              Medium Risk
                            </label>
                          </div>
                          <div className="flex items-center">
                            <Checkbox 
                              id="high-risk"
                              checked={showHighRisk}
                              onCheckedChange={setShowHighRisk}
                            />
                            <label
                              htmlFor="high-risk"
                              className="ml-2 flex items-center text-sm font-medium"
                            >
                              <div className="h-3 w-3 rounded-full bg-red-500 mr-2"></div>
                              High Risk
                            </label>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Risk Overview</CardTitle>
              <CardDescription>
                Current risk distribution across locations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 bg-green-100 dark:bg-green-900 rounded-md">
                    <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                      {locations?.filter(l => l.riskLevel === "low").length || 0}
                    </div>
                    <div className="text-sm text-green-600 dark:text-green-400">Low Risk</div>
                  </div>
                  <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-md">
                    <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                      {locations?.filter(l => l.riskLevel === "medium").length || 0}
                    </div>
                    <div className="text-sm text-yellow-600 dark:text-yellow-400">Medium Risk</div>
                  </div>
                  <div className="p-3 bg-red-100 dark:bg-red-900 rounded-md">
                    <div className="text-2xl font-bold text-red-700 dark:text-red-300">
                      {locations?.filter(l => l.riskLevel === "high").length || 0}
                    </div>
                    <div className="text-sm text-red-600 dark:text-red-400">High Risk</div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-2">AI Risk Engine</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Active alerts</span>
                      <span className="font-medium">{locations?.length || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Analyzed transactions</span>
                      <span className="font-medium">42,586</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Detection rate</span>
                      <span className="font-medium">99.7%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">False positives</span>
                      <span className="font-medium">0.3%</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {selectedLocation && (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>CSP Details</CardTitle>
                    <CardDescription>
                      {selectedLocation.cspName} (ID: {selectedLocation.cspId})
                    </CardDescription>
                  </div>
                  <div>
                    {renderRiskBadge(selectedLocation.riskLevel)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-sm text-muted-foreground">Location</div>
                    <div className="text-sm font-medium">
                      {selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}
                    </div>
                    
                    <div className="text-sm text-muted-foreground">Last Activity</div>
                    <div className="text-sm font-medium">
                      {formatDateTime(selectedLocation.lastActivity)}
                    </div>
                    
                    <div className="text-sm text-muted-foreground">Transactions</div>
                    <div className="text-sm font-medium">
                      {selectedLocation.transactionCount} transactions
                    </div>
                    
                    <div className="text-sm text-muted-foreground">Volume</div>
                    <div className="text-sm font-medium">
                      {formatCurrency(selectedLocation.transactionVolume)}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button variant="outline" className="flex-1" size="sm">
                      <Info className="mr-2 h-4 w-4" />
                      CSP Profile
                    </Button>
                    <Button className="flex-1" size="sm">
                      <AlertTriangle className="mr-2 h-4 w-4" />
                      Create Alert
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
