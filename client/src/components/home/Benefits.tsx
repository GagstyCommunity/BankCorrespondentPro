import { CircleDollarSign, Users, Shield, Building } from "lucide-react";

export function Benefits() {
  const benefits = [
    {
      icon: <CircleDollarSign className="h-6 w-6 text-white" />,
      title: "Earn Substantial Income",
      description:
        "Earn commission on every transaction processed, with top CSPs earning ₹30,000-50,000 monthly. Receive timely payments directly to your account.",
    },
    {
      icon: <Users className="h-6 w-6 text-white" />,
      title: "Community Impact",
      description:
        "Become a respected leader in your community by providing essential banking services to those who need them. Help bridge the financial inclusion gap.",
    },
    {
      icon: <Shield className="h-6 w-6 text-white" />,
      title: "Minimal Risk",
      description:
        "Our advanced security systems and robust training program ensure you can operate with confidence. We provide insurance coverage for legitimate transactions.",
    },
    {
      icon: <Building className="h-6 w-6 text-white" />,
      title: "Growth Opportunities",
      description:
        "Start with basic services and expand to insurance, pension plans, and more. Top performers receive opportunities to become regional managers.",
    },
  ];

  return (
    <section id="benefits" className="py-16 bg-white dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-primary dark:text-white">CSP Benefits</h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Become a Customer Service Point and enjoy financial rewards while making a positive impact in your community.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-10 items-center">
          <div className="lg:w-1/2">
            <img
              src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
              alt="CSP agent helping customers at a kiosk"
              className="rounded-xl shadow-lg w-full h-auto"
            />
          </div>

          <div className="lg:w-1/2 space-y-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl shadow-md">
                <div className="flex items-start mb-4">
                  <div className="flex-shrink-0 bg-accent rounded-full p-2 mr-4">{benefit.icon}</div>
                  <div>
                    <h3 className="text-xl font-semibold text-primary dark:text-white">{benefit.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300 mt-2">{benefit.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
