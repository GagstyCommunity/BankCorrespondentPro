import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Search, Filter, MoreVertical, Map, FileText, AlertTriangle, CheckCircle, ChevronDown } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { formatDate, getStatusColor, getScoreColor } from "@/lib/utils";
import { CSP } from "@shared/schema";
import { INDIAN_STATES } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";

export function CSPManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [stateFilter, setStateFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [scoreFilter, setScoreFilter] = useState<string>("");
  const [selectedCSP, setSelectedCSP] = useState<CSP | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const { toast } = useToast();

  // Fetch CSPs
  const { data: csps, isLoading } = useQuery({
    queryKey: ['/api/csps'],
    staleTime: 60000, // 1 minute
  });

  // Fetch applications for pending tab
  const { data: applications, isLoading: loadingApplications } = useQuery({
    queryKey: ['/api/applications'],
    staleTime: 60000,
  });

  // Mutation for updating CSP status
  const updateCspStatus = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await apiRequest('PATCH', `/api/csps/${id}`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/csps'] });
      toast({
        title: "Status Updated",
        description: "The CSP status has been successfully updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: "Failed to update CSP status. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Mutation for approving/rejecting applications
  const processApplication = useMutation({
    mutationFn: async ({ id, status, notes }: { id: number; status: string; notes?: string }) => {
      const response = await apiRequest('PATCH', `/api/applications/${id}`, { status, notes });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/applications'] });
      toast({
        title: "Application Processed",
        description: "The application has been successfully processed.",
      });
    },
    onError: (error) => {
      toast({
        title: "Process Failed",
        description: "Failed to process application. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Filter CSPs based on search and filters
  const filteredCSPs = csps?.filter((csp: CSP) => {
    const matchesSearch = !searchQuery || 
      csp.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      csp.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      csp.aadhaarNumber.includes(searchQuery);
    
    const matchesState = !stateFilter || csp.state === stateFilter;
    const matchesStatus = !statusFilter || csp.status === statusFilter;
    const matchesScore = !scoreFilter || 
      (scoreFilter === 'high' && csp.score >= 80) ||
      (scoreFilter === 'medium' && csp.score >= 50 && csp.score < 80) ||
      (scoreFilter === 'low' && csp.score < 50);
    
    return matchesSearch && matchesState && matchesStatus && matchesScore;
  });

  // Filter applications based on active tab
  const filteredApplications = applications?.filter((app: any) => {
    return app.status === 'pending';
  });

  // Get CSP Details
  const handleViewCSP = (csp: CSP) => {
    setSelectedCSP(csp);
  };

  // Status badges
  const renderStatusBadge = (status: string) => {
    return <Badge className={getStatusColor(status)}>{status}</Badge>;
  };

  // Render score with appropriate color
  const renderScore = (score: number) => {
    return <span className={getScoreColor(score)}>{score}</span>;
  };

  // Filtering UI
  const filterOptions = (
    <div className="flex flex-col md:flex-row gap-4 my-4">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by address, city, or Aadhaar number..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-8"
        />
      </div>
      
      <Select value={stateFilter} onValueChange={setStateFilter}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by state" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All States</SelectItem>
          {INDIAN_STATES.map((state) => (
            <SelectItem key={state.value} value={state.value}>
              {state.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All Statuses</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="inactive">Inactive</SelectItem>
          <SelectItem value="suspended">Suspended</SelectItem>
        </SelectContent>
      </Select>
      
      <Select value={scoreFilter} onValueChange={setScoreFilter}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by score" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All Scores</SelectItem>
          <SelectItem value="high">High (80+)</SelectItem>
          <SelectItem value="medium">Medium (50-79)</SelectItem>
          <SelectItem value="low">Low (&lt;50)</SelectItem>
        </SelectContent>
      </Select>
      
      <Button variant="outline" onClick={() => {
        setSearchQuery("");
        setStateFilter("");
        setStatusFilter("");
        setScoreFilter("");
      }}>
        Reset Filters
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">CSP Management</h1>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All CSPs</TabsTrigger>
          <TabsTrigger value="pending">
            Pending Applications {filteredApplications?.length ? `(${filteredApplications.length})` : ''}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4">
          {filterOptions}
          
          <Card>
            <CardHeader>
              <CardTitle>Customer Service Points</CardTitle>
              <CardDescription>
                Manage and monitor all registered CSPs in the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>CSP ID</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead>Aadhaar</TableHead>
                        <TableHead>Registered On</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCSPs?.length > 0 ? (
                        filteredCSPs.map((csp: CSP) => (
                          <TableRow key={csp.id}>
                            <TableCell className="font-medium">{csp.id}</TableCell>
                            <TableCell>
                              {csp.city}, {csp.state}
                            </TableCell>
                            <TableCell>{renderStatusBadge(csp.status)}</TableCell>
                            <TableCell>{renderScore(csp.score)}</TableCell>
                            <TableCell>
                              {csp.aadhaarNumber.substring(0, 4)}...
                              {csp.aadhaarNumber.substring(csp.aadhaarNumber.length - 4)}
                            </TableCell>
                            <TableCell>{formatDate(csp.createdAt)}</TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreVertical className="h-4 w-4" />
                                    <span className="sr-only">Actions</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuItem onClick={() => handleViewCSP(csp)}>
                                    <FileText className="h-4 w-4 mr-2" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Map className="h-4 w-4 mr-2" />
                                    View on Map
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    onClick={() => updateCspStatus.mutate({ id: csp.id, status: 'active' })}
                                    disabled={csp.status === 'active'}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Set as Active
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => updateCspStatus.mutate({ id: csp.id, status: 'suspended' })}
                                    disabled={csp.status === 'suspended'}
                                    className="text-destructive focus:text-destructive"
                                  >
                                    <AlertTriangle className="h-4 w-4 mr-2" />
                                    Suspend CSP
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                            No CSPs found matching the current filters
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Applications</CardTitle>
              <CardDescription>
                Review and process new CSP applications
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingApplications ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Education</TableHead>
                        <TableHead>Applied On</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredApplications?.length > 0 ? (
                        filteredApplications.map((app: any) => (
                          <TableRow key={app.id}>
                            <TableCell className="font-medium">
                              {app.firstName} {app.lastName}
                            </TableCell>
                            <TableCell>{app.email}</TableCell>
                            <TableCell>{app.phone}</TableCell>
                            <TableCell>{app.education}</TableCell>
                            <TableCell>{formatDate(app.createdAt)}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => processApplication.mutate({ 
                                    id: app.id, 
                                    status: 'approved'
                                  })}
                                >
                                  Approve
                                </Button>
                                <Button 
                                  variant="destructive" 
                                  size="sm"
                                  onClick={() => processApplication.mutate({ 
                                    id: app.id, 
                                    status: 'rejected',
                                    notes: 'Application does not meet our requirements' 
                                  })}
                                >
                                  Reject
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                            No pending applications found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {selectedCSP && (
        <Dialog open={!!selectedCSP} onOpenChange={(open) => !open && setSelectedCSP(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>CSP Details</DialogTitle>
              <DialogDescription>
                Detailed information about the selected Customer Service Point
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Personal Information</h3>
                <dl className="grid grid-cols-3 gap-2">
                  <dt className="text-muted-foreground">ID:</dt>
                  <dd className="col-span-2">{selectedCSP.id}</dd>
                  
                  <dt className="text-muted-foreground">Aadhaar:</dt>
                  <dd className="col-span-2">{selectedCSP.aadhaarNumber}</dd>
                  
                  <dt className="text-muted-foreground">PAN:</dt>
                  <dd className="col-span-2">{selectedCSP.panNumber || "Not provided"}</dd>
                  
                  <dt className="text-muted-foreground">Education:</dt>
                  <dd className="col-span-2">{selectedCSP.education}</dd>
                  
                  <dt className="text-muted-foreground">Status:</dt>
                  <dd className="col-span-2">{renderStatusBadge(selectedCSP.status)}</dd>
                  
                  <dt className="text-muted-foreground">Score:</dt>
                  <dd className="col-span-2">{renderScore(selectedCSP.score)}</dd>
                  
                  <dt className="text-muted-foreground">Registered:</dt>
                  <dd className="col-span-2">{formatDate(selectedCSP.createdAt)}</dd>
                </dl>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Location Information</h3>
                <dl className="grid grid-cols-3 gap-2">
                  <dt className="text-muted-foreground">Address:</dt>
                  <dd className="col-span-2">{selectedCSP.address}</dd>
                  
                  <dt className="text-muted-foreground">City:</dt>
                  <dd className="col-span-2">{selectedCSP.city}</dd>
                  
                  <dt className="text-muted-foreground">State:</dt>
                  <dd className="col-span-2">{selectedCSP.state}</dd>
                  
                  <dt className="text-muted-foreground">Pincode:</dt>
                  <dd className="col-span-2">{selectedCSP.pincode}</dd>
                  
                  <dt className="text-muted-foreground">Working Capital:</dt>
                  <dd className="col-span-2">₹{selectedCSP.workingCapital?.toLocaleString() || "0"}</dd>
                </dl>
              </div>
            </div>
            
            <div className="flex justify-between mt-4">
              <Button variant="outline">View Transactions</Button>
              <Button variant="outline">Assign Audit</Button>
              <Button variant="default">View on Map</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
