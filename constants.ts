import { User, Channel, Message } from './types';

export const LOCAL_USER: User = {
  id: 'user-1',
  username: 'LocalUser',
  avatar: 'https://ui-avatars.com/api/?name=LU&background=0D8ABC&color=fff&size=128',
};

// Start with only the local user, no other example users.
export const MOCK_USERS: User[] = [
  LOCAL_USER,
];

// Start with no default channels.
export const MOCK_CHANNELS: Channel[] = [];

// Start with no messages.
export const MOCK_MESSAGES: Message[] = [];
