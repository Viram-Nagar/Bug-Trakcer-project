import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { DashboardSkeleton } from "../components/common/Skeleton";
import PageTransition from "../components/common/PageTransition";
import { motion } from "framer-motion";
import {
  FolderKanban,
  Ticket,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  Users,
  Plus,
} from "lucide-react";
import { selectUser } from "../features/auth/authSlice";
import {
  fetchProjects,
  selectProjects,
  selectProjectLoading,
} from "../features/projects/projectSlice";
import api from "../services/api";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

function StatCard({ label, value, icon: Icon, color, bg }) {
  return (
    <motion.div
      variants={itemVariants}
      className="bg-white rounded-2xl border border-gray-100
                 p-5 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-500">{label}</span>
        <div
          className={`w-10 h-10 ${bg} rounded-xl flex items-center
                        justify-center`}
        >
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </motion.div>
  );
}

function DashboardPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const projects = useSelector(selectProjects);
  const isLoading = useSelector(selectProjectLoading);

  const [allTickets, setAllTickets] = useState([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  useEffect(() => {
    const fetchAllTickets = async () => {
      if (projects.length === 0) return;

      setTicketsLoading(true);
      try {
        const ticketRequests = projects.map((project) =>
          api
            .get(`/tickets/project/${project._id}`)
            .then((res) => res.data?.data?.tickets || [])
            .catch(() => []),
        );

        const results = await Promise.all(ticketRequests);

        const merged = results.flat();
        setAllTickets(merged);
      } catch (error) {
        console.error("Failed to fetch tickets:", error);
        setAllTickets([]);
      } finally {
        setTicketsLoading(false);
      }
    };

    fetchAllTickets();
  }, [projects]);

  const stats = {
    totalProjects: projects.length,
    activeProjects: projects.filter((p) => p.status === "active").length,
    totalTickets: allTickets.length,
    openTickets: allTickets.filter((t) => t.status !== "done").length,
    inProgress: allTickets.filter((t) => t.status === "in-progress").length,
    inReview: allTickets.filter((t) => t.status === "in-review").length,
    done: allTickets.filter((t) => t.status === "done").length,
    todo: allTickets.filter((t) => t.status === "todo").length,
    critical: allTickets.filter(
      (t) => t.priority === "critical" && t.status !== "done",
    ).length,
    high: allTickets.filter((t) => t.priority === "high").length,
    medium: allTickets.filter((t) => t.priority === "medium").length,
    low: allTickets.filter((t) => t.priority === "low").length,
  };

  const recentProjects = [...projects]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 4);

  const recentTickets = [...allTickets]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const statusColors = {
    active: "bg-emerald-100 text-emerald-700",
    "on-hold": "bg-amber-100 text-amber-700",
    completed: "bg-blue-100 text-blue-700",
  };

  const priorityColors = {
    critical: "text-red-600 bg-red-50 border-red-100",
    high: "text-orange-600 bg-orange-50 border-orange-100",
    medium: "text-yellow-600 bg-yellow-50 border-yellow-100",
    low: "text-green-600 bg-green-50 border-green-100",
  };

  const statusDot = {
    todo: "bg-gray-400",
    "in-progress": "bg-blue-500",
    "in-review": "bg-purple-500",
    done: "bg-emerald-500",
  };

  if (isLoading && projects.length === 0) {
    return <DashboardSkeleton />;
  }

  return (
    <PageTransition>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="max-w-7xl mx-auto space-y-6"
      >
        {/* ── Welcome Banner ──────────────────────────── */}
        <motion.div
          variants={itemVariants}
          className="bg-gradient-to-br from-blue-600 to-indigo-700
                     rounded-2xl p-6 md:p-8 text-white shadow-lg
                     shadow-blue-200 relative overflow-hidden"
        >
          <div
            className="absolute top-0 right-0 w-64 h-64
                          bg-white/5 rounded-full
                          -translate-y-32 translate-x-32"
          />
          <div
            className="absolute bottom-0 left-0 w-48 h-48
                          bg-white/5 rounded-full
                          translate-y-24 -translate-x-24"
          />

          <div
            className="relative flex flex-col sm:flex-row
                          sm:items-center justify-between gap-4"
          >
            <div>
              <p className="text-blue-200 text-sm font-medium mb-1">
                {getGreeting()} 👋
              </p>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">
                {user?.name}
              </h1>
              <p className="text-blue-200 text-sm">
                You have{" "}
                <span className="text-white font-semibold">
                  {stats.openTickets} open ticket
                  {stats.openTickets !== 1 ? "s" : ""}
                </span>{" "}
                across{" "}
                <span className="text-white font-semibold">
                  {stats.activeProjects} active project
                  {stats.activeProjects !== 1 ? "s" : ""}
                </span>
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/projects")}
              className="flex items-center gap-2 bg-white text-blue-600
                         font-semibold px-5 py-2.5 rounded-xl shadow-sm
                         hover:shadow-md transition-all self-start
                         sm:self-auto text-sm"
            >
              <Plus className="w-4 h-4" />
              New Project
            </motion.button>
          </div>
        </motion.div>

        {/* ── Stats Grid ──────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Projects"
            value={stats.totalProjects}
            icon={FolderKanban}
            color="text-blue-600"
            bg="bg-blue-50"
          />
          <StatCard
            label="Open Tickets"
            value={ticketsLoading ? "..." : stats.openTickets}
            icon={Ticket}
            color="text-orange-600"
            bg="bg-orange-50"
          />
          <StatCard
            label="In Progress"
            value={ticketsLoading ? "..." : stats.inProgress}
            icon={TrendingUp}
            color="text-purple-600"
            bg="bg-purple-50"
          />
          <StatCard
            label="Critical Issues"
            value={ticketsLoading ? "..." : stats.critical}
            icon={AlertCircle}
            color="text-red-600"
            bg="bg-red-50"
          />
        </div>

        {/* ── Bottom Grid ─────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Projects */}
          <motion.div
            variants={itemVariants}
            className="bg-white rounded-2xl border border-gray-100
                       shadow-sm overflow-hidden"
          >
            <div
              className="flex items-center justify-between p-5
                            border-b border-gray-50"
            >
              <h2
                className="font-bold text-gray-900
                             flex items-center gap-2"
              >
                <FolderKanban className="w-4 h-4 text-blue-500" />
                Recent Projects
              </h2>
              <button
                onClick={() => navigate("/projects")}
                className="text-sm text-blue-600 hover:text-blue-700
                           font-medium flex items-center gap-1
                           transition-colors"
              >
                View all
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {recentProjects.length === 0 ? (
              <div className="p-8 text-center">
                <FolderKanban
                  className="w-10 h-10 text-gray-200
                                         mx-auto mb-2"
                />
                <p className="text-gray-400 text-sm mb-3">No projects yet</p>
                <button
                  onClick={() => navigate("/projects")}
                  className="text-blue-600 text-sm font-medium
                             hover:underline"
                >
                  Create your first project
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {recentProjects.map((project) => (
                  <motion.div
                    key={project._id}
                    whileHover={{ backgroundColor: "#f9fafb" }}
                    onClick={() => navigate(`/projects/${project._id}`)}
                    className="flex items-center gap-4 p-4
                               cursor-pointer transition-colors"
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center
                                 justify-center text-xl flex-shrink-0"
                      style={{
                        backgroundColor: project.color + "20",
                      }}
                    >
                      {project.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className="font-semibold text-gray-900
                                    text-sm truncate"
                      >
                        {project.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Users className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-400">
                          {project.members?.length} member
                          {project.members?.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>
                    <div
                      className="flex items-center gap-2
                                    flex-shrink-0"
                    >
                      <span
                        className={`text-xs font-medium px-2
                                       py-0.5 rounded-full hidden
                                       sm:inline-flex
                                       ${statusColors[project.status]}`}
                      >
                        {project.status}
                      </span>
                      <ArrowRight className="w-4 h-4 text-gray-300" />
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Ticket Overview */}
          <motion.div
            variants={itemVariants}
            className="bg-white rounded-2xl border border-gray-100
                       shadow-sm overflow-hidden"
          >
            <div className="p-5 border-b border-gray-50">
              <h2
                className="font-bold text-gray-900
                             flex items-center gap-2"
              >
                <TrendingUp className="w-4 h-4 text-blue-500" />
                Ticket Overview
              </h2>
            </div>

            <div className="p-5 space-y-4">
              {ticketsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="space-y-1.5">
                      <div className="flex justify-between">
                        <div
                          className="h-4 w-20 bg-gray-100
                                        rounded animate-pulse"
                        />
                        <div
                          className="h-4 w-12 bg-gray-100
                                        rounded animate-pulse"
                        />
                      </div>
                      <div
                        className="h-2 w-full bg-gray-100
                                      rounded-full animate-pulse"
                      />
                    </div>
                  ))}
                </div>
              ) : stats.totalTickets === 0 ? (
                <div className="text-center py-6">
                  <Ticket
                    className="w-10 h-10 text-gray-200
                                     mx-auto mb-2"
                  />
                  <p className="text-gray-400 text-sm">No tickets yet</p>
                  <p className="text-gray-300 text-xs mt-1">
                    Open a project and create tickets
                  </p>
                </div>
              ) : (
                [
                  {
                    label: "To Do",
                    value: stats.todo,
                    color: "bg-gray-400",
                    textColor: "text-gray-600",
                  },
                  {
                    label: "In Progress",
                    value: stats.inProgress,
                    color: "bg-blue-500",
                    textColor: "text-blue-600",
                  },
                  {
                    label: "In Review",
                    value: stats.inReview,
                    color: "bg-purple-500",
                    textColor: "text-purple-600",
                  },
                  {
                    label: "Done",
                    value: stats.done,
                    color: "bg-emerald-500",
                    textColor: "text-emerald-600",
                  },
                ].map((item) => {
                  const pct =
                    stats.totalTickets > 0
                      ? Math.round((item.value / stats.totalTickets) * 100)
                      : 0;

                  return (
                    <div key={item.label}>
                      <div
                        className="flex items-center
                                      justify-between mb-1.5"
                      >
                        <span
                          className="text-sm font-medium
                                         text-gray-700"
                        >
                          {item.label}
                        </span>
                        <span
                          className={`text-sm font-bold
                                         ${item.textColor}`}
                        >
                          {item.value}
                          <span
                            className="text-gray-400
                                           font-normal ml-1"
                          >
                            ({pct}%)
                          </span>
                        </span>
                      </div>
                      <div
                        className="h-2 bg-gray-100 rounded-full
                                      overflow-hidden"
                      >
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{
                            duration: 0.8,
                            ease: "easeOut",
                          }}
                          className={`h-full ${item.color}
                                     rounded-full`}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Priority Breakdown */}
            {!ticketsLoading && stats.totalTickets > 0 && (
              <div className="px-5 pb-5">
                <div className="pt-4 border-t border-gray-50">
                  <p
                    className="text-xs font-semibold text-gray-400
                                uppercase tracking-wider mb-3"
                  >
                    By Priority
                  </p>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      {
                        label: "Critical",
                        value: stats.critical,
                        color: priorityColors.critical,
                      },
                      {
                        label: "High",
                        value: stats.high,
                        color: priorityColors.high,
                      },
                      {
                        label: "Medium",
                        value: stats.medium,
                        color: priorityColors.medium,
                      },
                      {
                        label: "Low",
                        value: stats.low,
                        color: priorityColors.low,
                      },
                    ].map((p) => (
                      <div
                        key={p.label}
                        className={`border rounded-xl p-2 text-center
                                   ${p.color}`}
                      >
                        <p className="text-lg font-bold">{p.value}</p>
                        <p className="text-xs font-medium opacity-80">
                          {p.label}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* ── Recent Tickets ───────────────────────────── */}
        {!ticketsLoading && recentTickets.length > 0 && (
          <motion.div
            variants={itemVariants}
            className="bg-white rounded-2xl border border-gray-100
                       shadow-sm overflow-hidden"
          >
            <div
              className="flex items-center justify-between p-5
                            border-b border-gray-50"
            >
              <h2
                className="font-bold text-gray-900
                             flex items-center gap-2"
              >
                <Ticket className="w-4 h-4 text-blue-500" />
                Recent Tickets
              </h2>
            </div>

            <div className="divide-y divide-gray-50">
              {recentTickets.map((ticket) => {
                const ticketProject = projects.find(
                  (p) =>
                    p._id === ticket.project?._id || p._id === ticket.project,
                );

                return (
                  <motion.div
                    key={ticket._id}
                    whileHover={{ backgroundColor: "#f9fafb" }}
                    onClick={() =>
                      navigate(
                        `/projects/${ticketProject?._id || ticket.project}/tickets/${ticket._id}`,
                      )
                    }
                    className="flex items-center gap-4 p-4
                               cursor-pointer transition-colors"
                  >
                    {/* Type emoji */}
                    <span className="text-xl flex-shrink-0">
                      {ticket.type === "bug"
                        ? "🐛"
                        : ticket.type === "feature"
                          ? "✨"
                          : ticket.type === "improvement"
                            ? "⚡"
                            : "📋"}
                    </span>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-sm font-semibold
                                    text-gray-900 truncate"
                      >
                        {ticket.title}
                      </p>
                      <div
                        className="flex items-center gap-2 mt-0.5
                                      flex-wrap"
                      >
                        {ticketProject && (
                          <span className="text-xs text-gray-400">
                            {ticketProject.icon} {ticketProject.title}
                          </span>
                        )}
                        <span className="text-xs text-gray-300">·</span>
                        <span className="text-xs text-gray-400">
                          #{ticket.ticketNumber}
                        </span>
                      </div>
                    </div>

                    {/* Priority + Status */}
                    <div
                      className="flex items-center gap-2
                                    flex-shrink-0"
                    >
                      <span
                        className={`text-xs font-medium px-2
                                       py-0.5 rounded-full border
                                       hidden sm:inline-flex
                                       ${priorityColors[ticket.priority]}`}
                      >
                        {ticket.priority}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full
                          ${statusDot[ticket.status]}`}
                        />
                        <span
                          className="text-xs text-gray-500
                                         hidden md:inline"
                        >
                          {ticket.status === "in-progress"
                            ? "In Progress"
                            : ticket.status === "in-review"
                              ? "In Review"
                              : ticket.status === "todo"
                                ? "To Do"
                                : "Done"}
                        </span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-300" />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </motion.div>
    </PageTransition>
  );
}

export default DashboardPage;
