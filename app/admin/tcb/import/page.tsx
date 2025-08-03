'use client';

import { useState, useEffect } from 'react';
import { initCloudBase } from '@/lib/tcb';
import { Save, Plus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ImportData {
  course: {
    title: string;
    description: string;
    slug: string;
  };
  sections: {
    title: string;
    description: string;
    order: number;
    lessons: {
      title: string;
      content: string;
      isFree: boolean;
      order: number;
    }[];
  }[];
}

export default function TCBImportPage() {
  const router = useRouter();
  const [db, setDb] = useState<any>(null);
  const [importing, setImporting] = useState(false);
  const [importData, setImportData] = useState<ImportData>({
    course: {
      title: '',
      description: '',
      slug: ''
    },
    sections: []
  });

  useEffect(() => {
    initDB();
  }, []);

  const initDB = async () => {
    try {
      const { db: database } = await initCloudBase();
      setDb(database);
    } catch (error) {
      console.error('初始化失败:', error);
    }
  };

  const addSection = () => {
    setImportData({
      ...importData,
      sections: [...importData.sections, {
        title: '',
        description: '',
        order: importData.sections.length + 1,
        lessons: []
      }]
    });
  };

  const addLesson = (sectionIndex: number) => {
    const sections = [...importData.sections];
    sections[sectionIndex].lessons.push({
      title: '',
      content: '',
      isFree: false,
      order: sections[sectionIndex].lessons.length + 1
    });
    setImportData({ ...importData, sections });
  };

  const updateSection = (index: number, field: string, value: any) => {
    const sections = [...importData.sections];
    sections[index] = { ...sections[index], [field]: value };
    setImportData({ ...importData, sections });
  };

  const updateLesson = (sectionIndex: number, lessonIndex: number, field: string, value: any) => {
    const sections = [...importData.sections];
    sections[sectionIndex].lessons[lessonIndex] = {
      ...sections[sectionIndex].lessons[lessonIndex],
      [field]: value
    };
    setImportData({ ...importData, sections });
  };

  const handleImport = async () => {
    if (!db) {
      alert('数据库未初始化');
      return;
    }

    setImporting(true);
    try {
      // 1. 创建课程
      const courseResult = await db.collection('courses').add({
        ...importData.course,
        isPublished: true,
        createdAt: new Date()
      });
      const courseId = courseResult.id;

      // 2. 创建章节和课时
      for (const section of importData.sections) {
        const sectionResult = await db.collection('sections').add({
          courseId,
          title: section.title,
          description: section.description,
          order: section.order,
          slug: `${importData.course.slug}-section-${section.order}`,
          createdAt: new Date()
        });
        const sectionId = sectionResult.id;

        // 3. 创建课时
        for (const lesson of section.lessons) {
          await db.collection('lessons').add({
            sectionId,
            courseId,
            title: lesson.title,
            content: lesson.content,
            isFree: lesson.isFree,
            order: lesson.order,
            createdAt: new Date()
          });
        }
      }

      alert('导入成功！');
      router.push('/admin/tcb');
    } catch (error) {
      console.error('导入失败:', error);
      alert('导入失败，请查看控制台错误信息');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 pt-20">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">快速导入课程</h1>

        {/* 课程信息 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">课程信息</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">课程标题</label>
              <input
                type="text"
                value={importData.course.title}
                onChange={(e) => setImportData({
                  ...importData,
                  course: { ...importData.course, title: e.target.value }
                })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="例如：AI编程实战"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">URL标识</label>
              <input
                type="text"
                value={importData.course.slug}
                onChange={(e) => setImportData({
                  ...importData,
                  course: { ...importData.course, slug: e.target.value }
                })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="例如：ai-programming"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium mb-1">课程描述</label>
            <textarea
              value={importData.course.description}
              onChange={(e) => setImportData({
                ...importData,
                course: { ...importData.course, description: e.target.value }
              })}
              className="w-full px-3 py-2 border rounded-lg"
              rows={2}
            />
          </div>
        </div>

        {/* 章节列表 */}
        <div className="space-y-4 mb-6">
          {importData.sections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">章节 {sectionIndex + 1}</h3>
                <button
                  onClick={() => {
                    const sections = [...importData.sections];
                    sections.splice(sectionIndex, 1);
                    setImportData({ ...importData, sections });
                  }}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <input
                  type="text"
                  value={section.title}
                  onChange={(e) => updateSection(sectionIndex, 'title', e.target.value)}
                  className="px-3 py-2 border rounded-lg"
                  placeholder="章节标题"
                />
                <input
                  type="text"
                  value={section.description}
                  onChange={(e) => updateSection(sectionIndex, 'description', e.target.value)}
                  className="px-3 py-2 border rounded-lg"
                  placeholder="章节描述"
                />
              </div>

              {/* 课时列表 */}
              <div className="ml-6 space-y-3">
                {section.lessons.map((lesson, lessonIndex) => (
                  <div key={lessonIndex} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-medium">课时 {lessonIndex + 1}</h4>
                      <button
                        onClick={() => {
                          const sections = [...importData.sections];
                          sections[sectionIndex].lessons.splice(lessonIndex, 1);
                          setImportData({ ...importData, sections });
                        }}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={lesson.title}
                      onChange={(e) => updateLesson(sectionIndex, lessonIndex, 'title', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg mb-3"
                      placeholder="课时标题"
                    />
                    <textarea
                      value={lesson.content}
                      onChange={(e) => updateLesson(sectionIndex, lessonIndex, 'content', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg mb-3"
                      placeholder="课时内容（支持Markdown）"
                      rows={4}
                    />
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={lesson.isFree}
                        onChange={(e) => updateLesson(sectionIndex, lessonIndex, 'isFree', e.target.checked)}
                      />
                      <span className="text-sm">免费试看</span>
                    </label>
                  </div>
                ))}
                <button
                  onClick={() => addLesson(sectionIndex)}
                  className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400"
                >
                  <Plus className="w-4 h-4 inline mr-1" />
                  添加课时
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* 添加章节按钮 */}
        <button
          onClick={addSection}
          className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 mb-6"
        >
          <Plus className="w-5 h-5 inline mr-2" />
          添加章节
        </button>

        {/* 导入按钮 */}
        <div className="flex gap-4">
          <button
            onClick={handleImport}
            disabled={importing || !importData.course.title || !importData.course.slug}
            className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
          >
            {importing ? '导入中...' : (
              <>
                <Save className="w-5 h-5" />
                开始导入
              </>
            )}
          </button>
          <button
            onClick={() => router.push('/admin/tcb')}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            返回
          </button>
        </div>

        {/* 提示信息 */}
        <div className="mt-6 bg-yellow-50 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-900 mb-2">使用说明</h3>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• 课时内容支持Markdown格式</li>
            <li>• 可以直接粘贴飞书文档内容</li>
            <li>• 图片需要先上传到图床，然后使用URL</li>
            <li>• 导入后可以在管理页面继续编辑</li>
          </ul>
        </div>
      </div>
    </div>
  );
}