'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';

interface Message {
  id: string;
  from: string;
  to: string;
  content: string;
  time: number;
  type: 'text' | 'image' | 'file';
}

interface Conversation {
  id: string;
  userId: string;
  userName: string;
  avatar?: string;
  lastMessage?: Message;
  unreadCount: number;
}

// 模拟IM功能，用于测试
export function useIMMock() {
  const { data: session } = useSession();
  const [isReady, setIsReady] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});

  useEffect(() => {
    // 模拟初始化延迟
    const timer = setTimeout(() => {
      setIsReady(true);
      console.log('模拟IM已就绪');
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // 发送文本消息
  const sendTextMessage = useCallback(async (toUserId: string, text: string) => {
    if (!session?.user) {
      throw new Error('用户未登录');
    }

    const message: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      from: session.user.id || session.user.email || 'current_user',
      to: toUserId,
      content: text,
      time: Date.now(),
      type: 'text'
    };

    // 更新本地消息列表
    const conversationId = `C2C${toUserId}`;
    setMessages(prev => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] || []), message]
    }));

    // 模拟自动回复（仅用于测试）
    setTimeout(() => {
      const autoReply: Message = {
        id: `msg_${Date.now()}_auto`,
        from: toUserId,
        to: session.user.id || session.user.email || 'current_user',
        content: `收到你的消息："${text}"。这是自动回复，真实IM不会有这个功能。`,
        time: Date.now(),
        type: 'text'
      };

      setMessages(prev => ({
        ...prev,
        [conversationId]: [...(prev[conversationId] || []), autoReply]
      }));

      // 更新会话列表
      setConversations(prev => {
        const existing = prev.find(c => c.userId === toUserId);
        if (existing) {
          return prev.map(c => 
            c.userId === toUserId 
              ? { ...c, lastMessage: autoReply, unreadCount: c.unreadCount + 1 }
              : c
          );
        } else {
          return [...prev, {
            id: conversationId,
            userId: toUserId,
            userName: toUserId,
            lastMessage: autoReply,
            unreadCount: 1
          }];
        }
      });
    }, 1000);

    return { code: 0, data: message };
  }, [session]);

  // 获取消息列表
  const getMessageList = useCallback(async (conversationId: string) => {
    return messages[conversationId] || [];
  }, [messages]);

  // 标记已读
  const markAsRead = useCallback(async (conversationId: string) => {
    setConversations(prev => 
      prev.map(c => 
        c.id === conversationId 
          ? { ...c, unreadCount: 0 }
          : c
      )
    );
  }, []);

  return {
    isReady,
    conversations,
    messages,
    sendTextMessage,
    getMessageList,
    markAsRead
  };
}