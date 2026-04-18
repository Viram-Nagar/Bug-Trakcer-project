/*
  ROLE HIERARCHY:
  admin      → full access (edit/delete any ticket)
  manager    → edit any ticket, delete own tickets only
  developer  → edit/delete own tickets only
  viewer     → read only, no edit/delete
*/

// Get current user's role in a project
export const getUserRole = (project, userId) => {
  if (!project || !userId) return null;

  const member = project.members?.find(
    (m) => m.user?._id === userId || m.user === userId,
  );

  return member?.role || null;
};

// Check if user is project owner
export const isProjectOwner = (project, userId) => {
  if (!project || !userId) return false;
  return project.owner?._id === userId || project.owner === userId;
};

// ── Ticket Permissions ────────────────────────────────

// Can user EDIT a ticket?
export const canEditTicket = (project, ticket, userId) => {
  if (!project || !ticket || !userId) return false;

  const role = getUserRole(project, userId);
  const owner = isProjectOwner(project, userId);

  // Project owner → always can edit
  if (owner) return true;

  // Admin/Manager → can edit any ticket in project
  if (role === "admin" || role === "manager") return true;

  // Developer → can only edit tickets they reported
  if (role === "developer") {
    return ticket.reporter?._id === userId || ticket.reporter === userId;
  }

  // Viewer → read only
  return false;
};

// Can user DELETE a ticket?
export const canDeleteTicket = (project, ticket, userId) => {
  if (!project || !ticket || !userId) return false;

  const role = getUserRole(project, userId);
  const owner = isProjectOwner(project, userId);

  // Project owner → always can delete
  if (owner) return true;

  // Admin → can delete any ticket
  if (role === "admin") return true;

  // Manager/Developer → can only delete own tickets
  if (role === "manager" || role === "developer") {
    return ticket.reporter?._id === userId || ticket.reporter === userId;
  }

  // Viewer → cannot delete
  return false;
};

// Can user ADD comments?
export const canComment = (project, userId) => {
  if (!project || !userId) return false;

  const role = getUserRole(project, userId);
  const owner = isProjectOwner(project, userId);

  if (owner) return true;

  // All roles except viewer can comment
  return role !== null && role !== "viewer";
};

// Can user CREATE tickets?
export const canCreateTicket = (project, userId) => {
  if (!project || !userId) return false;

  const role = getUserRole(project, userId);
  const owner = isProjectOwner(project, userId);

  if (owner) return true;

  return role === "admin" || role === "manager" || role === "developer";
};

// Can user MANAGE members (add/remove)?
export const canManageMembers = (project, userId) => {
  if (!project || !userId) return false;
  return isProjectOwner(project, userId);
};
