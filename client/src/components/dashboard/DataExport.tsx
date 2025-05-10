import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";
import { 
  Download, 
  Calendar as CalendarIcon, 
  RefreshCw, 
  Database, 
  Users, 
  CreditCard, 
  AlertTriangle, 
  ClipboardCheck, 
  FileText, 
  Loader2 
} from "lucide-react";
import { cn, formatDate, downloadCSV } from "@/lib/utils";
import { EXPORT_TYPES } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export function DataExport() {
  const [activeTab, setActiveTab] = useState("csps");
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [selectedFormat, setSelectedFormat] = useState("csv");
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  });
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  // Get available columns based on active tab
  const getColumns = () => {
    switch (activeTab) {
      case "csps":
        return [
          { id: "id", label: "CSP ID" },
          { id: "userId", label: "User ID" },
          { id: "address", label: "Address" },
          { id: "city", label: "City" },
          { id: "state", label: "State" },
          { id: "pincode", label: "Pincode" },
          { id: "aadhaarNumber", label: "Aadhaar Number" },
          { id: "panNumber", label: "PAN Number" },
          { id: "education", label: "Education" },
          { id: "location", label: "Location Coordinates" },
          { id: "score", label: "Score" },
          { id: "status", label: "Status" },
          { id: "createdAt", label: "Created At" },
          { id: "workingCapital", label: "Working Capital" },
        ];
      case "transactions":
        return [
          { id: "id", label: "Transaction ID" },
          { id: "cspId", label: "CSP ID" },
          { id: "type", label: "Type" },
          { id: "amount", label: "Amount" },
          { id: "status", label: "Status" },
          { id: "customerPhone", label: "Customer Phone" },
          { id: "customerName", label: "Customer Name" },
          { id: "createdAt", label: "Created At" },
          { id: "location", label: "Location" },
          { id: "riskScore", label: "Risk Score" },
          { id: "flagged", label: "Flagged" },
          { id: "flagReason", label: "Flag Reason" },
        ];
      case "audits":
        return [
          { id: "id", label: "Audit ID" },
          { id: "cspId", label: "CSP ID" },
          { id: "auditorId", label: "Auditor ID" },
          { id: "scheduledDate", label: "Scheduled Date" },
          { id: "completedDate", label: "Completed Date" },
          { id: "status", label: "Status" },
          { id: "notes", label: "Notes" },
          { id: "photos", label: "Photos" },
          { id: "videos", label: "Videos" },
          { id: "location", label: "Location" },
          { id: "rating", label: "Rating" },
          { id: "issues", label: "Issues" },
          { id: "createdAt", label: "Created At" },
        ];
      case "alerts":
        return [
          { id: "id", label: "Alert ID" },
          { id: "cspId", label: "CSP ID" },
          { id: "transactionId", label: "Transaction ID" },
          { id: "type", label: "Type" },
          { id: "severity", label: "Severity" },
          { id: "message", label: "Message" },
          { id: "status", label: "Status" },
          { id: "assignedTo", label: "Assigned To" },
          { id: "resolvedBy", label: "Resolved By" },
          { id: "resolvedAt", label: "Resolved At" },
          { id: "createdAt", label: "Created At" },
        ];
      case "applications":
        return [
          { id: "id", label: "Application ID" },
          { id: "firstName", label: "First Name" },
          { id: "lastName", label: "Last Name" },
          { id: "email", label: "Email" },
          { id: "phone", label: "Phone" },
          { id: "aadhaarNumber", label: "Aadhaar Number" },
          { id: "address", label: "Address" },
          { id: "education", label: "Education" },
          { id: "status", label: "Status" },
          { id: "notes", label: "Notes" },
          { id: "reviewedBy", label: "Reviewed By" },
          { id: "reviewedAt", label: "Reviewed At" },
          { id: "createdAt", label: "Created At" },
        ];
      case "users":
        return [
          { id: "id", label: "User ID" },
          { id: "username", label: "Username" },
          { id: "email", label: "Email" },
          { id: "fullName", label: "Full Name" },
          { id: "phone", label: "Phone" },
          { id: "role", label: "Role" },
          { id: "status", label: "Status" },
          { id: "createdAt", label: "Created At" },
        ];
      default:
        return [];
    }
  };

  const columns = getColumns();

  // Set all columns as selected by default when tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSelectedColumns(getColumns().map((col) => col.id));
  };

  // Toggle column selection
  const toggleColumn = (columnId: string) => {
    setSelectedColumns((prev) =>
      prev.includes(columnId)
        ? prev.filter((id) => id !== columnId)
        : [...prev, columnId]
    );
  };

  // Select all columns
  const selectAllColumns = () => {
    setSelectedColumns(columns.map((col) => col.id));
  };

  // Deselect all columns
  const deselectAllColumns = () => {
    setSelectedColumns([]);
  };

  // Handle export
  const handleExport = async () => {
    if (selectedColumns.length === 0) {
      toast({
        title: "No Columns Selected",
        description: "Please select at least one column to export.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsExporting(true);

      // Construct query parameters
      const params = new URLSearchParams();
      if (dateRange?.from) {
        params.append("fromDate", dateRange.from.toISOString());
      }
      if (dateRange?.to) {
        params.append("toDate", dateRange.to.toISOString());
      }
      
      const response = await apiRequest("GET", `/api/export/${activeTab}?${params.toString()}`);
      const { data } = await response.json();
      
      if (!data || data.length === 0) {
        toast({
          title: "No Data",
          description: "There is no data available for the selected criteria.",
          variant: "destructive",
        });
        return;
      }
      
      // Filter data to only include selected columns
      const filteredData = data.map((item: any) => {
        const result: Record<string, any> = {};
        selectedColumns.forEach((colId) => {
          if (colId in item) {
            result[colId] = item[colId];
          }
        });
        return result;
      });
      
      // Generate filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const filename = `${activeTab}_export_${timestamp}.${selectedFormat}`;
      
      // Export data
      if (selectedFormat === "csv") {
        downloadCSV(filteredData, filename);
      } else {
        // For JSON, create a file download
        const blob = new Blob([JSON.stringify(filteredData, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
      
      toast({
        title: "Export Successful",
        description: `Data has been exported as ${filename}`,
      });
      
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export Failed",
        description: "Failed to export data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Data Export</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Export Configuration</CardTitle>
              <CardDescription>
                Select data type, columns, and format for export
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <Tabs defaultValue="csps" value={activeTab} onValueChange={handleTabChange}>
                  <TabsList className="grid grid-cols-3 md:grid-cols-6">
                    <TabsTrigger value="csps" className="flex items-center">
                      <Users className="h-4 w-4 mr-2" />
                      CSPs
                    </TabsTrigger>
                    <TabsTrigger value="transactions" className="flex items-center">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Transactions
                    </TabsTrigger>
                    <TabsTrigger value="audits" className="flex items-center">
                      <ClipboardCheck className="h-4 w-4 mr-2" />
                      Audits
                    </TabsTrigger>
                    <TabsTrigger value="alerts" className="flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Alerts
                    </TabsTrigger>
                    <TabsTrigger value="applications" className="flex items-center">
                      <FileText className="h-4 w-4 mr-2" />
                      Applications
                    </TabsTrigger>
                    <TabsTrigger value="users" className="flex items-center">
                      <Users className="h-4 w-4 mr-2" />
                      Users
                    </TabsTrigger>
                  </TabsList>
                </Tabs>

                <div>
                  <h3 className="text-lg font-medium mb-2">Date Range</h3>
                  <div className="flex items-center space-x-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          id="date"
                          variant={"outline"}
                          className={cn(
                            "w-[300px] justify-start text-left font-normal",
                            !dateRange && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dateRange?.from ? (
                            dateRange.to ? (
                              <>
                                {formatDate(dateRange.from)} - {formatDate(dateRange.to)}
                              </>
                            ) : (
                              formatDate(dateRange.from)
                            )
                          ) : (
                            <span>Pick a date range</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          initialFocus
                          mode="range"
                          defaultMonth={dateRange?.from}
                          selected={dateRange}
                          onSelect={setDateRange}
                          numberOfMonths={2}
                        />
                      </PopoverContent>
                    </Popover>
                    <Button variant="outline" size="sm" onClick={() => setDateRange(undefined)}>
                      Reset
                    </Button>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-medium">Select Columns</h3>
                    <div className="space-x-2">
                      <Button variant="outline" size="sm" onClick={selectAllColumns}>
                        Select All
                      </Button>
                      <Button variant="outline" size="sm" onClick={deselectAllColumns}>
                        Deselect All
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {columns.map((column) => (
                      <div key={column.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`column-${column.id}`}
                          checked={selectedColumns.includes(column.id)}
                          onCheckedChange={() => toggleColumn(column.id)}
                        />
                        <Label
                          htmlFor={`column-${column.id}`}
                          className="text-sm cursor-pointer"
                        >
                          {column.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Export Format</h3>
                  <Select defaultValue="csv" onValueChange={setSelectedFormat}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="csv">CSV</SelectItem>
                      <SelectItem value="json">JSON</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleExport}
                disabled={isExporting || selectedColumns.length === 0}
                className="ml-auto"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Export Data
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Export Information</CardTitle>
              <CardDescription>
                Tips and guidance for data exports
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium">About {EXPORT_TYPES.find(t => t.value === activeTab)?.label}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {activeTab === "csps" && "Export Customer Service Point data including location, status, and performance metrics."}
                  {activeTab === "transactions" && "Export transaction records with amounts, types, and risk scores."}
                  {activeTab === "audits" && "Export audit assignments, schedules, and findings from field inspections."}
                  {activeTab === "alerts" && "Export system alerts including fraud warnings and compliance issues."}
                  {activeTab === "applications" && "Export CSP applications with applicant details and approval status."}
                  {activeTab === "users" && "Export system user accounts with roles and status information."}
                </p>
              </div>
              
              <div>
                <h3 className="font-medium">Data Privacy Notice</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Exported data may contain sensitive information. Ensure you follow data protection regulations and company policies when handling exports.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium">Export Formats</h3>
                <div className="text-sm text-muted-foreground mt-1 space-y-2">
                  <p><strong>CSV:</strong> Compatible with Excel and other spreadsheet applications.</p>
                  <p><strong>JSON:</strong> Best for data integration with other systems.</p>
                </div>
              </div>
              
              <div className="rounded-md bg-blue-50 dark:bg-blue-950 p-3">
                <div className="flex items-start">
                  <Database className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-2" />
                  <div>
                    <h3 className="font-medium text-blue-800 dark:text-blue-300">Export Limits</h3>
                    <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                      Exports are limited to 10,000 records per request. Use date filters to reduce the data size if needed.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
