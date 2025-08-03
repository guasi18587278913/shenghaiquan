'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { MessageCircle, Users, Send, X } from 'lucide-react';
import ChatWindowMock from '@/components/chat/ChatWindowMock';

export default function TestIMPage() {
  const { data: session } = useSession();
  const [showChat, setShowChat] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{ id: string; name: string } | null>(null);

  // 测试用户列表
  const testUsers = [
    { id: 'teacher001', name: '助教老师', role: '助教', avatar: '👨‍🏫' },
    { id: 'student001', name: '同学小明', role: '学员', avatar: '👦' },
    { id: 'student002', name: '同学小红', role: '学员', avatar: '👧' },
    { id: 'admin001', name: '管理员', role: '管理员', avatar: '👮' }
  ];

  const handleStartChat = (user: typeof testUsers[0]) => {
    setSelectedUser({ id: user.id, name: user.name });
    setShowChat(true);
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">请先登录</h2>
          <p className="text-gray-600">登录后才能使用聊天功能</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* 页面标题 */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">IM聊天测试</h1>
            <p className="text-gray-600">选择一个用户开始测试聊天功能</p>
          </div>

          {/* 当前用户信息 */}
          <div className="bg-blue-50 rounded-lg p-4 mb-8">
            <p className="text-sm text-blue-800">
              <strong>当前登录用户：</strong>{session.user?.name || session.user?.email}
            </p>
            <p className="text-xs text-blue-600 mt-1">
              用户ID：{session.user?.id || session.user?.email}
            </p>
          </div>

          {/* 测试用户列表 */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-gray-600" />
              选择聊天对象
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {testUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleStartChat(user)}
                  className="flex items-center gap-4 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors text-left"
                >
                  <div className="text-3xl">{user.avatar}</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{user.name}</h3>
                    <p className="text-sm text-gray-500">{user.role}</p>
                    <p className="text-xs text-gray-400 font-mono">ID: {user.id}</p>
                  </div>
                  <MessageCircle className="w-5 h-5 text-gray-400" />
                </button>
              ))}
            </div>
          </div>

          {/* 使用说明 */}
          <div className="mt-8 bg-amber-50 rounded-lg p-4">
            <h3 className="font-semibold text-amber-800 mb-2">测试说明：</h3>
            <ul className="text-sm text-amber-700 space-y-1">
              <li>• 点击用户卡片开始聊天</li>
              <li>• 发送的消息会实时显示在聊天窗口</li>
              <li>• 可以同时与多个用户聊天</li>
              <li>• 刷新页面后历史消息会保留</li>
            </ul>
          </div>

          {/* 技术信息 */}
          <div className="mt-4 text-xs text-gray-500 text-center">
            <p>使用腾讯云IM SDK | AppID: {process.env.NEXT_PUBLIC_IM_APPID}</p>
          </div>
        </div>
      </div>

      {/* 聊天窗口 */}
      {showChat && selectedUser && (
        <div className="fixed bottom-4 right-4 z-50">
          <ChatWindowMock
            recipientId={selectedUser.id}
            recipientName={selectedUser.name}
            onClose={() => {
              setShowChat(false);
              setSelectedUser(null);
            }}
          />
        </div>
      )}
    </div>
  );
}