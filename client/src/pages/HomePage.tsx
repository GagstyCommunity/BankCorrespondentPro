import { Hero } from "@/components/home/Hero";
import { HowItWorks } from "@/components/home/HowItWorks";
import { Benefits } from "@/components/home/Benefits";
import { FraudDetection } from "@/components/home/FraudDetection";
import { PartnerForm } from "@/components/home/PartnerForm";

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <Hero />
      
      {/* How It Works */}
      <HowItWorks />
      
      {/* CSP Benefits */}
      <Benefits />
      
      {/* Fraud Detection */}
      <FraudDetection />
      
      {/* Partner With Us / Application Form */}
      <section id="partner" className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-primary dark:text-white mb-6">Become a CSP Partner</h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                Join our network of trusted banking correspondents and start providing essential financial services to your community. Complete the form to begin your application.
              </p>
              
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 mb-8">
                <h3 className="text-xl font-semibold text-primary dark:text-white mb-4">Requirements</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent mr-3 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-600 dark:text-gray-200">Valid Aadhaar card and PAN card</span>
                  </li>
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent mr-3 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-600 dark:text-gray-200">Minimum 10th standard education</span>
                  </li>
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent mr-3 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-600 dark:text-gray-200">Basic computer literacy</span>
                  </li>
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent mr-3 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-600 dark:text-gray-200">A dedicated space for the CSP outlet</span>
                  </li>
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent mr-3 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-600 dark:text-gray-200">Ability to invest ₹15,000-25,000 as working capital</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-primary bg-opacity-10 dark:bg-gray-700 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-primary dark:text-white mb-4">Application Process</h3>
                <ol className="relative border-l border-gray-300 dark:border-gray-600 ml-3 space-y-6">
                  <li className="ml-6">
                    <span className="absolute flex items-center justify-center w-8 h-8 bg-primary text-white rounded-full -left-4">1</span>
                    <h4 className="text-lg font-semibold text-primary dark:text-white">Submit Application</h4>
                    <p className="text-gray-600 dark:text-gray-300">Complete the online form with your details</p>
                  </li>
                  <li className="ml-6">
                    <span className="absolute flex items-center justify-center w-8 h-8 bg-primary text-white rounded-full -left-4">2</span>
                    <h4 className="text-lg font-semibold text-primary dark:text-white">Document Verification</h4>
                    <p className="text-gray-600 dark:text-gray-300">Our team will verify all your documents</p>
                  </li>
                  <li className="ml-6">
                    <span className="absolute flex items-center justify-center w-8 h-8 bg-primary text-white rounded-full -left-4">3</span>
                    <h4 className="text-lg font-semibold text-primary dark:text-white">Training Program</h4>
                    <p className="text-gray-600 dark:text-gray-300">Complete our comprehensive 3-day training</p>
                  </li>
                  <li className="ml-6">
                    <span className="absolute flex items-center justify-center w-8 h-8 bg-primary text-white rounded-full -left-4">4</span>
                    <h4 className="text-lg font-semibold text-primary dark:text-white">Begin Operations</h4>
                    <p className="text-gray-600 dark:text-gray-300">Set up your outlet and start serving customers</p>
                  </li>
                </ol>
              </div>
            </div>
            
            <div>
              <PartnerForm />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
