'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  MessageCircle, 
  Send, 
  Search,
  ArrowLeft,
  MoreVertical,
  Loader2
} from 'lucide-react'
import { format, isToday, isYesterday } from 'date-fns'
import { zhCN } from 'date-fns/locale'

interface Conversation {
  user: {
    id: string
    name: string | null
    avatar: string | null
  }
  lastMessage: {
    content: string
    createdAt: string
    isRead: boolean
    isSent: boolean
  }
  unreadCount: number
}

interface Message {
  id: string
  content: string
  senderId: string
  receiverId: string
  isRead: boolean
  createdAt: string
  sender: {
    id: string
    name: string | null
    avatar: string | null
  }
}

export default function MessagesPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const selectedUserId = searchParams.get('user')
  
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedUser, setSelectedUser] = useState<Conversation['user'] | null>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [messageContent, setMessageContent] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  // 获取会话列表
  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/messages/conversations')
      if (response.ok) {
        const data = await response.json()
        setConversations(data)
      }
    } catch (error) {
      console.error('获取会话列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 获取消息记录
  const fetchMessages = async (userId: string) => {
    try {
      const response = await fetch(`/api/messages?userId=${userId}`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data)
        
        // 标记消息为已读
        await fetch(`/api/messages/read`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ senderId: userId })
        })
      }
    } catch (error) {
      console.error('获取消息记录失败:', error)
    }
  }

  // 发送消息
  const sendMessage = async () => {
    if (!messageContent.trim() || !selectedUser || sending) return

    setSending(true)
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiverId: selectedUser.id,
          content: messageContent.trim()
        })
      })

      if (response.ok) {
        const newMessage = await response.json()
        setMessages([...messages, newMessage])
        setMessageContent('')
        
        // 更新会话列表
        await fetchConversations()
      }
    } catch (error) {
      console.error('发送消息失败:', error)
      alert('发送失败，请重试')
    } finally {
      setSending(false)
    }
  }

  useEffect(() => {
    if (!session) {
      router.push('/login')
      return
    }
    
    fetchConversations()
  }, [session])

  useEffect(() => {
    if (selectedUserId) {
      const user = conversations.find(c => c.user.id === selectedUserId)?.user
      if (user) {
        setSelectedUser(user)
        fetchMessages(selectedUserId)
      }
    }
  }, [selectedUserId, conversations])

  const formatMessageTime = (date: Date) => {
    if (isToday(date)) {
      return format(date, 'HH:mm')
    } else if (isYesterday(date)) {
      return '昨天 ' + format(date, 'HH:mm')
    } else {
      return format(date, 'MM-dd HH:mm')
    }
  }

  const filteredConversations = conversations.filter(conv =>
    conv.user.name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (!session) return null

  return (
    <div className="container mx-auto py-6 h-[calc(100vh-8rem)]">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
        {/* 会话列表 */}
        <Card className="md:col-span-1 h-full flex flex-col">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              消息
            </CardTitle>
            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="搜索联系人..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-0">
            <ScrollArea className="h-full">
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">暂无消息</p>
                </div>
              ) : (
                <div className="divide-y">
                  {filteredConversations.map((conv) => (
                    <button
                      key={conv.user.id}
                      className={`w-full p-4 hover:bg-muted/50 transition-colors text-left ${
                        selectedUser?.id === conv.user.id ? 'bg-muted' : ''
                      }`}
                      onClick={() => {
                        setSelectedUser(conv.user)
                        router.push(`/messages?user=${conv.user.id}`)
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={conv.user.avatar || ''} />
                          <AvatarFallback>{conv.user.name?.[0] || 'U'}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-medium truncate">
                              {conv.user.name || '未设置昵称'}
                            </p>
                            <span className="text-xs text-muted-foreground">
                              {formatMessageTime(new Date(conv.lastMessage.createdAt))}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground truncate">
                              {conv.lastMessage.isSent && '你: '}
                              {conv.lastMessage.content}
                            </p>
                            {conv.unreadCount > 0 && (
                              <Badge variant="destructive" className="ml-2">
                                {conv.unreadCount}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* 对话区域 */}
        <Card className="md:col-span-2 h-full flex flex-col">
          {selectedUser ? (
            <>
              {/* 对话头部 */}
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="md:hidden"
                      onClick={() => setSelectedUser(null)}
                    >
                      <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={selectedUser.avatar || ''} />
                      <AvatarFallback>{selectedUser.name?.[0] || 'U'}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{selectedUser.name || '未设置昵称'}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </div>
              </CardHeader>

              {/* 消息列表 */}
              <CardContent className="flex-1 p-0">
                <ScrollArea className="h-full p-4">
                  <div className="space-y-4">
                    {messages.map((message) => {
                      const isSent = message.senderId === session.user.id
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isSent ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-[70%] ${isSent ? 'order-2' : 'order-1'}`}>
                            {!isSent && (
                              <Avatar className="h-8 w-8 mb-2">
                                <AvatarImage src={message.sender.avatar || ''} />
                                <AvatarFallback>{message.sender.name?.[0] || 'U'}</AvatarFallback>
                              </Avatar>
                            )}
                            <div
                              className={`rounded-lg px-4 py-2 ${
                                isSent
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted'
                              }`}
                            >
                              <p className="whitespace-pre-wrap break-words">{message.content}</p>
                              <p className={`text-xs mt-1 ${
                                isSent ? 'text-primary-foreground/70' : 'text-muted-foreground'
                              }`}>
                                {formatMessageTime(new Date(message.createdAt))}
                              </p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </ScrollArea>
              </CardContent>

              {/* 输入区域 */}
              <div className="border-t p-4">
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    sendMessage()
                  }}
                  className="flex gap-2"
                >
                  <Textarea
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    placeholder="输入消息..."
                    className="min-h-[50px] max-h-[100px]"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        sendMessage()
                      }
                    }}
                  />
                  <Button type="submit" disabled={sending || !messageContent.trim()}>
                    {sending ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Send className="h-5 w-5" />
                    )}
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">选择一个对话开始聊天</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}