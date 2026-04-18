import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { Ticket, ArrowRight, Users2 } from "lucide-react";
import {
  ArrowLeft,
  Users,
  Calendar,
  Trash2,
  Pencil,
  LayoutGrid,
  List,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  fetchProjects,
  deleteProject,
  selectProjects,
  selectProjectLoading,
} from "../features/projects/projectSlice";
import ManageMembersModal from "../components/projects/ManageMembersModal";
import { selectUser } from "../features/auth/authSlice";
import ConfirmModal from "../components/common/ConfirmModal";
import EditProjectModal from "../components/projects/EditProjectModal";
import PageTransition from "../components/common/PageTransition";

function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const projects = useSelector(selectProjects);
  const isLoading = useSelector(selectProjectLoading);
  const currentUser = useSelector(selectUser);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);

  const project = projects.find((p) => p._id === id);

  const isOwner =
    project?.owner?._id === currentUser?._id ||
    project?.owner === currentUser?._id;

  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch, project]);

  const handleDelete = async () => {
    const result = await dispatch(deleteProject(id));
    if (deleteProject.fulfilled.match(result)) {
      toast.success("Project deleted");
      navigate("/projects");
    } else {
      toast.error(result.payload || "Failed to delete");
    }
  };

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-4xl mb-3">🔍</div>
          <p className="text-gray-500">Loading project...</p>
        </div>
      </div>
    );
  }

  const statusColors = {
    active: "bg-emerald-100 text-emerald-700",
    "on-hold": "bg-amber-100 text-amber-700",
    completed: "bg-blue-100 text-blue-700",
  };

  return (
    <PageTransition>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate("/projects")}
          className="flex items-center gap-2 text-gray-500
                     hover:text-gray-900 mb-6 transition-colors group"
        >
          <ArrowLeft
            className="w-4 h-4 group-hover:-translate-x-1
                                transition-transform"
          />
          Back to Projects
        </motion.button>

        {/* Project Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-gray-100
                     p-8 mb-6 shadow-sm"
        >
          <div className="flex items-start gap-5">
            {/* Icon */}
            <div
              className="w-16 h-16 rounded-2xl flex items-center
                         justify-center text-3xl shadow-sm shrink-0"
              style={{ backgroundColor: project.color + "20" }}
            >
              {project.icon}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h1 className="text-2xl font-bold text-gray-900">
                  {project.title}
                </h1>
                <span
                  className={`text-xs font-medium px-2.5 py-1
                                 rounded-full ${statusColors[project.status]}`}
                >
                  {project.status}
                </span>
              </div>

              <p className="text-gray-500">
                {project.description || "No description"}
              </p>

              <div
                className="flex items-center gap-6 mt-4 text-sm
                              text-gray-400"
              >
                <span className="flex items-center gap-1.5">
                  <Users className="w-4 h-4" />
                  {project.members?.length} members
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  Created {new Date(project.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Owner Actions */}
            {isOwner && (
              <div className="flex gap-2 shrink-0">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowMembersModal(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl
                 border border-gray-200 text-gray-600
                 hover:bg-emerald-50 hover:text-emerald-600
                 hover:border-emerald-200 transition-all
                 text-sm font-medium"
                >
                  <Users2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Members</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowEditModal(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl
                             border border-gray-200 text-gray-600
                             hover:bg-blue-50 hover:text-blue-600
                             hover:border-blue-200 transition-all text-sm
                             font-medium"
                >
                  <Pencil className="w-4 h-4" />
                  Edit
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowDeleteModal(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl
                             border border-gray-200 text-gray-600
                             hover:bg-red-50 hover:text-red-600
                             hover:border-red-200 transition-all text-sm
                             font-medium"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </motion.button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Members */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border border-gray-100
                     p-6 shadow-sm"
        >
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" />
            Team Members
          </h2>
          <div className="space-y-3">
            {project.members?.map((member, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-2
                           border-b border-gray-50 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-full bg-linear-to-br
                                  from-blue-400 to-indigo-500 flex items-center
                                  justify-center text-white font-bold text-sm"
                  >
                    {member.user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {member.user?.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {member.user?.email}
                    </p>
                  </div>
                </div>
                <span
                  className="text-xs bg-gray-100 text-gray-600
                                 px-2.5 py-1 rounded-full font-medium
                                 capitalize"
                >
                  {member.role}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Tickets placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl border border-gray-100
             shadow-sm overflow-hidden"
        >
          <div
            className="flex items-center justify-between p-6
                  border-b border-gray-50"
          >
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <Ticket className="w-5 h-5 text-blue-500" />
              Tickets
            </h2>

            {/* Both view buttons */}
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(`/projects/${id}/kanban`)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl
                   border border-gray-200 text-gray-600
                   hover:bg-purple-50 hover:text-purple-600
                   hover:border-purple-200 transition-all
                   text-sm font-medium"
              >
                <LayoutGrid className="w-4 h-4" />
                Board View
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(`/projects/${id}/tickets`)}
                className="btn-primary flex items-center gap-2 text-sm py-2"
              >
                <ArrowRight className="w-4 h-4" />
                List View
              </motion.button>
            </div>
          </div>

          <div className="p-6 grid grid-cols-2 gap-4">
            <button
              onClick={() => navigate(`/projects/${id}/tickets`)}
              className="flex flex-col items-center gap-2 p-6 rounded-xl
                 bg-gray-50 hover:bg-blue-50 hover:text-blue-600
                 transition-colors border border-gray-100
                 hover:border-blue-100 group"
            >
              <List
                className="w-8 h-8 text-gray-400
                       group-hover:text-blue-500"
              />
              <span
                className="text-sm font-semibold text-gray-700
                       group-hover:text-blue-600"
              >
                List View
              </span>
              <span className="text-xs text-gray-400 text-center">
                Filter, search and manage all tickets
              </span>
            </button>

            <button
              onClick={() => navigate(`/projects/${id}/kanban`)}
              className="flex flex-col items-center gap-2 p-6 rounded-xl
                 bg-gray-50 hover:bg-purple-50 hover:text-purple-600
                 transition-colors border border-gray-100
                 hover:border-purple-100 group"
            >
              <LayoutGrid
                className="w-8 h-8 text-gray-400
                             group-hover:text-purple-500"
              />
              <span
                className="text-sm font-semibold text-gray-700
                       group-hover:text-purple-600"
              >
                Board View
              </span>
              <span className="text-xs text-gray-400 text-center">
                Drag and drop Kanban board
              </span>
            </button>
          </div>
        </motion.div>
      </div>

      {/* Modals */}
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
    </PageTransition>
  );
}

export default ProjectDetailPage;
