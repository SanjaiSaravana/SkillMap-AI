import { Navigate, Route, Routes } from "react-router-dom";
import AuthLayout from "./layouts/AuthLayout";
import AppLayout from "./layouts/AppLayout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Overview from "./pages/Overview";
import Leaderboard from "./pages/Leaderboard";
import Clusters from "./pages/Clusters";
import Internships from "./pages/Internships";
import ResumeAnalyzer from "./pages/ResumeAnalyzer";
import Persona from "./pages/Persona";
import LearningMap from "./pages/LearningMap";
import { getToken } from "./lib/storage";

function RequireAuth({ children }) {
  const token = getToken();
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      <Route path="/app" element={<RequireAuth><AppLayout /></RequireAuth>}>
        <Route index element={<Navigate to="/app/overview" replace />} />
        <Route path="overview" element={<Overview />} />
        <Route path="leaderboard" element={<Leaderboard />} />
        <Route path="clusters" element={<Clusters />} />
        <Route path="internships" element={<Internships />} />
        <Route path="resume" element={<ResumeAnalyzer />} />
        <Route path="persona" element={<Persona />} />
        <Route path="learning-map" element={<LearningMap />} />
      </Route>

      <Route path="/" element={<Navigate to="/app" replace />} />
      <Route path="*" element={<Navigate to="/app" replace />} />
    </Routes>
  );
}
