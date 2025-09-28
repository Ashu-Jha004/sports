// Database notification types (matching your Prisma schema)
export type NotificationType =
  | "STAT_UPDATE_REQUEST"
  | "STAT_UPDATE_APPROVED"
  | "STAT_UPDATE_DENIED"
  | "FRIEND_REQUEST"
  | "JOIN_REQUEST"
  | "TEAM_INVITE"
  | "TEAM_EXPIRING"
  | "MEMBER_JOINED"
  | "MEMBER_LEFT"
  | "ROLE_CHANGED"
  | "MESSAGE"
  | "MENTION"
  | "STAT_UPDATE_PERMISSION"
  | "FOLLOW"
  | "LIKE"
  | "COMMENT";

// Database notification interface
export interface DatabaseNotification {
  id: string;
  userId: string;
  actorId: string | null;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
  actor?: {
    id: string;
    username: string | null;
    firstName: string | null;
    lastName: string | null;
    profileImageUrl: string | null;
  } | null;
}

// Toast notification interface
export interface ToastNotification {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message?: string;
  duration?: number;
  dismissible?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
  createdAt: Date;
}
