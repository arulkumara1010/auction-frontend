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
      <h1 className="text-2xl font-bold mb-4 text-center">
        Select Your IPL Team
      </h1>
      {selectedTeam && (
        <p className="mb-4 text-center text-lg font-semibold">
          Selected Team: <span className="text-blue-600">{selectedTeam}</span>
        </p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {teams.map((team) => (
          <div
            key={team.id}
            onClick={() => handleSelectTeam(team.id)}
            className={`cursor-pointer p-4 border rounded-lg text-center font-medium transition ${
              selectedTeam === team.id
                ? "bg-blue-500 text-white"
                : "border-gray-800 hover:bg-gra-100"
            }`}
          >
            {team.name}
          </div>
        ))}
      </div>
    </div>
  );
}
