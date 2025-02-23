"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import useStore from "@/lib/store";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const login = useStore((state) => state.login);

  const handleLogin = async () => {
    const success = await login(username, password);
    if (success) {
      router.push("/teams");
    } else {
      alert("Login Failed");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 font-jetbrains">
      <h1 className="text-2xl font-bold mb-4 text-black">IPL Auction Login</h1>
      <input
        type="text"
        placeholder="Username"
        className="border p-2 mb-2 w-64 font-jetbrains text-black"
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        className="border p-2 mb-4 w-64 font-jetbrains text-black"
        onChange={(e) => setPassword(e.target.value)}
      />
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
        onClick={handleLogin}
      >
        Login
      </button>
    </div>
  );
}
