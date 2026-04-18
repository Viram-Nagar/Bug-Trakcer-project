import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import KanbanCard from "./KanbanCard";

function KanbanColumn({ column, tickets, onAddTicket }) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: { type: "column", columnId: column.id },
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col min-w-[300px] w-[300px]
                 flex-shrink-0"
    >
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2.5">
          <span
            className={`w-2.5 h-2.5 rounded-full
                           ${column.dot}`}
          />
          <h3 className="font-semibold text-gray-800 text-sm">
            {column.title}
          </h3>

          <span
            className={`text-xs font-bold px-2 py-0.5 rounded-full
                           ${column.countBg} ${column.countColor}`}
          >
            {tickets.length}
          </span>
        </div>

        <button
          onClick={() => onAddTicket(column.id)}
          className="w-7 h-7 rounded-lg flex items-center justify-center
                     text-gray-400 hover:text-gray-600 hover:bg-gray-100
                     transition-colors"
          title={`Add ticket to ${column.title}`}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <div
        ref={setNodeRef}
        className={`flex-1 rounded-2xl p-3 min-h-[500px]
                   transition-colors duration-200 space-y-3
                   ${
                     isOver
                       ? `${column.overBg} border-2 border-dashed
                        ${column.overBorder}`
                       : column.bg
                   }`}
      >
        <SortableContext
          items={tickets.map((t) => t._id)}
          strategy={verticalListSortingStrategy}
        >
          {tickets.map((ticket) => (
            <KanbanCard key={ticket._id} ticket={ticket} />
          ))}
        </SortableContext>

        {tickets.length === 0 && !isOver && (
          <div
            className="flex flex-col items-center justify-center
                          h-32 text-center"
          >
            <p className="text-xs text-gray-300 font-medium">
              Drop tickets here
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default KanbanColumn;
