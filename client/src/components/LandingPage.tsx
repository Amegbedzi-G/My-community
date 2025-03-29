import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { AuthModal } from "@/components/modals/AuthModal";

export default function LandingPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  
  // Redirect to home if already logged in
  useEffect(() => {
    if (user) {
      navigate("/home");
    }
  }, [user, navigate]);

  const handleShowLogin = () => {
    setShowLoginModal(true);
    setShowSignupModal(false);
  };

  const handleShowSignup = () => {
    setShowSignupModal(true);
    setShowLoginModal(false);
  };

  const handleCloseModals = () => {
    setShowLoginModal(false);
    setShowSignupModal(false);
  };

  const switchToSignup = () => {
    setShowLoginModal(false);
    setShowSignupModal(true);
  };

  const switchToLogin = () => {
    setShowSignupModal(false);
    setShowLoginModal(true);
  };

  return (
    <div id="landing-page" className="min-h-screen flex flex-col">
      <ThemeToggle />
      
      {/* Desktop Navigation */}
      <nav className="bg-white dark:bg-gray-800 shadow-md py-4 px-6 hidden md:block">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-primary-dark"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M16.5 7.5v.001"></path>
            </svg>
            <span className="font-bold text-xl">CreatorConnect</span>
          </div>
          <div className="flex items-center space-x-6">
            <a href="#features" className="hover:text-primary-dark transition-colors">Features</a>
            <a href="#pricing" className="hover:text-primary-dark transition-colors">Pricing</a>
            <a href="#about" className="hover:text-primary-dark transition-colors">About</a>
            <Button 
              variant="default" 
              className="bg-primary hover:bg-primary-dark text-white" 
              onClick={handleShowLogin}
            >
              Login
            </Button>
            <Button 
              variant="default" 
              className="bg-secondary hover:bg-secondary-dark text-white"
              onClick={handleShowSignup}
            >
              Sign Up
            </Button>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="bg-white dark:bg-gray-800 shadow-md py-4 px-4 md:hidden">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-primary-dark"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M16.5 7.5v.001"></path>
            </svg>
            <span className="font-bold text-lg">CreatorConnect</span>
          </div>
          <div className="flex items-center space-x-3">
            <Button 
              variant="default" 
              className="bg-primary hover:bg-primary-dark text-white px-3 py-1 h-8 text-sm"
              onClick={handleShowLogin}
            >
              Login
            </Button>
            <Button 
              variant="default" 
              className="bg-secondary hover:bg-secondary-dark text-white px-3 py-1 h-8 text-sm"
              onClick={handleShowSignup}
            >
              Sign Up
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-purple-400 via-primary to-secondary-dark text-white py-16 md:py-28 px-6">
        <div className="container mx-auto max-w-6xl flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-8 md:mb-0 md:pr-10 animate-fadeIn">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">Connect With Your Favorite Creator</h1>
            <p className="text-lg md:text-xl opacity-90 mb-8">Access exclusive content, engage in conversations, and support directly through tips and subscriptions.</p>
            <Button 
              variant="default" 
              className="bg-white text-primary hover:bg-gray-100 font-semibold px-6 py-6 h-auto rounded-full shadow-lg"
              onClick={handleShowSignup}
            >
              Get Started
            </Button>
          </div>
          <div className="md:w-1/2 animate-slideUp">
            <img 
              src="https://images.unsplash.com/photo-1611162616475-46b635cb6868?ixlib=rb-1.2.1&auto=format&fit=crop&w=700&q=80" 
              alt="Creator content preview" 
              className="rounded-lg shadow-2xl" 
              width="600" 
              height="400"
            />
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-16 px-6 bg-white dark:bg-gray-800">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">Platform Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl shadow-md animate-scaleIn">
              <div className="text-primary dark:text-primary-light text-3xl mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="2" ry="2"></rect>
                  <path d="M8 2v20"></path>
                  <path d="M16 2v20"></path>
                  <path d="M2 8h20"></path>
                  <path d="M2 16h20"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Exclusive Content</h3>
              <p className="text-gray-600 dark:text-gray-300">Access premium photos and videos that are only available to subscribers.</p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl shadow-md animate-scaleIn">
              <div className="text-primary dark:text-primary-light text-3xl mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Direct Messaging</h3>
              <p className="text-gray-600 dark:text-gray-300">Chat directly with creator through our easy-to-use messaging system.</p>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl shadow-md animate-scaleIn">
              <div className="text-primary dark:text-primary-light text-3xl mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                  <path d="M12 8v8"></path>
                  <path d="M16 8v8"></path>
                  <path d="M8 8v8"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Wallet System</h3>
              <p className="text-gray-600 dark:text-gray-300">Easily fund your account to tip, unlock content, and manage subscriptions.</p>
            </div>
            
            {/* Feature 4 */}
            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl shadow-md animate-scaleIn">
              <div className="text-primary dark:text-primary-light text-3xl mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Tipping</h3>
              <p className="text-gray-600 dark:text-gray-300">Show your appreciation by tipping on posts and in chat conversations.</p>
            </div>
            
            {/* Feature 5 */}
            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl shadow-md animate-scaleIn">
              <div className="text-primary dark:text-primary-light text-3xl mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                  <path d="M8 14h.01"></path>
                  <path d="M12 14h.01"></path>
                  <path d="M16 14h.01"></path>
                  <path d="M8 18h.01"></path>
                  <path d="M12 18h.01"></path>
                  <path d="M16 18h.01"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Flexible Subscriptions</h3>
              <p className="text-gray-600 dark:text-gray-300">Choose from weekly, monthly, or yearly subscription plans that fit your budget.</p>
            </div>
            
            {/* Feature 6 */}
            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl shadow-md animate-scaleIn">
              <div className="text-primary dark:text-primary-light text-3xl mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Dark Mode</h3>
              <p className="text-gray-600 dark:text-gray-300">Enjoy a comfortable viewing experience day or night with our dark mode toggle.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div id="pricing" className="py-16 px-6 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">Subscription Plans</h2>
          <p className="text-center text-gray-600 dark:text-gray-300 mb-12 max-w-2xl mx-auto">Choose the plan that fits your needs and get access to exclusive content and features.</p>
          
          <div className="flex flex-col md:flex-row gap-8 justify-center">
            {/* Weekly Plan */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 flex-1 max-w-md mx-auto md:mx-0 transition-transform hover:scale-105 duration-300">
              <h3 className="text-xl font-bold mb-2 text-primary">Weekly Plan</h3>
              <div className="text-3xl font-bold mb-4">$7.99 <span className="text-gray-500 text-base font-normal">/week</span></div>
              <ul className="mb-8 space-y-3">
                <li className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Access to all premium content
                </li>
                <li className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Direct messaging
                </li>
                <li className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Weekly exclusive updates
                </li>
                <li className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Cancel anytime
                </li>
              </ul>
              <Button 
                variant="default"
                className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 h-auto"
                onClick={handleShowSignup}
              >
                Get Started
              </Button>
            </div>

            {/* Monthly Plan */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 flex-1 max-w-md mx-auto md:mx-0 border-2 border-primary transition-transform hover:scale-105 duration-300">
              <div className="inline-block bg-primary text-white px-3 py-1 rounded-full text-sm font-semibold mb-4">Popular</div>
              <h3 className="text-xl font-bold mb-2 text-primary">Monthly Plan</h3>
              <div className="text-3xl font-bold mb-4">$24.99 <span className="text-gray-500 text-base font-normal">/month</span></div>
              <ul className="mb-8 space-y-3">
                <li className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Access to all premium content
                </li>
                <li className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Direct messaging
                </li>
                <li className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Monthly exclusive updates
                </li>
                <li className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <span className="font-semibold">22% savings</span> compared to weekly
                </li>
                <li className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Cancel anytime
                </li>
              </ul>
              <Button 
                variant="default"
                className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 h-auto"
                onClick={handleShowSignup}
              >
                Get Started
              </Button>
            </div>

            {/* Yearly Plan */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 flex-1 max-w-md mx-auto md:mx-0 transition-transform hover:scale-105 duration-300">
              <h3 className="text-xl font-bold mb-2 text-primary">Yearly Plan</h3>
              <div className="text-3xl font-bold mb-4">$199.99 <span className="text-gray-500 text-base font-normal">/year</span></div>
              <ul className="mb-8 space-y-3">
                <li className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Access to all premium content
                </li>
                <li className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Direct messaging
                </li>
                <li className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Yearly exclusive updates
                </li>
                <li className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <span className="font-semibold">33% savings</span> compared to monthly
                </li>
                <li className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Cancel anytime
                </li>
              </ul>
              <Button 
                variant="default"
                className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 h-auto"
                onClick={handleShowSignup}
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div id="about" className="py-16 px-6 bg-white dark:bg-gray-800">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2">
              <img 
                src="https://images.unsplash.com/photo-1517486808906-6ca8b3f8e1c1?ixlib=rb-1.2.1&auto=format&fit=crop&w=700&q=80" 
                alt="Creator profile" 
                className="rounded-xl shadow-lg" 
                width="600" 
                height="400"
              />
            </div>
            <div className="md:w-1/2">
              <h2 className="text-2xl md:text-3xl font-bold mb-6">About the Creator</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                I'm a digital creator passionate about sharing my work with an engaged audience. Through this platform, I offer exclusive content, behind-the-scenes footage, and direct interaction with my subscribers.
              </p>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                By subscribing to my content, you're not only getting access to premium material but also supporting my creative journey and enabling me to produce higher quality work.
              </p>
              <Button 
                variant="default"
                className="bg-primary hover:bg-primary-dark text-white font-semibold px-6 py-3 h-auto"
                onClick={handleShowSignup}
              >
                Join My Community
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 dark:bg-gray-900 text-white py-12 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-8 md:mb-0">
              <div className="flex items-center space-x-2 mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-primary-light"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <circle cx="12" cy="12" r="3"></circle>
                  <path d="M16.5 7.5v.001"></path>
                </svg>
                <span className="font-bold text-xl">CreatorConnect</span>
              </div>
              <p className="text-gray-400 max-w-xs">Connect with your favorite creator through exclusive content and direct interactions.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <h3 className="font-semibold text-lg mb-4">Platform</h3>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                  <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                  <li><a href="#about" className="hover:text-white transition-colors">About</a></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-4">Legal</h3>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Content Guidelines</a></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-4">Social</h3>
                <div className="flex space-x-4">
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </a>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                    </svg>
                  </a>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                    </svg>
                  </a>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-10 pt-6 text-center text-gray-500">
            <p>&copy; {new Date().getFullYear()} CreatorConnect. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Auth Modals */}
      <AuthModal 
        showLogin={showLoginModal}
        showSignup={showSignupModal}
        onClose={handleCloseModals}
        switchToSignup={switchToSignup}
        switchToLogin={switchToLogin}
      />
    </div>
  );
}
