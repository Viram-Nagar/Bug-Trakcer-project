import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import {
  X,
  UserPlus,
  Trash2,
  Crown,
  Shield,
  Code2,
  Eye,
  Loader2,
  Mail,
  ChevronDown,
} from "lucide-react";
import toast from "react-hot-toast";
import { addMember, removeMember } from "../../features/projects/projectSlice";
import { selectUser } from "../../features/auth/authSlice";

const ROLE_CONFIG = {
  admin: {
    label: "Admin",
    icon: Shield,
    color: "text-red-600 bg-red-50 border-red-200",
    desc: "Can edit/delete any ticket",
  },
  manager: {
    label: "Manager",
    icon: Crown,
    color: "text-purple-600 bg-purple-50 border-purple-200",
    desc: "Can edit any ticket",
  },
  developer: {
    label: "Developer",
    icon: Code2,
    color: "text-blue-600 bg-blue-50 border-blue-200",
    desc: "Can edit own tickets",
  },
  viewer: {
    label: "Viewer",
    icon: Eye,
    color: "text-gray-600 bg-gray-50 border-gray-200",
    desc: "Read only access",
  },
};

function RoleBadge({ role }) {
  const config = ROLE_CONFIG[role] || ROLE_CONFIG.viewer;
  const Icon = config.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs
                     font-medium px-2 py-0.5 rounded-full border
                     ${config.color}`}
    >
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
}

function ManageMembersModal({ isOpen, onClose, project }) {
  const dispatch = useDispatch();
  const currentUser = useSelector(selectUser);

  const [email, setEmail] = useState("");
  const [role, setRole] = useState("developer");
  const [isAdding, setIsAdding] = useState(false);
  const [removingId, setRemovingId] = useState(null);
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const isOwner =
    project?.owner?._id === currentUser?._id ||
    project?.owner === currentUser?._id;

  const handleAddMember = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      return toast.error("Please enter an email address");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return toast.error("Please enter a valid email address");
    }

    setIsAdding(true);

    const result = await dispatch(
      addMember({
        id: project._id,
        email: email.trim().toLowerCase(),
        role,
      }),
    );

    setIsAdding(false);

    if (addMember.fulfilled.match(result)) {
      toast.success(`Member added as ${ROLE_CONFIG[role].label}! 🎉`);
      setEmail("");
      setRole("developer");
    } else {
      toast.error(result.payload || "Failed to add member");
    }
  };

  const handleRemoveMember = async (userId, memberName) => {
    if (!window.confirm) {
    }
    setRemovingId(userId);

    const result = await dispatch(removeMember({ id: project._id, userId }));

    setRemovingId(null);

    if (removeMember.fulfilled.match(result)) {
      toast.success(`${memberName} removed from project`);
    } else {
      toast.error(result.payload || "Failed to remove member");
    }
  };

  if (!project) return null;

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
              className="bg-white rounded-2xl shadow-2xl w-full
                         max-w-lg border border-gray-100
                         max-h-[90vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div
                className="flex items-center justify-between
                              p-6 border-b border-gray-100 flex-shrink-0"
              >
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Manage Members
                  </h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {project.title} · {project.members?.length} member
                    {project.members?.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl hover:bg-gray-100
                             transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                {isOwner && (
                  <div className="p-6 border-b border-gray-100">
                    <h3
                      className="text-sm font-semibold text-gray-700
                                   mb-3 flex items-center gap-2"
                    >
                      <UserPlus className="w-4 h-4 text-blue-500" />
                      Invite New Member
                    </h3>

                    <form onSubmit={handleAddMember} className="space-y-3">
                      {/* Email Input */}
                      <div className="relative">
                        <Mail
                          className="absolute left-3 top-1/2
                                        -translate-y-1/2 w-4 h-4
                                        text-gray-400"
                        />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Enter member's email address"
                          className="input-field pl-10"
                          disabled={isAdding}
                        />
                      </div>

                      {/* Role Selector */}
                      <div>
                        <label
                          className="block text-xs font-medium
                                          text-gray-500 mb-1.5"
                        >
                          Assign Role
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {Object.entries(ROLE_CONFIG).map(
                            ([value, config]) => {
                              const Icon = config.icon;
                              return (
                                <button
                                  key={value}
                                  type="button"
                                  onClick={() => setRole(value)}
                                  className={`flex items-start gap-2
                                             p-3 rounded-xl border
                                             text-left transition-all
                                             ${
                                               role === value
                                                 ? `${config.color} ring-1`
                                                 : "border-gray-200 hover:bg-gray-50"
                                             }`}
                                >
                                  <Icon
                                    className={`w-4 h-4 mt-0.5
                                    flex-shrink-0
                                    ${role === value ? "" : "text-gray-400"}`}
                                  />
                                  <div>
                                    <p
                                      className={`text-xs font-semibold
                                      ${role === value ? "" : "text-gray-700"}`}
                                    >
                                      {config.label}
                                    </p>
                                    <p
                                      className="text-xs text-gray-400
                                                  mt-0.5 leading-tight"
                                    >
                                      {config.desc}
                                    </p>
                                  </div>
                                </button>
                              );
                            },
                          )}
                        </div>
                      </div>

                      {/* Submit */}
                      <button
                        type="submit"
                        disabled={isAdding || !email.trim()}
                        className="btn-primary w-full flex items-center
                                   justify-center gap-2"
                      >
                        {isAdding ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Adding...
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-4 h-4" />
                            Add Member
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                )}

                {/* Members List */}
                <div className="p-6">
                  <h3
                    className="text-sm font-semibold text-gray-700
                                 mb-3"
                  >
                    Current Members ({project.members?.length})
                  </h3>

                  <div className="space-y-2">
                    {project.members?.map((member) => {
                      const isCurrentUser =
                        member.user?._id === currentUser?._id;
                      const isMemberOwner =
                        project.owner?._id === member.user?._id ||
                        project.owner === member.user?._id;
                      const isRemoving = removingId === member.user?._id;

                      return (
                        <motion.div
                          key={member.user?._id}
                          layout
                          className="flex items-center gap-3 p-3
                                     rounded-xl hover:bg-gray-50
                                     transition-colors border
                                     border-transparent
                                     hover:border-gray-100"
                        >
                          {/* Avatar */}
                          <div
                            className="w-10 h-10 rounded-full
                                          bg-gradient-to-br from-blue-400
                                          to-indigo-500 flex items-center
                                          justify-center text-white
                                          font-bold text-sm flex-shrink-0"
                          >
                            {member.user?.name?.charAt(0).toUpperCase()}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div
                              className="flex items-center gap-2
                                            flex-wrap"
                            >
                              <p
                                className="text-sm font-semibold
                                            text-gray-900 truncate"
                              >
                                {member.user?.name}
                              </p>
                              {isCurrentUser && (
                                <span className="text-xs text-blue-500">
                                  (you)
                                </span>
                              )}
                              {isMemberOwner && (
                                <span
                                  className="flex items-center
                                                 gap-0.5 text-xs
                                                 text-amber-600
                                                 font-medium"
                                >
                                  <Crown className="w-3 h-3" />
                                  Owner
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-400 truncate">
                              {member.user?.email}
                            </p>
                          </div>

                          {/* Role Badge */}
                          <RoleBadge role={member.role} />

                          {isOwner && !isMemberOwner && !isCurrentUser && (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() =>
                                handleRemoveMember(
                                  member.user?._id,
                                  member.user?.name,
                                )
                              }
                              disabled={isRemoving}
                              className="p-2 rounded-lg text-gray-400
                                         hover:text-red-500
                                         hover:bg-red-50 transition-all
                                         disabled:opacity-50
                                         flex-shrink-0"
                              title={`Remove ${member.user?.name}`}
                            >
                              {isRemoving ? (
                                <Loader2
                                  className="w-4 h-4
                                                    animate-spin"
                                />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </motion.button>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                {/* Role Legend */}
                <div className="px-6 pb-6">
                  <div
                    className="bg-gray-50 rounded-xl p-4
                                  border border-gray-100"
                  >
                    <p
                      className="text-xs font-semibold text-gray-500
                                  uppercase tracking-wider mb-3"
                    >
                      Role Permissions
                    </p>
                    <div className="space-y-2">
                      {Object.entries(ROLE_CONFIG).map(([role, config]) => {
                        const Icon = config.icon;
                        return (
                          <div key={role} className="flex items-center gap-2">
                            <Icon
                              className="w-3.5 h-3.5
                                              text-gray-400
                                              flex-shrink-0"
                            />
                            <span
                              className="text-xs font-medium
                                               text-gray-700 w-20"
                            >
                              {config.label}
                            </span>
                            <span className="text-xs text-gray-400">
                              {config.desc}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default ManageMembersModal;
