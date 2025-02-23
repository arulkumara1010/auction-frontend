"use client";
import { useState, useEffect } from "react";
import socket from "@/lib/socket";
import useStore from "@/lib/store";

export default function Auction() {
  const [player, setPlayer] = useState(null);
  const [timer, setTimer] = useState(30);
  const [currentBid, setCurrentBid] = useState({ amount: 0, team: null });
  const [auctionStarted, setAuctionStarted] = useState(false);
  const selectedTeam = useStore((state) => state.selectedTeam);

  useEffect(() => {
    socket.on("auction_started", () => {
      console.log("🔥 Auction started!");
      setAuctionStarted(true);
    });

    socket.on("new_player", (newPlayer) => {
      console.log("🎉 New player up for auction:", newPlayer.name);
      setPlayer(newPlayer);
      setTimer(30);
      setCurrentBid({ amount: newPlayer.base_price, team: null });
    });

    socket.on("timer_update", (timeLeft) => {
      setTimer(timeLeft);
    });

    socket.on("bid_update", ({ player_id, bid_amount, team_id }) => {
      if (player_id === player?.id) {
        setCurrentBid((prevBid) => ({
          amount: bid_amount,
          team: team_id,
        }));
      }
    });

    return () => {
      socket.off("auction_started");
      socket.off("new_player");
      socket.off("timer_update");
      socket.off("bid_update");
    };
  }, [player]);

  const placeBid = () => {
    if (!player) {
      alert("⚠️ No active player to bid on.");
      return;
    }

    if (!selectedTeam) {
      alert("⚠️ You need to select a team before bidding.");
      return;
    }
    console.log(`🚀 Placing bid for Player ${player.id}`);

    socket.emit("place_bid", {
      player_id: player.id,
      team_id: selectedTeam,
    });
  };

  return (
    <div className="p-5 font-jetbrains">
      <h1 className="text-2xl font-bold mb-4">IPL Auction</h1>
      {player ? (
        <div className="space-y-3">
          <h2 className="text-xl font-semibold">
            {player.name} - {player.role}
          </h2>
          <p>Base Price: ₹{player.base_price}L</p>
          <p>
            Current Bid: ₹{currentBid.amount}L (Team {currentBid.team || "None"}
            )
          </p>
          <p>Time Left: {timer}s</p>
          <button
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
            onClick={placeBid}
          >
            Bid
          </button>
        </div>
      ) : (
        <p>Waiting for next player...</p>
      )}
    </div>
  );
}
