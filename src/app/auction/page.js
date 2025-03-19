"use client";
import { useState, useEffect } from "react";
import socket from "@/lib/socket";
import useStore from "@/lib/store";
import axios from "axios";

export default function Auction() {
    const [player, setPlayer] = useState(null);
    const [timer, setTimer] = useState(10);
    const [currentBid, setCurrentBid] = useState({ amount: 0, team: null });
    const [auctionStarted, setAuctionStarted] = useState(false);
    const [playersBought, setPlayersBought] = useState([]);
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);

    const selectedTeam = useStore((state) => state.selectedTeam);

    // Fetch teams and players bought
    const fetchPlayersBought = async () => {
        try {
            const response = await axios.get("http://localhost:5000/players/bought");
            setPlayersBought(response.data);
        } catch (error) {
            console.error("Error fetching players bought:", error);
        }
    };

    const fetchData = async () => {
        try {
            const [teamsRes, playersRes] = await Promise.all([
                axios.get("http://localhost:5000/teams"),
                axios.get("http://localhost:5000/players/bought"),
            ]);

            setTeams(teamsRes.data);
            setPlayersBought(playersRes.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching data:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Socket listeners
    useEffect(() => {
        socket.on("auction_started", () => {
            setAuctionStarted(true);
        });

        socket.on("new_player", (newPlayer) => {
            setPlayer(newPlayer);
            setTimer(10);
            setCurrentBid({ amount: newPlayer.base_price, team: null });

            // Fetch updated players bought list
            fetchPlayersBought();
        });

        socket.on("timer_update", (timeLeft) => {
            setTimer(timeLeft);
        });

        socket.on("bid_update", ({ player_id, bid_amount, team_id }) => {
            if (player_id === player?.id) {
                setCurrentBid({ amount: bid_amount, team: team_id });
            }
        });

        socket.on("player_sold", ({ player, team_id, price }) => {
            setPlayersBought((prev) => [
                ...prev,
                { ...player, sold_team: team_id, sold_price: price },
            ]);

            // Fetch updated players bought list
            fetchPlayersBought();
        });

        return () => {
            socket.off("auction_started");
            socket.off("new_player");
            socket.off("timer_update");
            socket.off("bid_update");
            socket.off("player_sold");
        };
    }, [player]);

    // Handle placing bid
    const placeBid = () => {
        if (!player) {
            alert("No active player to bid on.");
            return;
        }

        if (!selectedTeam) {
            alert("You need to select a team before bidding.");
            return;
        }

        socket.emit("place_bid", {
            player_id: player.id,
            team_id: selectedTeam,
        });
    };

    // Map team ID to team name
    const getTeamName = (teamId) => {
        const team = teams.find((t) => t.id === teamId);
        return team ? team.name : "Unknown";
    };

    // Get current selected team details
    const getCurrentTeamDetails = () => {
        if (!selectedTeam) return null;
        return teams.find((t) => t.id === selectedTeam);
    };

    // Get team statistics
    const getTeamStats = (teamId) => {
        // Define teamPlayers by filtering playersBought for the given teamId
        const teamPlayers = playersBought.filter((p) => p.sold_team === teamId);

        // Calculate total players
        const totalPlayers = teamPlayers.length;

        // Calculate overseas players
        const overseasCount = teamPlayers.filter(
            (p) => p.country !== "India",
        ).length;

        // Calculate total money spent
        const totalMoneySpent = teamPlayers.reduce(
            (sum, p) => sum + p.sold_price,
            0,
        );

        // Get the team's salary cap
        const team = teams.find((t) => t.id === teamId);
        const salaryCap = team ? team.salary_cap : 0;

        // Return the calculated statistics
        return {
            totalPlayers,
            overseasCount,
            totalMoneySpent,
            remainingPurse: salaryCap - totalMoneySpent,
        };
    };

    const currentTeam = getCurrentTeamDetails();
    const currentTeamStats = currentTeam ? getTeamStats(currentTeam.id) : null;

    return (
        <div className="h-screen w-full font-jetbrains bg-gray-50 flex flex-col justify-between p-6">
            {/* Header */}
            <header className="text-center mb-6">
                <h1 className="text-4xl font-bold text-gray-800">
                    IPL Auction Simulator
                </h1>
            </header>

            {/* Main Grid Layout */}
            <div className="grid grid-cols-4 gap-6 h-[75vh]">
                {/* Players Bought Section */}
                <section className="col-span-1 bg-white rounded-xl shadow-md p-4 overflow-y-scroll">
                    <h2 className="text-xl font-semibold mb-4">Players Bought</h2>

                    {loading ? (
                        <p className="text-center text-gray-500">Loading players...</p>
                    ) : playersBought?.length > 0 ? (
                        <div className="space-y-4">
                            {playersBought.map((player) => (
                                <div key={player.id} className="border p-3 rounded-lg">
                                    <p className="font-bold">{player.name}</p>
                                    <p>Role: {player.role}</p>
                                    <p>Team: {getTeamName(player.sold_team)}</p>
                                    <p>Price: ₹{player.sold_price}L</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500">No players bought yet</p>
                    )}
                </section>

                {/* Auction Area Section - Split into two halves */}
                <section className="col-span-2 bg-white rounded-xl shadow-md p-6 flex flex-col overflow-y-scroll">
                    <h2 className="text-xl font-bold mb-4 text-left">Auction Area</h2>

                    {/* First: Team Details (moved up) */}
                    <div className="flex-1 mb-4 border-b pb-4">
                        <h3 className="text-lg font-semibold mb-2">Current Team Details</h3>
                        {currentTeam && currentTeamStats ? (
                            <div className="space-y-4">
                                <div className="flex items-center">
                                    <div className="w-16 h-16 flex-shrink-0 mr-4">
                                        <img
                                            src={currentTeam.logo_url}
                                            alt={currentTeam.short_name}
                                            className="w-full h-full object-contain"
                                        />
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-semibold">
                                            {currentTeam.name}
                                        </h4>
                                        <p className="text-gray-600">
                                            Short Name: {currentTeam.short_name}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <p className="font-semibold">Total Players:</p>
                                        <p className="text-gray-700">
                                            {currentTeamStats.totalPlayers}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="font-semibold">Overseas Players:</p>
                                        <p className="text-gray-700">
                                            {currentTeamStats.overseasCount}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="font-semibold">Money Spent:</p>
                                        <p className="text-gray-700">
                                            ₹{currentTeamStats.totalMoneySpent}L
                                        </p>
                                    </div>
                                    <div>
                                        <p className="font-semibold">Remaining Purse:</p>
                                        <p className="text-gray-700">
                                            ₹{currentTeamStats.remainingPurse}L
                                        </p>
                                    </div>
                                </div>

                                <button
                                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition w-full"
                                    onClick={placeBid}
                                >
                                    Place Bid
                                </button>
                            </div>
                        ) : (
                            <p className="text-center text-gray-500">No team selected</p>
                        )}
                    </div>

                    {/* Second: Player Details */}
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-2">Player Details</h3>
                        {player ? (
                            <div className="space-y-4">
                                <h3 className="text-2xl font-semibold">{player.name}</h3>

                                <div className="grid grid-cols-3 gap-6 text-left">
                                    {/* Row 1 */}
                                    <div>
                                        <p className="font-semibold">Set Name:</p>
                                        <p className="text-gray-700">{player.setname}</p>
                                    </div>

                                    <div>
                                        <p className="font-semibold">Player No:</p>
                                        <p className="text-gray-700">{player.playerno}</p>
                                    </div>

                                    <div>
                                        <p className="font-semibold">Base Price:</p>
                                        <p className="text-gray-700">₹{player.base_price}L</p>
                                    </div>

                                    {/* Row 2 */}
                                    <div>
                                        <p className="font-semibold">Age:</p>
                                        <p className="text-gray-700">{player.age}</p>
                                    </div>

                                    <div>
                                        <p className="font-semibold">Country:</p>
                                        <p className="text-gray-700">{player.country}</p>
                                    </div>

                                    <div>
                                        <p className="font-semibold">Capped:</p>
                                        <p className="text-gray-700">
                                            {player.capped ? "Yes" : "No"}
                                        </p>
                                    </div>

                                    {/* Row 3 */}
                                    <div>
                                        <p className="font-semibold">Role:</p>
                                        <p className="text-gray-700">{player.role}</p>
                                    </div>

                                    <div>
                                        <p className="font-semibold">Batting Style:</p>
                                        <p className="text-gray-700">{player.batting_style}</p>
                                    </div>

                                    <div>
                                        <p className="font-semibold">Bowling Style:</p>
                                        <p className="text-gray-700">{player.bowling_style}</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <p className="text-center">Waiting for the next player...</p>
                        )}
                    </div>
                </section>

                {/* Other Teams Section */}
                <section className="col-span-1 bg-white rounded-xl shadow-md p-4 overflow-y-scroll">
                    <h2 className="text-xl font-semibold mb-4">Other Teams</h2>
                    {loading ? (
                        <p className="text-center text-gray-500">Loading teams...</p>
                    ) : teams.length > 0 ? (
                        <div className="space-y-4">
                            {teams.map((team) => {
                                const teamStats = getTeamStats(team.id);
                                return (
                                    <div
                                        key={team.id}
                                        className={`border p-3 rounded-lg flex flex-col cursor-pointer ${selectedTeam === team.id
                                                ? "border-blue-500 bg-blue-50"
                                                : ""
                                            }`}
                                    >
                                        <div className="flex items-center mb-2">
                                            <div className="w-12 h-12 flex-shrink-0 mr-3">
                                                <img
                                                    src={team.logo_url}
                                                    alt={team.short_name}
                                                    className="w-full h-full object-contain"
                                                />
                                            </div>
                                            <div>
                                                <p className="font-semibold">{team.name}</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-1 text-sm">
                                            <p>Players: {teamStats.totalPlayers}</p>
                                            <p>Overseas: {teamStats.overseasCount}</p>
                                            <p>Purse: ₹{teamStats.remainingPurse}L</p>
                                            <p>Spent: ₹{teamStats.totalMoneySpent}L</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-gray-500">No teams available</p>
                    )}
                </section>
            </div>

            {/* Footer Section */}
            <footer className="grid grid-cols-3 gap-6 mt-4">
                <div className="bg-white p-4 rounded-xl shadow-md text-center">
                    <h2 className="text-lg font-semibold">Time Left</h2>
                    <p className="text-2xl">{timer}s</p>
                </div>

                <div className="bg-white p-4 rounded-xl shadow-md text-center">
                    <h2 className="text-lg font-semibold">Current Bid</h2>
                    <p className="text-2xl">₹{currentBid.amount}L</p>
                </div>

                <div className="bg-white p-4 rounded-xl shadow-md text-center">
                    <h2 className="text-lg font-semibold">Current Bid Team</h2>
                    <p className="text-2xl">{getTeamName(currentBid.team)}</p>
                </div>
            </footer>
        </div>
    );
}
