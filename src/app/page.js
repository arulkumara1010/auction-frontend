"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function Home() {
  const router = useRouter();
  const [loaded, setLoaded] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);

  useEffect(() => {
    setLoaded(true);
    const timer = setTimeout(() => setAnimationComplete(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen w-full overflow-hidden">
      {/* Background image + gradient */}
      <div className="absolute inset-0 z-0">
        <div
          className={`absolute inset-0 bg-cover bg-center transition-all duration-2000 ${
            loaded ? "scale-100 blur-0" : "scale-102 blur-[1px]"
          }`}
          style={{
            backgroundImage: "url('/images/ipl_sta1.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "brightness(0.9)",
          }}
        />

        {/* Gradient overlay (added) */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/70 to-purple-900/70" />

        {/* Subtle soft blend overlay */}
        <div
          className={`absolute inset-0 bg-gradient-to-b from-blue-900/20 to-purple-900/20 transition-opacity duration-2000 ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
          style={{ mixBlendMode: "overlay" }}
        />
      </div>

      {/* Optional particles */}
      {animationComplete && (
        <>
          <div
            className="absolute top-20 left-20 w-4 h-4 rounded-full bg-blue-500 opacity-40 animate-ping"
            style={{ animationDuration: "3s" }}
          ></div>
          <div
            className="absolute bottom-40 right-40 w-3 h-3 rounded-full bg-purple-500 opacity-30 animate-ping"
            style={{ animationDuration: "4s" }}
          ></div>
          <div
            className="absolute top-1/3 right-1/4 w-2 h-2 rounded-full bg-yellow-500 opacity-30 animate-ping"
            style={{ animationDuration: "5s" }}
          ></div>
        </>
      )}

      {/* Content (no changes) */}
      <div className="z-10 flex flex-col items-center justify-center text-center px-4 sm:px-6 max-w-xs sm:max-w-sm md:max-w-3xl">
        <div
          className={`flex justify-center mb-6 sm:mb-8 transform transition-all duration-1000 ease-out ${
            loaded
              ? "opacity-100 translate-y-0 rotate-0"
              : "opacity-0 -translate-y-16 rotate-12"
          }`}
        >
          <img
            src="/images/ipl_logo.png"
            alt="IPL Logo"
            className={`h-16 sm:h-20 md:h-24 ${
              animationComplete ? "animate-pulse" : ""
            }`}
            style={{ animationDuration: "4s" }}
          />
        </div>

        <div className="overflow-hidden mb-4 sm:mb-6">
          <h1
            className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white transition-all duration-1000 delay-300 ease-out ${
              loaded
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-full"
            }`}
          >
            Welcome to the IPL Auction System
          </h1>
        </div>

        <div className="overflow-hidden mb-6 sm:mb-8 max-w-xl">
          <p
            className={`text-base sm:text-lg md:text-xl text-gray-200 transition-all duration-1000 delay-500 ease-out ${
              loaded
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-full"
            }`}
          >
            Experience the thrill of building your dream team. Join the auction,
            select your players, and compete for the ultimate glory!
          </p>
        </div>

        <div
          className={`transition-all duration-1000 delay-700 ease-out ${
            loaded ? "opacity-100 scale-100" : "opacity-0 scale-75"
          }`}
        >
          <button
            className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 text-base sm:text-lg font-medium hover:shadow-xl transform hover:scale-105 overflow-hidden group"
            onClick={() => router.push("/login")}
          >
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-white/0 via-white/30 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-all duration-1000 ease-out"></span>
            Enter Auction Room
          </button>
        </div>
      </div>
    </div>
  );
}
