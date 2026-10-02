export type User = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  goalId: string | null;
  classId: string | null;
  profileCompleted: boolean;
  status: "ACTIVE" | "INACTIVE" | string;
};

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type GoalClass = {
  id: string;
  name: string;
  status: string;
};

export type Goal = {
  id: string;
  name: string;
  status: string;
  classes: GoalClass[];
};

export type Session = {
  id: string;
  deviceId: string;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
  expiresAt: string;
};