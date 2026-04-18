import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, FolderOpen, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import {
  fetchProjects,
  selectProjects,
  selectProjectLoading,
  selectProjectError,
  clearProjectError,
} from "../features/projects/projectSlice";
import { ProjectCardSkeleton } from "../components/common/Skeleton";
import ProjectCard from "../components/projects/ProjectCard";
import CreateProjectModal from "../components/projects/CreateProjectModal";
import PageTransition from "../components/common/PageTransition";

function ProjectsPage() {
  const dispatch = useDispatch();
  const projects = useSelector(selectProjects);
  const isLoading = useSelector(selectProjectLoading);
  const error = useSelector(selectProjectError);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearProjectError());
    }
  }, [error, dispatch]);

  const filteredProjects = projects.filter((p) => {
    const matchSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || p.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <PageTransition>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between
                   gap-4 mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
            <p className="text-gray-500 mt-1">
              {projects.length} project{projects.length !== 1 ? "s" : ""} total
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsModalOpen(true)}
            className="btn-primary flex items-center gap-2 px-5 py-2.5"
          >
            <Plus className="w-5 h-5" />
            New Project
          </motion.button>
        </motion.div>

        {/* Search + Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col sm:flex-row gap-3 mb-8"
        >
          {/* Search */}
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2
                             w-4 h-4 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10"
            />
          </div>

          {/* Status Filter */}
          <div className="flex gap-2">
            {["all", "active", "on-hold", "completed"].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium
                         transition-all capitalize
                         ${
                           filter === status
                             ? "bg-blue-600 text-white shadow-sm"
                             : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                         }`}
              >
                {status}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Content */}
        {isLoading ? (
          <div
            className="grid grid-cols-1 sm:grid-cols-2
                  lg:grid-cols-3 gap-5"
          >
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <ProjectCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <EmptyState
            emoji="📁"
            title="No projects yet"
            description="Create your first project to start tracking
               bugs and issues"
            action={
              <button
                onClick={() => setIsModalOpen(true)}
                className="btn-primary flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create First Project
              </button>
            }
          />
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            <AnimatePresence>
              {filteredProjects.map((project, index) => (
                <ProjectCard
                  key={project._id}
                  project={project}
                  index={index}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Create Project Modal */}
        <CreateProjectModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </div>
    </PageTransition>
  );
}

export default ProjectsPage;
