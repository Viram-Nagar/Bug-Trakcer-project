import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import {
  createProject,
  selectProjectLoading,
} from "../../features/projects/projectSlice";

// Preset colors and icons to pick from
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

function CreateProjectModal({ isOpen, onClose }) {
  const dispatch = useDispatch();
  const isLoading = useSelector(selectProjectLoading);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    color: "#3b82f6",
    icon: "🚀",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      return toast.error("Project title is required");
    }

    const result = await dispatch(createProject(formData));

    if (createProject.fulfilled.match(result)) {
      toast.success("Project created! 🎉");
      setFormData({ title: "", description: "", color: "#3b82f6", icon: "🚀" });
      onClose();
    } else {
      toast.error(result.payload || "Failed to create project");
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
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md
                            border border-gray-100"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div
                className="flex items-center justify-between p-6 border-b
                              border-gray-100"
              >
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    New Project
                  </h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Set up your project workspace
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
                               justify-center text-3xl shadow-sm"
                    style={{ backgroundColor: formData.color + "20" }}
                  >
                    {formData.icon}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {formData.title || "Project Name"}
                    </p>
                    <p className="text-sm text-gray-400">
                      {formData.description || "Project description"}
                    </p>
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
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

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
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

                {/* Icon Picker */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Icon
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {ICONS.map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => setFormData((p) => ({ ...p, icon }))}
                        className={`w-10 h-10 rounded-xl text-xl flex items-center
                                   justify-center transition-all
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

                {/* Color Picker */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                    className="btn-primary flex-1 flex items-center justify-center gap-2"
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
                        Creating...
                      </>
                    ) : (
                      "Create Project"
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

export default CreateProjectModal;
