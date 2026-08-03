/**
 * Checks if a given user object or email string corresponds to the Super Admin.
 * 
 * @param {string|object} emailOrUser - The email address string or the Firebase user object.
 * @returns {boolean} True if the email matches VITE_SUPER_ADMIN_EMAIL, otherwise false.
 */
export const isSuperAdmin = (emailOrUser) => {
  const superAdminEmail = import.meta.env.VITE_SUPER_ADMIN_EMAIL;
  if (!superAdminEmail) {
    console.warn("VITE_SUPER_ADMIN_EMAIL is not set in the environment.");
    return false;
  }

  const email = typeof emailOrUser === "string"
    ? emailOrUser
    : (emailOrUser?.email || "");

  return email.trim().toLowerCase() === superAdminEmail.trim().toLowerCase();
};
