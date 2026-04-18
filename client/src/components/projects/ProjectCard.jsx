import { useState } from "react";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Trash2,
  Pencil,
  Users,
  Calendar,
  ArrowRight,
  MoreVertical,
  Users2,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  deleteProject,
  selectProjectLoading,
} from "../../features/projects/projectSlice";
import { selectUser } from "../../features/auth/authSlice";
import ConfirmModal from "../common/ConfirmModal";
import EditProjectModal from "./EditProjectModal";
import ManageMembersModal from "./ManageMembersModal";

function ProjectCard({ project, index }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const currentUser = useSelector(selectUser);
  const isLoading = useSelector(selectProjectLoading);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);

  const isOwner =
    project.owner?._id === currentUser?._id ||
    project.owner === currentUser?._id;

  const handleDelete = async () => {
    const result = await dispatch(deleteProject(project._id));
    if (deleteProject.fulfilled.match(result)) {
      toast.success("Project deleted");
      setShowDeleteModal(false);
    } else {
      toast.error(result.payload || "Failed to delete");
    }
  };

  const statusColors = {
    active: "bg-emerald-100 text-emerald-700",
    "on-hold": "bg-amber-100 text-amber-700",
    completed: "bg-blue-100 text-blue-700",
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3, delay: index * 0.08 }}
        className="bg-white rounded-2xl border border-gray-100 p-5
                   shadow-sm hover:shadow-lg transition-shadow
                   duration-300 cursor-pointer active:scale-[0.99]
                   relative"
        onClick={() => navigate(`/projects/${project._id}`)}
      >
        {/* Top Row */}
        <div className="flex items-start justify-between mb-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center
                       justify-center text-2xl shadow-sm"
            style={{ backgroundColor: project.color + "20" }}
          >
            {project.icon}
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-medium px-2.5 py-1
                             rounded-full ${statusColors[project.status]}`}
            >
              {project.status}
            </span>

            {isOwner && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowActionsMenu(!showActionsMenu);
                }}
                className="p-1.5 rounded-lg text-gray-400
                           hover:text-gray-600 hover:bg-gray-100
                           transition-colors"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Actions Dropdown */}
          {showActionsMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowActionsMenu(false);
                }}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="absolute right-4 top-14 bg-white rounded-xl
                           shadow-lg border border-gray-100 py-1 z-20
                           min-w-[140px]"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowActionsMenu(false);
                    setShowMembersModal(true);
                  }}
                  className="flex items-center gap-2 w-full px-4 py-2.5
                 text-sm text-gray-700 hover:bg-gray-50
                 transition-colors"
                >
                  <Users2 className="w-4 h-4 text-emerald-500" />
                  Members
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowActionsMenu(false);
                    setShowEditModal(true);
                  }}
                  className="flex items-center gap-2 w-full px-4 py-2.5
                             text-sm text-gray-700 hover:bg-gray-50
                             transition-colors"
                >
                  <Pencil className="w-4 h-4 text-blue-500" />
                  Edit
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowActionsMenu(false);
                    setShowDeleteModal(true);
                  }}
                  className="flex items-center gap-2 w-full px-4 py-2.5
                             text-sm text-red-600 hover:bg-red-50
                             transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </motion.div>
            </>
          )}
        </div>

        {/* Title */}
        <h3
          className="font-bold text-gray-900 text-lg mb-1
                       hover:text-blue-600 transition-colors line-clamp-1"
        >
          {project.title}
        </h3>

        {/* Description */}
        <p className="text-gray-500 text-sm mb-4 line-clamp-2 min-h-[40px]">
          {project.description || "No description provided"}
        </p>

        {/* Color bar */}
        <div
          className="h-1 rounded-full mb-4 opacity-60"
          style={{ backgroundColor: project.color }}
        />

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="flex -space-x-2">
              {project.members?.slice(0, 3).map((member, i) => (
                <div
                  key={i}
                  className="w-7 h-7 rounded-full bg-gradient-to-br
                             from-blue-400 to-indigo-500 border-2
                             border-white flex items-center justify-center
                             text-white text-xs font-bold shadow-sm"
                >
                  {member.user?.name?.charAt(0).toUpperCase() || "?"}
                </div>
              ))}
              {project.members?.length > 3 && (
                <div
                  className="w-7 h-7 rounded-full bg-gray-100
                                border-2 border-white flex items-center
                                justify-center text-gray-500 text-xs font-bold"
                >
                  +{project.members.length - 3}
                </div>
              )}
            </div>
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Users className="w-3 h-3" />
              {project.members?.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(project.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
            <ArrowRight className="w-4 h-4 text-gray-300" />
          </div>
        </div>
      </motion.div>

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        isLoading={isLoading}
        title="Delete Project?"
        message={`"${project.title}" and all its data will be permanently deleted.`}
        confirmText="Delete Project"
      />

      <ManageMembersModal
        isOpen={showMembersModal}
        onClose={() => setShowMembersModal(false)}
        project={project}
      />

      <EditProjectModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        project={project}
      />
    </>
  );
}

export default ProjectCard;
