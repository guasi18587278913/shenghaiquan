'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SimpleEditorPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [sections, setSections] = useState<any[]>([]);
  const [currentSection, setCurrentSection] = useState({
    title: '',
    slug: '',
    description: '',
    lessons: [{
      title: '',
      content: '',
      type: 'TEXT_ONLY'
    }]
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadSections();
  }, []);

  const loadSections = async () => {
    try {
      const response = await fetch('/api/admin/courses/sections/list');
      const data = await response.json();
      setSections(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('加载失败:', error);
    }
  };

  const handleSave = async () => {
    if (!currentSection.title || !currentSection.slug || !currentSection.lessons[0].title) {
      alert('请填写必填字段');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/admin/courses/sections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...currentSection,
          lessons: currentSection.lessons.map((lesson, index) => ({
            ...lesson,
            isFree: false,
            order: index + 1
          }))
        })
      });

      if (response.ok) {
        alert('保存成功！');
        loadSections();
        // 清空表单
        setCurrentSection({
          title: '',
          slug: '',
          description: '',
          lessons: [{
            title: '',
            content: '',
            type: 'TEXT_ONLY'
          }]
        });
      } else {
        alert('保存失败');
      }
    } catch (error) {
      alert('保存失败：' + error);
    } finally {
      setSaving(false);
    }
  };

  const addLesson = () => {
    setCurrentSection({
      ...currentSection,
      lessons: [
        ...currentSection.lessons,
        { title: '', content: '', type: 'TEXT_ONLY' }
      ]
    });
  };

  const updateLesson = (index: number, field: string, value: string) => {
    const newLessons = [...currentSection.lessons];
    newLessons[index] = { ...newLessons[index], [field]: value };
    setCurrentSection({ ...currentSection, lessons: newLessons });
  };

  const removeLesson = (index: number) => {
    if (currentSection.lessons.length > 1) {
      const newLessons = currentSection.lessons.filter((_, i) => i !== index);
      setCurrentSection({ ...currentSection, lessons: newLessons });
    }
  };

  if (!mounted) {
    return <div className="min-h-screen bg-gray-50 p-8 pt-24">加载中...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8 pt-24">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">简单课程编辑器</h1>
            <button
              onClick={() => router.push('/admin/courses')}
              className="text-gray-600 hover:text-gray-900"
            >
              返回管理页
            </button>
          </div>

          {/* 章节信息 */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">章节信息</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  章节标题 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={currentSection.title}
                  onChange={(e) => setCurrentSection({ ...currentSection, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="例如：前言"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  URL标识 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={currentSection.slug}
                  onChange={(e) => setCurrentSection({ 
                    ...currentSection, 
                    slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') 
                  })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="例如：preface"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium mb-1">章节描述</label>
              <textarea
                value={currentSection.description}
                onChange={(e) => setCurrentSection({ ...currentSection, description: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                rows={2}
                placeholder="简要描述本章内容"
              />
            </div>
          </div>

          {/* 课时列表 */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">课时内容</h2>
              <button
                onClick={addLesson}
                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
              >
                + 添加课时
              </button>
            </div>

            {currentSection.lessons.map((lesson, index) => (
              <div key={index} className="mb-6 p-4 border rounded-lg bg-gray-50">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-medium">课时 {index + 1}</h3>
                  {currentSection.lessons.length > 1 && (
                    <button
                      onClick={() => removeLesson(index)}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      删除
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      课时标题 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={lesson.title}
                      onChange={(e) => updateLesson(index, 'title', e.target.value)}
                      className="w-full px-3 py-2 border rounded"
                      placeholder="例如：你要学什么？"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      课时内容 <span className="text-red-500">*</span>
                      <span className="text-xs text-gray-500 ml-2">（从飞书复制粘贴）</span>
                    </label>
                    <textarea
                      value={lesson.content}
                      onChange={(e) => updateLesson(index, 'content', e.target.value)}
                      className="w-full px-3 py-2 border rounded font-mono text-sm"
                      rows={8}
                      placeholder="在这里粘贴飞书文档内容...

支持 Markdown 格式：
# 标题
## 副标题
- 列表项
**粗体** *斜体*

图片暂时使用【图片】标记，保存后可以单独上传"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 保存按钮 */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              {saving ? '保存中...' : '保存章节'}
            </button>
          </div>
        </div>

        {/* 已有章节列表 */}
        {sections.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">已有章节</h2>
            <div className="space-y-2">
              {sections.map((section, index) => (
                <div key={section.id || index} className="p-3 border rounded hover:bg-gray-50">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-medium">{section.title}</span>
                      <span className="text-gray-500 text-sm ml-2">({section.slug})</span>
                    </div>
                    <span className="text-sm text-gray-600">
                      {section.lessons?.length || 0} 个课时
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 使用说明 */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-3">使用说明</h2>
          <ol className="list-decimal list-inside space-y-2 text-blue-800">
            <li>填写章节信息（标题和URL标识）</li>
            <li>在课时内容中粘贴飞书文档内容</li>
            <li>可以添加多个课时</li>
            <li>内容支持 Markdown 格式</li>
            <li>图片位置暂时用【图片】标记</li>
            <li>点击保存，内容会自动同步到网站</li>
          </ol>
        </div>
      </div>
    </div>
  );
}