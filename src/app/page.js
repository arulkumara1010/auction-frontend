"use client";
import { useRouter } from "next/navigation";

export default function Home() {
    const router = useRouter();

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
            <h1 className="text-3xl font-bold mb-4">Welcome to the IPL Auction System</h1>
            <p className="text-lg text-gray-600 mb-6">Join the auction, select your team, and start bidding!</p>
            <button 
                className="bg-blue-500 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-600 transition"
                onClick={() => router.push("/login")}
            >
                Get Started
            </button>
        </div>
    );
}

