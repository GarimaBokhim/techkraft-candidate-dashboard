import { useMutation } from "@tanstack/react-query";
import { api } from "../lib/instance";

export type ApiError = {
  detail: string;
};

type LoginRequest = {
  email: string;
  password: string;
};

type RegisterRequest = {
  full_name: string;
  email: string;
  username: string;
  password: string;
};

type AuthResponse = {
  access_token: string;
  token_type: "bearer";
  role: "admin" | "reviewer";
};

const authEndpoints = {
  login: "/auth/login",
  register: "/auth/register",
};

export const useLogin = () => {
  return useMutation<AuthResponse, Error, LoginRequest>({
    mutationFn: async (data: LoginRequest): Promise<AuthResponse> => {
      const response = await api.post(authEndpoints.login, data);
      return response.data;
    },
  });
};

export const useRegister = () => {
  return useMutation<AuthResponse, Error, RegisterRequest>({
    mutationFn: async (data: RegisterRequest): Promise<AuthResponse> => {
      const response = await api.post(authEndpoints.register, data);
      return response.data;
    },
  });
};
