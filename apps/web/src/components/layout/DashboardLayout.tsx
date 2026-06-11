import { Navigate, Outlet, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../lib/auth-context";

export default function DashboardLayout() {
  const { isAuthenticated, role, logout } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  const handleLogout = () => {
    logout();
    navigate("/auth/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-64 fixed left-0 top-0 h-screen bg-[#19275A] text-white flex flex-col">
        <div className="p-6">
          <img
            src="/logo.svg"
            alt="TechKraft"
            className="h-8 mb-4 brightness-0 invert"
          />
          <h2 className="text-xl font-bold tracking-tight">Recruitment Hub</h2>
          <span className="text-xs bg-white/20 px-2 py-1 rounded mt-2 inline-block uppercase font-medium">
            Role: {role}
          </span>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <Link
            to="/candidates"
            className="flex items-center gap-3 px-4 py-3 bg-white/10 rounded-xl text-white font-medium transition-colors"
          >
            Candidates
          </Link>
        </nav>
        <div className="p-4">
          <button
            onClick={handleLogout}
            className="w-full flex cursor-pointer items-center justify-center gap-2 px-4 py-3 bg-white/10 hover:bg-red-500/80 rounded-xl text-white font-medium transition-colors"
          >
            Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 ml-64 overflow-y-auto min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}
