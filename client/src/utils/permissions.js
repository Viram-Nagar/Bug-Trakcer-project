export const getUserRole = (project, userId) => {
  if (!project || !userId) return null;

  const member = project.members?.find(
    (m) => m.user?._id === userId || m.user === userId,
  );

  return member?.role || null;
};

export const isProjectOwner = (project, userId) => {
  if (!project || !userId) return false;
  return project.owner?._id === userId || project.owner === userId;
};

export const canEditTicket = (project, ticket, userId) => {
  if (!project || !ticket || !userId) return false;

  const role = getUserRole(project, userId);
  const owner = isProjectOwner(project, userId);

  if (owner) return true;

  if (role === "admin" || role === "manager") return true;

  if (role === "developer") {
    return ticket.reporter?._id === userId || ticket.reporter === userId;
  }

  return false;
};

export const canDeleteTicket = (project, ticket, userId) => {
  if (!project || !ticket || !userId) return false;

  const role = getUserRole(project, userId);
  const owner = isProjectOwner(project, userId);

  if (owner) return true;

  if (role === "admin") return true;

  if (role === "manager" || role === "developer") {
    return ticket.reporter?._id === userId || ticket.reporter === userId;
  }

  return false;
};

export const canComment = (project, userId) => {
  if (!project || !userId) return false;

  const role = getUserRole(project, userId);
  const owner = isProjectOwner(project, userId);

  if (owner) return true;

  return role !== null && role !== "viewer";
};

export const canCreateTicket = (project, userId) => {
  if (!project || !userId) return false;

  const role = getUserRole(project, userId);
  const owner = isProjectOwner(project, userId);

  if (owner) return true;

  return role === "admin" || role === "manager" || role === "developer";
};

export const canManageMembers = (project, userId) => {
  if (!project || !userId) return false;
  return isProjectOwner(project, userId);
};
