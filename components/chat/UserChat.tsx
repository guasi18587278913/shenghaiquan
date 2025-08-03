'use client';

import { useState, useEffect } from 'react';
import { Search, MessageCircle, X, Users, Circle } from 'lucide-react';
import { useSession } from 'next-auth/react';
import ChatWindow from './ChatWindow';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  isOnline: boolean;
  lastSeenAt?: string;
}

export default function UserChat() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [activeChats, setActiveChats] = useState<{ user: User; conversationId: string }[]>([]);
  const [creatingConversation, setCreatingConversation] = useState(false);

  // 搜索用户
  const searchUsers = async (query: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/im/users/search?q=${encodeURIComponent(query)}&limit=10`);
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      }
    } catch (error) {
      console.error('搜索用户失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        searchUsers(searchQuery);
      } else {
        // 默认显示一些在线用户
        searchUsers('');
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleStartChat = async (user: User) => {
    if (creatingConversation) return;
    
    // 检查是否已有活跃聊天
    const existingChat = activeChats.find(c => c.user.id === user.id);
    if (existingChat) {
      setSelectedUser(user);
      setIsOpen(false);
      return;
    }

    setCreatingConversation(true);
    try {
      // 创建或获取会话
      const response = await fetch('/api/im/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participantIds: [user.id],
          type: 'C2C'
        })
      });

      if (response.ok) {
        const data = await response.json();
        setActiveChats([...activeChats, { user, conversationId: data.conversation.id }]);
        setSelectedUser(user);
        setIsOpen(false);
      }
    } catch (error) {
      console.error('创建会话失败:', error);
    } finally {
      setCreatingConversation(false);
    }
  };

  const handleCloseChat = (userId: string) => {
    setActiveChats(activeChats.filter(c => c.user.id !== userId));
    if (selectedUser?.id === userId) {
      setSelectedUser(null);
    }
  };

  // 更新用户在线状态
  useEffect(() => {
    if (!session?.user) return;

    // 设置在线状态
    const updateOnlineStatus = async (isOnline: boolean) => {
      try {
        await fetch('/api/im/status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isOnline, platform: 'web' })
        });
      } catch (error) {
        console.error('更新在线状态失败:', error);
      }
    };

    // 设置为在线
    updateOnlineStatus(true);

    // 离开时设置为离线
    return () => {
      updateOnlineStatus(false);
    };
  }, [session]);

  if (!session?.user) {
    return null;
  }

  return (
    <>
      {/* 聊天按钮 */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center text-white z-40"
      >
        <MessageCircle className="w-6 h-6" />
        {activeChats.length > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center font-bold">
            {activeChats.length}
          </span>
        )}
      </button>

      {/* 用户列表弹窗 */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col">
            {/* 头部 */}
            <div className="p-6 border-b">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">开始聊天</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              
              {/* 搜索框 */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="搜索用户..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            {/* 用户列表 */}
            <div className="flex-1 overflow-y-auto p-4">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div>
                  <p className="text-gray-500 mt-2">搜索中...</p>
                </div>
              ) : users.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">未找到用户</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {users.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => handleStartChat(user)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors text-left"
                    >
                      {/* 用户头像 */}
                      <div className="relative">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-10 h-10 rounded-full"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold">
                            {user.name?.[0] || user.email[0]}
                          </div>
                        )}
                        {/* 在线状态 */}
                        <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                          user.isOnline ? 'bg-green-500' : 'bg-gray-400'
                        }`} />
                      </div>
                      
                      {/* 用户信息 */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">{user.name || user.email}</h3>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span className="capitalize">{user.role.toLowerCase()}</span>
                          {!user.isOnline && user.lastSeenAt && (
                            <>
                              <span>•</span>
                              <span>最后在线 {new Date(user.lastSeenAt).toLocaleDateString()}</span>
                            </>
                          )}
                        </div>
                      </div>
                      
                      <MessageCircle className="w-5 h-5 text-gray-400" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 底部提示 */}
            <div className="p-4 border-t bg-gray-50 text-center text-xs text-gray-500">
              选择用户开始聊天
            </div>
          </div>
        </div>
      )}

      {/* 聊天窗口 */}
      {activeChats.map((chat) => (
        <div
          key={chat.user.id}
          className={`fixed bottom-4 z-50 transition-all duration-300 ${
            selectedUser?.id === chat.user.id ? 'right-4' : '-right-96'
          }`}
        >
          <ChatWindow
            conversationId={chat.conversationId}
            recipientId={chat.user.id}
            recipientName={chat.user.name || chat.user.email}
            recipientAvatar={chat.user.avatar}
            currentUserId={session.user.id}
            onClose={() => handleCloseChat(chat.user.id)}
          />
        </div>
      ))}

      {/* 最小化的聊天标签 */}
      <div className="fixed bottom-20 right-6 space-y-2 z-40">
        {activeChats.map((chat) => (
          <button
            key={chat.user.id}
            onClick={() => setSelectedUser(chat.user)}
            className={`flex items-center gap-2 bg-white rounded-full shadow-lg px-4 py-2 hover:shadow-xl transition-all ${
              selectedUser?.id === chat.user.id ? 'ring-2 ring-teal-500' : ''
            }`}
          >
            <div className="relative">
              {chat.user.avatar ? (
                <img
                  src={chat.user.avatar}
                  alt={chat.user.name}
                  className="w-6 h-6 rounded-full"
                />
              ) : (
                <div className="w-6 h-6 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {chat.user.name?.[0] || chat.user.email[0]}
                </div>
              )}
              <Circle className={`absolute -bottom-1 -right-1 w-2 h-2 ${
                chat.user.isOnline ? 'text-green-500' : 'text-gray-400'
              } fill-current`} />
            </div>
            <span className="text-sm font-medium text-gray-700 max-w-[100px] truncate">
              {chat.user.name || chat.user.email}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCloseChat(chat.user.id);
              }}
              className="ml-2 p-0.5 hover:bg-gray-100 rounded-full"
            >
              <X className="w-3 h-3 text-gray-400" />
            </button>
          </button>
        ))}
      </div>
    </>
  );
}