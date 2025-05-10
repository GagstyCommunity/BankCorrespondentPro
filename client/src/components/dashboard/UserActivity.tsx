import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTime, getInitials, getStatusColor } from "@/lib/utils";

interface UserActivityProps {
  limit?: number;
}

interface ActivityLog {
  id: number;
  userId: number | null;
  action: string;
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
  user?: {
    fullName: string;
    role: string;
  };
}

export function UserActivity({ limit = 5 }: UserActivityProps) {
  // Fetch activity logs
  const { data: logs, isLoading } = useQuery({
    queryKey: ['/api/activity-logs'],
    staleTime: 30000, // 30 seconds
  });

  // Format activity message
  const formatActivityMessage = (log: ActivityLog) => {
    const userName = log.user?.fullName || "System";
    
    switch (log.action) {
      case "login":
        return `${userName} logged in`;
      case "logout":
        return `${userName} logged out`;
      case "create_user":
        return `${userName} created a new user (ID: ${log.details?.newUserId})`;
      case "update_user_status":
        return `${userName} updated user #${log.details?.targetUserId} status to ${log.details?.status}`;
      case "create_application":
        return `${userName} submitted a new CSP application`;
      case "approved_application":
        return `${userName} approved application #${log.details?.applicationId}`;
      case "rejected_application":
        return `${userName} rejected application #${log.details?.applicationId}`;
      case "create_transaction":
        return `${userName} created a ${log.details?.type} transaction of ${log.details?.amount}`;
      case "create_audit":
        return `${userName} assigned audit to CSP #${log.details?.cspId}`;
      case "update_audit":
        return `${userName} updated audit #${log.details?.auditId} to ${log.details?.status}`;
      case "create_alert":
        return `${userName} created a ${log.details?.severity} alert`;
      case "update_alert":
        return `${userName} updated alert #${log.details?.alertId} to ${log.details?.status}`;
      case "export_data":
        return `${userName} exported ${log.details?.count} ${log.details?.type} records`;
      default:
        return `${userName} performed ${log.action}`;
    }
  };

  // Get activity icon based on action
  const getActivityIcon = (action: string) => {
    const actionColors: Record<string, string> = {
      login: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      logout: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      create_user: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      update_user_status: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      create_application: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      approved_application: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      rejected_application: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      create_transaction: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      create_audit: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      update_audit: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      create_alert: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      update_alert: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
      export_data: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
    };
    
    return actionColors[action] || "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
  };

  // Get role badge color
  const getRoleBadge = (role: string) => {
    return (
      <Badge variant="outline" className={getStatusColor(role)}>
        {role}
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      {isLoading ? (
        // Loading skeleton
        Array.from({ length: limit }).map((_, i) => (
          <div key={i} className="flex items-start space-x-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-3 w-[200px]" />
            </div>
          </div>
        ))
      ) : logs?.length > 0 ? (
        // Activity list
        logs.slice(0, limit).map((log: ActivityLog) => (
          <div key={log.id} className="flex items-start space-x-4">
            <Avatar>
              <AvatarFallback className={getActivityIcon(log.action)}>
                {log.user ? getInitials(log.user.fullName) : "SYS"}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <p className="text-sm font-medium leading-none">
                {formatActivityMessage(log)}
                {log.user?.role && <span className="ml-2">{getRoleBadge(log.user.role)}</span>}
              </p>
              <p className="text-sm text-muted-foreground">
                {formatDateTime(log.createdAt)}
                {log.ipAddress && <span className="ml-2 text-xs">from {log.ipAddress}</span>}
              </p>
            </div>
          </div>
        ))
      ) : (
        <p className="text-sm text-muted-foreground py-2">No activity logs found</p>
      )}
    </div>
  );
}
