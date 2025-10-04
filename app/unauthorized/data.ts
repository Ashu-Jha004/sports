export interface UnauthorizedReason {
  title: string;
  description: string;
  action?: string;
  actionLink?: string;
}

export const UNAUTHORIZED_REASONS: Record<string, UnauthorizedReason> = {
  admin_required: {
    title: "Admin Access Required",
    description:
      "You need administrator privileges to access this area. Contact a founder or existing admin to request admin access.",
    action: "Contact Admin",
    actionLink: "mailto:admin@sparta.com?subject=Admin Access Request",
  },
  insufficient_permissions: {
    title: "Insufficient Permissions",
    description:
      "Your admin role doesn't have permission to access this resource. Contact a founder if you need additional permissions.",
    action: "Contact Founder",
    actionLink: "mailto:founder@sparta.com?subject=Permission Request",
  },
  default: {
    title: "Access Denied",
    description:
      "You don't have permission to access this area. Please contact an administrator if you believe this is an error.",
    action: "Go Home",
    actionLink: "/",
  },
};
