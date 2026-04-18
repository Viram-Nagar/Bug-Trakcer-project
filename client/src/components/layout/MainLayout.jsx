import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Breadcrumbs from "./Breadcrumbs";

function MainLayout() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-auto min-w-0">
        {/* Top padding on mobile for hamburger button */}
        <div className="md:hidden h-16" />
        <div className="px-4 md:px-6 py-4 md:py-6">
          <Breadcrumbs />
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default MainLayout;

// import { Outlet } from "react-router-dom";
// import Sidebar from "./Sidebar";

// function MainLayout() {
//   return (
//     <div className="flex min-h-screen bg-gray-50">
//       <Sidebar />
//       <main className="flex-1 overflow-auto">
//         <Outlet />
//       </main>
//     </div>
//   );
// }

// export default MainLayout;
