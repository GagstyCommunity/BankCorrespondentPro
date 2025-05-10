import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import {
  Users,
  BarChart4,
  Map,
  ClipboardCheck,
  Download,
  UserCog,
  BellRing,
  LogOut,
  Home,
  CreditCard,
  CheckCircle,
  BadgeAlert,
  CircleDollarSign,
  FileText,
  Map as MapIcon,
  Route,
  Upload,
  LineChart,
  Flag,
  AlertTriangle,
} from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import { USER_ROLES, ROLE_LABELS, APP_NAME } from "@/lib/constants";

interface SidebarLinkProps {
  href: string;
  icon: ReactNode;
  children: ReactNode;
  active?: boolean;
}

function SidebarLink({ href, icon, children, active }: SidebarLinkProps) {
  return (
    <Link href={href}>
      <a className={`nav-link ${active ? "active" : ""}`}>
        {icon}
        <span>{children}</span>
      </a>
    </Link>
  );
}

export function Sidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  if (!user) return null;

  const role = user.role;
  const roleLabel = ROLE_LABELS[role] || "User";

  // Navigation links by role
  const adminLinks = [
    { href: "/dashboard/admin", icon: <BarChart4 size={20} />, label: "Overview" },
    { href: "/dashboard/admin/csps", icon: <Users size={20} />, label: "CSP Management" },
    { href: "/dashboard/admin/fraud-detection", icon: <Map size={20} />, label: "Fraud Detection" },
    { href: "/dashboard/admin/audits", icon: <ClipboardCheck size={20} />, label: "Audit Assignment" },
    { href: "/dashboard/admin/users", icon: <UserCog size={20} />, label: "User Management" },
    { href: "/dashboard/admin/notifications", icon: <BellRing size={20} />, label: "Notifications" },
    { href: "/dashboard/admin/export", icon: <Download size={20} />, label: "Data Export" },
  ];

  const cspLinks = [
    { href: "/dashboard/csp", icon: <BarChart4 size={20} />, label: "Overview" },
    { href: "/dashboard/csp/transactions", icon: <CircleDollarSign size={20} />, label: "Transactions" },
    { href: "/dashboard/csp/checkin", icon: <CheckCircle size={20} />, label: "Self Check-in" },
    { href: "/dashboard/csp/score", icon: <LineChart size={20} />, label: "Score" },
    { href: "/dashboard/csp/alerts", icon: <AlertTriangle size={20} />, label: "Alerts" },
  ];

  const fiLinks = [
    { href: "/dashboard/fi", icon: <BarChart4 size={20} />, label: "Overview" },
    { href: "/dashboard/fi/disbursement", icon: <CreditCard size={20} />, label: "Cash Disbursement" },
    { href: "/dashboard/fi/kyc", icon: <FileText size={20} />, label: "KYC Tracker" },
  ];

  const auditorLinks = [
    { href: "/dashboard/auditor", icon: <BarChart4 size={20} />, label: "Overview" },
    { href: "/dashboard/auditor/audits", icon: <ClipboardCheck size={20} />, label: "Assigned Audits" },
    { href: "/dashboard/auditor/route", icon: <Route size={20} />, label: "Map Route" },
    { href: "/dashboard/auditor/upload", icon: <Upload size={20} />, label: "Audit Upload" },
  ];

  const bankLinks = [
    { href: "/dashboard/bank", icon: <BarChart4 size={20} />, label: "Overview" },
    { href: "/dashboard/bank/review", icon: <FileText size={20} />, label: "Review Panel" },
    { href: "/dashboard/bank/flagged", icon: <Flag size={20} />, label: "Flagged CSPs" },
    { href: "/dashboard/bank/escalations", icon: <AlertTriangle size={20} />, label: "Escalation Tracker" },
  ];

  let links;
  switch (role) {
    case USER_ROLES.ADMIN:
      links = adminLinks;
      break;
    case USER_ROLES.CSP:
      links = cspLinks;
      break;
    case USER_ROLES.FI:
      links = fiLinks;
      break;
    case USER_ROLES.AUDITOR:
      links = auditorLinks;
      break;
    case USER_ROLES.BANK:
      links = bankLinks;
      break;
    default:
      links = [];
  }

  return (
    <div className="flex flex-col w-64 bg-sidebar dark:bg-sidebar-background border-r border-sidebar-border h-screen">
      <div className="p-4 flex flex-col h-full">
        <div className="flex items-center justify-between">
          <Link href="/">
            <a className="text-sidebar-foreground font-bold text-xl">{APP_NAME}</a>
          </Link>
          <ThemeToggle />
        </div>

        <div className="mt-4 py-2 px-3 bg-sidebar-accent/10 rounded-md">
          <p className="text-sm text-sidebar-foreground/70">Logged in as</p>
          <p className="font-medium text-sidebar-foreground">{user.fullName}</p>
          <p className="text-xs text-sidebar-foreground/70">{roleLabel}</p>
        </div>

        <ScrollArea className="flex-1 py-4">
          <div className="space-y-1">
            {links.map((link) => (
              <SidebarLink
                key={link.href}
                href={link.href}
                icon={link.icon}
                active={location === link.href}
              >
                {link.label}
              </SidebarLink>
            ))}
          </div>

          <Separator className="my-4 bg-sidebar-border" />

          <div className="space-y-1">
            <SidebarLink href="/" icon={<Home size={20} />}>
              Public Site
            </SidebarLink>
          </div>
        </ScrollArea>

        <div className="mt-auto pt-4">
          <Button
            variant="outline"
            className="w-full bg-sidebar-accent/10 text-sidebar-foreground border-sidebar-border hover:bg-sidebar-accent/20 hover:text-sidebar-foreground"
            onClick={logout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}
