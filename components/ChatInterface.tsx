import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { Channel, Message, User } from '../types';
import { HashtagIcon, PlusIcon, UsersIcon } from './icons';

// Sub-component: Modal for creating a new channel
const CreateChannelModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string) => void;
}> = ({ isOpen, onClose, onCreate }) => {
  const [channelName, setChannelName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (channelName.trim()) {
      onCreate(channelName.trim());
      setChannelName('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-gray-700 p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold text-white mb-4">Create a new channel</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={channelName}
            onChange={(e) => setChannelName(e.target.value)}
            placeholder="channel-name"
            className="w-full bg-gray-800 text-white rounded p-2 mb-4 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <div className="flex justify-end gap-4">
            <button type="button" onClick={onClose} className="text-gray-300 hover:text-white">Cancel</button>
            <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded">Create</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Sub-component: Modal for adding a new member
const AddMemberModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onAddMember: (username: string) => Promise<void>;
}> = ({ isOpen, onClose, onAddMember }) => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Username cannot be empty.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await onAddMember(username.trim());
      setUsername('');
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-gray-700 p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold text-white mb-4">Add Member to Channel</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username"
            className="w-full bg-gray-800 text-white rounded p-2 mb-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
          <div className="flex justify-end gap-4">
            <button type="button" onClick={onClose} className="text-gray-300 hover:text-white" disabled={loading}>Cancel</button>
            <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded" disabled={loading}>
              {loading ? 'Adding...' : 'Add Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


// Sub-component: Sidebar
const Sidebar: React.FC<{
    channels: Channel[];
    selectedChannelId: string;
    onSelectChannel: (id: string) => void;
    currentUser: User;
    onAddChannel: () => void;
}> = ({ channels, selectedChannelId, onSelectChannel, currentUser, onAddChannel }) => (
    <div className="bg-gray-900 text-white w-64 flex flex-col">
        <div className="p-4 font-bold text-xl border-b border-gray-800 shadow-md">Commune (Local)</div>
        <div className="flex-1 overflow-y-auto">
            <div className="p-2">
                <div className="flex justify-between items-center px-2 py-1 text-gray-400 text-sm font-semibold">
                    <span>CHANNELS</span>
                    <button onClick={onAddChannel} className="hover:text-white"><PlusIcon className="w-4 h-4" /></button>
                </div>
                <ul className="mt-2">
                    {channels.map(channel => (
                        <li key={channel.id}>
                            <a
                                href="#"
                                onClick={(e) => { e.preventDefault(); onSelectChannel(channel.id); }}
                                className={`flex items-center p-2 rounded-md text-gray-300 hover:bg-gray-700 ${selectedChannelId === channel.id ? 'bg-gray-700' : ''}`}
                            >
                                <HashtagIcon className="w-5 h-5 text-gray-500 mr-2" />
                                {channel.name}
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
        <div className="p-2 bg-gray-950 flex items-center justify-between">
            <div className="flex items-center">
                <img src={currentUser.avatar} alt={currentUser.username} className="w-10 h-10 rounded-full" />
                <span className="ml-3 font-semibold">{currentUser.username}</span>
            </div>
        </div>
    </div>
);

// Sub-component: ChatHeader
const ChatHeader: React.FC<{ channelName: string; }> = ({ channelName }) => (
    <div className="p-4 border-b border-gray-700 flex items-center justify-between shadow-sm">
        <div className="flex items-center">
            <HashtagIcon className="w-6 h-6 text-gray-500 mr-2" />
            <h1 className="text-xl font-bold">{channelName}</h1>
        </div>
    </div>
);

// Sub-component: MessageItem
const MessageItem: React.FC<{ message: Message; user?: User, showUserDetails: boolean }> = ({ message, user, showUserDetails }) => {
    if (!user) return null;

    return (
        <div className={`flex p-2 hover:bg-gray-700/50 ${showUserDetails ? 'mt-4' : ''}`}>
            {showUserDetails ? (
                <img src={user.avatar} alt={user.username} className="w-10 h-10 rounded-full mr-4" />
            ) : (
                <div className="w-10 mr-4"></div>
            )}
            <div className="flex-1">
                {showUserDetails && (
                    <div className="flex items-baseline">
                        <span className="font-bold text-indigo-400 mr-2">{user.username}</span>
                        <span className="text-xs text-gray-500">
                            {new Date(message.timestamp).toLocaleString()}
                        </span>
                    </div>
                )}
                <p className="text-gray-300">{message.content}</p>
            </div>
        </div>
    );
};


// Sub-component: MessageList
const MessageList: React.FC<{ messages: Message[], users: User[] }> = ({ messages, users }) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    useEffect(scrollToBottom, [messages]);

    return (
        <div className="flex-1 overflow-y-auto p-4 space-y-1">
            {messages.map((message, index) => {
                const user = users.find(u => u.id === message.userId);
                const prevMessage = messages[index - 1];
                const showUserDetails = !prevMessage || prevMessage.userId !== message.userId;
                return <MessageItem key={message.id} message={message} user={user} showUserDetails={showUserDetails} />;
            })}
             <div ref={messagesEndRef} />
        </div>
    );
};

// Sub-component: MessageInput
const MessageInput: React.FC<{ onSendMessage: (content: string) => void, channelName: string }> = ({ onSendMessage, channelName }) => {
    const [content, setContent] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (content.trim()) {
            onSendMessage(content.trim());
            setContent('');
        }
    };

    return (
        <div className="p-4">
            <form onSubmit={handleSubmit} className="bg-gray-600 rounded-lg p-1 flex items-center">
                <input
                    type="text"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={`Message #${channelName}`}
                    className="flex-1 bg-transparent text-white p-2 focus:outline-none"
                />
            </form>
        </div>
    );
};

// Sub-component: MemberList
const MemberList: React.FC<{ members: User[]; onAddMember: () => void; }> = ({ members, onAddMember }) => (
    <div className="bg-gray-800 text-white w-60 p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-400 flex items-center">
              <UsersIcon className="w-5 h-5 mr-2" /> MEMBERS
          </h2>
          <button onClick={onAddMember} className="text-gray-400 hover:text-white" title="Add Member">
              <PlusIcon className="w-5 h-5"/>
          </button>
        </div>
        <ul>
            {members.map(member => (
                <li key={member.id} className="flex items-center mb-3 p-1 rounded-md hover:bg-gray-700">
                    <img src={member.avatar} alt={member.username} className="w-8 h-8 rounded-full" />
                    <span className="ml-3">{member.username}</span>
                </li>
            ))}
        </ul>
    </div>
);


export const ChatInterface: React.FC = () => {
    const { state, addMessage, addChannel, addMemberToChannel } = useAppContext();
    const { users, channels, messages, currentUser } = state;
    const [selectedChannelId, setSelectedChannelId] = useState<string>('');
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [isAddMemberModalOpen, setAddMemberModalOpen] = useState(false);

    useEffect(() => {
        if (!selectedChannelId && channels.length > 0) {
            setSelectedChannelId(channels[0].id);
        }
    }, [channels, selectedChannelId]);

    const selectedChannel = channels.find(c => c.id === selectedChannelId);
    const channelMessages = messages.filter(m => m.channelId === selectedChannelId);
    const channelMembers = users.filter(user => selectedChannel?.members.includes(user.id));
    
    const handleSendMessage = (content: string) => {
        if (!selectedChannelId) return;
        addMessage(selectedChannelId, content);
    };

    const handleCreateChannel = (name: string) => {
        addChannel(name);
    };
    
    const handleAddMember = (username: string) => {
        if (!selectedChannelId) return Promise.reject(new Error("No channel selected."));
        return addMemberToChannel(selectedChannelId, username);
    };
    
    return (
        <div className="flex h-screen text-white bg-gray-800">
            <Sidebar 
                channels={channels}
                selectedChannelId={selectedChannelId}
                onSelectChannel={setSelectedChannelId}
                currentUser={currentUser}
                onAddChannel={() => setCreateModalOpen(true)}
            />
            
            <main className="flex-1 flex flex-col bg-gray-700">
                {selectedChannel ? (
                    <>
                        <ChatHeader channelName={selectedChannel.name} />
                        <div className="flex-1 flex overflow-hidden">
                           <div className="flex-1 flex flex-col">
                             <MessageList messages={channelMessages} users={users} />
                             <MessageInput onSendMessage={handleSendMessage} channelName={selectedChannel.name} />
                           </div>
                           <MemberList members={channelMembers} onAddMember={() => setAddMemberModalOpen(true)} />
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center">
                        <p className="text-gray-400">
                          {channels.length === 0 
                            ? "Create a channel to start chatting." 
                            : "Select a channel to start chatting."}
                        </p>
                    </div>
                )}
            </main>
            <CreateChannelModal isOpen={isCreateModalOpen} onClose={() => setCreateModalOpen(false)} onCreate={handleCreateChannel} />
            
            {selectedChannelId && (
              <>
                <AddMemberModal 
                    isOpen={isAddMemberModalOpen} 
                    onClose={() => setAddMemberModalOpen(false)} 
                    onAddMember={handleAddMember} 
                />
              </>
            )}
        </div>
    );
};