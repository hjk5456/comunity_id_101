
export interface User {
  id: string;
  username: string;
  avatar: string;
}

export interface Message {
  id: string;
  channelId: string;
  userId: string;
  content: string;
  timestamp: string;
}

export interface Channel {
  id: string;
  name: string;
  members: string[]; // Array of user IDs
}
