import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useNavigate, useParams } from "react-router-dom";
import {
  AlertCircle,
  ArrowUp,
  ArrowRight,
  ArrowDown,
  User,
  GripVertical,
} from "lucide-react";

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

const TYPE_EMOJI = {
  bug: "🐛",
  feature: "✨",
  improvement: "⚡",
  task: "📋",
};

function KanbanCard({ ticket, isOverlay = false }) {
  const navigate = useNavigate();
  const { projectId } = useParams();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: ticket._id,
    data: {
      type: "ticket",
      ticket,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const priority = PRIORITY_CONFIG[ticket.priority] || PRIORITY_CONFIG.medium;

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="bg-blue-50 border-2 border-blue-200 border-dashed
                   rounded-xl h-[130px] opacity-50"
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-xl border border-gray-100 p-4
                 shadow-sm hover:shadow-md transition-shadow
                 duration-200 group
                 ${
                   isOverlay
                     ? "rotate-2 shadow-xl scale-105 border-blue-200"
                     : ""
                 }`}
    >
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <span className="text-sm">{TYPE_EMOJI[ticket.type] || "📋"}</span>
          <span className="text-xs font-mono text-gray-400">
            #{ticket.ticketNumber}
          </span>
        </div>

        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 rounded-lg
                     text-gray-300 hover:text-gray-500 hover:bg-gray-50
                     transition-colors touch-none"
          title="Drag to move"
        >
          <GripVertical className="w-4 h-4" />
        </div>
      </div>

      <h4
        onClick={() => navigate(`/projects/${projectId}/tickets/${ticket._id}`)}
        className="text-sm font-semibold text-gray-900 line-clamp-2
                   leading-snug mb-2.5 cursor-pointer
                   hover:text-blue-600 transition-colors"
      >
        {ticket.title}
      </h4>
      <div className="mb-3">
        <span
          className={`inline-flex items-center gap-1 text-xs
                         font-medium px-2 py-0.5 rounded-full border
                         ${priority.color}`}
        >
          {priority.icon}
          {priority.label}
        </span>
      </div>

      <div
        className="flex items-center justify-between pt-2.5
                      border-t border-gray-50"
      >
        {ticket.assignee ? (
          <div className="flex items-center gap-1.5">
            <div
              className="w-5 h-5 rounded-full bg-gradient-to-br
                            from-blue-400 to-indigo-500 flex items-center
                            justify-center text-white text-xs font-bold"
            >
              {ticket.assignee.name?.charAt(0).toUpperCase()}
            </div>
            <span className="text-xs text-gray-500 max-w-[80px] truncate">
              {ticket.assignee.name}
            </span>
          </div>
        ) : (
          <span className="flex items-center gap-1 text-xs text-gray-300">
            <User className="w-3 h-3" />
            Unassigned
          </span>
        )}

        {ticket.dueDate && (
          <span
            className={`text-xs font-medium
            ${
              new Date(ticket.dueDate) < new Date() && ticket.status !== "done"
                ? "text-red-500"
                : "text-gray-400"
            }`}
          >
            {new Date(ticket.dueDate).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </span>
        )}
      </div>
    </div>
  );
}

export default KanbanCard;
