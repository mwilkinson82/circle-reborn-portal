export function configuredAdminEmails() {
  return (process.env.ADMIN_EMAILS ?? process.env.OWNER_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isConfiguredAdminEmail(email: string | null | undefined) {
  if (!email) return false;
  return configuredAdminEmails().includes(email.trim().toLowerCase());
}
