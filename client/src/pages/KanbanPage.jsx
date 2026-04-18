import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { KanbanBoardSkeleton } from "../components/common/Skeleton";
import PageTransition from "../components/common/PageTransition";

/*
  dnd-kit imports explained:
  
  DndContext        → wraps entire drag-drop area, handles all events
  DragOverlay       → renders a floating preview of dragged item
  PointerSensor     → detects mouse/touch drag (with activation distance)
  KeyboardSensor    → allows keyboard drag-drop for accessibility
  useSensor(s)      → creates sensor instances
  closestCorners    → collision detection algorithm
                      (finds closest column corner to dropped item)
*/
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Loader2, LayoutGrid, List } from "lucide-react";
import toast from "react-hot-toast";

import {
  fetchTickets,
  updateTicketStatus,
  selectTickets,
  selectTicketLoading,
  selectTicketError,
  clearTicketError,
  clearTickets,
} from "../features/tickets/ticketSlice";
import {
  fetchProjects,
  selectProjects,
} from "../features/projects/projectSlice";

import KanbanColumn from "../components/kanban/KanbanColumn";
import KanbanCard from "../components/kanban/KanbanCard";
import CreateTicketModal from "../components/tickets/CreateTicketModal";

// ── Column Definitions ────────────────────────────────
const COLUMNS = [
  {
    id: "todo",
    title: "To Do",
    dot: "bg-gray-400",
    bg: "bg-gray-50",
    overBg: "bg-gray-100",
    overBorder: "border-gray-300",
    countBg: "bg-gray-200",
    countColor: "text-gray-600",
  },
  {
    id: "in-progress",
    title: "In Progress",
    dot: "bg-blue-500",
    bg: "bg-blue-50/50",
    overBg: "bg-blue-100",
    overBorder: "border-blue-300",
    countBg: "bg-blue-100",
    countColor: "text-blue-600",
  },
  {
    id: "in-review",
    title: "In Review",
    dot: "bg-purple-500",
    bg: "bg-purple-50/50",
    overBg: "bg-purple-100",
    overBorder: "border-purple-300",
    countBg: "bg-purple-100",
    countColor: "text-purple-600",
  },
  {
    id: "done",
    title: "Done",
    dot: "bg-emerald-500",
    bg: "bg-emerald-50/50",
    overBg: "bg-emerald-100",
    overBorder: "border-emerald-300",
    countBg: "bg-emerald-100",
    countColor: "text-emerald-600",
  },
];

// ── Main Component ────────────────────────────────────

function KanbanPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const tickets = useSelector(selectTickets);
  const isLoading = useSelector(selectTicketLoading);
  const error = useSelector(selectTicketError);
  const projects = useSelector(selectProjects);

  const project = projects.find((p) => p._id === projectId);

  // Which ticket is currently being dragged
  const [activeTicket, setActiveTicket] = useState(null);

  // Create modal state + which column to pre-select
  const [createModal, setCreateModal] = useState({
    open: false,
    defaultStatus: "todo",
  });

  // ── Fetch Data ────────────────────────────────────

  useEffect(() => {
    if (projects.length === 0) dispatch(fetchProjects());
  }, [dispatch, projects.length]);

  useEffect(() => {
    if (projectId) {
      dispatch(fetchTickets({ projectId, filters: {} }));
    }
    return () => {
      dispatch(clearTickets());
    };
  }, [dispatch, projectId]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearTicketError());
    }
  }, [error, dispatch]);

  // ── DnD Sensors ──────────────────────────────────
  /*
    PointerSensor with activationConstraint:
    distance: 8 → user must drag at least 8px before drag starts.
    This prevents accidental drags when clicking cards.
    
    Without this, clicking a card would immediately start dragging!
  */
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // ── Group tickets by status ───────────────────────

  const getColumnTickets = useCallback(
    (columnId) => tickets.filter((t) => t.status === columnId),
    [tickets],
  );

  // ── DnD Event Handlers ────────────────────────────

  const handleDragStart = (event) => {
    /*
      event.active.data.current contains data we set in useSortable
      { type: "ticket", ticket: {...} }
    */
    const { data } = event.active;
    if (data.current?.type === "ticket") {
      setActiveTicket(data.current.ticket);
    }
  };

  const handleDragOver = (event) => {
    /*
      This fires continuously while dragging.
      We don't need to do anything here for column-to-column
      because we handle it in handleDragEnd.
    */
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    // Reset active ticket
    setActiveTicket(null);

    // If dropped outside any droppable area
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    // If dropped in same position — do nothing
    if (activeId === overId) return;

    /*
      Determine the target column.
      
      Case 1: Dropped directly onto a COLUMN
        → over.id = column id (e.g. "in-progress")
        → over.data.current.type = "column"
      
      Case 2: Dropped onto another TICKET in a column
        → over.id = ticket._id
        → over.data.current.type = "ticket"
        → we get the column from the ticket's status
    */
    let targetColumnId;

    if (over.data.current?.type === "column") {
      targetColumnId = over.id;
    } else if (over.data.current?.type === "ticket") {
      // Find the ticket being dropped on → get its column
      const overTicket = tickets.find((t) => t._id === overId);
      targetColumnId = overTicket?.status;
    }

    if (!targetColumnId) return;

    // Find the dragged ticket
    const draggedTicket = tickets.find((t) => t._id === activeId);
    if (!draggedTicket) return;

    // If status hasn't changed — do nothing
    if (draggedTicket.status === targetColumnId) return;

    /*
      Optimistic update pattern:
      1. Update Redux state immediately (feels instant)
      2. Call API in background
      3. If API fails → show error (Redux already reverted? No — 
         we keep it optimistic and show error only)
      
      This makes the UI feel responsive even on slow connections.
    */
    const result = await dispatch(
      updateTicketStatus({
        id: activeId,
        status: targetColumnId,
      }),
    );

    if (updateTicketStatus.fulfilled.match(result)) {
      const columnName = COLUMNS.find((c) => c.id === targetColumnId)?.title;
      toast.success(`Moved to ${columnName} ✓`, {
        duration: 1500,
      });
    } else {
      toast.error("Failed to update status");
    }
  };

  // ── Open create modal with pre-selected status ────

  const handleAddTicket = (columnId) => {
    setCreateModal({ open: true, defaultStatus: columnId });
  };

  // ─────────────────────────────────────────────────

  return (
    <PageTransition>
      <div className="flex flex-col h-full">
        {/* ── Page Header ────────────────────────────── */}
        <div className="flex-shrink-0 mb-6">
          {/* Back Button */}
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate(`/projects/${projectId}`)}
            className="flex items-center gap-2 text-gray-500
                     hover:text-gray-900 mb-4 transition-colors group"
          >
            <ArrowLeft
              className="w-4 h-4 group-hover:-translate-x-1
                                transition-transform duration-200"
            />
            <span className="text-sm font-medium">
              Back to {project?.title || "Project"}
            </span>
          </motion.button>

          {/* Title + Actions */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">{project?.icon || "🗂️"}</span>
                <h1 className="text-2xl font-bold text-gray-900">
                  Kanban Board
                </h1>
              </div>
              <p className="text-gray-500 text-sm">
                {tickets.length} ticket{tickets.length !== 1 ? "s" : ""} · Drag
                to update status
              </p>
            </div>

            {/* View Toggle — Link to tickets list */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate(`/projects/${projectId}/tickets`)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl
                         border border-gray-200 text-gray-600
                         hover:bg-gray-50 transition-colors text-sm
                         font-medium"
              >
                <List className="w-4 h-4" />
                List View
              </button>

              <button
                className="flex items-center gap-2 px-4 py-2 rounded-xl
                         bg-blue-600 text-white text-sm font-medium
                         shadow-sm"
              >
                <LayoutGrid className="w-4 h-4" />
                Board View
              </button>
            </div>
          </div>
        </div>

        {/* ── Kanban Board ────────────────────────────── */}
        {isLoading ? (
          <KanbanBoardSkeleton />
        ) : (
          /*
          DndContext — the root context for all drag-drop.
          
          sensors        → how drag is initiated (mouse/touch/keyboard)
          collisionDetection → algorithm to find drop target
          onDragStart    → fires when drag begins
          onDragOver     → fires when dragging over something
          onDragEnd      → fires when drag is released
        */
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            {/* Horizontal scroll container */}
            <div
              className="flex gap-5 overflow-x-auto pb-6
                          scrollbar-thin scrollbar-thumb-gray-200
                          scrollbar-track-transparent"
            >
              {COLUMNS.map((column) => (
                <KanbanColumn
                  key={column.id}
                  column={column}
                  tickets={getColumnTickets(column.id)}
                  onAddTicket={handleAddTicket}
                />
              ))}
            </div>

            {/*
            DragOverlay — renders the card that "floats"
            under the cursor while dragging.
            
            Without this, the original card just disappears
            during drag. With overlay, you see a floating copy.
            
            dropAnimation → smooth animation when card is dropped.
          */}
            <DragOverlay
              dropAnimation={{
                duration: 200,
                easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)",
              }}
            >
              {activeTicket ? (
                <KanbanCard ticket={activeTicket} isOverlay={true} />
              ) : null}
            </DragOverlay>
          </DndContext>
        )}

        {/* ── Create Ticket Modal ──────────────────────── */}
        <CreateTicketModal
          isOpen={createModal.open}
          onClose={() => setCreateModal({ open: false, defaultStatus: "todo" })}
          projectId={projectId}
          members={project?.members || []}
          defaultStatus={createModal.defaultStatus}
        />
      </div>
    </PageTransition>
  );
}

export default KanbanPage;
