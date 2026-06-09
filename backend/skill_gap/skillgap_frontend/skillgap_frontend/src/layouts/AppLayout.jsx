import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import MobileNav from "../components/MobileNav";
export default function AppLayout() {
  return (
    <div className="min-h-screen gradient-bg">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-start gap-6">
          <Sidebar />
          <main className="flex-1 min-w-0">
            <div className="flex items-center justify-between lg:hidden mb-4">
              <div className="text-lg font-extrabold tracking-tight">SkillGap</div>
              <MobileNav />
            </div>
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
