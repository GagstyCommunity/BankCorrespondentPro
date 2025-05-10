import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section id="home" className="relative bg-white dark:bg-gray-800">
      {/* Hero background with overlay */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="w-full h-full hero-gradient opacity-60" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
        <h1 className="text-4xl md:text-5xl font-bold text-center text-primary dark:text-white mb-6">
          Empowering Banking <span className="text-accent">Everywhere</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 text-center max-w-3xl mb-10">
          Join our network of Customer Service Points and bring essential banking services to underserved communities.
          Secure, efficient, and powered by cutting-edge technology.
        </p>
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-white">
            <Link href="/#partner">Become a CSP</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/login">Agent Login</Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 w-full max-w-4xl text-center">
          <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-lg">
            <p className="text-4xl font-bold text-primary dark:text-accent mb-2">12,000+</p>
            <p className="text-gray-600 dark:text-gray-300">Active CSPs Nationwide</p>
          </div>
          <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-lg">
            <p className="text-4xl font-bold text-primary dark:text-accent mb-2">₹4.2B+</p>
            <p className="text-gray-600 dark:text-gray-300">Monthly Transaction Volume</p>
          </div>
          <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-lg">
            <p className="text-4xl font-bold text-primary dark:text-accent mb-2">99.9%</p>
            <p className="text-gray-600 dark:text-gray-300">Fraud Prevention Rate</p>
          </div>
        </div>
      </div>
    </section>
  );
}
