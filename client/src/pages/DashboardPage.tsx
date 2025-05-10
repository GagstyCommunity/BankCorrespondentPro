import { useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";
import { CSPManagement } from "@/components/dashboard/CSPManagement";
import { FraudDetectionMap } from "@/components/dashboard/FraudDetectionMap";
import { AuditAssignment } from "@/components/dashboard/AuditAssignment";
import { NotificationCenter } from "@/components/dashboard/NotificationCenter";
import { DataExport } from "@/components/dashboard/DataExport";
import { useAuth } from "@/hooks/use-auth";
import { USER_ROLES } from "@/lib/constants";

export default function DashboardPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();
  const [dashboardRoute] = useRoute("/dashboard/:role");
  const [sectionRoute] = useRoute("/dashboard/:role/:section");

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/login");
      return;
    }

    // If user is trying to access another role's dashboard
    if (user && dashboardRoute && dashboardRoute.params.role !== user.role) {
      navigate(`/dashboard/${user.role}`);
    }
  }, [user, isAuthenticated, loading, dashboardRoute, navigate]);

  // If still loading or not authenticated, return null
  if (loading || !isAuthenticated || !user) {
    return null;
  }

  // Get current section from route or default to overview
  const role = sectionRoute?.params.role || dashboardRoute?.params.role || user.role;
  const section = sectionRoute?.params.section || "overview";

  // Render different dashboard based on role and section
  const renderDashboardContent = () => {
    if (role === USER_ROLES.ADMIN) {
      switch (section) {
        case "overview":
          return <AdminDashboard />;
        case "csps":
          return <CSPManagement />;
        case "fraud-detection":
          return <FraudDetectionMap />;
        case "audits":
          return <AuditAssignment />;
        case "notifications":
          return <NotificationCenter />;
        case "export":
          return <DataExport />;
        default:
          return <AdminDashboard />;
      }
    } else if (role === USER_ROLES.CSP) {
      // Implement CSP dashboard sections
      return (
        <div className="space-y-6">
          <h1 className="text-3xl font-bold tracking-tight">CSP Dashboard</h1>
          <p>Welcome to your CSP Dashboard, {user.fullName}!</p>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="stat-card">
              <p className="stat-value">₹42,500</p>
              <p className="stat-label">Monthly Earnings</p>
            </div>
            <div className="stat-card">
              <p className="stat-value">124</p>
              <p className="stat-label">Transactions Today</p>
            </div>
            <div className="stat-card">
              <p className="stat-value">85%</p>
              <p className="stat-label">Performance Score</p>
            </div>
            <div className="stat-card">
              <p className="stat-value">2</p>
              <p className="stat-label">Active Alerts</p>
            </div>
          </div>
        </div>
      );
    } else if (role === USER_ROLES.FI) {
      // Implement FI Agent dashboard sections
      return (
        <div className="space-y-6">
          <h1 className="text-3xl font-bold tracking-tight">FI Agent Dashboard</h1>
          <p>Welcome to your FI Agent Dashboard, {user.fullName}!</p>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="stat-card">
              <p className="stat-value">₹1.2M</p>
              <p className="stat-label">Cash Disbursed Today</p>
            </div>
            <div className="stat-card">
              <p className="stat-value">42</p>
              <p className="stat-label">CSPs Managed</p>
            </div>
            <div className="stat-card">
              <p className="stat-value">18</p>
              <p className="stat-label">Pending KYC Verifications</p>
            </div>
            <div className="stat-card">
              <p className="stat-value">4</p>
              <p className="stat-label">Support Requests</p>
            </div>
          </div>
        </div>
      );
    } else if (role === USER_ROLES.AUDITOR) {
      // Implement Auditor dashboard sections
      return (
        <div className="space-y-6">
          <h1 className="text-3xl font-bold tracking-tight">Auditor Dashboard</h1>
          <p>Welcome to your Auditor Dashboard, {user.fullName}!</p>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="stat-card">
              <p className="stat-value">8</p>
              <p className="stat-label">Pending Audits</p>
            </div>
            <div className="stat-card">
              <p className="stat-value">3</p>
              <p className="stat-label">Scheduled Today</p>
            </div>
            <div className="stat-card">
              <p className="stat-value">12</p>
              <p className="stat-label">Completed This Week</p>
            </div>
            <div className="stat-card">
              <p className="stat-value">96%</p>
              <p className="stat-label">On-time Completion</p>
            </div>
          </div>
        </div>
      );
    } else if (role === USER_ROLES.BANK) {
      // Implement Bank Officer dashboard sections
      return (
        <div className="space-y-6">
          <h1 className="text-3xl font-bold tracking-tight">Bank Officer Dashboard</h1>
          <p>Welcome to your Bank Officer Dashboard, {user.fullName}!</p>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="stat-card">
              <p className="stat-value">24</p>
              <p className="stat-label">Pending Reviews</p>
            </div>
            <div className="stat-card">
              <p className="stat-value">7</p>
              <p className="stat-label">Flagged CSPs</p>
            </div>
            <div className="stat-card">
              <p className="stat-value">3</p>
              <p className="stat-label">Critical Escalations</p>
            </div>
            <div className="stat-card">
              <p className="stat-value">18</p>
              <p className="stat-label">Approved Today</p>
            </div>
          </div>
        </div>
      );
    }

    // Default fallback
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p>Welcome to your dashboard, {user.fullName}!</p>
      </div>
    );
  };

  return <DashboardLayout>{renderDashboardContent()}</DashboardLayout>;
}
