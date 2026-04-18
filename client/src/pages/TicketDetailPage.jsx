import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import {
  canEditTicket,
  canDeleteTicket,
  canComment,
  getUserRole,
} from "../utils/permissions";
import {
  ArrowLeft,
  Calendar,
  User,
  Tag,
  Clock,
  Pencil,
  Trash2,
  AlertCircle,
  ArrowUp,
  ArrowRight,
  ArrowDown,
  ChevronDown,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  updateTicketStatus,
  deleteTicket,
  selectTickets,
  fetchTickets,
} from "../features/tickets/ticketSlice";
import {
  selectProjects,
  fetchProjects,
} from "../features/projects/projectSlice";
import { selectUser } from "../features/auth/authSlice";
import EditTicketModal from "../components/tickets/EditTicketModal";
import { TicketDetailSkeleton } from "../components/common/Skeleton";
import PageTransition from "../components/common/PageTransition";
import ConfirmModal from "../components/common/ConfirmModal";
import CommentSection from "../components/comments/CommentSection";

// ─── Config ───────────────────────────────────────────

const PRIORITY_CONFIG = {
  critical: {
    label: "Critical",
    color: "text-red-600 bg-red-50 border border-red-200",
    icon: <AlertCircle className="w-4 h-4" />,
    bar: "bg-red-500",
  },
  high: {
    label: "High",
    color: "text-orange-600 bg-orange-50 border border-orange-200",
    icon: <ArrowUp className="w-4 h-4" />,
    bar: "bg-orange-500",
  },
  medium: {
    label: "Medium",
    color: "text-yellow-600 bg-yellow-50 border border-yellow-200",
    icon: <ArrowRight className="w-4 h-4" />,
    bar: "bg-yellow-500",
  },
  low: {
    label: "Low",
    color: "text-green-600 bg-green-50 border border-green-200",
    icon: <ArrowDown className="w-4 h-4" />,
    bar: "bg-green-500",
  },
};

const STATUS_CONFIG = {
  todo: {
    label: "To Do",
    color: "text-gray-700 bg-gray-100 border border-gray-200",
    dot: "bg-gray-400",
  },
  "in-progress": {
    label: "In Progress",
    color: "text-blue-700 bg-blue-50 border border-blue-200",
    dot: "bg-blue-500",
  },
  "in-review": {
    label: "In Review",
    color: "text-purple-700 bg-purple-50 border border-purple-200",
    dot: "bg-purple-500",
  },
  done: {
    label: "Done",
    color: "text-emerald-700 bg-emerald-50 border border-emerald-200",
    dot: "bg-emerald-500",
  },
};

const TYPE_CONFIG = {
  bug: {
    label: "Bug",
    emoji: "🐛",
    color: "text-red-600 bg-red-50 border border-red-100",
  },
  feature: {
    label: "Feature",
    emoji: "✨",
    color: "text-blue-600 bg-blue-50 border border-blue-100",
  },
  improvement: {
    label: "Improvement",
    emoji: "⚡",
    color: "text-purple-600 bg-purple-50 border border-purple-100",
  },
  task: {
    label: "Task",
    emoji: "📋",
    color: "text-gray-600 bg-gray-50 border border-gray-100",
  },
};

// ─── Component ────────────────────────────────────────

function TicketDetailPage() {
  const { projectId, ticketId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const tickets = useSelector(selectTickets);
  const projects = useSelector(selectProjects);
  const currentUser = useSelector(selectUser);

  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const ticket = tickets.find((t) => t._id === ticketId);
  const project = projects.find((p) => p._id === projectId);

  // Fetch data if not in store yet
  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch, projects.length]);

  useEffect(() => {
    dispatch(fetchTickets({ projectId, filters: {} }));
  }, [dispatch, tickets.length, projectId]);

  // ── Handlers ───────────────────────────────────────

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

  const handleDelete = async () => {
    setIsDeleting(true);
    const result = await dispatch(deleteTicket(ticket._id));
    setIsDeleting(false);

    if (deleteTicket.fulfilled.match(result)) {
      toast.success("Ticket deleted");
      navigate(`/projects/${projectId}/tickets`);
    } else {
      toast.error(result.payload || "Failed to delete");
    }
  };

  const formatDate = (date) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const isOverdue =
    ticket?.dueDate &&
    new Date(ticket.dueDate) < new Date() &&
    ticket.status !== "done";

  const priority = PRIORITY_CONFIG[ticket?.priority] || PRIORITY_CONFIG.medium;
  const status = STATUS_CONFIG[ticket?.status] || STATUS_CONFIG.todo;
  const type = TYPE_CONFIG[ticket?.type] || TYPE_CONFIG.task;

  // const isReporter =
  //   ticket.reporter?._id === currentUser?._id ||
  //   ticket.reporter === currentUser?._id;
  // const isOwner =
  //   project?.owner?._id === currentUser?._id ||
  //   project?.owner === currentUser?._id;
  // const canEdit = isReporter || isOwner;

  const userCanEdit = canEditTicket(project, ticket, currentUser?._id);
  const userCanDelete = canDeleteTicket(project, ticket, currentUser?._id);
  const userCanComment = canComment(project, currentUser?._id);
  const userRole = getUserRole(project, currentUser?._id);

  if (!ticket) {
    return <TicketDetailSkeleton />;
  }

  return (
    <PageTransition>
      <div className="p-6 max-w-5xl mx-auto">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(`/projects/${projectId}/tickets`)}
          className="flex items-center gap-2 text-gray-500
                     hover:text-gray-900 mb-6 transition-colors group"
        >
          <ArrowLeft
            className="w-4 h-4 group-hover:-translate-x-1
                                transition-transform duration-200"
          />
          <span className="text-sm font-medium">
            Back to {project?.title || "Tickets"}
          </span>
        </motion.button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── LEFT: Main Content ─────────────────── */}
          <div className="lg:col-span-2 space-y-5">
            {/* Title Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-gray-100
                         p-6 shadow-sm"
            >
              {/* Breadcrumb */}
              <div
                className="flex items-center gap-2 text-xs text-gray-400
                              mb-4"
              >
                <span>{project?.icon}</span>
                <span>{project?.title}</span>
                <span>/</span>
                <span className="font-mono font-medium text-gray-500">
                  #{ticket.ticketNumber}
                </span>
              </div>

              {/* Type + Priority Row */}
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span
                  className={`flex items-center gap-1.5 text-xs
                                 font-medium px-2.5 py-1 rounded-full
                                 ${type.color}`}
                >
                  {type.emoji} {type.label}
                </span>
                <span
                  className={`flex items-center gap-1.5 text-xs
                                 font-medium px-2.5 py-1 rounded-full
                                 ${priority.color}`}
                >
                  {priority.icon} {priority.label}
                </span>
              </div>

              {/* Title */}
              <h1
                className="text-2xl font-bold text-gray-900 mb-3
                             leading-snug"
              >
                {ticket.title}
              </h1>

              {/* Description */}
              <div className="prose prose-sm max-w-none">
                {ticket.description ? (
                  <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                    {ticket.description}
                  </p>
                ) : (
                  <p className="text-gray-300 italic text-sm">
                    No description provided
                  </p>
                )}
              </div>

              {/* Tags */}
              {ticket.tags?.length > 0 && (
                <div
                  className="flex flex-wrap gap-2 mt-5 pt-5
                                border-t border-gray-50"
                >
                  <span
                    className="text-xs text-gray-400 flex items-center
                                   gap-1 mr-1"
                  >
                    <Tag className="w-3 h-3" /> Tags:
                  </span>
                  {ticket.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="text-xs bg-blue-50 text-blue-600 px-2.5
                                 py-1 rounded-full border border-blue-100
                                 font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Activity / Meta Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl border border-gray-100
                         p-6 shadow-sm"
            >
              <h3 className="font-semibold text-gray-900 mb-4 text-sm">
                Activity
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div
                    className="w-7 h-7 rounded-full bg-gradient-to-br
                                  from-blue-400 to-indigo-500 flex items-center
                                  justify-center text-white text-xs font-bold
                                  flex-shrink-0 mt-0.5"
                  >
                    {ticket.reporter?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 bg-gray-50 rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-900">
                        {ticket.reporter?.name}
                      </span>
                      <span className="text-xs text-gray-400">
                        created this ticket
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">
                      {formatDate(ticket.createdAt)}
                    </span>
                  </div>
                </div>

                {ticket.updatedAt !== ticket.createdAt && (
                  <div className="flex items-center gap-3 pl-10">
                    <div className="flex-1 border-l-2 border-gray-100 pl-3">
                      <p className="text-xs text-gray-400">
                        Last updated {formatDate(ticket.updatedAt)}
                      </p>
                    </div>
                  </div>
                )}

                {/* Comments coming Day 9 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white rounded-2xl border border-gray-100
             p-6 shadow-sm"
                >
                  {/* Activity Timeline */}
                  <div className="mb-6 pb-6 border-b border-gray-50">
                    <h3 className="font-semibold text-gray-900 mb-4 text-sm">
                      Activity
                    </h3>
                    <div className="flex items-start gap-3">
                      <div
                        className="w-7 h-7 rounded-full bg-gradient-to-br
                      from-blue-400 to-indigo-500 flex items-center
                      justify-center text-white text-xs font-bold
                      flex-shrink-0 mt-0.5"
                      >
                        {ticket.reporter?.name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 bg-gray-50 rounded-xl p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-gray-900">
                            {ticket.reporter?.name}
                          </span>
                          <span className="text-xs text-gray-400">
                            created this ticket
                          </span>
                        </div>
                        <span className="text-xs text-gray-400">
                          {new Date(ticket.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              weekday: "short",
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            },
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Comments */}
                  <CommentSection
                    ticketId={ticket._id}
                    canComment={userCanComment}
                  />
                </motion.div>
              </div>
            </motion.div>
          </div>

          {/* ── RIGHT: Sidebar Details ─────────────── */}
          <div className="space-y-4">
            {/* Actions Card */}
            {/* {canEdit && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-2xl border border-gray-100
                           p-4 shadow-sm"
              >
                <h3
                  className="text-xs font-semibold text-gray-400
                               uppercase tracking-wider mb-3"
                >
                  Actions
                </h3>
                <div className="flex flex-col gap-2">
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => setShowEditModal(true)}
                    className="flex items-center gap-2 w-full px-4 py-2.5
                               rounded-xl border border-gray-200 text-gray-700
                               hover:bg-blue-50 hover:text-blue-600
                               hover:border-blue-200 transition-all text-sm
                               font-medium"
                  >
                    <Pencil className="w-4 h-4" />
                    Edit Ticket
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => setShowDeleteModal(true)}
                    className="flex items-center gap-2 w-full px-4 py-2.5
                               rounded-xl border border-gray-200 text-gray-700
                               hover:bg-red-50 hover:text-red-600
                               hover:border-red-200 transition-all text-sm
                               font-medium"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Ticket
                  </motion.button>
                </div>
              </motion.div>
            )} */}

            {(userCanEdit || userCanDelete) && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-2xl border border-gray-100
               p-4 shadow-sm"
              >
                <h3
                  className="text-xs font-semibold text-gray-400
                   uppercase tracking-wider mb-3"
                >
                  Actions
                </h3>
                <div className="flex flex-col gap-2">
                  {userCanEdit && (
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => setShowEditModal(true)}
                      className="flex items-center gap-2 w-full px-4 py-2.5
                     rounded-xl border border-gray-200 text-gray-700
                     hover:bg-blue-50 hover:text-blue-600
                     hover:border-blue-200 transition-all text-sm
                     font-medium"
                    >
                      <Pencil className="w-4 h-4" />
                      Edit Ticket
                    </motion.button>
                  )}

                  {userCanDelete && (
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => setShowDeleteModal(true)}
                      className="flex items-center gap-2 w-full px-4 py-2.5
                     rounded-xl border border-gray-200 text-gray-700
                     hover:bg-red-50 hover:text-red-600
                     hover:border-red-200 transition-all text-sm
                     font-medium"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Ticket
                    </motion.button>
                  )}
                </div>
              </motion.div>
            )}

            {/* Status Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 }}
              className="bg-white rounded-2xl border border-gray-100
                         p-4 shadow-sm"
            >
              <h3
                className="text-xs font-semibold text-gray-400
                             uppercase tracking-wider mb-3"
              >
                Status
              </h3>

              {/* Current Status */}
              <div className="relative">
                <button
                  onClick={() => setShowStatusMenu(!showStatusMenu)}
                  className={`flex items-center justify-between w-full
                             px-3 py-2.5 rounded-xl text-sm font-medium
                             transition-all ${status.color}`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${status.dot}`} />
                    {status.label}
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform
                    ${showStatusMenu ? "rotate-180" : ""}`}
                  />
                </button>

                {/* Dropdown */}
                {showStatusMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowStatusMenu(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute top-12 left-0 right-0 bg-white
                                 rounded-xl shadow-lg border border-gray-100
                                 py-1 z-20"
                    >
                      {Object.entries(STATUS_CONFIG).map(([value, cfg]) => (
                        <button
                          key={value}
                          onClick={() => handleStatusChange(value)}
                          className={`w-full text-left px-3 py-2.5 text-sm
                                     font-medium hover:bg-gray-50
                                     transition-colors flex items-center gap-2
                                     ${
                                       ticket.status === value
                                         ? "text-blue-600"
                                         : "text-gray-700"
                                     }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full
                                          ${cfg.dot}`}
                          />
                          {cfg.label}
                          {ticket.status === value && (
                            <span
                              className="ml-auto text-xs
                                             text-blue-400"
                            >
                              current
                            </span>
                          )}
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </div>
            </motion.div>

            {/* Details Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl border border-gray-100
                         p-4 shadow-sm"
            >
              <h3
                className="text-xs font-semibold text-gray-400
                             uppercase tracking-wider mb-4"
              >
                Details
              </h3>

              <div className="space-y-4">
                {/* Reporter */}
                <div>
                  <p className="text-xs text-gray-400 mb-1.5">Reporter</p>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-7 h-7 rounded-full bg-gradient-to-br
                                    from-blue-400 to-indigo-500 flex items-center
                                    justify-center text-white text-xs font-bold"
                    >
                      {ticket.reporter?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {ticket.reporter?.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {ticket.reporter?.email}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Assignee */}
                <div>
                  <p className="text-xs text-gray-400 mb-1.5">Assignee</p>
                  {ticket.assignee ? (
                    <div className="flex items-center gap-2">
                      <div
                        className="w-7 h-7 rounded-full bg-gradient-to-br
                                      from-emerald-400 to-teal-500 flex
                                      items-center justify-center text-white
                                      text-xs font-bold"
                      >
                        {ticket.assignee.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {ticket.assignee.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {ticket.assignee.email}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-gray-400">
                      <div
                        className="w-7 h-7 rounded-full bg-gray-100
                                      flex items-center justify-center"
                      >
                        <User className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-sm">Unassigned</span>
                    </div>
                  )}
                </div>

                {/* Due Date */}
                {ticket.dueDate && (
                  <div>
                    <p className="text-xs text-gray-400 mb-1.5">Due Date</p>
                    <div
                      className={`flex items-center gap-2 text-sm
                                   font-medium
                                   ${
                                     isOverdue
                                       ? "text-red-500"
                                       : "text-gray-700"
                                   }`}
                    >
                      <Clock className="w-4 h-4" />
                      {formatDate(ticket.dueDate)}
                      {isOverdue && (
                        <span
                          className="text-xs bg-red-50 text-red-500
                                         px-1.5 py-0.5 rounded-full"
                        >
                          Overdue
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Created */}
                <div>
                  <p className="text-xs text-gray-400 mb-1.5">Created</p>
                  <div
                    className="flex items-center gap-2 text-sm
                                  text-gray-700"
                  >
                    <Calendar className="w-4 h-4 text-gray-400" />
                    {formatDate(ticket.createdAt)}
                  </div>
                </div>

                {/* Updated */}
                <div>
                  <p className="text-xs text-gray-400 mb-1.5">Updated</p>
                  <div
                    className="flex items-center gap-2 text-sm
                                  text-gray-700"
                  >
                    <Calendar className="w-4 h-4 text-gray-400" />
                    {formatDate(ticket.updatedAt)}
                  </div>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-white rounded-2xl border border-gray-100
             p-4 shadow-sm"
            >
              <h3
                className="text-xs font-semibold text-gray-400
                 uppercase tracking-wider mb-3"
              >
                Your Access
              </h3>
              <div className="space-y-2">
                {/* Role Badge */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Role</span>
                  <span
                    className={`text-xs font-semibold px-2.5 py-1
                       rounded-full capitalize
                       ${
                         userRole === "admin"
                           ? "bg-red-50 text-red-600"
                           : userRole === "manager"
                             ? "bg-purple-50 text-purple-600"
                             : userRole === "developer"
                               ? "bg-blue-50 text-blue-600"
                               : "bg-gray-50 text-gray-600"
                       }`}
                  >
                    {userRole || "viewer"}
                  </span>
                </div>

                {/* Permissions */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Edit</span>
                  <span
                    className={`text-xs font-medium
                       ${userCanEdit ? "text-emerald-600" : "text-gray-300"}`}
                  >
                    {userCanEdit ? "✓ Allowed" : "✗ Restricted"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Delete</span>
                  <span
                    className={`text-xs font-medium
                       ${userCanDelete ? "text-emerald-600" : "text-gray-300"}`}
                  >
                    {userCanDelete ? "✓ Allowed" : "✗ Restricted"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Comment</span>
                  <span
                    className={`text-xs font-medium
                       ${
                         userCanComment ? "text-emerald-600" : "text-gray-300"
                       }`}
                  >
                    {userCanComment ? "✓ Allowed" : "✗ Restricted"}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <EditTicketModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        ticket={ticket}
        members={project?.members || []}
      />

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Delete Ticket?"
        message={`"${ticket.title}" will be permanently deleted.`}
        confirmText="Delete Ticket"
      />
    </PageTransition>
  );
}

export default TicketDetailPage;
