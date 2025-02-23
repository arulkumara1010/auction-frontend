"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import useStore from "@/lib/store";

export default function Teams() {
  const [teams, setTeams] = useState([]);
  const router = useRouter();
  const { selectedTeam, selectTeam } = useStore();

  useEffect(() => {
    axios
      .get("http://localhost:5000/teams")
      .then((res) => setTeams(res.data))
      .catch(console.error);
  }, []);

  const handleSelectTeam = async (teamId) => {
    if (await selectTeam(teamId)) {
      router.push("/auction");
    } else {
      alert("Team selection failed.");
    }
  };

  return (
    <div className="font-jetbrains p-5">
      <h1 className="text-2xl font-bold mb-4">Select Your IPL Team</h1>
      {selectedTeam && <p className="mb-4">Selected Team: {selectedTeam}</p>}
      <ul className="space-y-3">
        {teams.map((team) => (
          <li
            key={team.id}
            className="flex items-center justify-between p-3 border rounded"
          >
            {team.name}
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
              onClick={() => handleSelectTeam(team.id)}
            >
              Select
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
