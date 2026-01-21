
export type RatingCategory = 'PRO' | 'CON' | 'WISH';

export interface Rating {
  id: string;
  fromUserId: string;
  toUserId: string;
  category: RatingCategory;
  content: string;
  isSecret: boolean;
  votes: number;
  createdAt: number;
}

export interface User {
  id: string;
  name: string;
  avatar: string;
  points: number;
  handle: string;
}
