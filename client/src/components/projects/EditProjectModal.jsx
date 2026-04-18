import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import {
  updateProject,
  selectProjectLoading,
} from "../../features/projects/projectSlice";

const COLORS = [
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#f59e0b",
  "#10b981",
  "#ef4444",
  "#06b6d4",
  "#f97316",
];

const ICONS = ["🚀", "🐛", "⚡", "🎯", "🔥", "💡", "🛠️", "🎨", "📊", "🌟"];

function EditProjectModal({ isOpen, onClose, project }) {
  const dispatch = useDispatch();
  const isLoading = useSelector(selectProjectLoading);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    color: "#3b82f6",
    icon: "🚀",
    status: "active",
  });

  useEffect(() => {
    if (project) {
      setFormData({
        title: project.title || "",
        description: project.description || "",
        color: project.color || "#3b82f6",
        icon: project.icon || "🚀",
        status: project.status || "active",
      });
    }
  }, [project]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      return toast.error("Project title is required");
    }

    const result = await dispatch(
      updateProject({ id: project._id, projectData: formData }),
    );

    if (updateProject.fulfilled.match(result)) {
      toast.success("Project updated! ✅");
      onClose();
    } else {
      toast.error(result.payload || "Failed to update project");
    }
  };

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
            className="fixed inset-0 z-50 flex items-center
                       justify-center p-4"
          >
            <div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md
                         border border-gray-100"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div
                className="flex items-center justify-between p-6
                              border-b border-gray-100"
              >
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Edit Project
                  </h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Update your project details
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
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {/* Preview */}
                <div
                  className="flex items-center gap-4 p-4 rounded-xl
                                bg-gray-50 border border-gray-100"
                >
                  <div
                    className="w-14 h-14 rounded-xl flex items-center
                               justify-center text-3xl shadow-sm flex-shrink-0"
                    style={{ backgroundColor: formData.color + "20" }}
                  >
                    {formData.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 truncate">
                      {formData.title || "Project Name"}
                    </p>
                    <p className="text-sm text-gray-400 truncate">
                      {formData.description || "Project description"}
                    </p>
                  </div>
                </div>

                <div>
                  <label
                    className="block text-sm font-medium
                                    text-gray-700 mb-1.5"
                  >
                    Project Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, title: e.target.value }))
                    }
                    placeholder="e.g. E-Commerce App"
                    className="input-field"
                    disabled={isLoading}
                    maxLength={100}
                  />
                </div>

                <div>
                  <label
                    className="block text-sm font-medium
                                    text-gray-700 mb-1.5"
                  >
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        description: e.target.value,
                      }))
                    }
                    placeholder="What is this project about?"
                    rows={3}
                    className="input-field resize-none"
                    disabled={isLoading}
                    maxLength={500}
                  />
                </div>

                <div>
                  <label
                    className="block text-sm font-medium
                                    text-gray-700 mb-1.5"
                  >
                    Status
                  </label>
                  <div className="flex gap-2">
                    {["active", "on-hold", "completed"].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() =>
                          setFormData((p) => ({ ...p, status: s }))
                        }
                        className={`flex-1 py-2 rounded-lg text-sm font-medium
                                   capitalize transition-all border
                                   ${
                                     formData.status === s
                                       ? "bg-blue-600 text-white border-blue-600"
                                       : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                                   }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label
                    className="block text-sm font-medium
                                    text-gray-700 mb-2"
                  >
                    Icon
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {ICONS.map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => setFormData((p) => ({ ...p, icon }))}
                        className={`w-10 h-10 rounded-xl text-xl flex
                                   items-center justify-center transition-all
                                   ${
                                     formData.icon === icon
                                       ? "ring-2 ring-blue-500 bg-blue-50 scale-110"
                                       : "bg-gray-50 hover:bg-gray-100"
                                   }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label
                    className="block text-sm font-medium
                                    text-gray-700 mb-2"
                  >
                    Color
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setFormData((p) => ({ ...p, color }))}
                        className={`w-8 h-8 rounded-full transition-all
                                   ${
                                     formData.color === color
                                       ? "scale-125 ring-2 ring-offset-2 ring-gray-400"
                                       : "hover:scale-110"
                                   }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

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

export default EditProjectModal;
