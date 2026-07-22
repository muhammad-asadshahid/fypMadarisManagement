export type Role = "admin" | "teacher" | "parent";

export interface User {
  id: string;
  name: string;
  role: Role;
}

let currentUser: User | null = null;

export const AuthService = {
  login: async (role: Role, name = "User") => {
    // simple mock login
    currentUser = { id: String(Date.now()), name, role };
    return currentUser;
  },
  logout: async () => {
    currentUser = null;
  },
  getUser: () => currentUser,
};

export const StudentService = {
  list: async () => {
    return [
      { id: "s1", name: "Ali", program: "Hifz" },
      { id: "s2", name: "Fatima", program: "Nazra" },
    ];
  },
};

export default {
  AuthService,
  StudentService,
};
