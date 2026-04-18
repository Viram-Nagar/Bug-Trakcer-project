import { motion } from "framer-motion";

function EmptyState({
  emoji = "📭",
  title = "Nothing here yet",
  description = "",
  action = null,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center
                 py-20 text-center px-4"
    >
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="text-5xl mb-4"
      >
        {emoji}
      </motion.div>
      <h3 className="text-xl font-semibold text-gray-700 mb-2">{title}</h3>
      {description && (
        <p className="text-gray-400 text-sm max-w-xs mb-6">{description}</p>
      )}
      {action && (
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          {action}
        </motion.div>
      )}
    </motion.div>
  );
}

export default EmptyState;
