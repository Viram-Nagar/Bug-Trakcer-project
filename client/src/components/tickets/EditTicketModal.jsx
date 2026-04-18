import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import {
  updateTicket,
  selectTicketLoading,
} from "../../features/tickets/ticketSlice";

function EditTicketModal({ isOpen, onClose, ticket, members = [] }) {
  const dispatch = useDispatch();
  const isLoading = useSelector(selectTicketLoading);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "bug",
    priority: "medium",
    status: "todo",
    assigneeId: "",
    dueDate: "",
  });

  useEffect(() => {
    if (ticket) {
      setFormData({
        title: ticket.title || "",
        description: ticket.description || "",
        type: ticket.type || "bug",
        priority: ticket.priority || "medium",
        status: ticket.status || "todo",
        assigneeId: ticket.assignee?._id || "",
        dueDate: ticket.dueDate
          ? new Date(ticket.dueDate).toISOString().split("T")[0]
          : "",
      });
    }
  }, [ticket]);

  const handleChange = (e) => {
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      return toast.error("Title is required");
    }

    const result = await dispatch(
      updateTicket({
        id: ticket._id,
        ticketData: {
          ...formData,
          assigneeId: formData.assigneeId || null,
          dueDate: formData.dueDate || null,
        },
      }),
    );

    if (updateTicket.fulfilled.match(result)) {
      toast.success("Ticket updated ✅");
      onClose();
    } else {
      toast.error(result.payload || "Failed to update ticket");
    }
  };

  const typeOptions = [
    { value: "bug", label: "🐛 Bug" },
    { value: "feature", label: "✨ Feature" },
    { value: "improvement", label: "⚡ Improvement" },
    { value: "task", label: "📋 Task" },
  ];

  const priorityOptions = [
    { value: "low", label: "🟢 Low" },
    { value: "medium", label: "🟡 Medium" },
    { value: "high", label: "🟠 High" },
    { value: "critical", label: "🔴 Critical" },
  ];

  const statusOptions = [
    { value: "todo", label: "To Do" },
    { value: "in-progress", label: "In Progress" },
    { value: "in-review", label: "In Review" },
    { value: "done", label: "Done" },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg
                         border border-gray-100 max-h-[90vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div
                className="flex items-center justify-between p-6
                              border-b border-gray-100 flex-shrink-0"
              >
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Edit Ticket
                  </h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    #{ticket?.ticketNumber} · Update ticket details
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Form */}
              <form
                onSubmit={handleSubmit}
                className="p-6 space-y-5 overflow-y-auto flex-1"
              >
                {/* Title */}
                <div>
                  <label
                    className="block text-sm font-medium
                                    text-gray-700 mb-1.5"
                  >
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="input-field"
                    disabled={isLoading}
                    maxLength={150}
                  />
                </div>

                {/* Description */}
                <div>
                  <label
                    className="block text-sm font-medium
                                    text-gray-700 mb-1.5"
                  >
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    className="input-field resize-none"
                    disabled={isLoading}
                    maxLength={2000}
                  />
                </div>

                {/* Type + Priority */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      className="block text-sm font-medium
                                      text-gray-700 mb-1.5"
                    >
                      Type
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      className="input-field"
                      disabled={isLoading}
                    >
                      {typeOptions.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      className="block text-sm font-medium
                                      text-gray-700 mb-1.5"
                    >
                      Priority
                    </label>
                    <select
                      name="priority"
                      value={formData.priority}
                      onChange={handleChange}
                      className="input-field"
                      disabled={isLoading}
                    >
                      {priorityOptions.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Status + Assignee */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      className="block text-sm font-medium
                                      text-gray-700 mb-1.5"
                    >
                      Status
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="input-field"
                      disabled={isLoading}
                    >
                      {statusOptions.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      className="block text-sm font-medium
                                      text-gray-700 mb-1.5"
                    >
                      Assignee
                    </label>
                    <select
                      name="assigneeId"
                      value={formData.assigneeId}
                      onChange={handleChange}
                      className="input-field"
                      disabled={isLoading}
                    >
                      <option value="">Unassigned</option>
                      {members.map((member) => (
                        <option key={member.user?._id} value={member.user?._id}>
                          {member.user?.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Due Date */}
                <div>
                  <label
                    className="block text-sm font-medium
                                    text-gray-700 mb-1.5"
                  >
                    Due Date
                  </label>
                  <input
                    type="date"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleChange}
                    className="input-field"
                    disabled={isLoading}
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="btn-secondary flex-1"
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-primary flex-1 flex items-center
                               justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <svg
                          className="animate-spin h-4 w-4"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v8H4z"
                          />
                        </svg>
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default EditTicketModal;
