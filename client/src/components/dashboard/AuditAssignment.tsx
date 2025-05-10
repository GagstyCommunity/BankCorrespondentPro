import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter 
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
  DialogTrigger,
  DialogFooter 
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
import { Label } from "@/components/ui/label";
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
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  Loader2, 
  Search, 
  Filter, 
  Calendar as CalendarIcon, 
  ChevronDown, 
  MoreVertical, 
  Download, 
  Eye, 
  CheckCircle,
  XCircle,
  FileText,
  Route,
  Clock
} from "lucide-react";
import { cn, formatDate, getStatusColor } from "@/lib/utils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { AUDIT_STATUS_OPTIONS } from "@/lib/constants";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const assignmentSchema = z.object({
  cspId: z.number({
    required_error: "CSP is required",
  }),
  auditorId: z.number({
    required_error: "Auditor is required",
  }),
  scheduledDate: z.date({
    required_error: "Scheduled date is required",
  }),
  notes: z.string().optional(),
});

export function AuditAssignment() {
  const [selectedAudit, setSelectedAudit] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);
  const { toast } = useToast();

  // Fetch data
  const { data: audits, isLoading: loadingAudits } = useQuery({
    queryKey: ['/api/audits'],
    staleTime: 60000,
  });

  const { data: csps, isLoading: loadingCsps } = useQuery({
    queryKey: ['/api/csps'],
    staleTime: 60000,
  });

  const { data: auditors, isLoading: loadingAuditors } = useQuery({
    queryKey: ['/api/users?role=auditor'],
    staleTime: 60000,
  });

  // Setup assignment form
  const form = useForm<z.infer<typeof assignmentSchema>>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: {
      notes: "",
    },
  });

  // Filter audits based on tab and search
  const filteredAudits = audits?.filter((audit: any) => {
    // Filter by tab
    if (activeTab === "pending" && audit.status !== "scheduled") return false;
    if (activeTab === "completed" && audit.status !== "completed") return false;
    if (activeTab === "failed" && audit.status !== "failed") return false;
    
    // Filter by status if applicable
    if (statusFilter && audit.status !== statusFilter) return false;
    
    // Filter by search
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      const cspMatches = audit.cspId.toString().includes(searchLower);
      const auditorMatches = audit.auditorId.toString().includes(searchLower);
      if (!cspMatches && !auditorMatches) return false;
    }
    
    return true;
  });

  // Create audit assignment mutation
  const createAudit = useMutation({
    mutationFn: async (data: z.infer<typeof assignmentSchema>) => {
      const response = await apiRequest('POST', '/api/audits', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/audits'] });
      toast({
        title: "Audit Assigned",
        description: "The audit has been successfully assigned to the auditor.",
      });
      setIsAssigning(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Assignment Failed",
        description: "Failed to assign the audit. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Handle submitting the assignment form
  const onSubmit = (data: z.infer<typeof assignmentSchema>) => {
    createAudit.mutate(data);
  };

  // View audit details
  const handleViewAudit = (audit: any) => {
    setSelectedAudit(audit);
  };

  // Status badges
  const renderStatusBadge = (status: string) => {
    return <Badge className={getStatusColor(status)}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Audit Assignment</h1>
        <Button onClick={() => setIsAssigning(true)}>Assign New Audit</Button>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Audits</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="failed">Failed</TabsTrigger>
        </TabsList>

        <div className="flex flex-col md:flex-row gap-4 my-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by CSP ID or auditor ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Statuses</SelectItem>
              {AUDIT_STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button variant="outline" onClick={() => {
            setSearchQuery("");
            setStatusFilter("");
          }}>
            Reset Filters
          </Button>
        </div>

        <TabsContent value={activeTab} className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Audit Assignments</CardTitle>
              <CardDescription>
                Manage and track all audit assignments
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingAudits ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Audit ID</TableHead>
                        <TableHead>CSP ID</TableHead>
                        <TableHead>Auditor ID</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Scheduled Date</TableHead>
                        <TableHead>Completed Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAudits?.length > 0 ? (
                        filteredAudits.map((audit: any) => (
                          <TableRow key={audit.id}>
                            <TableCell className="font-medium">{audit.id}</TableCell>
                            <TableCell>{audit.cspId}</TableCell>
                            <TableCell>{audit.auditorId}</TableCell>
                            <TableCell>{renderStatusBadge(audit.status)}</TableCell>
                            <TableCell>{formatDate(audit.scheduledDate)}</TableCell>
                            <TableCell>
                              {audit.completedDate ? formatDate(audit.completedDate) : "-"}
                            </TableCell>
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
                                  <DropdownMenuItem onClick={() => handleViewAudit(audit)}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Details
                                  </DropdownMenuItem>
                                  {audit.status === "completed" && (
                                    <DropdownMenuItem>
                                      <Download className="h-4 w-4 mr-2" />
                                      Download Report
                                    </DropdownMenuItem>
                                  )}
                                  {audit.status === "scheduled" && (
                                    <DropdownMenuItem>
                                      <Route className="h-4 w-4 mr-2" />
                                      View Route
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                            No audits found matching the current filters
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

      {/* Audit Details Dialog */}
      {selectedAudit && (
        <Dialog open={!!selectedAudit} onOpenChange={(open) => !open && setSelectedAudit(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Audit Details</DialogTitle>
              <DialogDescription>
                Information about Audit #{selectedAudit.id}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Audit Information</h3>
                <dl className="grid grid-cols-3 gap-2">
                  <dt className="text-muted-foreground">Audit ID:</dt>
                  <dd className="col-span-2">{selectedAudit.id}</dd>
                  
                  <dt className="text-muted-foreground">CSP ID:</dt>
                  <dd className="col-span-2">{selectedAudit.cspId}</dd>
                  
                  <dt className="text-muted-foreground">Auditor ID:</dt>
                  <dd className="col-span-2">{selectedAudit.auditorId}</dd>
                  
                  <dt className="text-muted-foreground">Status:</dt>
                  <dd className="col-span-2">{renderStatusBadge(selectedAudit.status)}</dd>
                </dl>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Schedule Information</h3>
                <dl className="grid grid-cols-3 gap-2">
                  <dt className="text-muted-foreground">Scheduled:</dt>
                  <dd className="col-span-2">{formatDate(selectedAudit.scheduledDate)}</dd>
                  
                  <dt className="text-muted-foreground">Completed:</dt>
                  <dd className="col-span-2">
                    {selectedAudit.completedDate ? formatDate(selectedAudit.completedDate) : "-"}
                  </dd>
                  
                  <dt className="text-muted-foreground">Notes:</dt>
                  <dd className="col-span-2">{selectedAudit.notes || "No notes"}</dd>
                </dl>
              </div>
            </div>
            
            {selectedAudit.status === "completed" && (
              <div>
                <h3 className="text-lg font-medium mb-2">Audit Results</h3>
                <dl className="grid grid-cols-3 gap-2">
                  <dt className="text-muted-foreground">Rating:</dt>
                  <dd className="col-span-2">
                    {selectedAudit.rating ? `${selectedAudit.rating}/5 stars` : "Not rated"}
                  </dd>
                  
                  <dt className="text-muted-foreground">Issues:</dt>
                  <dd className="col-span-2">
                    {selectedAudit.issues?.length ? 
                      selectedAudit.issues.map((issue: string, i: number) => (
                        <div key={i} className="flex items-start mt-1">
                          <XCircle className="h-4 w-4 text-red-500 mr-2 mt-0.5" />
                          <span>{issue}</span>
                        </div>
                      ))
                      : "No issues found"
                    }
                  </dd>
                  
                  <dt className="text-muted-foreground">Photos:</dt>
                  <dd className="col-span-2">
                    {selectedAudit.photos?.length ? 
                      <div className="flex flex-wrap gap-2 mt-1">
                        {selectedAudit.photos.map((photo: string, i: number) => (
                          <div key={i} className="h-16 w-16 rounded-md bg-gray-200 flex items-center justify-center">
                            <FileText className="h-6 w-6 text-gray-500" />
                          </div>
                        ))}
                      </div>
                      : "No photos uploaded"
                    }
                  </dd>
                </dl>
              </div>
            )}
            
            <div className="flex justify-between mt-4">
              <Button variant="outline">
                <Clock className="mr-2 h-4 w-4" />
                View Audit History
              </Button>
              
              {selectedAudit.status === "completed" && (
                <Button>
                  <Download className="mr-2 h-4 w-4" />
                  Download Report
                </Button>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Assign New Audit Dialog */}
      <Dialog open={isAssigning} onOpenChange={setIsAssigning}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign New Audit</DialogTitle>
            <DialogDescription>
              Select a CSP and auditor to schedule a new audit.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="cspId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select CSP</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      defaultValue={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a CSP" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {loadingCsps ? (
                          <div className="flex justify-center items-center py-2">
                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                          </div>
                        ) : (
                          csps?.map((csp: any) => (
                            <SelectItem key={csp.id} value={csp.id.toString()}>
                              CSP #{csp.id} - {csp.city}, {csp.state}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="auditorId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Auditor</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      defaultValue={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an auditor" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {loadingAuditors ? (
                          <div className="flex justify-center items-center py-2">
                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                          </div>
                        ) : (
                          auditors?.map((auditor: any) => (
                            <SelectItem key={auditor.id} value={auditor.id.toString()}>
                              {auditor.fullName}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="scheduledDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Scheduled Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              formatDate(field.value)
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date() || date > new Date(new Date().setDate(new Date().getDate() + 30))
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      Audits can be scheduled up to 30 days in advance.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add any specific instructions for the auditor"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsAssigning(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createAudit.isPending}>
                  {createAudit.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Assigning...
                    </>
                  ) : (
                    "Assign Audit"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
