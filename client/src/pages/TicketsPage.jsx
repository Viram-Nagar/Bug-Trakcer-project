import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { TicketCardSkeleton } from "../components/common/Skeleton";
import {
  Plus,
  Search,
  X,
  Ticket,
  Loader2,
  ArrowLeft,
  LayoutGrid,
  ChevronUp,
  ChevronDown,
  ArrowUpDown,
  SlidersHorizontal,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  fetchTickets,
  selectTickets,
  selectTicketLoading,
  selectTicketError,
  selectTicketFilters,
  setFilters,
  clearFilters,
  clearTicketError,
  clearTickets,
} from "../features/tickets/ticketSlice";
import {
  selectProjects,
  fetchProjects,
} from "../features/projects/projectSlice";
import TicketCard from "../components/tickets/TicketCard";
import CreateTicketModal from "../components/tickets/CreateTicketModal";
import PageTransition from "../components/common/PageTransition";

// ── Priority sort weight ──────────────────────────────
const PRIORITY_WEIGHT = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

// ── Filter Chip ───────────────────────────────────────
function FilterChip({ label, value, onRemove }) {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="flex items-center gap-1.5 bg-blue-50 text-blue-700
                 text-xs font-medium px-2.5 py-1.5 rounded-full
                 border border-blue-100"
    >
      <span className="text-blue-400 text-xs">{label}:</span>
      {value}
      <button
        onClick={onRemove}
        className="hover:text-red-500 transition-colors ml-0.5"
      >
        <X className="w-3 h-3" />
      </button>
    </motion.span>
  );
}

// ── Sort Button ───────────────────────────────────────
function SortButton({ label, field, currentSortBy, currentOrder, onSort }) {
  const isActive = currentSortBy === field;

  return (
    <button
      onClick={() => onSort(field)}
      className={`flex items-center gap-1 text-xs font-medium px-2.5
                 py-1.5 rounded-lg transition-all
                 ${
                   isActive
                     ? "bg-blue-50 text-blue-600 border border-blue-200"
                     : "text-gray-500 hover:bg-gray-50 border border-transparent"
                 }`}
    >
      {label}
      {isActive ? (
        currentOrder === "desc" ? (
          <ChevronDown className="w-3 h-3" />
        ) : (
          <ChevronUp className="w-3 h-3" />
        )
      ) : (
        <ArrowUpDown className="w-3 h-3 opacity-40" />
      )}
    </button>
  );
}

// ── Main Component ────────────────────────────────────
function TicketsPage() {
  const { projectId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const tickets = useSelector(selectTickets);
  const isLoading = useSelector(selectTicketLoading);
  const error = useSelector(selectTicketError);
  const filters = useSelector(selectTicketFilters);
  const projects = useSelector(selectProjects);

  const project = projects.find((p) => p._id === projectId);
  const members = project?.members || [];

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // ── Data Fetching ─────────────────────────────────

  useEffect(() => {
    if (projects.length === 0) dispatch(fetchProjects());
  }, [dispatch, projects.length]);

  useEffect(() => {
    if (projectId) {
      dispatch(fetchTickets({ projectId, filters }));
    }
  }, [dispatch, projectId, filters]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearTicketError());
    }
  }, [error, dispatch]);

  // Clear on unmount
  useEffect(() => {
    return () => {
      dispatch(clearTickets());
      dispatch(clearFilters());
    };
  }, [dispatch]);

  // ── Debounced Search ─────────────────────────────

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(setFilters({ search: searchInput }));
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput, dispatch]);

  // ── Handlers ─────────────────────────────────────

  const handleFilterChange = (key, value) => {
    dispatch(setFilters({ [key]: value }));
  };

  const handleClearFilters = () => {
    dispatch(clearFilters());
    setSearchInput("");
  };

  const handleSort = (field) => {
    if (filters.sortBy === field) {
      // Toggle order if same field
      dispatch(
        setFilters({
          order: filters.order === "desc" ? "asc" : "desc",
        }),
      );
    } else {
      dispatch(setFilters({ sortBy: field, order: "desc" }));
    }
  };

  // ── Priority sort on frontend ─────────────────────
  const sortedTickets = [...tickets].sort((a, b) => {
    if (filters.sortBy === "priority") {
      const diff = PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority];
      return filters.order === "desc" ? diff : -diff;
    }
    return 0; // backend handles other sorts
  });

  // ── Active filter chips data ──────────────────────
  const activeFilters = [
    filters.status && {
      key: "status",
      label: "Status",
      value: filters.status,
    },
    filters.priority && {
      key: "priority",
      label: "Priority",
      value: filters.priority,
    },
    filters.type && {
      key: "type",
      label: "Type",
      value: filters.type,
    },
    filters.assignee && {
      key: "assignee",
      label: "Assignee",
      value:
        filters.assignee === "unassigned"
          ? "Unassigned"
          : members.find((m) => m.user?._id === filters.assignee)?.user?.name ||
            filters.assignee,
    },
    filters.search && {
      key: "search",
      label: "Search",
      value: `"${filters.search}"`,
    },
  ].filter(Boolean);

  const hasActiveFilters = activeFilters.length > 0;

  // ── Stats ─────────────────────────────────────────
  const stats = {
    total: tickets.length,
    todo: tickets.filter((t) => t.status === "todo").length,
    inProgress: tickets.filter((t) => t.status === "in-progress").length,
    done: tickets.filter((t) => t.status === "done").length,
  };

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(`/projects/${projectId}`)}
          className="flex items-center gap-2 text-gray-500
                     hover:text-gray-900 mb-6 transition-colors group"
        >
          <ArrowLeft
            className="w-4 h-4 group-hover:-translate-x-1
                                transition-transform duration-200"
          />
          <span className="text-sm font-medium">
            Back to {project?.title || "Project"}
          </span>
        </motion.button>

        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start justify-between mb-6 flex-wrap gap-4"
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">{project?.icon || "🎫"}</span>
              <h1 className="text-2xl font-bold text-gray-900">Tickets</h1>
            </div>
            <p className="text-gray-500 text-sm">
              {project?.title} · {tickets.length} ticket
              {tickets.length !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Board View */}
            <button
              onClick={() => navigate(`/projects/${projectId}/kanban`)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl
                         border border-gray-200 text-gray-600
                         hover:bg-purple-50 hover:text-purple-600
                         hover:border-purple-200 transition-all
                         text-sm font-medium"
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">Board</span>
            </button>

            {/* New Ticket */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsCreateModalOpen(true)}
              className="btn-primary flex items-center gap-2
                         px-4 py-2.5"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Ticket</span>
              <span className="sm:hidden">New</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.05 }}
          className="grid grid-cols-4 gap-3 mb-5"
        >
          {[
            {
              label: "Total",
              value: stats.total,
              color: "text-gray-700",
              bg: "bg-white border border-gray-100",
            },
            {
              label: "To Do",
              value: stats.todo,
              color: "text-gray-600",
              bg: "bg-gray-50 border border-gray-100",
            },
            {
              label: "In Progress",
              value: stats.inProgress,
              color: "text-blue-600",
              bg: "bg-blue-50 border border-blue-100",
            },
            {
              label: "Done",
              value: stats.done,
              color: "text-emerald-600",
              bg: "bg-emerald-50 border border-emerald-100",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className={`${stat.bg} rounded-xl p-3 text-center
                         shadow-sm`}
            >
              <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Search + Filter Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl border border-gray-100
                     shadow-sm mb-4"
        >
          {/* Top Row — Search + Toggle */}
          <div className="flex gap-3 p-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2
                                 -translate-y-1/2 w-4 h-4 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search by title, description or tag..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="input-field pl-10 py-2 text-sm"
              />
              {searchInput && (
                <button
                  onClick={() => {
                    setSearchInput("");
                    dispatch(setFilters({ search: "" }));
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2
                             text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filter Toggle Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl
                         border text-sm font-medium transition-all
                         ${
                           showFilters || hasActiveFilters
                             ? "bg-blue-50 text-blue-600 border-blue-200"
                             : "border-gray-200 text-gray-600 hover:bg-gray-50"
                         }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline">Filters</span>
              {hasActiveFilters && (
                <span
                  className="bg-blue-600 text-white text-xs
                                 rounded-full w-5 h-5 flex items-center
                                 justify-center font-bold"
                >
                  {activeFilters.length}
                </span>
              )}
            </button>
          </div>

          {/* Expandable Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden border-t border-gray-100"
              >
                <div
                  className="p-3 grid grid-cols-2 md:grid-cols-4
                                gap-3"
                >
                  {/* Status */}
                  <div>
                    <label
                      className="block text-xs font-medium
                                      text-gray-500 mb-1.5"
                    >
                      Status
                    </label>
                    <select
                      value={filters.status}
                      onChange={(e) =>
                        handleFilterChange("status", e.target.value)
                      }
                      className="input-field py-2 text-sm"
                    >
                      <option value="">All Status</option>
                      <option value="todo">To Do</option>
                      <option value="in-progress">In Progress</option>
                      <option value="in-review">In Review</option>
                      <option value="done">Done</option>
                    </select>
                  </div>

                  {/* Priority */}
                  <div>
                    <label
                      className="block text-xs font-medium
                                      text-gray-500 mb-1.5"
                    >
                      Priority
                    </label>
                    <select
                      value={filters.priority}
                      onChange={(e) =>
                        handleFilterChange("priority", e.target.value)
                      }
                      className="input-field py-2 text-sm"
                    >
                      <option value="">All Priority</option>
                      <option value="critical">🔴 Critical</option>
                      <option value="high">🟠 High</option>
                      <option value="medium">🟡 Medium</option>
                      <option value="low">🟢 Low</option>
                    </select>
                  </div>

                  {/* Type */}
                  <div>
                    <label
                      className="block text-xs font-medium
                                      text-gray-500 mb-1.5"
                    >
                      Type
                    </label>
                    <select
                      value={filters.type}
                      onChange={(e) =>
                        handleFilterChange("type", e.target.value)
                      }
                      className="input-field py-2 text-sm"
                    >
                      <option value="">All Types</option>
                      <option value="bug">🐛 Bug</option>
                      <option value="feature">✨ Feature</option>
                      <option value="improvement">⚡ Improvement</option>
                      <option value="task">📋 Task</option>
                    </select>
                  </div>

                  {/* Assignee ← NEW properly wired */}
                  <div>
                    <label
                      className="block text-xs font-medium
                                      text-gray-500 mb-1.5"
                    >
                      Assignee
                    </label>
                    <select
                      value={filters.assignee}
                      onChange={(e) =>
                        handleFilterChange("assignee", e.target.value)
                      }
                      className="input-field py-2 text-sm"
                    >
                      <option value="">All Members</option>
                      <option value="unassigned">Unassigned</option>
                      {members.map((member) => (
                        <option key={member.user?._id} value={member.user?._id}>
                          {member.user?.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Clear All */}
                {hasActiveFilters && (
                  <div className="px-3 pb-3">
                    <button
                      onClick={handleClearFilters}
                      className="text-xs text-red-500 hover:text-red-700
                                 font-medium flex items-center gap-1
                                 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                      Clear all filters
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Active Filter Chips */}
        <AnimatePresence>
          {hasActiveFilters && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="flex flex-wrap gap-2 mb-4"
            >
              {activeFilters.map((f) => (
                <FilterChip
                  key={f.key}
                  label={f.label}
                  value={f.value}
                  onRemove={() => {
                    handleFilterChange(f.key, "");
                    if (f.key === "search") setSearchInput("");
                  }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sort Controls */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className="text-xs text-gray-400 font-medium">Sort by:</span>
          {[
            { label: "Date", field: "createdAt" },
            { label: "Updated", field: "updatedAt" },
            { label: "Priority", field: "priority" },
            { label: "Status", field: "status" },
            { label: "Ticket #", field: "ticketNumber" },
          ].map((sort) => (
            <SortButton
              key={sort.field}
              label={sort.label}
              field={sort.field}
              currentSortBy={filters.sortBy}
              currentOrder={filters.order}
              onSort={handleSort}
            />
          ))}
        </div>

        {/* Results count */}
        {hasActiveFilters && (
          <p className="text-sm text-gray-500 mb-4">
            Showing{" "}
            <span className="font-semibold text-gray-900">
              {tickets.length}
            </span>{" "}
            result{tickets.length !== 1 ? "s" : ""}
          </p>
        )}

        {/* Ticket Grid */}
        {isLoading ? (
          <div
            className="grid grid-cols-1 md:grid-cols-2
                  xl:grid-cols-3 gap-4"
          >
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <TicketCardSkeleton key={i} />
            ))}
          </div>
        ) : sortedTickets.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center
                       py-20 text-center"
          >
            <div
              className="w-20 h-20 bg-blue-50 rounded-2xl flex
                            items-center justify-center mb-4"
            >
              <Ticket className="w-10 h-10 text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {hasActiveFilters
                ? "No tickets match your filters"
                : "No tickets yet"}
            </h3>
            <p className="text-gray-400 mb-6 max-w-sm text-sm">
              {hasActiveFilters
                ? "Try adjusting or clearing your filters"
                : "Create your first ticket to start tracking issues"}
            </p>
            {hasActiveFilters ? (
              <button
                onClick={handleClearFilters}
                className="btn-secondary flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Clear Filters
              </button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsCreateModalOpen(true)}
                className="btn-primary flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create First Ticket
              </motion.button>
            )}
          </motion.div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2
                       xl:grid-cols-3 gap-4"
          >
            <AnimatePresence>
              {sortedTickets.map((ticket, index) => (
                <TicketCard
                  key={ticket._id}
                  ticket={ticket}
                  index={index}
                  members={members}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Create Ticket Modal */}
      <CreateTicketModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        projectId={projectId}
        members={members}
      />
    </PageTransition>
  );
}

export default TicketsPage;

// import { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { useDispatch, useSelector } from "react-redux";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   Plus,
//   Search,
//   X,
//   Ticket,
//   Loader2,
//   ArrowLeft,
//   LayoutGrid,
// } from "lucide-react";
// import toast from "react-hot-toast";
// import {
//   fetchTickets,
//   selectTickets,
//   selectTicketLoading,
//   selectTicketError,
//   selectTicketFilters,
//   setFilters,
//   clearFilters,
//   clearTicketError,
//   clearTickets,
// } from "../features/tickets/ticketSlice";
// import {
//   selectProjects,
//   fetchProjects,
// } from "../features/projects/projectSlice";
// import TicketCard from "../components/tickets/TicketCard";
// import CreateTicketModal from "../components/tickets/CreateTicketModal";

// function TicketsPage() {
//   const { projectId } = useParams();
//   const dispatch = useDispatch();
//   const navigate = useNavigate();

//   const tickets = useSelector(selectTickets);
//   const isLoading = useSelector(selectTicketLoading);
//   const error = useSelector(selectTicketError);
//   const filters = useSelector(selectTicketFilters);
//   const projects = useSelector(selectProjects);

//   const project = projects.find((p) => p._id === projectId);

//   const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
//   const [searchInput, setSearchInput] = useState("");

//   // Fetch projects if not loaded yet
//   useEffect(() => {
//     if (projects.length === 0) {
//       dispatch(fetchProjects());
//     }
//   }, [dispatch, projects.length]);

//   // Fetch tickets when projectId or filters change
//   useEffect(() => {
//     if (projectId) {
//       dispatch(fetchTickets({ projectId, filters }));
//     }
//   }, [dispatch, projectId, filters]);

//   // Show error toast
//   useEffect(() => {
//     if (error) {
//       toast.error(error);
//       dispatch(clearTicketError());
//     }
//   }, [error, dispatch]);

//   // Debounce search
//   useEffect(() => {
//     const timer = setTimeout(() => {
//       dispatch(setFilters({ search: searchInput }));
//     }, 500);
//     return () => clearTimeout(timer);
//   }, [searchInput, dispatch]);

//   useEffect(() => {
//     return () => {
//       dispatch(clearTickets()); // clear on unmount
//       dispatch(clearFilters()); // clear filters too
//     };
//   }, [dispatch]);

//   const handleFilterChange = (key, value) => {
//     dispatch(setFilters({ [key]: value }));
//   };

//   const handleClearFilters = () => {
//     dispatch(clearFilters());
//     setSearchInput("");
//   };

//   const hasActiveFilters =
//     filters.status || filters.priority || filters.type || filters.search;

//   const stats = {
//     total: tickets.length,
//     todo: tickets.filter((t) => t.status === "todo").length,
//     inProgress: tickets.filter((t) => t.status === "in-progress").length,
//     done: tickets.filter((t) => t.status === "done").length,
//   };

//   return (
//     <>
//       <div className="p-6 max-w-7xl mx-auto">
//         {/* ── Back Button ────────────────────────── */}
//         <motion.button
//           initial={{ opacity: 0, x: -10 }}
//           animate={{ opacity: 1, x: 0 }}
//           onClick={() => navigate(`/projects/${projectId}`)}
//           className="flex items-center gap-2 text-gray-500
//                      hover:text-gray-900 mb-6 transition-colors group"
//         >
//           <ArrowLeft
//             className="w-4 h-4 group-hover:-translate-x-1
//                                 transition-transform duration-200"
//           />
//           <span className="text-sm font-medium">
//             Back to {project?.title || "Project"}
//           </span>
//         </motion.button>

//         {/* ── Page Header ─────────────────────────── */}
//         <motion.div
//           initial={{ opacity: 0, y: -20 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="flex items-start justify-between mb-6"
//         >
//           <div>
//             <div className="flex items-center gap-2 mb-1">
//               <span className="text-2xl">{project?.icon || "🎫"}</span>
//               <h1 className="text-2xl font-bold text-gray-900">
//                 {project?.title || "Tickets"}
//               </h1>
//             </div>
//             <p className="text-gray-500 text-sm">Manage and track all issues</p>
//           </div>

//           <div className="flex items-center gap-2">
//             <button
//               onClick={() => navigate(`/projects/${projectId}/kanban`)}
//               className="flex items-center gap-2 px-4 py-2.5 rounded-xl
//                border border-gray-200 text-gray-600
//                hover:bg-purple-50 hover:text-purple-600
//                hover:border-purple-200 transition-all
//                text-sm font-medium"
//             >
//               <LayoutGrid className="w-4 h-4" />
//               <span className="hidden sm:inline">Board View</span>
//             </button>

//             <motion.button
//               whileHover={{ scale: 1.02 }}
//               whileTap={{ scale: 0.98 }}
//               onClick={() => setIsCreateModalOpen(true)}
//               className="btn-primary flex items-center gap-2 px-5 py-2.5"
//             >
//               <Plus className="w-4 h-4" />
//               <span className="hidden sm:inline">New Ticket</span>
//               <span className="sm:hidden">New</span>
//             </motion.button>
//           </div>

//           {/* <motion.button
//             whileHover={{ scale: 1.02 }}
//             whileTap={{ scale: 0.98 }}
//             onClick={() => setIsCreateModalOpen(true)}
//             className="btn-primary flex items-center gap-2 px-5 py-2.5"
//           >
//             <Plus className="w-4 h-4" />
//             New Ticket
//           </motion.button> */}
//         </motion.div>

//         {/* ── Stats Bar ───────────────────────────── */}
//         <motion.div
//           initial={{ opacity: 0, y: -10 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.05 }}
//           className="grid grid-cols-4 gap-4 mb-6"
//         >
//           {[
//             {
//               label: "Total",
//               value: stats.total,
//               color: "text-gray-700",
//               bg: "bg-gray-50",
//             },
//             {
//               label: "To Do",
//               value: stats.todo,
//               color: "text-gray-600",
//               bg: "bg-gray-100",
//             },
//             {
//               label: "In Progress",
//               value: stats.inProgress,
//               color: "text-blue-600",
//               bg: "bg-blue-50",
//             },
//             {
//               label: "Done",
//               value: stats.done,
//               color: "text-emerald-600",
//               bg: "bg-emerald-50",
//             },
//           ].map((stat) => (
//             <div
//               key={stat.label}
//               className={`${stat.bg} rounded-xl p-4 text-center`}
//             >
//               <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
//               <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
//             </div>
//           ))}
//         </motion.div>

//         {/* ── Search + Filters ────────────────────── */}
//         <motion.div
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           transition={{ delay: 0.1 }}
//           className="bg-white rounded-xl border border-gray-100
//                      p-4 mb-6 shadow-sm"
//         >
//           <div className="flex flex-wrap gap-3">
//             {/* Search */}
//             <div className="relative flex-1 min-w-[200px]">
//               <Search
//                 className="absolute left-3 top-1/2 -translate-y-1/2
//                                  w-4 h-4 text-gray-400"
//               />
//               <input
//                 type="text"
//                 placeholder="Search tickets..."
//                 value={searchInput}
//                 onChange={(e) => setSearchInput(e.target.value)}
//                 className="input-field pl-10 py-2"
//               />
//             </div>

//             {/* Status */}
//             <select
//               value={filters.status}
//               onChange={(e) => handleFilterChange("status", e.target.value)}
//               className="input-field w-auto py-2"
//             >
//               <option value="">All Status</option>
//               <option value="todo">To Do</option>
//               <option value="in-progress">In Progress</option>
//               <option value="in-review">In Review</option>
//               <option value="done">Done</option>
//             </select>

//             {/* Priority */}
//             <select
//               value={filters.priority}
//               onChange={(e) => handleFilterChange("priority", e.target.value)}
//               className="input-field w-auto py-2"
//             >
//               <option value="">All Priority</option>
//               <option value="low">🟢 Low</option>
//               <option value="medium">🟡 Medium</option>
//               <option value="high">🟠 High</option>
//               <option value="critical">🔴 Critical</option>
//             </select>

//             {/* Type */}
//             <select
//               value={filters.type}
//               onChange={(e) => handleFilterChange("type", e.target.value)}
//               className="input-field w-auto py-2"
//             >
//               <option value="">All Types</option>
//               <option value="bug">🐛 Bug</option>
//               <option value="feature">✨ Feature</option>
//               <option value="improvement">⚡ Improvement</option>
//               <option value="task">📋 Task</option>
//             </select>

//             {/* Clear */}
//             {hasActiveFilters && (
//               <motion.button
//                 initial={{ opacity: 0, scale: 0.9 }}
//                 animate={{ opacity: 1, scale: 1 }}
//                 onClick={handleClearFilters}
//                 className="flex items-center gap-1.5 px-3 py-2 rounded-lg
//                            text-sm text-red-500 hover:bg-red-50
//                            transition-colors border border-red-100"
//               >
//                 <X className="w-4 h-4" />
//                 Clear
//               </motion.button>
//             )}
//           </div>
//         </motion.div>

//         {/* ── Ticket Grid ─────────────────────────── */}
//         {isLoading ? (
//           <div className="flex items-center justify-center py-20">
//             <motion.div
//               animate={{ rotate: 360 }}
//               transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
//             >
//               <Loader2 className="w-10 h-10 text-blue-500" />
//             </motion.div>
//           </div>
//         ) : tickets.length === 0 ? (
//           <motion.div
//             initial={{ opacity: 0, scale: 0.95 }}
//             animate={{ opacity: 1, scale: 1 }}
//             className="flex flex-col items-center justify-center
//                        py-20 text-center"
//           >
//             <div
//               className="w-20 h-20 bg-blue-50 rounded-2xl flex
//                             items-center justify-center mb-4"
//             >
//               <Ticket className="w-10 h-10 text-blue-400" />
//             </div>
//             <h3 className="text-xl font-semibold text-gray-700 mb-2">
//               {hasActiveFilters ? "No tickets match filters" : "No tickets yet"}
//             </h3>
//             <p className="text-gray-400 mb-6 max-w-sm">
//               {hasActiveFilters
//                 ? "Try adjusting or clearing your filters"
//                 : "Create your first ticket to start tracking issues"}
//             </p>
//             {!hasActiveFilters && (
//               <motion.button
//                 whileHover={{ scale: 1.02 }}
//                 whileTap={{ scale: 0.98 }}
//                 onClick={() => setIsCreateModalOpen(true)}
//                 className="btn-primary flex items-center gap-2"
//               >
//                 <Plus className="w-4 h-4" />
//                 Create First Ticket
//               </motion.button>
//             )}
//           </motion.div>
//         ) : (
//           <motion.div
//             layout
//             className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
//           >
//             <AnimatePresence>
//               {tickets.map((ticket, index) => (
//                 <TicketCard
//                   key={ticket._id}
//                   ticket={ticket}
//                   index={index}
//                   members={project?.members || []} // ← pass members
//                 />
//               ))}
//             </AnimatePresence>
//           </motion.div>
//         )}
//       </div>

//       {/* Create Ticket Modal */}
//       <CreateTicketModal
//         isOpen={isCreateModalOpen}
//         onClose={() => setIsCreateModalOpen(false)}
//         projectId={projectId}
//         members={project?.members || []}
//       />
//     </>
//   );
// }

// export default TicketsPage;

// // import { useEffect, useState } from "react";
// // import { useParams } from "react-router-dom";
// // import { useDispatch, useSelector } from "react-redux";
// // import { motion, AnimatePresence } from "framer-motion";
// // import {
// //   Plus,
// //   Search,
// //   Filter,
// //   X,
// //   Ticket,
// //   Loader2,
// //   LayoutGrid,
// //   List,
// // } from "lucide-react";
// // import toast from "react-hot-toast";
// // import {
// //   fetchTickets,
// //   selectTickets,
// //   selectTicketLoading,
// //   selectTicketError,
// //   selectTicketFilters,
// //   setFilters,
// //   clearFilters,
// //   clearTicketError,
// //   deleteTicket,
// // } from "../features/tickets/ticketSlice";
// // import { selectProjects } from "../features/projects/projectSlice";
// // import TicketCard from "../components/tickets/TicketCard";
// // import CreateTicketModal from "../components/tickets/CreateTicketModal";
// // import ConfirmModal from "../components/common/ConfirmModal";

// // function TicketsPage() {
// //   const { projectId } = useParams();
// //   const dispatch = useDispatch();

// //   const tickets = useSelector(selectTickets);
// //   const isLoading = useSelector(selectTicketLoading);
// //   const error = useSelector(selectTicketError);
// //   const filters = useSelector(selectTicketFilters);
// //   const projects = useSelector(selectProjects);

// //   const project = projects.find((p) => p._id === projectId);

// //   const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
// //   const [deleteId, setDeleteId] = useState(null);
// //   const [isDeleting, setIsDeleting] = useState(false);
// //   const [searchInput, setSearchInput] = useState("");

// //   // Fetch tickets when projectId or filters change
// //   useEffect(() => {
// //     if (projectId) {
// //       dispatch(fetchTickets({ projectId, filters }));
// //     }
// //   }, [dispatch, projectId, filters]);

// //   // Show error toast
// //   useEffect(() => {
// //     if (error) {
// //       toast.error(error);
// //       dispatch(clearTicketError());
// //     }
// //   }, [error, dispatch]);

// //   // Debounce search — wait 500ms after typing
// //   useEffect(() => {
// //     const timer = setTimeout(() => {
// //       dispatch(setFilters({ search: searchInput }));
// //     }, 500);
// //     return () => clearTimeout(timer);
// //   }, [searchInput, dispatch]);

// //   const handleFilterChange = (key, value) => {
// //     dispatch(setFilters({ [key]: value }));
// //   };

// //   const handleClearFilters = () => {
// //     dispatch(clearFilters());
// //     setSearchInput("");
// //   };

// //   const handleDelete = async () => {
// //     if (!deleteId) return;
// //     setIsDeleting(true);
// //     const result = await dispatch(deleteTicket(deleteId));
// //     setIsDeleting(false);
// //     if (deleteTicket.fulfilled.match(result)) {
// //       toast.success("Ticket deleted");
// //       setDeleteId(null);
// //     } else {
// //       toast.error(result.payload || "Failed to delete");
// //     }
// //   };

// //   // Check if any filter is active
// //   const hasActiveFilters =
// //     filters.status ||
// //     filters.priority ||
// //     filters.type ||
// //     filters.assignee ||
// //     filters.search;

// //   // Stats for header
// //   const stats = {
// //     total: tickets.length,
// //     todo: tickets.filter((t) => t.status === "todo").length,
// //     inProgress: tickets.filter((t) => t.status === "in-progress").length,
// //     done: tickets.filter((t) => t.status === "done").length,
// //   };

// //   return (
// //     <>
// //       <div className="p-6 max-w-7xl mx-auto">
// //         {/* Page Header */}
// //         <motion.div
// //           initial={{ opacity: 0, y: -20 }}
// //           animate={{ opacity: 1, y: 0 }}
// //           className="flex items-start justify-between mb-6"
// //         >
// //           <div>
// //             <div className="flex items-center gap-2 mb-1">
// //               <span className="text-2xl">{project?.icon || "🎫"}</span>
// //               <h1 className="text-2xl font-bold text-gray-900">
// //                 {project?.title || "Tickets"}
// //               </h1>
// //             </div>
// //             <p className="text-gray-500 text-sm">Manage and track all issues</p>
// //           </div>

// //           <motion.button
// //             whileHover={{ scale: 1.02 }}
// //             whileTap={{ scale: 0.98 }}
// //             onClick={() => setIsCreateModalOpen(true)}
// //             className="btn-primary flex items-center gap-2 px-5 py-2.5"
// //           >
// //             <Plus className="w-4 h-4" />
// //             New Ticket
// //           </motion.button>
// //         </motion.div>

// //         {/* Stats Bar */}
// //         <motion.div
// //           initial={{ opacity: 0, y: -10 }}
// //           animate={{ opacity: 1, y: 0 }}
// //           transition={{ delay: 0.05 }}
// //           className="grid grid-cols-4 gap-4 mb-6"
// //         >
// //           {[
// //             {
// //               label: "Total",
// //               value: stats.total,
// //               color: "text-gray-700",
// //               bg: "bg-gray-50",
// //             },
// //             {
// //               label: "To Do",
// //               value: stats.todo,
// //               color: "text-gray-600",
// //               bg: "bg-gray-100",
// //             },
// //             {
// //               label: "In Progress",
// //               value: stats.inProgress,
// //               color: "text-blue-600",
// //               bg: "bg-blue-50",
// //             },
// //             {
// //               label: "Done",
// //               value: stats.done,
// //               color: "text-emerald-600",
// //               bg: "bg-emerald-50",
// //             },
// //           ].map((stat) => (
// //             <div
// //               key={stat.label}
// //               className={`${stat.bg} rounded-xl p-4 text-center`}
// //             >
// //               <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
// //               <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
// //             </div>
// //           ))}
// //         </motion.div>

// //         {/* Search + Filters */}
// //         <motion.div
// //           initial={{ opacity: 0 }}
// //           animate={{ opacity: 1 }}
// //           transition={{ delay: 0.1 }}
// //           className="bg-white rounded-xl border border-gray-100 p-4 mb-6
// //                      shadow-sm"
// //         >
// //           <div className="flex flex-wrap gap-3">
// //             {/* Search */}
// //             <div className="relative flex-1 min-w-50">
// //               <Search
// //                 className="absolute left-3 top-1/2 -translate-y-1/2
// //                                  w-4 h-4 text-gray-400"
// //               />
// //               <input
// //                 type="text"
// //                 placeholder="Search tickets..."
// //                 value={searchInput}
// //                 onChange={(e) => setSearchInput(e.target.value)}
// //                 className="input-field pl-10 py-2"
// //               />
// //             </div>

// //             {/* Status Filter */}
// //             <select
// //               value={filters.status}
// //               onChange={(e) => handleFilterChange("status", e.target.value)}
// //               className="input-field w-auto py-2 pr-8"
// //             >
// //               <option value="">All Status</option>
// //               <option value="todo">To Do</option>
// //               <option value="in-progress">In Progress</option>
// //               <option value="in-review">In Review</option>
// //               <option value="done">Done</option>
// //             </select>

// //             {/* Priority Filter */}
// //             <select
// //               value={filters.priority}
// //               onChange={(e) => handleFilterChange("priority", e.target.value)}
// //               className="input-field w-auto py-2 pr-8"
// //             >
// //               <option value="">All Priority</option>
// //               <option value="low">🟢 Low</option>
// //               <option value="medium">🟡 Medium</option>
// //               <option value="high">🟠 High</option>
// //               <option value="critical">🔴 Critical</option>
// //             </select>

// //             {/* Type Filter */}
// //             <select
// //               value={filters.type}
// //               onChange={(e) => handleFilterChange("type", e.target.value)}
// //               className="input-field w-auto py-2 pr-8"
// //             >
// //               <option value="">All Types</option>
// //               <option value="bug">🐛 Bug</option>
// //               <option value="feature">✨ Feature</option>
// //               <option value="improvement">⚡ Improvement</option>
// //               <option value="task">📋 Task</option>
// //             </select>

// //             {/* Clear Filters */}
// //             {hasActiveFilters && (
// //               <motion.button
// //                 initial={{ opacity: 0, scale: 0.9 }}
// //                 animate={{ opacity: 1, scale: 1 }}
// //                 onClick={handleClearFilters}
// //                 className="flex items-center gap-1.5 px-3 py-2 rounded-lg
// //                            text-sm text-red-500 hover:bg-red-50
// //                            transition-colors border border-red-100"
// //               >
// //                 <X className="w-4 h-4" />
// //                 Clear
// //               </motion.button>
// //             )}
// //           </div>
// //         </motion.div>

// //         {/* Ticket List */}
// //         {isLoading ? (
// //           <div className="flex items-center justify-center py-20">
// //             <motion.div
// //               animate={{ rotate: 360 }}
// //               transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
// //             >
// //               <Loader2 className="w-10 h-10 text-blue-500" />
// //             </motion.div>
// //           </div>
// //         ) : tickets.length === 0 ? (
// //           <motion.div
// //             initial={{ opacity: 0, scale: 0.95 }}
// //             animate={{ opacity: 1, scale: 1 }}
// //             className="flex flex-col items-center justify-center
// //                        py-20 text-center"
// //           >
// //             <div
// //               className="w-20 h-20 bg-blue-50 rounded-2xl flex
// //                             items-center justify-center mb-4"
// //             >
// //               <Ticket className="w-10 h-10 text-blue-400" />
// //             </div>
// //             <h3 className="text-xl font-semibold text-gray-700 mb-2">
// //               {hasActiveFilters ? "No tickets match filters" : "No tickets yet"}
// //             </h3>
// //             <p className="text-gray-400 mb-6 max-w-sm">
// //               {hasActiveFilters
// //                 ? "Try adjusting or clearing your filters"
// //                 : "Create your first ticket to start tracking issues"}
// //             </p>
// //             {!hasActiveFilters && (
// //               <motion.button
// //                 whileHover={{ scale: 1.02 }}
// //                 whileTap={{ scale: 0.98 }}
// //                 onClick={() => setIsCreateModalOpen(true)}
// //                 className="btn-primary flex items-center gap-2"
// //               >
// //                 <Plus className="w-4 h-4" />
// //                 Create First Ticket
// //               </motion.button>
// //             )}
// //           </motion.div>
// //         ) : (
// //           <motion.div
// //             layout
// //             className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
// //           >
// //             <AnimatePresence>
// //               {tickets.map((ticket, index) => (
// //                 <TicketCard
// //                   key={ticket._id}
// //                   ticket={ticket}
// //                   index={index}
// //                   onClick={() => setDeleteId(null)}
// //                 />
// //               ))}
// //             </AnimatePresence>
// //           </motion.div>
// //         )}
// //       </div>

// //       {/* Create Ticket Modal */}
// //       <CreateTicketModal
// //         isOpen={isCreateModalOpen}
// //         onClose={() => setIsCreateModalOpen(false)}
// //         projectId={projectId}
// //         members={project?.members || []}
// //       />

// //       {/* Delete Confirm Modal */}
// //       <ConfirmModal
// //         isOpen={!!deleteId}
// //         onClose={() => setDeleteId(null)}
// //         onConfirm={handleDelete}
// //         isLoading={isDeleting}
// //         title="Delete Ticket?"
// //         message="This ticket will be permanently deleted."
// //         confirmText="Delete Ticket"
// //       />
// //     </>
// //   );
// // }

// // export default TicketsPage;
