import React, { createContext, useReducer, useContext, useEffect, ReactNode, useCallback } from 'react';
import { User, Channel, Message } from '../types';
import { LOCAL_USER, MOCK_USERS, MOCK_CHANNELS, MOCK_MESSAGES } from '../constants';

// --- Local Storage Utilities ---
const getFromStorage = <T,>(key: string, defaultValue: T): T => {
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage key "${key}":`, error);
    return defaultValue;
  }
};

const saveToStorage = <T,>(key: string, value: T) => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving to localStorage key "${key}":`, error);
  }
};

// --- State and Reducer ---
interface AppState {
  users: User[];
  channels: Channel[];
  messages: Message[];
  currentUser: User;
}

type Action =
  | { type: 'SET_STATE'; payload: AppState }
  | { type: 'ADD_CHANNEL'; payload: Channel }
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'ADD_MEMBER'; payload: { channelId: string; userId: string } };

const initialState: AppState = {
  users: getFromStorage('commune_users', MOCK_USERS),
  channels: getFromStorage('commune_channels', MOCK_CHANNELS),
  messages: getFromStorage('commune_messages', MOCK_MESSAGES),
  currentUser: LOCAL_USER,
};

const appReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'SET_STATE':
      return action.payload;

    case 'ADD_CHANNEL':
      return { ...state, channels: [...state.channels, action.payload] };

    case 'ADD_MESSAGE':
      return { ...state, messages: [...state.messages, action.payload] };

    case 'ADD_MEMBER': {
      const { channelId, userId } = action.payload;
      return {
        ...state,
        channels: state.channels.map(c =>
          c.id === channelId && !c.members.includes(userId)
            ? { ...c, members: [...c.members, userId] }
            : c
        ),
      };
    }

    default:
      return state;
  }
};

// --- Context Definition ---
interface AppContextType {
  state: AppState;
  addChannel: (name: string) => void;
  addMessage: (channelId: string, content: string) => void;
  addMemberToChannel: (channelId: string, username: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// --- Provider Component ---
interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider = ({ children }: AppProviderProps) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Persist state to localStorage on any change
  useEffect(() => {
    saveToStorage('commune_users', state.users);
    saveToStorage('commune_channels', state.channels);
    saveToStorage('commune_messages', state.messages);
  }, [state]);

  const addChannel = useCallback(
    (name: string) => {
      const newChannel: Channel = {
        id: `channel-${Date.now()}`,
        name,
        members: [state.currentUser.id],
      };
      dispatch({ type: 'ADD_CHANNEL', payload: newChannel });
    },
    [state.currentUser]
  );

  const addMessage = useCallback(
    (channelId: string, content: string) => {
      const newMessage: Message = {
        id: `msg-${Date.now()}`,
        channelId,
        userId: state.currentUser.id,
        content,
        timestamp: new Date().toISOString(),
      };
      dispatch({ type: 'ADD_MESSAGE', payload: newMessage });
    },
    [state.currentUser]
  );

  const addMemberToChannel = useCallback(
    async (channelId: string, username: string) => {
      const userToAdd = state.users.find(
        u => u.username.toLowerCase() === username.toLowerCase()
      );

      if (!userToAdd) {
        throw new Error(`User "${username}" not found.`);
      }

      const channel = state.channels.find(c => c.id === channelId);
      if (channel?.members.includes(userToAdd.id)) {
        throw new Error(`User "${username}" is already in this channel.`);
      }

      dispatch({ type: 'ADD_MEMBER', payload: { channelId, userId: userToAdd.id } });
    },
    [state.users, state.channels]
  );

  return (
    <AppContext.Provider value={{ state, addChannel, addMessage, addMemberToChannel }}>
      {children}
    </AppContext.Provider>
  );
};

// --- Custom Hook ---
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
