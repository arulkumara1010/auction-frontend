"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const router = useRouter();

    const handleLogin = async () => {
        try {
            const res = await axios.post("http://localhost:5000/auth/login", {
                username, password,
            });
            localStorage.setItem("token", res.data.token);
            router.push("/teams");
        } catch (error) {
            alert("Login failed.");
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <h1 className="text-2xl font-bold">IPL Auction Login</h1>
            <input type="text" placeholder="Username" className="border p-2" onChange={(e) => setUsername(e.target.value)} />
            <input type="password" placeholder="Password" className="border p-2" onChange={(e) => setPassword(e.target.value)} />
            <button className="bg-blue-500 text-white px-4 py-2" onClick={handleLogin}>Login</button>
        </div>
    );
}
