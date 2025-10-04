export interface ProfileData {
  id: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  primarySport: string | null;
  rank: string | null;
  class: string | null;
  role: string;
  city: string | null;
  state: string | null;
  country: string | null;
  location: {
    lat: number | 0;
    lon: number | 0;
    city: string | null;
    state: string | null;
    country: string | null;
  } | null;
  dateOfBirth: string | null;
  gender: string | null;
  email: string | null;
  createdAt: string;
  updatedAt: string;
  isOwnProfile: boolean;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  friendshipStatus: "none" | "following" | "follower" | "mutual" | "self";
  isFollowing: boolean;
  isFollowedBy: boolean;
}

export interface UserItem {
  id: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
  displayName: string;
  profileImageUrl: string | null;
  bio: string | null;
  primarySport: string | null;
  rank: string | null;
  class: string | null;
  role: string;
  city: string | null;
  country: string | null;
  location: string | null;
  followedAt: string;
  followersCount: number;
  followingCount: number;
  isCurrentUser: boolean;
  isFollowingCurrentUser?: boolean;
  isFollowedByCurrentUser?: boolean;
  showPrivateInfo: boolean;
}
export const getRankEmoji = (rank: string | null) => {
  switch (rank) {
    case "KING":
      return "👑";
    case "QUEEN":
      return "👸";
    case "ROOK":
      return "🏰";
    case "BISHOP":
      return "⛪";
    case "KNIGHT":
      return "🐎";
    case "PAWN":
      return "♟️";
    default:
      return "🏆";
  }
};
export const getClassColor = (classLevel: string | null) => {
  switch (classLevel) {
    case "A":
      return "text-red-600 bg-red-50";
    case "B":
      return "text-orange-600 bg-orange-50";
    case "C":
      return "text-yellow-600 bg-yellow-50";
    case "D":
      return "text-blue-600 bg-blue-50";
    case "E":
      return "text-gray-600 bg-gray-50";
    default:
      return "text-gray-600 bg-gray-50";
  }
};
