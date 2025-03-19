"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import useStore from "@/lib/store";
import Link from "next/link";
import toast from "react-hot-toast";

export default function Register() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const router = useRouter();
  const register = useStore((state) => state.register);

  const handleRegister = async (e) => {
    e.preventDefault();
    
    // Form validation
    if (!name || !username || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    
    try {
      const success = await register(name, username, password);
      if (success) {
        toast.success("Registration successful! Redirecting...");
        router.push("/login");
      } else {
        toast.error("Registration failed. Username might already exist.");
      }
    } catch (err) {
      toast.error("Registration error. Please try again later.");
      console.error("Registration error:", err);
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center h-screen w-full overflow-hidden">
      {/* Background and overlays same as before */}
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center" 
          style={{ 
            backgroundImage: "url('/images/ipl_sta1.jpg')", 
            backgroundSize: "cover",
            filter: "brightness(0.4)"
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/70 to-purple-900/70" />
      </div>

      <div className="absolute inset-0 z-0 opacity-10">
        <div className="w-full h-full bg-repeat" style={{ backgroundImage: "url('/images/ipl-pattern.png')" }} />
      </div>

      <div className="z-10 bg-white bg-opacity-10 backdrop-blur-md p-8 rounded-xl shadow-2xl border border-white/20 w-96">
        <div className="flex justify-center mb-4">
          <img src="/images/ipl_logo.png" alt="IPL Logo" className="h-16" />
        </div>

        <h1 className="text-2xl font-bold mb-4 text-white text-center">Registration</h1>
        <p className="text-gray-300 text-sm text-center mb-6">Register for the IPL auction</p>
        
        <form onSubmit={handleRegister}>
          <div className="mb-4">
            <label className="block text-gray-300 text-sm mb-1" htmlFor="name">
                Name
            </label>
            <input
              id="name"
              type="text"
              placeholder="Your Name"
              className="border border-white/30 bg-white/10 p-3 rounded-lg w-full font-jetbrains text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
              onChange={(e) => setName(e.target.value)}
              value={name}
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-300 text-sm mb-1" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              type="text"
              placeholder="Choose a unique username"
              className="border border-white/30 bg-white/10 p-3 rounded-lg w-full font-jetbrains text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
              onChange={(e) => setUsername(e.target.value)}
              value={username}
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-300 text-sm mb-1" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Create a secure password"
              className="border border-white/30 bg-white/10 p-3 rounded-lg w-full font-jetbrains text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-300 text-sm mb-1" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              className="border border-white/30 bg-white/10 p-3 rounded-lg w-full font-jetbrains text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
              onChange={(e) => setConfirmPassword(e.target.value)}
              value={confirmPassword}
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium py-3 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition duration-300 shadow-lg"
          >
            Register
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-gray-300 text-sm">
            Already registered? <Link href="/login" className="text-blue-400 hover:text-blue-300 underline">Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
