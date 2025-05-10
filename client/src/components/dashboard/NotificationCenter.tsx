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
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  BellRing, 
  Mail, 
  MessageSquare, 
  InfoIcon, 
  AlertCircle, 
  CheckCircle, 
  MoreVertical, 
  Loader2,
  Clock
} from "lucide-react";
import { formatDateTime, getStatusColor } from "@/lib/utils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: string;
  status: string;
  createdAt: string;
  readAt: string | null;
}

export function NotificationCenter() {
  const [activeTab, setActiveTab] = useState<string>("all");
  const { toast } = useToast();

  // Fetch notifications
  const { data: notifications, isLoading } = useQuery({
    queryKey: ['/api/notifications'],
    staleTime: 30000, // 30 seconds
  });

  // Mark notification as read
  const markAsRead = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('PATCH', `/api/notifications/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive",
      });
    },
  });

  // Filter notifications based on the active tab
  const filteredNotifications = notifications?.filter((notification: Notification) => {
    if (activeTab === "all") return true;
    if (activeTab === "unread") return notification.status === "unread";
    return notification.type === activeTab;
  });

  // Get notification icon based on type
  const getNotificationIcon = (type: string, status: string) => {
    if (status === "read") {
      return <CheckCircle className="h-4 w-4 text-muted-foreground" />;
    }
    
    switch (type) {
      case "system":
        return <InfoIcon className="h-4 w-4 text-primary" />;
      case "alert":
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      case "email":
        return <Mail className="h-4 w-4 text-blue-500" />;
      case "sms":
        return <MessageSquare className="h-4 w-4 text-green-500" />;
      case "whatsapp":
        return <MessageSquare className="h-4 w-4 text-green-600" />;
      default:
        return <BellRing className="h-4 w-4 text-amber-500" />;
    }
  };

  // Get badge color based on type
  const getNotificationBadge = (type: string) => {
    let badgeClass = "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    
    switch (type) {
      case "system":
        badgeClass = "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
        break;
      case "alert":
        badgeClass = "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
        break;
      case "email":
        badgeClass = "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300";
        break;
      case "sms":
        badgeClass = "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
        break;
      case "whatsapp":
        badgeClass = "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300";
        break;
    }
    
    return <Badge className={badgeClass}>{type}</Badge>;
  };

  // Handle marking a notification as read
  const handleMarkAsRead = (id: number) => {
    markAsRead.mutate(id);
  };

  // Count unread notifications
  const unreadCount = notifications?.filter((n: Notification) => n.status === "unread").length || 0;

  // Count notifications by type
  const countByType = (type: string) => {
    return notifications?.filter((n: Notification) => n.type === type).length || 0;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Notification Center</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
              <CardDescription>Filter notifications by status or type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button 
                  variant={activeTab === "all" ? "default" : "outline"} 
                  className="w-full justify-start" 
                  onClick={() => setActiveTab("all")}
                >
                  <BellRing className="mr-2 h-4 w-4" />
                  All Notifications
                  <Badge className="ml-auto">{notifications?.length || 0}</Badge>
                </Button>
                <Button 
                  variant={activeTab === "unread" ? "default" : "outline"} 
                  className="w-full justify-start" 
                  onClick={() => setActiveTab("unread")}
                >
                  <AlertCircle className="mr-2 h-4 w-4" />
                  Unread
                  <Badge className="ml-auto">{unreadCount}</Badge>
                </Button>
                
                <Separator className="my-2" />
                
                <h3 className="text-sm font-medium mb-2">By Type</h3>
                <Button 
                  variant={activeTab === "system" ? "default" : "outline"} 
                  className="w-full justify-start" 
                  onClick={() => setActiveTab("system")}
                >
                  <InfoIcon className="mr-2 h-4 w-4" />
                  System
                  <Badge className="ml-auto">{countByType("system")}</Badge>
                </Button>
                <Button 
                  variant={activeTab === "alert" ? "default" : "outline"} 
                  className="w-full justify-start" 
                  onClick={() => setActiveTab("alert")}
                >
                  <AlertCircle className="mr-2 h-4 w-4" />
                  Alerts
                  <Badge className="ml-auto">{countByType("alert")}</Badge>
                </Button>
                <Button 
                  variant={activeTab === "email" ? "default" : "outline"} 
                  className="w-full justify-start" 
                  onClick={() => setActiveTab("email")}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Email
                  <Badge className="ml-auto">{countByType("email")}</Badge>
                </Button>
                <Button 
                  variant={activeTab === "sms" ? "default" : "outline"} 
                  className="w-full justify-start" 
                  onClick={() => setActiveTab("sms")}
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  SMS
                  <Badge className="ml-auto">{countByType("sms")}</Badge>
                </Button>
                <Button 
                  variant={activeTab === "whatsapp" ? "default" : "outline"} 
                  className="w-full justify-start" 
                  onClick={() => setActiveTab("whatsapp")}
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  WhatsApp
                  <Badge className="ml-auto">{countByType("whatsapp")}</Badge>
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Notification Simulator</CardTitle>
              <CardDescription>Test notification delivery</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm">
                    <Mail className="mr-2 h-4 w-4" />
                    Send Email
                  </Button>
                  <Button variant="outline" size="sm">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Send SMS
                  </Button>
                </div>
                <Button className="w-full">
                  <InfoIcon className="mr-2 h-4 w-4" />
                  Trigger System Alert
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>
                {activeTab === "all" ? "All Notifications" : 
                 activeTab === "unread" ? "Unread Notifications" : 
                 `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Notifications`}
              </CardTitle>
              <CardDescription>
                {activeTab === "unread" ? 
                  `You have ${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 
                  `Showing all ${filteredNotifications?.length || 0} notification${filteredNotifications?.length !== 1 ? 's' : ''}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredNotifications?.length > 0 ? (
                <ScrollArea className="h-[500px] pr-4">
                  <div className="space-y-4">
                    {filteredNotifications.map((notification: Notification) => (
                      <div 
                        key={notification.id} 
                        className={`p-4 rounded-lg border ${
                          notification.status === "unread" ? 
                            "bg-muted/50 border-primary/20" : 
                            "bg-background border-border"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="mt-1">
                              {getNotificationIcon(notification.type, notification.status)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-medium">{notification.title}</h3>
                                {getNotificationBadge(notification.type)}
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                              <div className="flex items-center text-xs text-muted-foreground mt-2">
                                <Clock className="mr-1 h-3 w-3" />
                                {formatDateTime(notification.createdAt)}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {notification.status === "unread" && (
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                onClick={() => handleMarkAsRead(notification.id)}
                                disabled={markAsRead.isPending}
                              >
                                Mark as read
                              </Button>
                            )}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                {notification.status === "unread" ? (
                                  <DropdownMenuItem onClick={() => handleMarkAsRead(notification.id)}>
                                    Mark as read
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem>Mark as unread</DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>Delete</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <BellRing className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="font-medium text-lg mb-2">No notifications</h3>
                  <p className="text-muted-foreground">
                    {activeTab === "all" ? 
                      "You don't have any notifications yet" : 
                      `You don't have any ${activeTab} notifications`}
                  </p>
                </div>
              )}
            </CardContent>
            {filteredNotifications?.length > 0 && (
              <CardFooter className="flex justify-between border-t px-6 py-4">
                <p className="text-xs text-muted-foreground">
                  Showing {filteredNotifications.length} of {notifications?.length} notifications
                </p>
                <Button variant="outline" size="sm">
                  Mark all as read
                </Button>
              </CardFooter>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
