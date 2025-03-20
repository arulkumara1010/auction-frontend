import { create } from "zustand";
import axios from "axios";

const useStore = create((set) => ({
  token: null,
  selectedTeam: null,
  teams: [], // Store teams in Zustand
  setTeams: (teams) => set({ teams }),
  login: async (username, password) => {
    try {
      const res = await axios.post(
        "https://auction-backend-7745.onrender.com/auth/login",
        {
          username,
          password,
        },
      );
      localStorage.setItem("token", res.data.token);
      set({ token: res.data.token });
      return true;
    } catch (error) {
      return false;
    }
  },
  register: async (name, username, password) => {
    try {
      const res = await axios.post(
        "https://auction-backend-7745.onrender.com/auth/register",
        {
          name,
          username,
          password,
        },
      );

      console.log("✅ Registration successful:", res.data);
      return true;
    } catch (error) {
      console.error("❌ Registration failed:", error);
      return false;
    }
  },
  selectTeam: async (teamId) => {
    try {
      await axios.post(
        "https://auction-backend-7745.onrender.com/teams/select",
        { team_id: teamId },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );

      localStorage.setItem("selectedTeam", teamId);
      set({ selectedTeam: teamId });
      return true;
    } catch (error) {
      return false;
    }
  },

  logout: () => {
    localStorage.clear();
    set({ token: null, selectedTeam: null });
  },
}));

export default useStore;
