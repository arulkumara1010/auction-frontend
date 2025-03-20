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

  const getTeamName = (teamId) => {
    const team = teams.find((t) => t.id === teamId);
    return team ? team.name : "Unknown";
  };

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
        {},
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      console.log("✅ Auction started:", response.data);
      socket.emit("start_auction");
    } catch (error) {
      console.error("❌ Error starting auction:", error);
      alert("Failed to start the auction.");
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center h-screen w-full overflow-hidden font-jetbrains p-5">
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
        <div className="w-full h-full bg-repeat" />
      </div>

      <div className="z-10 bg-white bg-opacity-10 backdrop-blur-md p-8 rounded-xl shadow-2xl border border-white/20 w-[900px] max-h-[600px] overflow-y-auto">
        <h1 className="text-3xl font-bold mb-4 text-center text-white transition-all duration-500 transform hover:scale-105">
          Select Your IPL Team
        </h1>

        {selectedTeam && (
          <p className="mb-4 text-center text-lg font-semibold text-white">
            Selected Team:{" "}
            <span className="text-yellow-400">{getTeamName(selectedTeam)}</span>
          </p>
        )}

        {isWaiting ? (
          <div className="text-center mt-6 text-white">
            <p className="text-lg">Waiting for other teams to be picked...</p>
            {!allTeamsPicked && <p className="text-gray-200">Please wait...</p>}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {teams.map((team) => (
              <div
                key={team.id}
                onClick={() => handleSelectTeam(team.id)}
                className={`w-full cursor-pointer p-4 flex items-center space-x-4 border rounded-xl font-medium transition-all duration-300 transform ${
                  selectedTeam === team.id
                    ? "bg-blue-500 text-white scale-105"
                    : "border-gray-700 hover:bg-green-500/70 hover:scale-105 bg-white/20 text-white"
                }`}
              >
                <img
                  src={`${team.logo_url}`}
                  alt={`${team.name}`}
                  className="w-14 h-14 object-contain rounded-full bg-white p-1"
                />
                <span className="text-lg">{team.name}</span>
              </div>
            ))}
          </div>
        )}

        {allTeamsPicked && (
          <div className="text-center mt-8">
            <p className="text-green-500 font-semibold text-white">
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
    </div>
  );
}
