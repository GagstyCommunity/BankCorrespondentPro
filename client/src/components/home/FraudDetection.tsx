import { Activity, ShieldCheck, MapPin, LockKeyhole } from "lucide-react";

export function FraudDetection() {
  const features = [
    {
      title: "Real-time Transaction Monitoring",
      description:
        "Every transaction is analyzed in real-time using our proprietary AI algorithm that checks for over 200 risk factors. Suspicious activities trigger immediate alerts.",
      icon: <Activity />,
    },
    {
      title: "Behavioral Analysis",
      description:
        "Our system learns normal patterns for each CSP and flags unusual deviations. This behavioral profiling helps identify potential fraud before it occurs.",
      icon: <ShieldCheck />,
    },
    {
      title: "Geo-fencing & Location Verification",
      description:
        "Each CSP operates within a defined geographical area. Our system uses GPS data to verify that transactions are processed from authorized locations only.",
      icon: <MapPin />,
    },
    {
      title: "Multi-layer Authentication",
      description:
        "All users undergo rigorous biometric verification. High-value transactions require additional security steps, ensuring only authorized personnel can access the system.",
      icon: <LockKeyhole />,
    },
  ];

  const stats = [
    {
      value: "₹1.2B+",
      label: "Fraud Prevented Annually",
    },
    {
      value: "1.5M+",
      label: "Alerts Generated Monthly",
    },
    {
      value: "200ms",
      label: "Average Detection Time",
    },
    {
      value: "6,500+",
      label: "Fraud Patterns Identified",
    },
  ];

  return (
    <section id="fraud-detection" className="py-16 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-primary dark:text-white">Advanced Fraud Detection</h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Our platform employs cutting-edge AI and machine learning to detect and prevent fraudulent activities,
            ensuring the security of all transactions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-300"
              >
                <div className="flex items-start">
                  <div className="mr-4 flex-shrink-0 p-2 bg-primary/10 dark:bg-primary/20 rounded-full">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-primary dark:text-white mb-3">{feature.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1563986768609-322da13575f3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=1000"
              alt="Advanced fraud detection system with data visualization"
              className="rounded-xl shadow-lg w-full h-auto"
            />
            <div className="absolute top-4 right-4 bg-accent text-white px-4 py-2 rounded-full shadow-lg font-medium">
              99.9% Accuracy
            </div>
          </div>
        </div>

        {/* Fraud Detection Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md text-center">
              <p className="text-3xl font-bold text-primary dark:text-accent">{stat.value}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
