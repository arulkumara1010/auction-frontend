"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import useStore from "@/lib/store";
import Link from "next/link";
// import { toast } from "react-toastify";
import toast from "react-hot-toast";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const login = useStore((state) => state.login);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      toast.error("Please enter both username and password");
      return;
    }

    const success = await login(username, password);
    if (success) {
      router.push("/teams");
    } else {
      toast.error("Invalid credentials. Please try again.");
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center h-screen w-full overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/images/ipl_sta1.jpg')",
            backgroundSize: "cover",
            filter: "brightness(0.4)",
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/70 to-purple-900/70" />
      </div>

      <div className="absolute inset-0 z-0 opacity-10">
        <div
          className="w-full h-full bg-repeat"
          style={{ backgroundImage: "url('/images/ipl-pattern.png')" }}
        />
      </div>

      <div className="z-10 bg-white bg-opacity-10 backdrop-blur-md p-8 rounded-xl shadow-2xl border border-white/20 w-96">
        <div className="flex justify-center mb-6">
          <img src="/images/ipl_logo.png" alt="IPL Logo" className="h-16" />
        </div>

        <h1 className="text-2xl font-bold mb-6 text-white text-center">Login</h1>

        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Username"
              className="border border-white/30 bg-white/10 p-3 rounded-lg w-full font-jetbrains text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
              onChange={(e) => setUsername(e.target.value)}
              value={username}
            />
          </div>

          <div className="mb-6">
            <input
              type="password"
              placeholder="Password"
              className="border border-white/30 bg-white/10 p-3 rounded-lg w-full font-jetbrains text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium py-3 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition duration-300 shadow-lg"
          >
            Enter Auction Room
          </button>
        </form>

        <div className="flex items-center my-6">
          <div className="flex-1 border-t border-gray-400/30"></div>
          <div className="px-3 text-gray-300 text-sm">or</div>
          <div className="flex-1 border-t border-gray-400/30"></div>
        </div>

        <Link href="/register">
          <button
            className="w-full bg-transparent border-2 border-white/50 text-white font-medium py-2.5 px-4 rounded-lg hover:bg-white/10 transition duration-300"
          >
            Register New User
          </button>
        </Link>

        <div className="mt-6 text-center">
          <p className="text-gray-300 text-xs">
            IPL Auction 2025 • Team Access Only
          </p>
        </div>
      </div>
    </div>
  );
}
