'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, X } from 'lucide-react';
import { useIMMock } from '@/hooks/useIMMock';

interface ChatWindowMockProps {
  recipientId: string;
  recipientName: string;
  onClose?: () => void;
}

export default function ChatWindowMock({ recipientId, recipientName, onClose }: ChatWindowMockProps) {
  const { isReady, messages, sendTextMessage, getMessageList, markAsRead } = useIMMock();
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
  }, [isReady, conversationId, getMessageList, markAsRead]);

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
      alert('发送失败，请重试');
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
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-t-lg">
        <div>
          <h3 className="font-semibold">{recipientName}</h3>
          <p className="text-xs opacity-75">模拟聊天（测试版）</p>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-white/20 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {!isReady ? (
          <div className="text-center text-gray-500 py-8">
            <div className="animate-pulse">连接中...</div>
          </div>
        ) : conversationMessages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p className="mb-2">暂无消息</p>
            <p className="text-sm">发送第一条消息开始聊天吧！</p>
          </div>
        ) : (
          conversationMessages.map((msg) => {
            const isFromMe = msg.from !== recipientId;
            return (
              <div
                key={msg.id}
                className={`flex ${isFromMe ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] px-3 py-2 rounded-lg ${
                    isFromMe
                      ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white'
                      : 'bg-white text-gray-800 shadow-sm'
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                  <p className={`text-xs mt-1 ${isFromMe ? 'text-teal-100' : 'text-gray-400'}`}>
                    {new Date(msg.time).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 输入框 */}
      <div className="border-t p-4 bg-white rounded-b-lg">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="输入消息..."
            disabled={!isReady || sending}
            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
          <button
            onClick={handleSend}
            disabled={!isReady || sending || !inputText.trim()}
            className="px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-lg hover:from-teal-600 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center"
          >
            {sending ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2 text-center">
          模拟版本 - 消息不会真实发送
        </p>
      </div>
    </div>
  );
}