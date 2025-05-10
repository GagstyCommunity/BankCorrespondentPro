import {
  Users,
  Building,
  ClipboardCheck,
  Settings,
  Banknote,
  CheckCircle,
  FileText,
  MapPin,
  Shield,
  RefreshCw,
  Eye,
  ShieldAlert,
  ArrowUpDown,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function HowItWorks() {
  const roles = [
    {
      title: "CSP Agent",
      icon: <Users className="h-6 w-6 text-white" />,
      description:
        "The frontline representatives who operate in local communities, providing essential banking services to customers.",
      features: [
        "Process cash deposits & withdrawals",
        "Assist with account opening",
        "Facilitate money transfers",
      ],
    },
    {
      title: "FI Agent",
      icon: <Building className="h-6 w-6 text-white" />,
      description:
        "Financial Institution representatives who manage cash flow and ensure CSPs have the resources they need.",
      features: [
        "Manage cash disbursement",
        "Monitor KYC compliance",
        "Support CSP network",
      ],
    },
    {
      title: "Auditor",
      icon: <ClipboardCheck className="h-6 w-6 text-white" />,
      description:
        "Field auditors who verify CSP operations, ensure compliance, and maintain quality standards.",
      features: [
        "Conduct on-site inspections",
        "Document with photos & video",
        "Report compliance issues",
      ],
    },
    {
      title: "Administrator",
      icon: <Settings className="h-6 w-6 text-white" />,
      description:
        "System administrators who manage the platform, monitor for fraud, and oversee the entire network.",
      features: [
        "Manage entire CSP network",
        "Monitor fraud alerts",
        "Assign audits & review reports",
      ],
    },
    {
      title: "Banknote Officer",
      icon: <Banknote className="h-6 w-6 text-white" />,
      description:
        "Senior banking officials who review critical issues, handle escalations, and make final decisions.",
      features: [
        "Review flagged CSPs",
        "Handle escalated issues",
        "Make final approval decisions",
      ],
    },
  ];

  return (
    <section id="how-it-works" className="py-16 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-primary dark:text-white">
            How Our Banking Network Works
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Our integrated platform connects five key roles to ensure secure, efficient, and accessible banking services.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {roles.map((role, index) => (
            <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-primary dark:bg-primary-light rounded-full flex items-center justify-center mb-4">
                  {role.icon}
                </div>
                <h3 className="text-xl font-semibold text-primary dark:text-white mb-2">{role.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">{role.description}</p>
                <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                  {role.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-accent mr-2 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
