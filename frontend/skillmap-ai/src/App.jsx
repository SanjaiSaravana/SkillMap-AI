import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import { LandingPage } from "./pages/LandingPage";
import { Signup } from "./pages/Signup";
import { Login } from "./pages/Login";
import { UploadResume } from "./pages/UploadResume";
import { Roadmap } from "./pages/Roadmap";
import { Dashboard } from "./pages/Dashboard";
import { Profile } from "./pages/Profile";
import { Leaderboard } from "./pages/Leaderboard";
import { InstitutionDashboard } from "./pages/InstitutionDashboard";
import { CompanyDashboard } from "./pages/CompanyDashboard";
import { Internships } from "./pages/Internships";
import { Interview } from "./pages/Interview";
import { SkillBarter } from "./pages/SkillBarter";
import { ATSResumeBuilder } from "./pages/ATSResumeBuilder";
import { Assessments } from "./pages/Assessments";
import { TakeAssessment } from "./pages/TakeAssessment";
import { ChatWidget } from "./components/ChatWidget";

function App() {
  return (
    <BrowserRouter>
      <ChatWidget />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/upload" element={<UploadResume />} />
        <Route path="/roadmap" element={<Roadmap />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/internships" element={<Internships />} />
        <Route path="/interview" element={<Interview />} />
        <Route path="/assessments" element={<Assessments />} />
        <Route path="/take-assessment/:id" element={<TakeAssessment />} />
        <Route path="/institution" element={<InstitutionDashboard />} />
        <Route path="/company" element={<CompanyDashboard />} />
        <Route path="/skill-barter" element={<SkillBarter />} />
        <Route path="/resume-builder" element={<ATSResumeBuilder />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
