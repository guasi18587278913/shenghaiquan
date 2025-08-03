'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Eye, EyeOff, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Lesson {
  id: string;
  title: string;
  content: string;
  order: number;
}

interface Section {
  id: string;
  title: string;
  slug: string;
  description: string;
  lessons: Lesson[];
  expanded: boolean;
}

export default function CourseEditorPage() {
  const router = useRouter();
  const [sections, setSections] = useState<Section[]>([]);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [activeLesson, setActiveLesson] = useState<string | null>(null);
  const contentEditableRef = useRef<HTMLDivElement>(null);

  // 加载已有课程
  useEffect(() => {
    loadSections();
  }, []);

  const loadSections = async () => {
    try {
      const response = await fetch('/api/admin/courses/sections/list');
      const data = await response.json();
      setSections(data.map((s: any) => ({ ...s, expanded: false })));
    } catch (error) {
      console.error('加载失败:', error);
    }
  };

  // 添加新章节
  const addSection = () => {
    const newSection: Section = {
      id: `new-${Date.now()}`,
      title: '新章节',
      slug: `section-${Date.now()}`,
      description: '',
      lessons: [],
      expanded: true
    };
    setSections([...sections, newSection]);
  };

  // 添加新课时
  const addLesson = (sectionId: string) => {
    const newLesson: Lesson = {
      id: `lesson-${Date.now()}`,
      title: '新课时',
      content: '',
      order: 0
    };
    
    setSections(sections.map(s => 
      s.id === sectionId 
        ? { ...s, lessons: [...s.lessons, newLesson], expanded: true }
        : s
    ));
    
    setActiveLesson(newLesson.id);
  };

  // 处理粘贴事件
  const handlePaste = async (e: React.ClipboardEvent, lessonId: string) => {
    e.preventDefault();
    
    const text = e.clipboardData.getData('text/plain');
    const html = e.clipboardData.getData('text/html');
    
    let content = text;
    
    // 处理图片
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) {
          const imageUrl = await uploadImage(file);
          if (imageUrl) {
            content += `\n![图片](${imageUrl})\n`;
          }
        }
      }
    }
    
    // 更新内容
    updateLessonContent(lessonId, content);
  };

  // 上传图片
  const uploadImage = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.url;
      }
    } catch (error) {
      console.error('图片上传失败:', error);
    }
    return null;
  };

  // 更新课时内容
  const updateLessonContent = (lessonId: string, content: string) => {
    setSections(sections.map(section => ({
      ...section,
      lessons: section.lessons.map(lesson => 
        lesson.id === lessonId ? { ...lesson, content } : lesson
      )
    })));
  };

  // 保存到数据库
  const saveAll = async () => {
    setSaving(true);
    try {
      for (const section of sections) {
        if (section.id.startsWith('new-') || section.lessons.some(l => l.id.startsWith('lesson-'))) {
          const response = await fetch('/api/admin/courses/sections', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: section.title,
              slug: section.slug,
              description: section.description,
              lessons: section.lessons.map((lesson, index) => ({
                title: lesson.title,
                type: 'TEXT_ONLY',
                content: lesson.content,
                isFree: false,
                order: index + 1
              }))
            })
          });
          
          if (!response.ok) {
            throw new Error('保存失败');
          }
        }
      }
      
      alert('保存成功！');
      loadSections(); // 重新加载
    } catch (error) {
      alert('保存失败：' + error);
    } finally {
      setSaving(false);
    }
  };

  // 获取当前编辑的课时
  const getActiveLesson = () => {
    for (const section of sections) {
      const lesson = section.lessons.find(l => l.id === activeLesson);
      if (lesson) return { section, lesson };
    }
    return null;
  };

  const active = getActiveLesson();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部工具栏 */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold">课程内容编辑器</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-2 px-3 py-1.5 border rounded-lg hover:bg-gray-50"
            >
              {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showPreview ? '编辑' : '预览'}
            </button>
            <button
              onClick={saveAll}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              <Save className="w-4 h-4" />
              {saving ? '保存中...' : '保存全部'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 flex gap-6">
        {/* 左侧：章节列表 */}
        <div className="w-80 bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">课程大纲</h2>
            <button
              onClick={addSection}
              className="text-blue-600 hover:bg-blue-50 p-1 rounded"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          
          <div className="space-y-3">
            {sections.map((section) => (
              <div key={section.id} className="border rounded-lg">
                <div 
                  className="p-3 flex items-center justify-between cursor-pointer hover:bg-gray-50"
                  onClick={() => setSections(sections.map(s => 
                    s.id === section.id ? { ...s, expanded: !s.expanded } : s
                  ))}
                >
                  <input
                    value={section.title}
                    onChange={(e) => {
                      e.stopPropagation();
                      setSections(sections.map(s => 
                        s.id === section.id ? { ...s, title: e.target.value } : s
                      ));
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="font-medium bg-transparent border-none focus:outline-none"
                  />
                  {section.expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
                
                {section.expanded && (
                  <div className="px-3 pb-3">
                    <input
                      value={section.slug}
                      onChange={(e) => setSections(sections.map(s => 
                        s.id === section.id ? { ...s, slug: e.target.value } : s
                      ))}
                      placeholder="URL标识"
                      className="w-full text-sm text-gray-500 mb-2 px-2 py-1 border rounded"
                    />
                    
                    <div className="space-y-1">
                      {section.lessons.map((lesson) => (
                        <div
                          key={lesson.id}
                          onClick={() => setActiveLesson(lesson.id)}
                          className={`p-2 rounded cursor-pointer text-sm ${
                            activeLesson === lesson.id ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
                          }`}
                        >
                          <input
                            value={lesson.title}
                            onChange={(e) => {
                              e.stopPropagation();
                              setSections(sections.map(s => ({
                                ...s,
                                lessons: s.lessons.map(l => 
                                  l.id === lesson.id ? { ...l, title: e.target.value } : l
                                )
                              })));
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full bg-transparent"
                          />
                        </div>
                      ))}
                      
                      <button
                        onClick={() => addLesson(section.id)}
                        className="w-full text-left text-sm text-gray-500 hover:text-blue-600 p-2"
                      >
                        + 添加课时
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 右侧：内容编辑区 */}
        <div className="flex-1 bg-white rounded-lg shadow-sm p-6">
          {active ? (
            <>
              <h3 className="text-lg font-semibold mb-4">
                {active.section.title} / {active.lesson.title}
              </h3>
              
              {showPreview ? (
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown>{active.lesson.content}</ReactMarkdown>
                </div>
              ) : (
                <div>
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
                    💡 直接从飞书复制内容粘贴到下方，支持图文混合
                  </div>
                  
                  <textarea
                    value={active.lesson.content}
                    onChange={(e) => updateLessonContent(active.lesson.id, e.target.value)}
                    onPaste={(e) => handlePaste(e, active.lesson.id)}
                    placeholder="在这里粘贴或输入课程内容...

支持 Markdown 格式：
# 标题
## 副标题
- 列表项
**粗体** *斜体*
[链接](url)
![图片](url)"
                    className="w-full h-96 p-4 border rounded-lg font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </>
          ) : (
            <div className="text-center text-gray-500 py-12">
              <p>选择一个课时开始编辑</p>
              <p className="text-sm mt-2">或点击"+ 添加课时"创建新内容</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}