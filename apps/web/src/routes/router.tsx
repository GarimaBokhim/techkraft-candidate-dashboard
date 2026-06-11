import { createBrowserRouter, Navigate } from "react-router-dom";

import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import DashboardLayout from "../components/layout/DashboardLayout";
import CandidatesListPage from "../pages/candidates/CandidatesListPage";
import CandidateDetailPage from "../pages/candidates/CandidateDetailPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/candidates" replace />,
  },
  {
    path: "/auth/login",
    element: <LoginPage />,
  },
  {
    path: "/auth/register",
    element: <RegisterPage />,
  },
  {
    path: "/candidates",
    element: <DashboardLayout />,
    children: [
      {
        path: "",
        element: <CandidatesListPage />,
      },
      {
        path: ":id",
        element: <CandidateDetailPage />,
      },
    ],
  },
]);
