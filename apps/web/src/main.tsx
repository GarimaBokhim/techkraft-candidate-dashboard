import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./lib/auth-provider";
import { Toaster } from "sonner";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchInterval: false,
      refetchIntervalInBackground: false,
      staleTime: 10 * 60 * 1000,
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <App />
        <Toaster
          swipeDirections={["right", "left", "top", "bottom"]}
          closeButton
        />
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
);
