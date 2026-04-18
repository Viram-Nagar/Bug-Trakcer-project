import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Pencil,
  Trash2,
  Reply,
  X,
  MessageSquare,
  Loader2,
  CornerDownRight,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  fetchComments,
  addComment,
  updateComment,
  deleteComment,
  clearComments,
  selectComments,
  selectCommentLoading,
  selectCommentSubmitting,
} from "../../features/comments/commentSlice";
import { CommentSkeleton } from "../common/Skeleton";
import { selectUser } from "../../features/auth/authSlice";

function CommentItem({ comment, onReply, onEdit, onDelete, currentUser }) {
  const isAuthor =
    comment.author?._id === currentUser?._id ||
    comment.author === currentUser?._id;

  const formatTime = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="group"
    >
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div
            className="w-8 h-8 rounded-full bg-gradient-to-br
                          from-blue-400 to-indigo-500 flex items-center
                          justify-center text-white text-xs font-bold"
          >
            {comment.author?.name?.charAt(0).toUpperCase()}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-sm font-semibold text-gray-900">
              {comment.author?.name}
              {comment.author?._id === currentUser?._id && (
                <span className="text-xs text-blue-500 font-normal ml-1">
                  (you)
                </span>
              )}
            </span>
            <span className="text-xs text-gray-400">
              {formatTime(comment.createdAt)}
            </span>
            {comment.updatedAt !== comment.createdAt && (
              <span className="text-xs text-gray-300 italic">edited</span>
            )}
          </div>

          {comment.parentComment && (
            <div
              className="flex items-center gap-1.5 mb-1.5 text-xs
                            text-gray-400 bg-gray-50 rounded-lg px-2
                            py-1 border-l-2 border-gray-200"
            >
              <CornerDownRight className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">Replying to a comment</span>
            </div>
          )}

          <div
            className="bg-gray-50 rounded-xl rounded-tl-sm px-4
                          py-3 text-sm text-gray-800 leading-relaxed
                          whitespace-pre-wrap border border-gray-100"
          >
            {comment.text}
          </div>

          <div className="flex items-center gap-3 mt-1.5 ml-1">
            <button
              onClick={() => onReply(comment)}
              className="flex items-center gap-1 text-xs text-gray-400
                         hover:text-blue-500 transition-colors py-1"
            >
              <Reply className="w-3.5 h-3.5" />
              Reply
            </button>

            {isAuthor && (
              <>
                <button
                  onClick={() => onEdit(comment)}
                  className="flex items-center gap-1 text-xs text-gray-400
                             hover:text-blue-500 transition-colors py-1"
                >
                  <Pencil className="w-3 h-3" />
                  Edit
                </button>
                <button
                  onClick={() => onDelete(comment._id)}
                  className="flex items-center gap-1 text-xs text-gray-400
                             hover:text-red-500 transition-colors py-1"
                >
                  <Trash2 className="w-3 h-3" />
                  Delete
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function CommentSection({ ticketId, canComment = true }) {
  const dispatch = useDispatch();
  const comments = useSelector(selectComments);
  const isLoading = useSelector(selectCommentLoading);
  const isSubmitting = useSelector(selectCommentSubmitting);
  const currentUser = useSelector(selectUser);

  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [editingComment, setEditingComment] = useState(null);
  const [editText, setEditText] = useState("");

  const textareaRef = useRef(null);
  const editTextareaRef = useRef(null);

  useEffect(() => {
    if (ticketId) {
      dispatch(fetchComments(ticketId));
    }
    return () => {
      dispatch(clearComments());
    };
  }, [dispatch, ticketId]);

  useEffect(() => {
    if (replyTo && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [replyTo]);

  useEffect(() => {
    if (editingComment && editTextareaRef.current) {
      editTextareaRef.current.focus();
    }
  }, [editingComment]);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;

    const result = await dispatch(
      addComment({
        ticketId,
        text: trimmed,
        parentCommentId: replyTo?._id || null,
      }),
    );

    if (addComment.fulfilled.match(result)) {
      setText("");
      setReplyTo(null);
    } else {
      toast.error(result.payload || "Failed to add comment");
    }
  };

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      handleSubmit();
    }
  };

  const handleReply = (comment) => {
    setReplyTo(comment);
    setEditingComment(null);
    textareaRef.current?.focus();
  };

  const handleEdit = (comment) => {
    setEditingComment(comment);
    setEditText(comment.text);
    setReplyTo(null);
  };

  const handleEditSubmit = async (e) => {
    e?.preventDefault();
    const trimmed = editText.trim();
    if (!trimmed) return;
    if (trimmed === editingComment.text) {
      setEditingComment(null);
      return;
    }

    const result = await dispatch(
      updateComment({ id: editingComment._id, text: trimmed }),
    );

    if (updateComment.fulfilled.match(result)) {
      toast.success("Comment updated");
      setEditingComment(null);
      setEditText("");
    } else {
      toast.error(result.payload || "Failed to update");
    }
  };

  const handleDelete = async (commentId) => {
    const result = await dispatch(deleteComment(commentId));
    if (deleteComment.fulfilled.match(result)) {
      toast.success("Comment deleted");
    } else {
      toast.error(result.payload || "Failed to delete");
    }
  };

  const autoResize = (e) => {
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-blue-500" />
        <h3 className="font-bold text-gray-900">
          Comments
          {comments.length > 0 && (
            <span className="ml-2 text-sm font-normal text-gray-400">
              ({comments.length})
            </span>
          )}
        </h3>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <CommentSkeleton key={i} />
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8">
          <MessageSquare
            className="w-10 h-10 text-gray-200
                                    mx-auto mb-2"
          />
          <p className="text-sm text-gray-400">
            No comments yet. Be the first!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {comments.map((comment) => (
              <div key={comment._id}>
                {/* Indent replies */}
                <div className={comment.parentComment ? "ml-10" : ""}>
                  {editingComment?._id === comment._id ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex gap-3"
                    >
                      <div
                        className="w-8 h-8 rounded-full bg-gradient-to-br
                                      from-blue-400 to-indigo-500 flex
                                      items-center justify-center text-white
                                      text-xs font-bold flex-shrink-0"
                      >
                        {currentUser?.name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <textarea
                          ref={editTextareaRef}
                          value={editText}
                          onChange={(e) => {
                            setEditText(e.target.value);
                            autoResize(e);
                          }}
                          onKeyDown={(e) => {
                            if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                              handleEditSubmit();
                            }
                            if (e.key === "Escape") {
                              setEditingComment(null);
                            }
                          }}
                          className="w-full border border-blue-300 rounded-xl
                                     px-4 py-3 text-sm resize-none
                                     focus:outline-none focus:ring-2
                                     focus:ring-blue-500 min-h-[80px]"
                          maxLength={1000}
                        />
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={handleEditSubmit}
                            disabled={isSubmitting || !editText.trim()}
                            className="btn-primary text-xs py-1.5 px-3
                                       flex items-center gap-1"
                          >
                            <Send className="w-3 h-3" />
                            Save
                          </button>
                          <button
                            onClick={() => setEditingComment(null)}
                            className="btn-secondary text-xs py-1.5 px-3"
                          >
                            Cancel
                          </button>
                          <span className="text-xs text-gray-300 ml-auto">
                            Ctrl+Enter to save
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <CommentItem
                      comment={comment}
                      currentUser={currentUser}
                      onReply={handleReply}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  )}
                </div>
              </div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {canComment ? (
        <div className="pt-4 border-t border-gray-100">
          <div className="pt-4 border-t border-gray-100">
            <AnimatePresence>
              {replyTo && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="flex items-center justify-between bg-blue-50
                         border border-blue-100 rounded-xl px-4 py-2.5
                         mb-3 text-sm"
                >
                  <div
                    className="flex items-center gap-2 text-blue-700
                              min-w-0"
                  >
                    <CornerDownRight className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">
                      Replying to <strong>{replyTo.author?.name}</strong>:{" "}
                      <span className="font-normal opacity-75">
                        {replyTo.text.substring(0, 50)}
                        {replyTo.text.length > 50 ? "..." : ""}
                      </span>
                    </span>
                  </div>
                  <button
                    onClick={() => setReplyTo(null)}
                    className="ml-2 text-blue-400 hover:text-blue-600
                           flex-shrink-0 p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex gap-3">
              {/* Current user avatar */}
              <div className="flex-shrink-0">
                <div
                  className="w-8 h-8 rounded-full bg-gradient-to-br
                            from-blue-400 to-indigo-500 flex items-center
                            justify-center text-white text-xs font-bold"
                >
                  {currentUser?.name?.charAt(0).toUpperCase()}
                </div>
              </div>

              <div className="flex-1">
                <div
                  className="relative border border-gray-200 rounded-xl
                            focus-within:border-blue-400 focus-within:ring-2
                            focus-within:ring-blue-100 transition-all
                            bg-white overflow-hidden"
                >
                  <textarea
                    ref={textareaRef}
                    value={text}
                    onChange={(e) => {
                      setText(e.target.value);
                      autoResize(e);
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder={
                      replyTo
                        ? `Reply to ${replyTo.author?.name}...`
                        : "Add a comment... (Ctrl+Enter to submit)"
                    }
                    rows={3}
                    maxLength={1000}
                    className="w-full px-4 pt-3 pb-2 text-sm resize-none
                           focus:outline-none bg-transparent
                           placeholder:text-gray-300"
                  />

                  <div
                    className="flex items-center justify-between
                              px-3 pb-2.5 pt-1"
                  >
                    <span className="text-xs text-gray-300">
                      {text.length}/1000
                    </span>

                    <button
                      onClick={handleSubmit}
                      disabled={isSubmitting || !text.trim()}
                      className="flex items-center gap-1.5 bg-blue-600
                             hover:bg-blue-700 text-white text-xs
                             font-medium px-3 py-1.5 rounded-lg
                             transition-colors disabled:opacity-50
                             disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Send className="w-3.5 h-3.5" />
                      )}
                      {isSubmitting ? "Sending..." : "Comment"}
                    </button>
                  </div>
                </div>

                <p className="text-xs text-gray-300 mt-1.5 ml-1">
                  Ctrl+Enter to submit · Esc to cancel edit
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="pt-4 border-t border-gray-100">
          <div
            className="flex items-center gap-3 p-4 bg-gray-50
                    rounded-xl border border-gray-100"
          >
            <span className="text-2xl">🔒</span>
            <div>
              <p className="text-sm font-medium text-gray-700">
                View only access
              </p>
              <p className="text-xs text-gray-400">
                Viewers cannot add comments
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CommentSection;
