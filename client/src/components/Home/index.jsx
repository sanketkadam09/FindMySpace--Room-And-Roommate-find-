import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import Footer from "../Footer";

export default function Home() {
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(AuthContext);

  return (
    <div className="flex flex-col min-h-screen font-sans">
      {/* Navigation Bar */}
      <nav className="bg-gray-800 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white font-bold text-xl">FS</span>
                </div>
                <a href="/">
                  {" "}
                  <span className="text-2xl font-bold text-white hidden sm:inline">
                    FindMySpace
                  </span>
                </a>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              {!isAuthenticated ? (
                <>
                  <button
                    onClick={() => navigate("/login")}
                    className="text-gray-700 hover:text-indigo-600 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Log in
                  </button>
                  <button
                    onClick={() => navigate("/signup")}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-2 rounded-md text-sm font-medium hover:opacity-90 transition-opacity shadow-sm"
                  >
                    Sign up
                  </button>
                </>
              ) : (
                <button
                  onClick={() => navigate("/profile")}
                  className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors"
                >
                  <span className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold">
                    {/* {localStorage.getItem('userName')?.charAt(0).toUpperCase() || 'U'} */}
                  </span>
                  <span
                    className="hidden lg:inline"
                    style={{ color: "white", fontWeight: "bold", fontSize: "18px" }}
                  >
                    My Profile
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow">
        {/* Hero Section - Image is now a full-width background */}
        <div
          className="relative bg-cover bg-center bg-no-repeat overflow-hidden"
          style={{ backgroundImage: "url('/image/image4.jpg')" }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
            <div className="relative z-10 max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Find Your Perfect{" "}
                <span className="text-yellow-300">Living Space</span>
              </h1>
              <p className="mt-6 text-xl text-purple-100 max-w-2xl mx-auto">
                Connect with compatible roommates and discover amazing rooms in
                your area. Your ideal living situation is just a click away.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
                <button
                  onClick={() => navigate("/rooms")}
                  className="bg-white text-indigo-700 hover:bg-gray-50 font-semibold py-3 px-8 rounded-lg text-lg transition-transform hover:scale-105 shadow-lg"
                >
                  Browse Available Rooms
                </button>
                <button
                  onClick={() => navigate("/dashboard")}
                  className="bg-transparent hover:bg-white/10 text-white border-2 border-white font-semibold py-3 px-8 rounded-lg text-lg transition-all hover:scale-105 shadow-lg"
                >
                  Find Roommates
                </button>
              </div>
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        </div>

        {/* Features Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-800 mb-4">
                Why Choose FindMySpace?
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                We make finding the perfect living situation simple, safe, and
                stress-free.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-8 rounded-2xl bg-gray-50 transition-transform duration-300 ease-in-out hover:-translate-y-1 hover:shadow-2xl">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-3xl">🏡</span>
                </div>
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                  Verified Listings
                </h3>
                <p className="text-gray-600">
                  All rooms and roommate profiles are verified for authenticity
                  and safety. No fake listings, no surprises.
                </p>
              </div>
              <div className="text-center p-8 rounded-2xl bg-gray-50 transition-transform duration-300 ease-in-out hover:-translate-y-1 hover:shadow-2xl">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-3xl">🤝</span>
                </div>
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                  Smart Matching
                </h3>
                <p className="text-gray-600">
                  Our algorithm matches you with compatible roommates based on
                  lifestyle, preferences, and habits.
                </p>
              </div>
              <div className="text-center p-8 rounded-2xl bg-gray-50 transition-transform duration-300 ease-in-out hover:-translate-y-1 hover:shadow-2xl">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-3xl">🔒</span>
                </div>
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                  Secure & Safe
                </h3>
                <p className="text-gray-600">
                  Background checks, secure messaging, and 24/7 support ensure
                  your safety throughout the process.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-800 mb-4">
                How It Works
              </h2>
              <p className="text-xl text-gray-600">
                Get started in just 3 simple steps
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-20 h-20 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-white text-2xl font-bold">1</span>
                </div>
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                  Create Your Profile
                </h3>
                <p className="text-gray-600">
                  Tell us about yourself, your preferences, and what you're
                  looking for in a living situation.
                </p>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-white text-2xl font-bold">2</span>
                </div>
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                  Browse & Match
                </h3>
                <p className="text-gray-600">
                  Explore verified listings and connect with potential roommates
                  who match your criteria.
                </p>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-white text-2xl font-bold">3</span>
                </div>
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                  Move In
                </h3>
                <p className="text-gray-600">
                  Schedule viewings, chat with matches, and find your perfect
                  space with confidence.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 bg-purple-600 text-white mb-5rem">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold mb-6">
              Ready to Find Your Perfect Match?
            </h2>
            <p className="text-xl mb-8 text-purple-100">
              Join thousands of users who found their ideal living situation
              with us.
            </p>
            <button
              onClick={() => navigate(isAuthenticated ? "/dashboard" : "/signup")}
              className="bg-white text-purple-600 hover:bg-gray-100 font-semibold py-4 px-8 rounded-lg text-lg transition transform hover:scale-105 shadow-lg"
            >
              {isAuthenticated ? "Go to Dashboard" : "Get Started Now"}
            </button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}