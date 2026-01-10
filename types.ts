
export interface UserProfile {
  id: string;
  name: string;
  bio: string;
  photoUrl?: string;
  points: number;
  streak: number;
  dailyChallengeCount: number;
  lastChallengeDate: string;
  joinDate: string;
}

export interface AdminProfile {
  name: string;
  email: string;
  photoUrl?: string;
}

export interface HelpMessage {
  id: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: number;
  isAdmin: boolean;
}

export interface StudyLink {
  id: string;
  title: string;
  url: string;
  date: string;
}

export enum AppMode {
  HOME = 'HOME',
  STUDY = 'STUDY',
  MATH = 'MATH',
  SPEAKING = 'SPEAKING',
  QA = 'QA',
  FRIEND_CHAT = 'FRIEND_CHAT',
  HELP_LINE = 'HELP_LINE',
  ADMIN = 'ADMIN',
  GOAL = 'GOAL',
  PROFILE = 'PROFILE',
  SPELLING = 'SPELLING'
}
