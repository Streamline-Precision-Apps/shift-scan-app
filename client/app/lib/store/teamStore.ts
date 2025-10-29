import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Worker {
  id: string;
  firstName: string;
  lastName: string;
  status: boolean;
}

interface Team {
  id: string;
  name: string;
  crewType: string;
  workers: Worker[];
  userCount: number; // number of workers in the team
}

interface TeamStoreState {
  teams: Team[];
  setTeams: (teams: Team[]) => void;
  updateTeamWorkers: (teamId: string, workers: Worker[]) => void;
}

export const useTeamStore = create<TeamStoreState>()(
  persist(
    (set) => ({
      teams: [],
      setTeams: (teams: Team[]) =>
        set({
          teams: teams.map((team) => ({
            ...team,
            userCount: Array.isArray(team.workers)
              ? team.workers.length
              : typeof team.userCount === "number"
              ? team.userCount
              : 0,
          })),
        }),
      updateTeamWorkers: (teamId: string, workers: Worker[]) =>
        set((state) => ({
          teams: state.teams.map((team) =>
            team.id === teamId
              ? { ...team, workers, userCount: workers.length }
              : team
          ),
        })),
    }),
    {
      name: "team-store",
      partialize: (state: TeamStoreState): TeamStoreState => ({
        teams: state.teams,
        setTeams: () => {},
        updateTeamWorkers: () => {},
      }),
    }
  )
);
