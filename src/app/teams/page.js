"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import useStore from "@/lib/store";
import socket from "@/lib/socket";

export default function Teams() {
  const [teams, setTeams] = useState([]);
  const [isWaiting, setIsWaiting] = useState(false);
  const [allTeamsPicked, setAllTeamsPicked] = useState(false);
  const router = useRouter();
  const { selectedTeam, selectTeam, token } = useStore();

  useEffect(() => {
    axios
      .get("http://localhost:5000/teams")
      .then((res) => setTeams(res.data))
      .catch(console.error);

    // Listen for auction readiness
    socket.on("teams_picked", () => {
      setAllTeamsPicked(true);
    });

    socket.on("auction_started", () => {
      router.push("/auction");
    });

    return () => {
      socket.off("teams_picked");
      socket.off("auction_started");
    };
  }, [router]);

  const handleSelectTeam = async (teamId) => {
    if (await selectTeam(teamId)) {
      setIsWaiting(true);
      socket.emit("team_selected", teamId);
    } else {
      alert("Team selection failed.");
    }
  };

  const startAuction = async () => {
    if (!token) {
      alert("Authentication token missing.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/auction/start",
        {}, // Empty body
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // ✅ Using token from Zustand
          },
        },
      );

      console.log("✅ Auction started:", response.data);

      // Emit socket event
      socket.emit("start_auction");
    } catch (error) {
      console.error("❌ Error starting auction:", error);
      alert("Failed to start the auction.");
    }
  };

  return (
    <div className="font-jetbrains p-5">
      <h1 className="text-2xl font-bold mb-4 text-center">
        Select Your IPL Team
      </h1>

      {selectedTeam && (
        <p className="mb-4 text-center text-lg font-semibold">
          Selected Team: <span className="text-blue-600">{selectedTeam}</span>
        </p>
      )}

      {isWaiting ? (
        <div className="text-center mt-6">
          <p className="text-lg">Waiting for other teams to be picked...</p>
          {!allTeamsPicked && <p className="text-gray-500">Please wait...</p>}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {teams.map((team) => (
            <div
              key={team.id}
              onClick={() => handleSelectTeam(team.id)}
              className={`cursor-pointer p-4 border rounded-lg text-center font-medium transition ${
                selectedTeam === team.id
                  ? "bg-blue-500 text-white"
                  : "border-gray-800 hover:bg-gray-100"
              }`}
            >
              {team.name}
            </div>
          ))}
        </div>
      )}

      {allTeamsPicked && (
        <div className="text-center mt-8">
          <p className="text-green-600 font-semibold">
            All teams have been picked! 🎯
          </p>
          <button
            onClick={startAuction}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg mt-4 hover:bg-blue-700 transition"
          >
            Start Auction
          </button>
        </div>
      )}
    </div>
  );
}
