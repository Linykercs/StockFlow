import { Outlet } from "react-router-dom";
import Sidebar from "../Components/Sidebar";

function Layout() {
  return (
    <div className="min-h-screen bg-bege md:flex">
      <Sidebar />
      <main className="min-w-0 flex-1 md:ml-[230px]">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
