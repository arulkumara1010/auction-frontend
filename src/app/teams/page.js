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
        <div>
            <h1>Select Your IPL Team</h1>
            {selectedTeam && <p>Selected Team: {selectedTeam}</p>}
            <ul>
                {teams.map((team) => (
                    <li key={team.id}>
                        {team.name}
                        <button onClick={() => handleSelectTeam(team.id)}>Select</button>
                    </li>
                ))}
            </ul>
        </div>
    );
}
