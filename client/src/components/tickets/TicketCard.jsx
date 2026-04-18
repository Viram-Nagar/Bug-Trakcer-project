import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  AlertCircle,
  ArrowUp,
  ArrowRight,
  ArrowDown,
  Clock,
  User,
  Tag,
  Pencil,
  Trash2,
  ChevronDown,
  MoreVertical,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  deleteTicket,
  updateTicketStatus,
} from "../../features/tickets/ticketSlice";
import { selectUser } from "../../features/auth/authSlice";
import { selectProjects } from "../../features/projects/projectSlice";
import { canEditTicket, canDeleteTicket } from "../../utils/permissions";
import ConfirmModal from "../common/ConfirmModal";
import EditTicketModal from "./EditTicketModal";

// ── Config Maps ───────────────────────────────────────

const PRIORITY_CONFIG = {
  critical: {
    label: "Critical",
    color: "text-red-600 bg-red-50 border-red-200",
    icon: <AlertCircle className="w-3 h-3" />,
  },
  high: {
    label: "High",
    color: "text-orange-600 bg-orange-50 border-orange-200",
    icon: <ArrowUp className="w-3 h-3" />,
  },
  medium: {
    label: "Medium",
    color: "text-yellow-600 bg-yellow-50 border-yellow-200",
    icon: <ArrowRight className="w-3 h-3" />,
  },
  low: {
    label: "Low",
    color: "text-green-600 bg-green-50 border-green-200",
    icon: <ArrowDown className="w-3 h-3" />,
  },
};

const STATUS_CONFIG = {
  todo: { label: "To Do", color: "text-gray-600 bg-gray-100" },
  "in-progress": {
    label: "In Progress",
    color: "text-blue-600 bg-blue-100",
  },
  "in-review": {
    label: "In Review",
    color: "text-purple-600 bg-purple-100",
  },
  done: { label: "Done", color: "text-emerald-600 bg-emerald-100" },
};

const TYPE_CONFIG = {
  bug: { label: "Bug", emoji: "🐛" },
  feature: { label: "Feature", emoji: "✨" },
  improvement: { label: "Improvement", emoji: "⚡" },
  task: { label: "Task", emoji: "📋" },
};

// ── Component ─────────────────────────────────────────

function TicketCard({ ticket, index, members = [] }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { projectId } = useParams();

  const currentUser = useSelector(selectUser);
  const projects = useSelector(selectProjects);
  const project = projects.find((p) => p._id === projectId);

  const userCanEdit = canEditTicket(project, ticket, currentUser?._id);
  const userCanDelete = canDeleteTicket(project, ticket, currentUser?._id);
  const hasActions = userCanEdit || userCanDelete;

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Refs for dropdown positioning
  const actionsButtonRef = useRef(null);
  const actionsMenuRef = useRef(null);
  const statusButtonRef = useRef(null);
  const statusMenuRef = useRef(null);

  // ── Close dropdowns on outside click ───────────────
  useEffect(() => {
    if (!showActionsMenu && !showStatusMenu) return;

    const handleClickOutside = (e) => {
      // Close actions menu
      if (
        showActionsMenu &&
        actionsMenuRef.current &&
        !actionsMenuRef.current.contains(e.target) &&
        !actionsButtonRef.current.contains(e.target)
      ) {
        setShowActionsMenu(false);
      }

      // Close status menu
      if (
        showStatusMenu &&
        statusMenuRef.current &&
        !statusMenuRef.current.contains(e.target) &&
        !statusButtonRef.current.contains(e.target)
      ) {
        setShowStatusMenu(false);
      }
    };

    // Use capture phase so it fires before other handlers
    document.addEventListener("mousedown", handleClickOutside, true);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside, true);
    };
  }, [showActionsMenu, showStatusMenu]);

  // ── Handlers ───────────────────────────────────────

  const handleDelete = async () => {
    setIsDeleting(true);
    const result = await dispatch(deleteTicket(ticket._id));
    setIsDeleting(false);
    if (deleteTicket.fulfilled.match(result)) {
      toast.success("Ticket deleted");
      setShowDeleteModal(false);
    } else {
      toast.error(result.payload || "Failed to delete");
    }
  };

  const handleStatusChange = async (newStatus) => {
    setShowStatusMenu(false);
    if (newStatus === ticket.status) return;
    const result = await dispatch(
      updateTicketStatus({ id: ticket._id, status: newStatus }),
    );
    if (updateTicketStatus.fulfilled.match(result)) {
      toast.success(`Status → ${STATUS_CONFIG[newStatus]?.label}`);
    } else {
      toast.error(result.payload || "Failed to update status");
    }
  };

  const handleCardClick = (e) => {
    // Don't navigate if clicking on interactive elements
    if (e.target.closest("button") || e.target.closest("[data-no-navigate]"))
      return;
    navigate(`/projects/${projectId}/tickets/${ticket._id}`);
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const isOverdue =
    ticket.dueDate &&
    new Date(ticket.dueDate) < new Date() &&
    ticket.status !== "done";

  const priority = PRIORITY_CONFIG[ticket.priority] || PRIORITY_CONFIG.medium;
  const status = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.todo;
  const type = TYPE_CONFIG[ticket.type] || TYPE_CONFIG.task;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97 }}
        transition={{ duration: 0.25, delay: index * 0.05 }}
        onClick={handleCardClick}
        className="bg-white rounded-xl border border-gray-100 p-4
                   hover:shadow-md transition-all duration-200
                   cursor-pointer active:scale-[0.99] relative"
      >
        {/* ── Top Row ──────────────────────────────── */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-base">{type.emoji}</span>
            <span
              className="text-xs font-mono text-gray-400
                             font-medium"
            >
              #{ticket.ticketNumber}
            </span>
            <span
              className={`flex items-center gap-1 text-xs
                             font-medium px-2 py-0.5 rounded-full
                             border ${priority.color}`}
            >
              {priority.icon}
              {priority.label}
            </span>
          </div>

          {/* ⋮ Actions Button — only if user has permissions */}
          {hasActions && (
            <div className="relative flex-shrink-0" data-no-navigate>
              <button
                ref={actionsButtonRef}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowStatusMenu(false);
                  setShowActionsMenu((prev) => !prev);
                }}
                className="p-1.5 rounded-lg text-gray-400
                           hover:text-gray-600 hover:bg-gray-100
                           transition-colors"
                aria-label="Actions"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {/* Actions Dropdown */}
              <AnimatePresence>
                {showActionsMenu && (
                  <motion.div
                    ref={actionsMenuRef}
                    initial={{ opacity: 0, scale: 0.95, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -4 }}
                    transition={{ duration: 0.15 }}
                    /*
                      Position: right-0 aligns dropdown's right edge
                      with button's right edge.
                      top-8 places it just below the button.
                      min-w ensures it's wide enough.
                      z-50 keeps it above everything in the card.
                    */
                    className="absolute right-0 top-8 bg-white
                               rounded-xl shadow-lg border
                               border-gray-100 py-1 z-50
                               min-w-[140px]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {userCanEdit && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowActionsMenu(false);
                          setShowEditModal(true);
                        }}
                        className="flex items-center gap-2 w-full
                                   px-4 py-2.5 text-sm text-gray-700
                                   hover:bg-gray-50 transition-colors
                                   text-left"
                      >
                        <Pencil
                          className="w-4 h-4 text-blue-500
                                          flex-shrink-0"
                        />
                        Edit
                      </button>
                    )}

                    {userCanDelete && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowActionsMenu(false);
                          setShowDeleteModal(true);
                        }}
                        className="flex items-center gap-2 w-full
                                   px-4 py-2.5 text-sm text-red-600
                                   hover:bg-red-50 transition-colors
                                   text-left"
                      >
                        <Trash2 className="w-4 h-4 flex-shrink-0" />
                        Delete
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* ── Title ────────────────────────────────── */}
        <h3
          className="font-semibold text-gray-900 mb-1.5
                       line-clamp-2 leading-snug text-sm
                       hover:text-blue-600 transition-colors"
        >
          {ticket.title}
        </h3>

        {/* ── Description ──────────────────────────── */}
        {ticket.description && (
          <p className="text-xs text-gray-400 line-clamp-2 mb-3">
            {ticket.description}
          </p>
        )}

        {/* ── Tags ─────────────────────────────────── */}
        {ticket.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {ticket.tags.slice(0, 2).map((tag, i) => (
              <span
                key={i}
                className="flex items-center gap-1 text-xs
                           bg-gray-50 text-gray-500 px-2 py-0.5
                           rounded-full border border-gray-100"
              >
                <Tag className="w-2.5 h-2.5" />
                {tag}
              </span>
            ))}
            {ticket.tags.length > 2 && (
              <span className="text-xs text-gray-400">
                +{ticket.tags.length - 2}
              </span>
            )}
          </div>
        )}

        {/* ── Status Dropdown ───────────────────────── */}
        <div className="relative mb-3" data-no-navigate>
          <button
            ref={statusButtonRef}
            onClick={(e) => {
              e.stopPropagation();
              setShowActionsMenu(false);
              setShowStatusMenu((prev) => !prev);
            }}
            className={`flex items-center gap-1.5 text-xs
                       font-medium px-2.5 py-1.5 rounded-full
                       transition-all active:scale-95 ${status.color}`}
          >
            {status.label}
            <ChevronDown
              className={`w-3 h-3 transition-transform
              duration-200
              ${showStatusMenu ? "rotate-180" : ""}`}
            />
          </button>

          <AnimatePresence>
            {showStatusMenu && (
              <motion.div
                ref={statusMenuRef}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="absolute left-0 top-9 bg-white rounded-xl
                           shadow-lg border border-gray-100 py-1
                           z-50 min-w-[150px]"
                onClick={(e) => e.stopPropagation()}
              >
                {Object.entries(STATUS_CONFIG).map(([value, cfg]) => (
                  <button
                    key={value}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusChange(value);
                    }}
                    className={`w-full text-left px-3 py-2.5 text-xs
                               font-medium hover:bg-gray-50
                               transition-colors flex items-center
                               gap-2
                               ${
                                 ticket.status === value
                                   ? "text-blue-600 bg-blue-50"
                                   : "text-gray-700"
                               }`}
                  >
                    {ticket.status === value && (
                      <span
                        className="w-1.5 h-1.5 rounded-full
                                       bg-blue-500 flex-shrink-0"
                      />
                    )}
                    {cfg.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Bottom Row ───────────────────────────── */}
        <div
          className="flex items-center justify-between pt-3
                        border-t border-gray-50"
        >
          <div className="flex items-center gap-2">
            {ticket.assignee ? (
              <>
                <div
                  className="w-6 h-6 rounded-full bg-gradient-to-br
                                from-blue-400 to-indigo-500 flex
                                items-center justify-center text-white
                                text-xs font-bold flex-shrink-0"
                >
                  {ticket.assignee.name?.charAt(0).toUpperCase()}
                </div>
                <span
                  className="text-xs text-gray-500 font-medium
                                 max-w-[80px] truncate"
                >
                  {ticket.assignee.name}
                </span>
              </>
            ) : (
              <span
                className="flex items-center gap-1 text-xs
                               text-gray-300"
              >
                <User className="w-3.5 h-3.5" />
                Unassigned
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {ticket.dueDate && (
              <span
                className={`flex items-center gap-1 text-xs
                               font-medium
                               ${isOverdue ? "text-red-500" : "text-gray-400"}`}
              >
                <Clock className="w-3 h-3" />
                {isOverdue ? "Overdue" : formatDate(ticket.dueDate)}
              </span>
            )}
            <span className="text-xs text-gray-300">
              {formatDate(ticket.createdAt)}
            </span>
          </div>
        </div>
      </motion.div>

      {/* ── Modals (outside card) ─────────────────── */}
      <EditTicketModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        ticket={ticket}
        members={members}
      />

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Delete Ticket?"
        message={`"${ticket.title}" will be permanently deleted.`}
        confirmText="Delete Ticket"
      />
    </>
  );
}

export { PRIORITY_CONFIG, STATUS_CONFIG, TYPE_CONFIG };
export default TicketCard;

// import { selectUser } from "../../features/auth/authSlice";
// import { selectProjects } from "../../features/projects/projectSlice";
// import { canEditTicket, canDeleteTicket } from "../../utils/permissions";
// import { useState } from "react";
// import { motion } from "framer-motion";
// import { useDispatch, useSelector } from "react-redux";
// import { useNavigate, useParams } from "react-router-dom";
// import {
//   AlertCircle,
//   ArrowUp,
//   ArrowRight,
//   ArrowDown,
//   Clock,
//   User,
//   Tag,
//   Pencil,
//   Trash2,
//   ChevronDown,
//   MoreVertical,
// } from "lucide-react";
// import toast from "react-hot-toast";
// import {
//   deleteTicket,
//   updateTicketStatus,
// } from "../../features/tickets/ticketSlice";
// import ConfirmModal from "../common/ConfirmModal";
// import EditTicketModal from "./EditTicketModal";

// const PRIORITY_CONFIG = {
//   critical: {
//     label: "Critical",
//     color: "text-red-600 bg-red-50 border-red-200",
//     icon: <AlertCircle className="w-3 h-3" />,
//   },
//   high: {
//     label: "High",
//     color: "text-orange-600 bg-orange-50 border-orange-200",
//     icon: <ArrowUp className="w-3 h-3" />,
//   },
//   medium: {
//     label: "Medium",
//     color: "text-yellow-600 bg-yellow-50 border-yellow-200",
//     icon: <ArrowRight className="w-3 h-3" />,
//   },
//   low: {
//     label: "Low",
//     color: "text-green-600 bg-green-50 border-green-200",
//     icon: <ArrowDown className="w-3 h-3" />,
//   },
// };

// const STATUS_CONFIG = {
//   todo: { label: "To Do", color: "text-gray-600 bg-gray-100" },
//   "in-progress": { label: "In Progress", color: "text-blue-600 bg-blue-100" },
//   "in-review": { label: "In Review", color: "text-purple-600 bg-purple-100" },
//   done: { label: "Done", color: "text-emerald-600 bg-emerald-100" },
// };

// const TYPE_CONFIG = {
//   bug: { label: "Bug", emoji: "🐛" },
//   feature: { label: "Feature", emoji: "✨" },
//   improvement: { label: "Improvement", emoji: "⚡" },
//   task: { label: "Task", emoji: "📋" },
// };

// function TicketCard({ ticket, index, members = [] }) {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const { projectId } = useParams();

//   const [showDeleteModal, setShowDeleteModal] = useState(false);
//   const [showEditModal, setShowEditModal] = useState(false);
//   const [showStatusMenu, setShowStatusMenu] = useState(false);
//   const [showActionsMenu, setShowActionsMenu] = useState(false);
//   const [isDeleting, setIsDeleting] = useState(false);

//   const currentUser = useSelector(selectUser);
//   const projects = useSelector(selectProjects);
//   const project = projects.find((p) => p._id === projectId);

//   const userCanEdit = canEditTicket(project, ticket, currentUser?._id);
//   const userCanDelete = canDeleteTicket(project, ticket, currentUser?._id);

//   const priority = PRIORITY_CONFIG[ticket.priority] || PRIORITY_CONFIG.medium;
//   const status = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.todo;
//   const type = TYPE_CONFIG[ticket.type] || TYPE_CONFIG.task;

//   const formatDate = (date) => {
//     const d = new Date(date);
//     const now = new Date();
//     const diff = now - d;
//     const days = Math.floor(diff / (1000 * 60 * 60 * 24));
//     if (days === 0) return "Today";
//     if (days === 1) return "Yesterday";
//     if (days < 7) return `${days}d ago`;
//     return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
//   };

//   const isOverdue =
//     ticket.dueDate &&
//     new Date(ticket.dueDate) < new Date() &&
//     ticket.status !== "done";

//   const handleDelete = async () => {
//     setIsDeleting(true);
//     const result = await dispatch(deleteTicket(ticket._id));
//     setIsDeleting(false);
//     if (deleteTicket.fulfilled.match(result)) {
//       toast.success("Ticket deleted");
//       setShowDeleteModal(false);
//     } else {
//       toast.error(result.payload || "Failed to delete");
//     }
//   };

//   const handleStatusChange = async (newStatus) => {
//     setShowStatusMenu(false);
//     if (newStatus === ticket.status) return;
//     const result = await dispatch(
//       updateTicketStatus({ id: ticket._id, status: newStatus }),
//     );
//     if (updateTicketStatus.fulfilled.match(result)) {
//       toast.success(`Status → ${STATUS_CONFIG[newStatus]?.label}`);
//     } else {
//       toast.error(result.payload || "Failed to update status");
//     }
//   };

//   const handleCardClick = () => {
//     navigate(`/projects/${projectId}/tickets/${ticket._id}`);
//   };

//   return (
//     <>
//       <motion.div
//         initial={{ opacity: 0, y: 16 }}
//         animate={{ opacity: 1, y: 0 }}
//         exit={{ opacity: 0, scale: 0.97 }}
//         transition={{ duration: 0.25, delay: index * 0.05 }}
//         className="bg-white rounded-xl border border-gray-100 p-4
//                    hover:shadow-md transition-all duration-200 cursor-pointer
//                    active:scale-[0.99]"
//         onClick={handleCardClick}
//       >
//         {/* Top Row */}
//         <div className="flex items-start justify-between mb-3">
//           <div className="flex items-center gap-2">
//             <span className="text-base">{type.emoji}</span>
//             <span className="text-xs font-mono text-gray-400 font-medium">
//               #{ticket.ticketNumber}
//             </span>
//             <span
//               className={`flex items-center gap-1 text-xs font-medium
//                              px-2 py-0.5 rounded-full border ${priority.color}`}
//             >
//               {priority.icon}
//               {priority.label}
//             </span>
//           </div>

//           {/*
//             ── Actions Menu ─────────────────────────────────
//             Always visible (not hover-only) so mobile users
//             can access edit/delete by tapping the ⋮ button
//           */}
//           <button
//             onClick={(e) => {
//               e.stopPropagation();
//               setShowActionsMenu(!showActionsMenu);
//             }}
//             className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600
//                        hover:bg-gray-100 transition-colors flex-shrink-0"
//           >
//             <MoreVertical className="w-4 h-4" />
//           </button>

//           {/* Actions Dropdown */}
//           {showActionsMenu && (
//             <>
//               <div
//                 className="fixed inset-0 z-10"
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   setShowActionsMenu(false);
//                 }}
//               />
//               {/* <motion.div
//                 initial={{ opacity: 0, scale: 0.95, y: -5 }}
//                 animate={{ opacity: 1, scale: 1, y: 0 }}
//                 className="absolute right-4 mt-8 bg-white rounded-xl
//                            shadow-lg border border-gray-100 py-1 z-20
//                            min-w-[140px]"
//                 onClick={(e) => e.stopPropagation()}
//               >
//                 <button
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     setShowActionsMenu(false);
//                     setShowEditModal(true);
//                   }}
//                   className="flex items-center gap-2 w-full px-4 py-2.5
//                              text-sm text-gray-700 hover:bg-gray-50
//                              transition-colors"
//                 >
//                   <Pencil className="w-4 h-4 text-blue-500" />
//                   Edit
//                 </button>
//                 <button
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     setShowActionsMenu(false);
//                     setShowDeleteModal(true);
//                   }}
//                   className="flex items-center gap-2 w-full px-4 py-2.5
//                              text-sm text-red-600 hover:bg-red-50
//                              transition-colors"
//                 >
//                   <Trash2 className="w-4 h-4" />
//                   Delete
//                 </button>
//               </motion.div> */}

//               <motion.div
//                 initial={{ opacity: 0, scale: 0.95, y: -5 }}
//                 animate={{ opacity: 1, scale: 1, y: 0 }}
//                 className="absolute right-4 mt-8 bg-white rounded-xl
//              shadow-lg border border-gray-100 py-1 z-20
//              min-w-[140px]"
//                 onClick={(e) => e.stopPropagation()}
//               >
//                 {/* Edit — only if permitted */}
//                 {userCanEdit && (
//                   <button
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       setShowActionsMenu(false);
//                       setShowEditModal(true);
//                     }}
//                     className="flex items-center gap-2 w-full px-4 py-2.5
//                  text-sm text-gray-700 hover:bg-gray-50
//                  transition-colors"
//                   >
//                     <Pencil className="w-4 h-4 text-blue-500" />
//                     Edit
//                   </button>
//                 )}

//                 {/* Delete — only if permitted */}
//                 {userCanDelete && (
//                   <button
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       setShowActionsMenu(false);
//                       setShowDeleteModal(true);
//                     }}
//                     className="flex items-center gap-2 w-full px-4 py-2.5
//                  text-sm text-red-600 hover:bg-red-50
//                  transition-colors"
//                   >
//                     <Trash2 className="w-4 h-4" />
//                     Delete
//                   </button>
//                 )}

//                 {/* Show message if no actions available */}
//                 {!userCanEdit && !userCanDelete && (
//                   <div className="px-4 py-2.5 text-xs text-gray-400">
//                     View only access
//                   </div>
//                 )}
//               </motion.div>
//             </>
//           )}
//         </div>

//         {/* Title */}
//         <h3
//           className="font-semibold text-gray-900 mb-1.5 line-clamp-2
//                        leading-snug text-sm"
//         >
//           {ticket.title}
//         </h3>

//         {/* Description */}
//         {ticket.description && (
//           <p className="text-xs text-gray-400 line-clamp-2 mb-3">
//             {ticket.description}
//           </p>
//         )}

//         {/* Tags */}
//         {ticket.tags?.length > 0 && (
//           <div className="flex flex-wrap gap-1 mb-3">
//             {ticket.tags.slice(0, 2).map((tag, i) => (
//               <span
//                 key={i}
//                 className="flex items-center gap-1 text-xs bg-gray-50
//                            text-gray-500 px-2 py-0.5 rounded-full
//                            border border-gray-100"
//               >
//                 <Tag className="w-2.5 h-2.5" />
//                 {tag}
//               </span>
//             ))}
//             {ticket.tags.length > 2 && (
//               <span className="text-xs text-gray-400">
//                 +{ticket.tags.length - 2}
//               </span>
//             )}
//           </div>
//         )}

//         {/* Status — always visible tap target */}
//         <div className="relative mb-3">
//           <button
//             onClick={(e) => {
//               e.stopPropagation();
//               setShowStatusMenu(!showStatusMenu);
//             }}
//             className={`flex items-center gap-1.5 text-xs font-medium
//                        px-2.5 py-1.5 rounded-full transition-all
//                        active:scale-95 ${status.color}`}
//           >
//             {status.label}
//             <ChevronDown
//               className={`w-3 h-3 transition-transform
//               ${showStatusMenu ? "rotate-180" : ""}`}
//             />
//           </button>

//           {showStatusMenu && (
//             <>
//               <div
//                 className="fixed inset-0 z-10"
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   setShowStatusMenu(false);
//                 }}
//               />
//               <motion.div
//                 initial={{ opacity: 0, y: -5 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 className="absolute left-0 top-9 bg-white rounded-xl
//                            shadow-lg border border-gray-100 py-1 z-20
//                            min-w-[150px]"
//                 onClick={(e) => e.stopPropagation()}
//               >
//                 {Object.entries(STATUS_CONFIG).map(([value, cfg]) => (
//                   <button
//                     key={value}
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       handleStatusChange(value);
//                     }}
//                     className={`w-full text-left px-3 py-2.5 text-xs
//                                font-medium hover:bg-gray-50 transition-colors
//                                flex items-center gap-2
//                                ${
//                                  ticket.status === value
//                                    ? "text-blue-600 bg-blue-50"
//                                    : "text-gray-700"
//                                }`}
//                   >
//                     {ticket.status === value && (
//                       <span
//                         className="w-1.5 h-1.5 rounded-full
//                                        bg-blue-500 flex-shrink-0"
//                       />
//                     )}
//                     {cfg.label}
//                   </button>
//                 ))}
//               </motion.div>
//             </>
//           )}
//         </div>

//         {/* Bottom Row */}
//         <div
//           className="flex items-center justify-between pt-3
//                         border-t border-gray-50"
//         >
//           <div className="flex items-center gap-2">
//             {ticket.assignee ? (
//               <>
//                 <div
//                   className="w-6 h-6 rounded-full bg-gradient-to-br
//                                 from-blue-400 to-indigo-500 flex items-center
//                                 justify-center text-white text-xs font-bold"
//                 >
//                   {ticket.assignee.name?.charAt(0).toUpperCase()}
//                 </div>
//                 <span
//                   className="text-xs text-gray-500 font-medium
//                                  max-w-[80px] truncate"
//                 >
//                   {ticket.assignee.name}
//                 </span>
//               </>
//             ) : (
//               <span className="flex items-center gap-1 text-xs text-gray-300">
//                 <User className="w-3.5 h-3.5" />
//                 Unassigned
//               </span>
//             )}
//           </div>

//           <div className="flex items-center gap-2">
//             {ticket.dueDate && (
//               <span
//                 className={`flex items-center gap-1 text-xs font-medium
//                                ${isOverdue ? "text-red-500" : "text-gray-400"}`}
//               >
//                 <Clock className="w-3 h-3" />
//                 {isOverdue ? "Overdue" : formatDate(ticket.dueDate)}
//               </span>
//             )}
//             <span className="text-xs text-gray-300">
//               {formatDate(ticket.createdAt)}
//             </span>
//           </div>
//         </div>
//       </motion.div>

//       {/* Edit Modal */}
//       <EditTicketModal
//         isOpen={showEditModal}
//         onClose={() => setShowEditModal(false)}
//         ticket={ticket}
//         members={members}
//       />

//       {/* Delete Confirm Modal */}
//       <ConfirmModal
//         isOpen={showDeleteModal}
//         onClose={() => setShowDeleteModal(false)}
//         onConfirm={handleDelete}
//         isLoading={isDeleting}
//         title="Delete Ticket?"
//         message={`"${ticket.title}" will be permanently deleted.`}
//         confirmText="Delete Ticket"
//       />
//     </>
//   );
// }

// export { PRIORITY_CONFIG, STATUS_CONFIG, TYPE_CONFIG };
// export default TicketCard;

// import { useState } from "react";
// import { motion } from "framer-motion";
// import { useDispatch, useSelector } from "react-redux";
// import { useNavigate, useParams } from "react-router-dom";

// import {
//   AlertCircle,
//   ArrowUp,
//   ArrowRight,
//   ArrowDown,
//   Clock,
//   User,
//   Tag,
//   Pencil,
//   Trash2,
//   ChevronDown,
// } from "lucide-react";
// import toast from "react-hot-toast";
// import {
//   deleteTicket,
//   updateTicketStatus,
//   selectTicketLoading,
// } from "../../features/tickets/ticketSlice";
// import ConfirmModal from "../common/ConfirmModal";
// import EditTicketModal from "./EditTicketModal";

// // ─── Config Maps ──────────────────────────────────────

// const PRIORITY_CONFIG = {
//   critical: {
//     label: "Critical",
//     color: "text-red-600 bg-red-50 border-red-200",
//     icon: <AlertCircle className="w-3 h-3" />,
//   },
//   high: {
//     label: "High",
//     color: "text-orange-600 bg-orange-50 border-orange-200",
//     icon: <ArrowUp className="w-3 h-3" />,
//   },
//   medium: {
//     label: "Medium",
//     color: "text-yellow-600 bg-yellow-50 border-yellow-200",
//     icon: <ArrowRight className="w-3 h-3" />,
//   },
//   low: {
//     label: "Low",
//     color: "text-green-600 bg-green-50 border-green-200",
//     icon: <ArrowDown className="w-3 h-3" />,
//   },
// };

// const STATUS_CONFIG = {
//   todo: { label: "To Do", color: "text-gray-600 bg-gray-100" },
//   "in-progress": { label: "In Progress", color: "text-blue-600 bg-blue-100" },
//   "in-review": { label: "In Review", color: "text-purple-600 bg-purple-100" },
//   done: { label: "Done", color: "text-emerald-600 bg-emerald-100" },
// };

// const TYPE_CONFIG = {
//   bug: { label: "Bug", emoji: "🐛" },
//   feature: { label: "Feature", emoji: "✨" },
//   improvement: { label: "Improvement", emoji: "⚡" },
//   task: { label: "Task", emoji: "📋" },
// };

// // ─── Component ────────────────────────────────────────

// function TicketCard({ ticket, index, members = [] }) {
//   const navigate = useNavigate();
//   const { projectId } = useParams();
//   const dispatch = useDispatch();
//   const isLoading = useSelector(selectTicketLoading);

//   const [showDeleteModal, setShowDeleteModal] = useState(false);
//   const [showEditModal, setShowEditModal] = useState(false);
//   const [showStatusMenu, setShowStatusMenu] = useState(false);
//   const [isDeleting, setIsDeleting] = useState(false);

//   const priority = PRIORITY_CONFIG[ticket.priority] || PRIORITY_CONFIG.medium;
//   const status = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.todo;
//   const type = TYPE_CONFIG[ticket.type] || TYPE_CONFIG.task;

//   const formatDate = (date) => {
//     const d = new Date(date);
//     const now = new Date();
//     const diff = now - d;
//     const days = Math.floor(diff / (1000 * 60 * 60 * 24));
//     if (days === 0) return "Today";
//     if (days === 1) return "Yesterday";
//     if (days < 7) return `${days}d ago`;
//     return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
//   };

//   const isOverdue =
//     ticket.dueDate &&
//     new Date(ticket.dueDate) < new Date() &&
//     ticket.status !== "done";

//   // ── Handlers ───────────────────────────────────────

//   const handleDelete = async () => {
//     setIsDeleting(true);
//     const result = await dispatch(deleteTicket(ticket._id));
//     setIsDeleting(false);
//     if (deleteTicket.fulfilled.match(result)) {
//       toast.success("Ticket deleted");
//       setShowDeleteModal(false);
//     } else {
//       toast.error(result.payload || "Failed to delete");
//     }
//   };

//   const handleStatusChange = async (newStatus) => {
//     setShowStatusMenu(false);
//     if (newStatus === ticket.status) return;

//     const result = await dispatch(
//       updateTicketStatus({ id: ticket._id, status: newStatus }),
//     );

//     if (updateTicketStatus.fulfilled.match(result)) {
//       toast.success(`Status → ${STATUS_CONFIG[newStatus]?.label}`);
//     } else {
//       toast.error(result.payload || "Failed to update status");
//     }
//   };

//   return (
//     <>
//       <motion.div
//         initial={{ opacity: 0, y: 16 }}
//         animate={{ opacity: 1, y: 0 }}
//         exit={{ opacity: 0, scale: 0.97 }}
//         transition={{ duration: 0.25, delay: index * 0.05 }}
//         whileHover={{ y: -2, transition: { duration: 0.15 } }}
//         className="bg-white rounded-xl border border-gray-100 p-5
//                    hover:shadow-md transition-all duration-200 group"
//         onClick={() => navigate(`/projects/${projectId}/tickets/${ticket._id}`)}
//       >
//         {/* Top Row */}
//         <div className="flex items-start justify-between mb-3">
//           <div className="flex items-center gap-2">
//             <span className="text-base">{type.emoji}</span>
//             <span className="text-xs font-mono text-gray-400 font-medium">
//               #{ticket.ticketNumber}
//             </span>
//           </div>

//           {/* Action Buttons — show on hover */}
//           <div
//             className="flex items-center gap-1 opacity-0
//                           group-hover:opacity-100 transition-opacity"
//           >
//             <motion.button
//               whileHover={{ scale: 1.1 }}
//               whileTap={{ scale: 0.9 }}
//               onClick={(e) => {
//                 e.stopPropagation();
//                 setShowEditModal(true);
//               }}
//               className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500
//                          hover:bg-blue-50 transition-colors"
//               title="Edit ticket"
//             >
//               <Pencil className="w-3.5 h-3.5" />
//             </motion.button>

//             <motion.button
//               whileHover={{ scale: 1.1 }}
//               whileTap={{ scale: 0.9 }}
//               onClick={(e) => {
//                 e.stopPropagation();
//                 setShowDeleteModal(true);
//               }}
//               className="p-1.5 rounded-lg text-gray-400 hover:text-red-500
//                          hover:bg-red-50 transition-colors"
//               title="Delete ticket"
//             >
//               <Trash2 className="w-3.5 h-3.5" />
//             </motion.button>
//           </div>
//         </div>

//         {/* Priority Badge */}
//         <div className="mb-2">
//           <span
//             className={`inline-flex items-center gap-1 text-xs
//                            font-medium px-2 py-0.5 rounded-full border
//                            ${priority.color}`}
//           >
//             {priority.icon}
//             {priority.label}
//           </span>
//         </div>

//         {/* Title */}
//         <h3
//           className="font-semibold text-gray-900 mb-1.5 line-clamp-2
//                        leading-snug text-sm"
//         >
//           {ticket.title}
//         </h3>

//         {/* Description */}
//         {ticket.description && (
//           <p className="text-xs text-gray-400 line-clamp-2 mb-3">
//             {ticket.description}
//           </p>
//         )}

//         {/* Tags */}
//         {ticket.tags?.length > 0 && (
//           <div className="flex flex-wrap gap-1 mb-3">
//             {ticket.tags.slice(0, 3).map((tag, i) => (
//               <span
//                 key={i}
//                 className="flex items-center gap-1 text-xs bg-gray-50
//                            text-gray-500 px-2 py-0.5 rounded-full
//                            border border-gray-100"
//               >
//                 <Tag className="w-2.5 h-2.5" />
//                 {tag}
//               </span>
//             ))}
//           </div>
//         )}

//         {/* Status Dropdown */}
//         <div className="relative mb-3">
//           <button
//             onClick={(e) => {
//               e.stopPropagation();
//               setShowStatusMenu(!showStatusMenu);
//             }}
//             className={`flex items-center gap-1.5 text-xs font-medium
//                        px-2.5 py-1 rounded-full transition-all
//                        ${status.color}`}
//           >
//             {status.label}
//             <ChevronDown className="w-3 h-3" />
//           </button>

//           {/* Status Dropdown Menu */}
//           {showStatusMenu && (
//             <>
//               {/* Click outside to close */}
//               <div
//                 className="fixed inset-0 z-10"
//                 onClick={() => setShowStatusMenu(false)}
//               />
//               <motion.div
//                 initial={{ opacity: 0, y: -5 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 className="absolute left-0 top-8 bg-white rounded-xl
//                            shadow-lg border border-gray-100 py-1 z-20
//                            min-w-[140px]"
//               >
//                 {Object.entries(STATUS_CONFIG).map(([value, cfg]) => (
//                   <button
//                     key={value}
//                     onClick={() => handleStatusChange(value)}
//                     className={`w-full text-left px-3 py-2 text-xs
//                                font-medium hover:bg-gray-50 transition-colors
//                                flex items-center gap-2
//                                ${
//                                  ticket.status === value
//                                    ? "text-blue-600 bg-blue-50"
//                                    : "text-gray-700"
//                                }`}
//                   >
//                     {ticket.status === value && (
//                       <span
//                         className="w-1.5 h-1.5 rounded-full
//                                        bg-blue-500 flex-shrink-0"
//                       />
//                     )}
//                     {cfg.label}
//                   </button>
//                 ))}
//               </motion.div>
//             </>
//           )}
//         </div>

//         {/* Bottom Row — Assignee + Date */}
//         <div
//           className="flex items-center justify-between pt-3
//                         border-t border-gray-50"
//         >
//           <div className="flex items-center gap-2">
//             {ticket.assignee ? (
//               <>
//                 <div
//                   className="w-6 h-6 rounded-full bg-gradient-to-br
//                                 from-blue-400 to-indigo-500 flex items-center
//                                 justify-center text-white text-xs font-bold"
//                 >
//                   {ticket.assignee.name?.charAt(0).toUpperCase()}
//                 </div>
//                 <span className="text-xs text-gray-500 font-medium">
//                   {ticket.assignee.name}
//                 </span>
//               </>
//             ) : (
//               <span className="flex items-center gap-1 text-xs text-gray-300">
//                 <User className="w-3.5 h-3.5" />
//                 Unassigned
//               </span>
//             )}
//           </div>

//           <div className="flex items-center gap-2">
//             {ticket.dueDate && (
//               <span
//                 className={`flex items-center gap-1 text-xs font-medium
//                                ${isOverdue ? "text-red-500" : "text-gray-400"}`}
//               >
//                 <Clock className="w-3 h-3" />
//                 {isOverdue ? "Overdue" : formatDate(ticket.dueDate)}
//               </span>
//             )}
//             <span className="text-xs text-gray-300">
//               {formatDate(ticket.createdAt)}
//             </span>
//           </div>
//         </div>
//       </motion.div>

//       {/* Edit Modal */}
//       <EditTicketModal
//         isOpen={showEditModal}
//         onClose={() => setShowEditModal(false)}
//         ticket={ticket}
//         members={members}
//       />

//       {/* Delete Confirm Modal */}
//       <ConfirmModal
//         isOpen={showDeleteModal}
//         onClose={() => setShowDeleteModal(false)}
//         onConfirm={handleDelete}
//         isLoading={isDeleting}
//         title="Delete Ticket?"
//         message={`"${ticket.title}" will be permanently deleted.`}
//         confirmText="Delete Ticket"
//       />
//     </>
//   );
// }

// export { PRIORITY_CONFIG, STATUS_CONFIG, TYPE_CONFIG };
// export default TicketCard;

// // import { motion } from "framer-motion";
// // import { useNavigate } from "react-router-dom";
// // import {
// //   AlertCircle,
// //   ArrowUp,
// //   ArrowRight,
// //   ArrowDown,
// //   Clock,
// //   User,
// //   Tag,
// // } from "lucide-react";

// // // ─── Config Maps ──────────────────────────────────────

// // const PRIORITY_CONFIG = {
// //   critical: {
// //     label: "Critical",
// //     color: "text-red-600 bg-red-50 border-red-200",
// //     icon: <AlertCircle className="w-3 h-3" />,
// //     dot: "bg-red-500",
// //   },
// //   high: {
// //     label: "High",
// //     color: "text-orange-600 bg-orange-50 border-orange-200",
// //     icon: <ArrowUp className="w-3 h-3" />,
// //     dot: "bg-orange-500",
// //   },
// //   medium: {
// //     label: "Medium",
// //     color: "text-yellow-600 bg-yellow-50 border-yellow-200",
// //     icon: <ArrowRight className="w-3 h-3" />,
// //     dot: "bg-yellow-500",
// //   },
// //   low: {
// //     label: "Low",
// //     color: "text-green-600 bg-green-50 border-green-200",
// //     icon: <ArrowDown className="w-3 h-3" />,
// //     dot: "bg-green-500",
// //   },
// // };

// // const STATUS_CONFIG = {
// //   todo: {
// //     label: "To Do",
// //     color: "text-gray-600 bg-gray-100",
// //   },
// //   "in-progress": {
// //     label: "In Progress",
// //     color: "text-blue-600 bg-blue-100",
// //   },
// //   "in-review": {
// //     label: "In Review",
// //     color: "text-purple-600 bg-purple-100",
// //   },
// //   done: {
// //     label: "Done",
// //     color: "text-emerald-600 bg-emerald-100",
// //   },
// // };

// // const TYPE_CONFIG = {
// //   bug: { label: "Bug", color: "text-red-500", emoji: "🐛" },
// //   feature: { label: "Feature", color: "text-blue-500", emoji: "✨" },
// //   improvement: { label: "Improvement", color: "text-purple-500", emoji: "⚡" },
// //   task: { label: "Task", color: "text-gray-500", emoji: "📋" },
// // };

// // // ─── Component ────────────────────────────────────────

// // function TicketCard({ ticket, index, onClick }) {
// //   const priority = PRIORITY_CONFIG[ticket.priority] || PRIORITY_CONFIG.medium;
// //   const status = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.todo;
// //   const type = TYPE_CONFIG[ticket.type] || TYPE_CONFIG.task;

// //   // Format date nicely
// //   const formatDate = (date) => {
// //     const d = new Date(date);
// //     const now = new Date();
// //     const diff = now - d;
// //     const days = Math.floor(diff / (1000 * 60 * 60 * 24));

// //     if (days === 0) return "Today";
// //     if (days === 1) return "Yesterday";
// //     if (days < 7) return `${days}d ago`;
// //     return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
// //   };

// //   // Check if overdue
// //   const isOverdue =
// //     ticket.dueDate &&
// //     new Date(ticket.dueDate) < new Date() &&
// //     ticket.status !== "done";

// //   return (
// //     <motion.div
// //       initial={{ opacity: 0, y: 16 }}
// //       animate={{ opacity: 1, y: 0 }}
// //       exit={{ opacity: 0, scale: 0.97 }}
// //       transition={{ duration: 0.25, delay: index * 0.05 }}
// //       whileHover={{ y: -2, transition: { duration: 0.15 } }}
// //       onClick={onClick}
// //       className="bg-white rounded-xl border border-gray-100 p-5
// //                  cursor-pointer hover:shadow-md transition-all
// //                  duration-200 group"
// //     >
// //       {/* Top Row — Type + Priority + Status */}
// //       <div className="flex items-center justify-between mb-3">
// //         <div className="flex items-center gap-2">
// //           {/* Type emoji */}
// //           <span className="text-base">{type.emoji}</span>

// //           {/* Ticket number */}
// //           <span className="text-xs font-mono text-gray-400 font-medium">
// //             #{ticket.ticketNumber}
// //           </span>
// //         </div>

// //         <div className="flex items-center gap-2">
// //           {/* Priority Badge */}
// //           <span
// //             className={`flex items-center gap-1 text-xs font-medium
// //                            px-2 py-0.5 rounded-full border ${priority.color}`}
// //           >
// //             {priority.icon}
// //             {priority.label}
// //           </span>

// //           {/* Status Badge */}
// //           <span
// //             className={`text-xs font-medium px-2.5 py-0.5
// //                            rounded-full ${status.color}`}
// //           >
// //             {status.label}
// //           </span>
// //         </div>
// //       </div>

// //       {/* Title */}
// //       <h3
// //         className="font-semibold text-gray-900 mb-1.5 line-clamp-2
// //                      group-hover:text-blue-600 transition-colors leading-snug"
// //       >
// //         {ticket.title}
// //       </h3>

// //       {/* Description */}
// //       {ticket.description && (
// //         <p className="text-sm text-gray-400 line-clamp-2 mb-4">
// //           {ticket.description}
// //         </p>
// //       )}

// //       {/* Tags */}
// //       {ticket.tags?.length > 0 && (
// //         <div className="flex flex-wrap gap-1.5 mb-4">
// //           {ticket.tags.slice(0, 3).map((tag, i) => (
// //             <span
// //               key={i}
// //               className="flex items-center gap-1 text-xs bg-gray-50
// //                          text-gray-500 px-2 py-0.5 rounded-full border
// //                          border-gray-100"
// //             >
// //               <Tag className="w-2.5 h-2.5" />
// //               {tag}
// //             </span>
// //           ))}
// //         </div>
// //       )}

// //       {/* Bottom Row — Assignee + Date */}
// //       <div
// //         className="flex items-center justify-between pt-3
// //                       border-t border-gray-50"
// //       >
// //         {/* Assignee */}
// //         <div className="flex items-center gap-2">
// //           {ticket.assignee ? (
// //             <>
// //               <div
// //                 className="w-6 h-6 rounded-full bg-linear-to-br
// //                               from-blue-400 to-indigo-500 flex items-center
// //                               justify-center text-white text-xs font-bold"
// //               >
// //                 {ticket.assignee.name?.charAt(0).toUpperCase()}
// //               </div>
// //               <span className="text-xs text-gray-500 font-medium">
// //                 {ticket.assignee.name}
// //               </span>
// //             </>
// //           ) : (
// //             <span className="flex items-center gap-1 text-xs text-gray-300">
// //               <User className="w-3.5 h-3.5" />
// //               Unassigned
// //             </span>
// //           )}
// //         </div>

// //         {/* Date + Due */}
// //         <div className="flex items-center gap-2">
// //           {ticket.dueDate && (
// //             <span
// //               className={`flex items-center gap-1 text-xs font-medium
// //                              ${isOverdue ? "text-red-500" : "text-gray-400"}`}
// //             >
// //               <Clock className="w-3 h-3" />
// //               {isOverdue ? "Overdue" : formatDate(ticket.dueDate)}
// //             </span>
// //           )}
// //           <span className="text-xs text-gray-300">
// //             {formatDate(ticket.createdAt)}
// //           </span>
// //         </div>
// //       </div>
// //     </motion.div>
// //   );
// // }

// // // Export configs so other components can reuse
// // export { PRIORITY_CONFIG, STATUS_CONFIG, TYPE_CONFIG };
// // export default TicketCard;
