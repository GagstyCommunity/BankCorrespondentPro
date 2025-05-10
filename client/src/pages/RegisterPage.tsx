import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { APP_NAME } from "@/lib/constants";

export default function RegisterPage() {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="w-full max-w-4xl mx-auto">
        <div className="flex flex-col items-center mb-8">
          <h1 className="text-3xl font-bold text-primary">{APP_NAME}</h1>
          <p className="mt-2 text-center text-sm text-muted-foreground max-w-sm">
            Register as a Customer Service Point and join our network
          </p>
        </div>
        
        <Card className="w-full mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Register as a CSP</CardTitle>
            <CardDescription className="text-center">
              Fill in the following details to apply for a CSP position
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RegisterForm />
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 border-t pt-6">
            <div className="text-sm text-center text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Login here
              </Link>
            </div>
            
            <div className="text-xs text-center text-muted-foreground max-w-lg mx-auto">
              By registering, you confirm that all information provided is accurate and you agree to our{" "}
              <a href="#" className="underline underline-offset-4 hover:text-primary">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="underline underline-offset-4 hover:text-primary">
                Privacy Policy
              </a>
              . Your personal information will be processed in accordance with our privacy practices.
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
