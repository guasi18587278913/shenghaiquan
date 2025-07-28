'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, Save, X, FileText, Video, ChevronDown, ChevronRight } from 'lucide-react';
// import { RichCourseEditor, courseTemplates } from '@/components/rich-course-editor';

interface Lesson {
  title: string;
  type: 'TEXT_ONLY' | 'VIDEO_TEXT';
  content: string;
  videoUrl?: string;
  duration?: number;
  isFree: boolean;
  order: number;
}

interface Section {
  id?: string;
  title: string;
  slug: string;
  description: string;
  lessons: Lesson[];
}

export default function CourseAdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  // 检查管理员权限
  useEffect(() => {
    if (status === 'loading') return;
    // 暂时允许所有登录用户访问，实际应该检查角色
    if (!session) {
      router.push('/login');
    }
  }, [session, status, router]);

  // 加载现有课程数据
  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      const response = await fetch('/api/admin/courses/sections/list');
      const data = await response.json();
      setSections(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch sections:', error);
      setSections([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const addNewSection = () => {
    const timestamp = Date.now();
    const newSection: Section = {
      title: '新章节',
      slug: `section-${timestamp}`,
      description: '章节描述',
      lessons: []
    };
    const newSections = [...sections, newSection];
    setSections(newSections);
    setEditingSection(`new-${sections.length}`);
    // 自动展开新章节
    const newExpanded = new Set(expandedSections);
    newExpanded.add(`new-${sections.length}`);
    setExpandedSections(newExpanded);
  };

  const addNewLesson = (sectionIndex: number) => {
    const newLesson: Lesson = {
      title: '新课时',
      type: 'TEXT_ONLY',
      content: '课时内容',
      isFree: false,
      order: sections[sectionIndex].lessons.length + 1
    };
    const updatedSections = [...sections];
    updatedSections[sectionIndex].lessons.push(newLesson);
    setSections(updatedSections);
  };

  const updateSection = (index: number, field: keyof Section, value: any) => {
    const updatedSections = [...sections];
    updatedSections[index] = { ...updatedSections[index], [field]: value };
    setSections(updatedSections);
  };

  const updateLesson = (sectionIndex: number, lessonIndex: number, field: keyof Lesson, value: any) => {
    const updatedSections = [...sections];
    updatedSections[sectionIndex].lessons[lessonIndex] = {
      ...updatedSections[sectionIndex].lessons[lessonIndex],
      [field]: value
    };
    setSections(updatedSections);
  };

  const deleteLesson = (sectionIndex: number, lessonIndex: number) => {
    if (confirm('确定要删除这个课时吗？')) {
      const updatedSections = [...sections];
      updatedSections[sectionIndex].lessons.splice(lessonIndex, 1);
      setSections(updatedSections);
    }
  };

  const saveSection = async (sectionIndex: number) => {
    const section = sections[sectionIndex];
    console.log('保存章节数据:', section);
    
    try {
      const response = await fetch('/api/admin/courses/sections', {
        method: section.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(section)
      });

      const data = await response.json();
      console.log('服务器响应:', data);

      if (response.ok) {
        alert('保存成功！');
        await fetchSections();
        setEditingSection(null);
      } else {
        console.error('保存失败:', data);
        alert(`保存失败: ${data.error || '请重试'}`);
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('保存失败，请检查网络连接');
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">加载中...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 pt-20 md:pt-24">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">课程内容管理</h1>
          <button
            onClick={addNewSection}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            添加新章节
          </button>
        </div>

        <div className="space-y-6">
          {sections.map((section, sectionIndex) => (
            <div key={section.id || sectionIndex} className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* 章节标题 */}
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <button
                      onClick={() => toggleSection(section.id || `${sectionIndex}`)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      {expandedSections.has(section.id || `${sectionIndex}`) ? 
                        <ChevronDown className="w-5 h-5" /> : 
                        <ChevronRight className="w-5 h-5" />
                      }
                    </button>
                    {editingSection === (section.id || `new-${sectionIndex}`) ? (
                      <div className="flex-1 space-y-4">
                        <input
                          type="text"
                          value={section.title}
                          onChange={(e) => updateSection(sectionIndex, 'title', e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg"
                          placeholder="章节标题"
                        />
                        <input
                          type="text"
                          value={section.slug}
                          onChange={(e) => updateSection(sectionIndex, 'slug', e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg"
                          placeholder="URL标识（如：preface）"
                        />
                        <textarea
                          value={section.description}
                          onChange={(e) => updateSection(sectionIndex, 'description', e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg"
                          placeholder="章节描述"
                          rows={2}
                        />
                      </div>
                    ) : (
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900">{section.title}</h3>
                        <p className="text-gray-600">{section.description}</p>
                        <p className="text-sm text-gray-500">标识：{section.slug}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {editingSection === (section.id || `new-${sectionIndex}`) ? (
                      <>
                        <button
                          onClick={() => saveSection(sectionIndex)}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors"
                        >
                          <Save className="w-4 h-4" />
                          <span>保存</span>
                        </button>
                        <button
                          onClick={() => setEditingSection(null)}
                          className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 hover:bg-gray-300 rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4" />
                          <span>取消</span>
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setEditingSection(section.id || `new-${sectionIndex}`)}
                        className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit className="w-5 h-5" />
                        <span>编辑</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* 课时列表 */}
              {expandedSections.has(section.id || `${sectionIndex}`) && (
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-lg font-medium text-gray-900">课时列表</h4>
                    <button
                      onClick={() => addNewLesson(sectionIndex)}
                      className="flex items-center gap-2 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      添加课时
                    </button>
                  </div>

                  {(section.lessons || []).map((lesson, lessonIndex) => (
                    <div key={lessonIndex} className="border rounded-lg p-4 space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <input
                          type="text"
                          value={lesson.title}
                          onChange={(e) => updateLesson(sectionIndex, lessonIndex, 'title', e.target.value)}
                          className="px-3 py-2 border rounded"
                          placeholder="课时标题"
                        />
                        <select
                          value={lesson.type}
                          onChange={(e) => updateLesson(sectionIndex, lessonIndex, 'type', e.target.value)}
                          className="px-3 py-2 border rounded"
                        >
                          <option value="TEXT_ONLY">纯文档</option>
                          <option value="VIDEO_TEXT">视频+文档</option>
                        </select>
                      </div>

                      {lesson.type === 'VIDEO_TEXT' && (
                        <div className="grid grid-cols-2 gap-4">
                          <input
                            type="text"
                            value={lesson.videoUrl || ''}
                            onChange={(e) => updateLesson(sectionIndex, lessonIndex, 'videoUrl', e.target.value)}
                            className="px-3 py-2 border rounded"
                            placeholder="视频URL"
                          />
                          <input
                            type="number"
                            value={lesson.duration || ''}
                            onChange={(e) => updateLesson(sectionIndex, lessonIndex, 'duration', parseInt(e.target.value))}
                            className="px-3 py-2 border rounded"
                            placeholder="视频时长（秒）"
                          />
                        </div>
                      )}

                      {/* 临时使用textarea，确保基本功能正常 */}
                      <textarea
                        value={lesson.content}
                        onChange={(e) => updateLesson(sectionIndex, lessonIndex, 'content', e.target.value)}
                        className="w-full px-3 py-2 border rounded"
                        placeholder="课时内容（支持Markdown格式）"
                        rows={6}
                      />

                      <div className="flex justify-between items-center">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={lesson.isFree}
                            onChange={(e) => updateLesson(sectionIndex, lessonIndex, 'isFree', e.target.checked)}
                          />
                          <span className="text-sm">免费试看</span>
                        </label>
                        <button
                          onClick={() => deleteLesson(sectionIndex, lessonIndex)}
                          className="text-red-600 hover:bg-red-50 p-2 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 使用说明 */}
        <div className="mt-12 bg-blue-50 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-4">使用说明</h2>
          <ul className="space-y-2 text-blue-800">
            <li>• 点击章节标题左侧的箭头展开/收起课时列表</li>
            <li>• 点击编辑按钮修改章节信息，修改后记得点击保存</li>
            <li>• URL标识用于生成课程链接，如：/courses/preface/1</li>
            <li>• 课时内容支持Markdown格式，可以使用标题、列表、代码块等</li>
            <li>• 视频URL请填写腾讯云点播的视频地址</li>
            <li>• 勾选"免费试看"可以让未登录用户预览该课时</li>
          </ul>
        </div>
      </div>
    </div>
  );
}