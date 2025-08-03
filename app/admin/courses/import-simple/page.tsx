'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SimpleImportPage() {
  const router = useRouter();
  const [sectionTitle, setSectionTitle] = useState('');
  const [sectionSlug, setSectionSlug] = useState('');
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonContent, setLessonContent] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!sectionTitle || !sectionSlug || !lessonTitle || !lessonContent) {
      alert('请填写所有必填字段');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/admin/courses/sections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: sectionTitle,
          slug: sectionSlug,
          description: '从飞书导入的章节',
          lessons: [{
            title: lessonTitle,
            type: 'TEXT_ONLY',
            content: lessonContent,
            isFree: false,
            order: 1
          }]
        })
      });

      if (response.ok) {
        alert('导入成功！');
        router.push('/admin/courses');
      } else {
        throw new Error('导入失败');
      }
    } catch (error) {
      alert('导入失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 pt-24">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold mb-6">简化版课程导入</h1>
          
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-4">章节信息</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    章节标题 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={sectionTitle}
                    onChange={(e) => setSectionTitle(e.target.value)}
                    placeholder="例如：前言"
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    URL标识 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={sectionSlug}
                    onChange={(e) => setSectionSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    placeholder="例如：preface"
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    只能使用小写字母、数字和连字符
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-4">课时信息</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    课时标题 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={lessonTitle}
                    onChange={(e) => setLessonTitle(e.target.value)}
                    placeholder="例如：课程介绍"
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    课时内容 <span className="text-red-500">*</span>
                    <span className="text-xs text-gray-500 ml-2">（从飞书复制粘贴内容）</span>
                  </label>
                  <textarea
                    value={lessonContent}
                    onChange={(e) => setLessonContent(e.target.value)}
                    placeholder="在这里粘贴飞书文档的内容..."
                    className="w-full px-4 py-2 border rounded-lg"
                    rows={10}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-6 border-t">
              <button
                onClick={() => router.push('/admin/courses')}
                className="px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                返回
              </button>
              
              <button
                onClick={handleSave}
                disabled={saving || !sectionTitle || !sectionSlug || !lessonTitle || !lessonContent}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {saving ? '保存中...' : '保存课程'}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-blue-50 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">使用说明</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>1. 填写章节标题和URL标识</li>
            <li>2. 填写课时标题</li>
            <li>3. 从飞书复制内容，粘贴到课时内容框</li>
            <li>4. 点击保存</li>
          </ul>
        </div>
      </div>
    </div>
  );
}