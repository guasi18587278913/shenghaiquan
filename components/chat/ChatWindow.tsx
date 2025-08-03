'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, X } from 'lucide-react';
import { useIM } from '@/hooks/useIM';

interface ChatWindowProps {
  recipientId: string;
  recipientName: string;
  onClose?: () => void;
}

export default function ChatWindow({ recipientId, recipientName, onClose }: ChatWindowProps) {
  const { isReady, messages, sendTextMessage, getMessageList, markAsRead } = useIM();
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const conversationId = `C2C${recipientId}`;

  useEffect(() => {
    if (isReady) {
      // 获取历史消息
      getMessageList(conversationId);
      // 标记已读
      markAsRead(conversationId);
    }
  }, [isReady, conversationId]);

  useEffect(() => {
    // 滚动到最新消息
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages[conversationId]]);

  const handleSend = async () => {
    if (!inputText.trim() || sending || !isReady) return;

    setSending(true);
    try {
      await sendTextMessage(recipientId, inputText);
      setInputText('');
    } catch (error) {
      console.error('发送失败:', error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const conversationMessages = messages[conversationId] || [];

  return (
    <div className="flex flex-col h-[500px] w-[350px] bg-white rounded-lg shadow-xl">
      {/* 头部 */}
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-semibold">{recipientName}</h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {!isReady ? (
          <div className="text-center text-gray-500 py-8">
            连接中...
          </div>
        ) : conversationMessages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            暂无消息，开始聊天吧！
          </div>
        ) : (
          conversationMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.from === recipientId ? 'justify-start' : 'justify-end'}`}
            >
              <div
                className={`max-w-[70%] px-3 py-2 rounded-lg ${
                  msg.from === recipientId
                    ? 'bg-gray-100 text-gray-800'
                    : 'bg-teal-600 text-white'
                }`}
              >
                <p className="text-sm">{msg.content}</p>
                <p className="text-xs opacity-70 mt-1">
                  {new Date(msg.time).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 输入框 */}
      <div className="border-t p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="输入消息..."
            disabled={!isReady || sending}
            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <button
            onClick={handleSend}
            disabled={!isReady || sending || !inputText.trim()}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}