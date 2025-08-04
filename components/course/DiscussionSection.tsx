'use client';

import { useState } from 'react';
import { MessageSquare, Send, Heart, Reply, MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Comment {
  id: string;
  author: string;
  avatar: string;
  content: string;
  timestamp: string;
  likes: number;
  replies?: Comment[];
  isLiked?: boolean;
}

interface DiscussionSectionProps {
  lessonId: number;
  lessonTitle: string;
}

// 示例评论数据
const mockComments: Comment[] = [
  {
    id: '1',
    author: '学习者A',
    avatar: '👨‍💻',
    content: '这节课讲得很清楚！Cursor 确实很强大，配合 GitHub Copilot 使用效果更好。',
    timestamp: '2小时前',
    likes: 5,
    isLiked: false,
    replies: [
      {
        id: '1-1',
        author: '深海圈助教',
        avatar: '🐙',
        content: '是的，Cursor 和 GitHub Copilot 是很好的组合。建议你也试试 v0.dev，对快速原型开发很有帮助！',
        timestamp: '1小时前',
        likes: 3,
        isLiked: true,
      }
    ]
  },
  {
    id: '2',
    author: '产品新手',
    avatar: '🚀',
    content: '请问 bolt.new 和 v0.dev 有什么区别？哪个更适合新手？',
    timestamp: '5小时前',
    likes: 8,
    isLiked: false,
  }
];

export default function DiscussionSection({ lessonId, lessonTitle }: DiscussionSectionProps) {
  const [comments, setComments] = useState<Comment[]>(mockComments);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [showAllReplies, setShowAllReplies] = useState<Set<string>>(new Set());

  // 发送评论
  const handleSubmitComment = () => {
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: Date.now().toString(),
      author: '我',
      avatar: '😊',
      content: newComment,
      timestamp: '刚刚',
      likes: 0,
      isLiked: false,
    };

    if (replyTo) {
      // 添加回复
      setComments(comments.map(c => {
        if (c.id === replyTo) {
          return {
            ...c,
            replies: [...(c.replies || []), comment]
          };
        }
        return c;
      }));
      setReplyTo(null);
    } else {
      // 添加新评论
      setComments([comment, ...comments]);
    }

    setNewComment('');
  };

  // 切换点赞
  const toggleLike = (commentId: string, parentId?: string) => {
    setComments(comments.map(c => {
      if (parentId && c.id === parentId) {
        return {
          ...c,
          replies: c.replies?.map(r => {
            if (r.id === commentId) {
              return {
                ...r,
                likes: r.isLiked ? r.likes - 1 : r.likes + 1,
                isLiked: !r.isLiked
              };
            }
            return r;
          })
        };
      }
      
      if (c.id === commentId) {
        return {
          ...c,
          likes: c.isLiked ? c.likes - 1 : c.likes + 1,
          isLiked: !c.isLiked
        };
      }
      return c;
    }));
  };

  // 切换显示所有回复
  const toggleShowReplies = (commentId: string) => {
    const newSet = new Set(showAllReplies);
    if (newSet.has(commentId)) {
      newSet.delete(commentId);
    } else {
      newSet.add(commentId);
    }
    setShowAllReplies(newSet);
  };

  return (
    <div className="max-w-4xl mx-auto mt-12 p-8">
      <div className="bg-white rounded-lg shadow-sm">
        {/* 标题栏 */}
        <div className="px-8 py-6 border-b">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-6 h-6 text-indigo-600" />
            <h2 className="text-xl font-bold">课程讨论</h2>
            <span className="text-sm text-gray-500">({comments.length} 条讨论)</span>
          </div>
          <p className="mt-2 text-sm text-gray-600">
            分享你的学习心得，提出疑问，与其他学员一起交流
          </p>
        </div>

        {/* 发表评论区 */}
        <div className="p-6 border-b bg-gray-50">
          <div className="flex gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-full flex items-center justify-center text-white font-medium">
              我
            </div>
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={replyTo ? "写下你的回复..." : "分享你的想法..."}
                className="w-full px-4 py-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows={3}
              />
              <div className="mt-3 flex items-center justify-between">
                {replyTo && (
                  <button
                    onClick={() => setReplyTo(null)}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    取消回复
                  </button>
                )}
                <button
                  onClick={handleSubmitComment}
                  disabled={!newComment.trim()}
                  className={cn(
                    "ml-auto px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all",
                    newComment.trim() ?
                      "bg-indigo-600 text-white hover:bg-indigo-700" :
                      "bg-gray-200 text-gray-400 cursor-not-allowed"
                  )}
                >
                  <Send className="w-4 h-4" />
                  发表
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 评论列表 */}
        <div className="divide-y">
          {comments.map((comment) => (
            <div key={comment.id} className="p-6">
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-xl">
                  {comment.avatar}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{comment.author}</span>
                    <span className="text-sm text-gray-500">{comment.timestamp}</span>
                  </div>
                  <p className="text-gray-700 mb-3">{comment.content}</p>
                  
                  {/* 操作按钮 */}
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => toggleLike(comment.id)}
                      className={cn(
                        "flex items-center gap-1 text-sm transition-colors",
                        comment.isLiked ? "text-red-500" : "text-gray-500 hover:text-red-500"
                      )}
                    >
                      <Heart className={cn("w-4 h-4", comment.isLiked && "fill-current")} />
                      <span>{comment.likes}</span>
                    </button>
                    <button
                      onClick={() => setReplyTo(comment.id)}
                      className="flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600"
                    >
                      <Reply className="w-4 h-4" />
                      回复
                    </button>
                    <button className="text-gray-400 hover:text-gray-600">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>

                  {/* 回复列表 */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="mt-4">
                      {/* 显示第一条回复 */}
                      <div className="pl-4 border-l-2 border-gray-100">
                        {(showAllReplies.has(comment.id) ? comment.replies : comment.replies.slice(0, 1)).map((reply) => (
                          <div key={reply.id} className="mb-4 last:mb-0">
                            <div className="flex gap-3">
                              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm">
                                {reply.avatar}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium text-sm">{reply.author}</span>
                                  <span className="text-xs text-gray-500">{reply.timestamp}</span>
                                </div>
                                <p className="text-sm text-gray-700 mb-2">{reply.content}</p>
                                <button
                                  onClick={() => toggleLike(reply.id, comment.id)}
                                  className={cn(
                                    "flex items-center gap-1 text-xs transition-colors",
                                    reply.isLiked ? "text-red-500" : "text-gray-500 hover:text-red-500"
                                  )}
                                >
                                  <Heart className={cn("w-3 h-3", reply.isLiked && "fill-current")} />
                                  <span>{reply.likes}</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* 查看更多回复按钮 */}
                      {comment.replies.length > 1 && (
                        <button
                          onClick={() => toggleShowReplies(comment.id)}
                          className="mt-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                        >
                          {showAllReplies.has(comment.id) ? 
                            '收起回复' : 
                            `查看全部 ${comment.replies.length} 条回复`
                          }
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 加载更多 */}
        <div className="p-6 text-center">
          <button className="text-indigo-600 hover:text-indigo-700 font-medium">
            加载更多讨论
          </button>
        </div>
      </div>
    </div>
  );
}