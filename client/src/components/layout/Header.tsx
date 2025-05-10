import { useState, useEffect } from "react";
import { Link } from "wouter";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { APP_NAME } from "@/lib/constants";
import { Menu, X } from "lucide-react";

export function Header() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    // Update path when it changes
    const updatePath = () => setCurrentPath(window.location.pathname);
    window.addEventListener('popstate', updatePath);
    
    // Handle scroll for style changes
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('popstate', updatePath);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  // Hide header on dashboard pages
  if (currentPath.includes('/dashboard')) {
    return null;
  }

  const links = [
    { href: "/", label: "Home" },
    { href: "/#how-it-works", label: "How It Works" },
    { href: "/#benefits", label: "Benefits" },
    { href: "/#fraud-detection", label: "Fraud Detection" },
    { href: "/#partner", label: "Partner With Us" },
  ];

  return (
    <header 
      className={`sticky top-0 z-40 w-full ${
        isScrolled ? "bg-white/90 dark:bg-gray-800/90 backdrop-blur shadow-sm" : "bg-white dark:bg-gray-800"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <span className="text-primary dark:text-white font-bold text-xl">{APP_NAME}</span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {links.map(link => (
              <a
                key={link.href}
                href={link.href}
                className={`${
                  currentPath === link.href 
                    ? "border-primary text-gray-900 dark:text-white"
                    : "border-transparent text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white"
                } border-b-2 py-5 text-sm font-medium transition-colors`}
              >
                {link.label}
              </a>
            ))}
          </nav>
          
          {/* Auth Buttons & Theme */}
          <div className="hidden md:flex items-center space-x-4">
            <ThemeToggle />
            
            {isAuthenticated ? (
              <>
                <Button asChild variant="ghost">
                  <Link href={`/dashboard/${user?.role}`}>Dashboard</Link>
                </Button>
                <Button onClick={logout}>Logout</Button>
              </>
            ) : (
              <>
                <Button asChild variant="ghost">
                  <Link href="/register">Register</Link>
                </Button>
                <Button asChild>
                  <Link href="/login">Login</Link>
                </Button>
              </>
            )}
          </div>
          
          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <ThemeToggle />
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="ml-2"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-700">
          <div className="pt-2 pb-3 space-y-1">
            {links.map(link => (
              <a
                key={link.href}
                href={link.href}
                className={`${
                  currentPath === link.href
                    ? "bg-primary border-primary text-white"
                    : "border-transparent text-gray-500 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
                } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
          </div>
          
          <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-center space-x-4 px-4">
              {isAuthenticated ? (
                <>
                  <Button asChild className="w-full">
                    <Link href={`/dashboard/${user?.role}`} onClick={() => setIsMenuOpen(false)}>
                      Dashboard
                    </Link>
                  </Button>
                  <Button onClick={() => { logout(); setIsMenuOpen(false); }} variant="outline" className="w-full">
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/register" onClick={() => setIsMenuOpen(false)}>
                      Register
                    </Link>
                  </Button>
                  <Button asChild className="w-full">
                    <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                      Login
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
