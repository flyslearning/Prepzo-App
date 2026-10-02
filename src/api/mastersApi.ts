import axiosClient from "./axiosClient";
import { ApiResponse, Goal, GoalClass } from "../types/auth";

export const MastersApi = {
  async getGoals() {
    return axiosClient.get<
      ApiResponse<{
        goals: Goal[];
      }>
    >("/masters/goals");
  },

  async getClassesByGoal(goalId: string) {
    return axiosClient.get<
      ApiResponse<{
        classes: GoalClass[];
      }>
    >(`/masters/goals/${goalId}/classes`);
  },
};