
"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function Teams() {
    const [teams, setTeams] = useState([]);
    const router = useRouter();

    useEffect(() => {
        axios.get("http://localhost:5000/teams")
            .then(res => setTeams(res.data))
            .catch(err => console.error(err));
    }, []);

    const selectTeam = async (teamId) => {
        try {
            await axios.post("http://localhost:5000/teams/select", { team_id: teamId }, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            router.push("/auction");
        } catch (error) {
            alert("Team selection failed.");
        }
    };

    return (
        <div>
            <h1>Select Your IPL Team</h1>
            <ul>
                {teams.map(team => (
                    <li key={team.id}>
                        {team.name} 
                        <button onClick={() => selectTeam(team.id)}>Select</button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

