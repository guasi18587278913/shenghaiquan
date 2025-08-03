'use client';

import { useState, useEffect } from 'react';
import { Save, FileText } from 'lucide-react';

export default function StaticContentManager() {
  const [sections, setSections] = useState<any>({});
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedLesson, setSelectedLesson] = useState<any>(null);
  const [editingContent, setEditingContent] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchStaticData();
  }, []);

  const fetchStaticData = async () => {
    try {
      // 获取当前的静态数据
      const response = await fetch('/api/admin/courses/static-data');
      if (response.ok) {
        const data = await response.json();
        setSections(data);
      }
    } catch (error) {
      console.error('Failed to fetch static data:', error);
    }
  };

  const handleSelectLesson = (sectionKey: string, lesson: any) => {
    setSelectedSection(sectionKey);
    setSelectedLesson(lesson);
    setEditingContent(lesson.content || '');
  };

  const handleSave = async () => {
    if (!selectedLesson || !selectedSection) return;

    setSaving(true);
    try {
      const response = await fetch('/api/admin/courses/static-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionKey: selectedSection,
          lessonId: selectedLesson.id,
          content: editingContent
        })
      });

      if (response.ok) {
        alert('内容已更新！');
        // 更新本地状态
        const updatedSections = { ...sections };
        const lesson = updatedSections[selectedSection].lessons.find(
          (l: any) => l.id === selectedLesson.id
        );
        if (lesson) {
          lesson.content = editingContent;
        }
        setSections(updatedSections);
      } else {
        alert('保存失败');
      }
    } catch (error) {
      alert('保存失败：' + error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 pt-20 md:pt-24">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">静态课程内容管理</h1>
          <p className="text-gray-600">
            直接编辑 course-data.ts 文件中的课程内容
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧：课程列表 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="font-semibold mb-4">课程章节</h3>
              <div className="space-y-4 max-h-[70vh] overflow-y-auto">
                {Object.entries(sections).map(([key, section]: [string, any]) => (
                  <div key={key}>
                    <h4 className="font-medium text-gray-900 mb-2">{section.title}</h4>
                    <div className="ml-4 space-y-1">
                      {section.lessons?.map((lesson: any) => (
                        <button
                          key={lesson.id}
                          onClick={() => handleSelectLesson(key, lesson)}
                          className={`w-full text-left p-2 rounded text-sm flex items-center gap-2 ${
                            selectedLesson?.id === lesson.id
                              ? 'bg-blue-50 text-blue-600'
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          <FileText className="w-3 h-3" />
                          <span className="flex-1">{lesson.title}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 右侧：内容编辑 */}
          <div className="lg:col-span-2">
            {selectedLesson ? (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="mb-6">
                  <h2 className="text-xl font-bold">{selectedLesson.title}</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    章节: {sections[selectedSection]?.title}
                  </p>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">
                    课时内容
                  </label>
                  <textarea
                    value={editingContent}
                    onChange={(e) => setEditingContent(e.target.value)}
                    className="w-full h-96 p-4 border rounded-lg font-mono text-sm"
                    placeholder="输入课程内容..."
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setEditingContent(selectedLesson.content || '')}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    重置
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? '保存中...' : '保存内容'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <p className="text-gray-600">请从左侧选择一个课时开始编辑</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}