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
  const [selectedFilterTeam, setSelectedFilterTeam] = useState(null); // State for team filter
  const selectedTeam = useStore((state) => state.selectedTeam);
  // Fetch teams and players bought
  const fetchPlayersBought = async () => {
    try {
      const response = await axios.get(
        "https://auction-backend-7745.onrender.com/players/bought",
      );
      console.log(response);
      setPlayersBought(response.data);
    } catch (error) {
      console.error("Error fetching players bought:", error);
    }
  };

  const fetchData = async () => {
    try {
      const [teamsRes, playersRes] = await Promise.all([
        axios.get("https://auction-backend-7745.onrender.com/teams"),
        axios.get("https://auction-backend-7745.onrender.com/players/bought"),
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
    if (currentBid.team === selectedTeam) {
      alert("You are already the highest bidder. You cannot bid again.");
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

  // Filter players based on selected team
  const filteredPlayersBought = selectedFilterTeam
    ? playersBought.filter((p) => p.sold_team === selectedFilterTeam)
    : playersBought;
  const getTopBuys = () => {
    return [...playersBought]
      .filter((player) => player.sold_team && player.sold_price) // Include only sold players
      .sort((a, b) => b.sold_price - a.sold_price) // Sort by sold_price in descending order
      .slice(0, 10); // Take the top 10 entries
  };
  return (
    <div
      className="h-screen w-full font-jetbrains flex flex-col justify-between p-6 bg-cover bg-center"
      style={{
        backgroundImage: "url('/images/ipl_sta1.jpg')", // Make sure this path is correct
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        position: "relative",
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-blue-900/70 to-purple-900/70" />

      {/* Gradient overlay */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-blue-50/80 to-white/80 pointer-events-none"
        style={{ zIndex: "-1" }}
      ></div>

      {/* Header */}
      <header className="text-center mb-6 relative z-10">
        <h1 className="text-4xl font-bold text-white">
          IPL Auction Simulator 2025
        </h1>
      </header>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-4 gap-6 h-[75vh] relative z-10">
        {/* First Column: Players Sold + Top Buys */}
        <div className="col-span-1 flex flex-col gap-6 h-[75vh]">
          {/* Players Sold Section */}
          <section className="bg-white/90 backdrop-blur-md rounded-xl shadow-md p-4 flex flex-col h-[37.5vh]">
            {/* Title and Filter */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Players Sold</h2>
              {/* Dropdown for team filter */}
              <select
                className="border border-gray-300 rounded-lg px-3 py-1"
                value={selectedFilterTeam || ""}
                onChange={(e) => setSelectedFilterTeam(e.target.value || null)}
              >
                <option value="">All Teams</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>
            {/* Scrollable Player List */}
            <div className="flex-1 overflow-y-scroll space-y-4">
              {loading ? (
                <p className="text-center text-gray-500">Loading players...</p>
              ) : filteredPlayersBought?.length > 0 ? (
                filteredPlayersBought.map((player) => (
                  <div
                    key={player.id || `player-${Math.random()}`}
                    className="border p-3 rounded-lg bg-white/80"
                  >
                    <p className="font-bold">{player.name}</p>
                    <p>Role: {player.role}</p>
                    {player.sold_team ? (
                      <>
                        <p>Team: {getTeamName(player.sold_team)}</p>
                        <p>Price: ₹{player.sold_price}L</p>
                      </>
                    ) : (
                      <p className="text-red-500">Status: Unsold</p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No players bought yet</p>
              )}
            </div>
          </section>

          {/* Top Buys Section */}
          <section className="bg-white/90 backdrop-blur-md rounded-xl shadow-md p-4 flex flex-col h-[35vh]">
            {/* Title */}
            <h2 className="text-xl font-semibold mb-4">Top Buys</h2>
            {/* Scrollable Player List */}
            <div className="flex-1 overflow-y-scroll space-y-4">
              {loading ? (
                <p className="text-center text-gray-500">Loading top buys...</p>
              ) : playersBought?.length > 0 ? (
                getTopBuys().map((player) => (
                  <div
                    key={player.id}
                    className="border p-3 rounded-lg bg-white/80"
                  >
                    <p className="font-bold">{player.name}</p>
                    <p>Role: {player.role}</p>
                    <p>Team: {getTeamName(player.sold_team)}</p>
                    <p>Price: ₹{player.sold_price}L</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No players bought yet</p>
              )}
            </div>
          </section>
        </div>

        {/* Second Column: Auction Area */}
        <section className="col-span-2 bg-white/90 backdrop-blur-md rounded-xl shadow-md p-6 overflow-y-scroll">
          <h2 className="text-xl font-bold mb-4 text-left">Auction Area</h2>
          {/* Current Team Details */}
          <div className="mb-4 border-b pb-4">
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
          {/* Player Details */}
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

        {/* Third Column: Other Teams */}
        <section className="col-span-1 bg-white/90 backdrop-blur-md rounded-xl shadow-md p-4 overflow-y-scroll">
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
                    className={`border p-3 rounded-lg flex flex-col cursor-pointer ${
                      selectedTeam === team.id
                        ? "border-blue-500 bg-blue-50"
                        : "bg-white/80"
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
      <footer className="grid grid-cols-3 gap-6 mt-4 relative z-10">
        <div className="bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-md text-center">
          <h2 className="text-lg font-semibold">Time Left</h2>
          <p className="text-2xl">{timer}s</p>
        </div>
        <div className="bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-md text-center">
          <h2 className="text-lg font-semibold">Current Bid</h2>
          <p className="text-2xl">₹{currentBid.amount}L</p>
        </div>
        <div className="bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-md text-center">
          <h2 className="text-lg font-semibold">Current Bid Team</h2>
          <p className="text-2xl">{getTeamName(currentBid.team)}</p>
        </div>
      </footer>
    </div>
  );
}
