import { Link, useLocation, useParams } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { useSelector } from "react-redux";
import { selectProjects } from "../../features/projects/projectSlice";
import { selectTickets } from "../../features/tickets/ticketSlice";

function Breadcrumbs() {
  const location = useLocation();
  const { id, projectId, ticketId } = useParams();
  const projects = useSelector(selectProjects);
  const tickets = useSelector(selectTickets);

  const project = projects.find((p) => p._id === (id || projectId));
  const ticket = tickets.find((t) => t._id === ticketId);
  const buildCrumbs = () => {
    const path = location.pathname;
    const crumbs = [
      {
        label: "Home",
        to: "/dashboard",
        icon: <Home className="w-3.5 h-3.5" />,
      },
    ];

    if (path.includes("/projects")) {
      crumbs.push({ label: "Projects", to: "/projects" });
    }

    if (project && (id || projectId)) {
      crumbs.push({
        label: project.title,
        to: `/projects/${project._id}`,
        icon: project.icon,
      });
    }

    if (path.includes("/tickets") && !ticketId) {
      crumbs.push({ label: "Tickets", to: null });
    }

    if (ticketId && ticket) {
      crumbs.push({
        label: "Tickets",
        to: `/projects/${projectId}/tickets`,
      });
      crumbs.push({
        label: `#${ticket.ticketNumber} ${ticket.title}`,
        to: null,
      });
    }

    return crumbs;
  };

  const crumbs = buildCrumbs();

  if (crumbs.length <= 1) return null;

  return (
    <nav className="flex items-center gap-1 text-sm mb-4 flex-wrap">
      {crumbs.map((crumb, index) => (
        <div key={index} className="flex items-center gap-1">
          {index > 0 && (
            <ChevronRight className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
          )}
          {crumb.to ? (
            <Link
              to={crumb.to}
              className="flex items-center gap-1 text-gray-400
                         hover:text-gray-700 transition-colors
                         font-medium truncate max-w-[150px]"
            >
              {crumb.icon && <span>{crumb.icon}</span>}
              <span>{crumb.label}</span>
            </Link>
          ) : (
            <span
              className="flex items-center gap-1 text-gray-700
                             font-medium truncate max-w-[200px]"
            >
              {crumb.icon && <span>{crumb.icon}</span>}
              <span>{crumb.label}</span>
            </span>
          )}
        </div>
      ))}
    </nav>
  );
}

export default Breadcrumbs;
