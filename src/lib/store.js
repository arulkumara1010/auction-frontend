import { create } from "zustand";
import axios from "axios";

const useStore = create((set) => ({
  token: null,
  selectedTeam: null,

  login: async (username, password) => {
    try {
      const res = await axios.post("http://localhost:5000/auth/login", {
        username,
        password,
      });
      localStorage.setItem("token", res.data.token);
      set({ token: res.data.token });
      return true;
    } catch (error) {
      return false;
    }
  },

  selectTeam: async (teamId) => {
    try {
      await axios.post(
        "http://localhost:5000/teams/select",
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
