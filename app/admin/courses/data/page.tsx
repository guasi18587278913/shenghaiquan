'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Database, RefreshCw, Eye, Trash2 } from 'lucide-react';

interface SectionData {
  id: string;
  title: string;
  slug: string;
  description: string;
  createdAt?: string;
  order?: number;
  lessons?: Array<{
    title: string;
    type: string;
    content: string;
    videoUrl?: string;
    duration?: number;
    isFree: boolean;
    order: number;
  }>;
  courses?: Array<{
    id: string;
    title: string;
    slug: string;
  }>;
  _count?: {
    courses: number;
  };
}

export default function CourseDataPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [sections, setSections] = useState<SectionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSection, setSelectedSection] = useState<SectionData | null>(null);
  const [lessonDetails, setLessonDetails] = useState<any[]>([]);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login');
    } else {
      fetchData();
    }
  }, [session, status, router]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/courses/data');
      const data = await response.json();
      setSections(data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLessonDetails = async (sectionId: string) => {
    try {
      const response = await fetch(`/api/admin/courses/sections/${sectionId}/lessons`);
      const data = await response.json();
      setLessonDetails(data);
    } catch (error) {
      console.error('Failed to fetch lessons:', error);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '未知时间';
    return new Date(dateString).toLocaleString('zh-CN');
  };

  const handleSectionClick = (section: SectionData) => {
    setSelectedSection(section);
    fetchLessonDetails(section.id);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">加载中...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 pt-20 md:pt-24">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Database className="w-6 h-6 text-blue-600" />
              <h1 className="text-2xl font-bold">数据库课程数据查看器</h1>
            </div>
            <button
              onClick={fetchData}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <RefreshCw className="w-4 h-4" />
              刷新数据
            </button>
          </div>

          {/* 统计信息 */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-3xl font-bold text-blue-600">{sections.length}</div>
              <div className="text-gray-600">总章节数</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-3xl font-bold text-green-600">
                {sections.reduce((acc, s) => acc + (s._count?.courses || 0), 0)}
              </div>
              <div className="text-gray-600">总课程数</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-3xl font-bold text-purple-600">
                {sections.filter(s => s.createdAt?.includes(new Date().toISOString().split('T')[0])).length}
              </div>
              <div className="text-gray-600">今日新增</div>
            </div>
          </div>

          {/* 章节列表 */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">所有章节</h2>
            {sections.map((section) => (
              <div
                key={section.id}
                className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                onClick={() => handleSectionClick(section)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{section.title}</h3>
                    <p className="text-gray-500 text-sm">URL: {section.slug}</p>
                    <p className="text-gray-500 text-sm">{section.description || '无描述'}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">
                      创建时间：{formatDate(section.createdAt)}
                    </div>
                    <div className="text-sm text-blue-600 font-medium">
                      {section._count?.courses || 0} 个课程
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 课时详情弹窗 */}
          {selectedSection && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-auto p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">{selectedSection.title} - 课时详情</h2>
                  <button
                    onClick={() => {
                      setSelectedSection(null);
                      setLessonDetails([]);
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
                
                {lessonDetails.length > 0 ? (
                  <div className="space-y-4">
                    {lessonDetails.map((lesson, index) => (
                      <div key={lesson.id} className="border rounded-lg p-4">
                        <h3 className="font-semibold">{index + 1}. {lesson.title}</h3>
                        <p className="text-sm text-gray-500">类型: {lesson.type}</p>
                        <div className="mt-2 p-3 bg-gray-50 rounded">
                          <p className="text-sm whitespace-pre-wrap">
                            {lesson.content.substring(0, 200)}...
                          </p>
                        </div>
                        {lesson.content.includes('![') && (
                          <p className="text-sm text-green-600 mt-2">
                            ✓ 包含图片内容
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">暂无课时数据</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 使用提示 */}
        <div className="mt-6 bg-blue-50 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-3">使用提示</h2>
          <ul className="space-y-2 text-blue-800">
            <li>• 点击章节查看详细的课时内容</li>
            <li>• 数据直接从数据库读取，显示最真实的存储状态</li>
            <li>• 如果看到包含图片的标记，说明图片已成功上传并保存</li>
            <li>• URL标识中的数字是时间戳，用于避免重复</li>
          </ul>
        </div>
      </div>
    </div>
  );
}