'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, AlertCircle } from 'lucide-react';

export default function DirectImportPage() {
  const router = useRouter();
  const [sectionTitle, setSectionTitle] = useState('');
  const [sectionSlug, setSectionSlug] = useState('');
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonContent, setLessonContent] = useState('');
  const [saving, setSaving] = useState(false);

  // 直接处理粘贴 - 不做复杂转换
  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    // 让浏览器默认处理粘贴，只获取纯文本
    setTimeout(() => {
      const content = e.currentTarget.value;
      setLessonContent(content);
      console.log('粘贴内容长度:', content.length);
    }, 10);
  };

  const handleSave = async () => {
    if (!sectionTitle || !sectionSlug || !lessonTitle || !lessonContent) {
      alert('请填写所有必填字段');
      return;
    }

    setSaving(true);
    try {
      // 处理内容中的图片链接（如果有）
      let processedContent = lessonContent;
      
      // 简单替换一些常见格式
      processedContent = processedContent.replace(/【图片】/g, '\n![图片](需要替换为实际图片地址)\n');
      
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
            content: processedContent,
            isFree: false,
            order: 1
          }]
        })
      });

      if (response.ok) {
        alert('导入成功！');
        router.push('/admin/courses');
      } else {
        const error = await response.text();
        throw new Error(error);
      }
    } catch (error) {
      alert('导入失败：' + error);
    } finally {
      setSaving(false);
    }
  };

  // 计算是否可以保存
  const canSave = sectionTitle && sectionSlug && lessonTitle && lessonContent;

  return (
    <div className="min-h-screen bg-gray-50 p-8 pt-24">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold mb-6">直接导入课程内容</h1>
          
          <div className="space-y-6">
            {/* 章节信息 */}
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
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
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
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* 课时信息 */}
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
                    placeholder="例如：你要学什么？"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    课时内容 <span className="text-red-500">*</span>
                    <span className="text-xs text-gray-500 ml-2">
                      （字数：{lessonContent.length}）
                    </span>
                  </label>
                  <textarea
                    value={lessonContent}
                    onChange={(e) => setLessonContent(e.target.value)}
                    onPaste={handlePaste}
                    placeholder="在这里粘贴飞书文档的内容..."
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                    rows={15}
                  />
                </div>
              </div>
            </div>

            {/* 状态信息 */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold mb-2">当前状态</h3>
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  <span className={sectionTitle ? 'text-green-600' : 'text-red-600'}>
                    {sectionTitle ? '✓' : '✗'} 章节标题
                  </span>
                  {sectionTitle && <span className="text-gray-500">({sectionTitle})</span>}
                </div>
                <div className="flex items-center gap-2">
                  <span className={sectionSlug ? 'text-green-600' : 'text-red-600'}>
                    {sectionSlug ? '✓' : '✗'} URL标识
                  </span>
                  {sectionSlug && <span className="text-gray-500">({sectionSlug})</span>}
                </div>
                <div className="flex items-center gap-2">
                  <span className={lessonTitle ? 'text-green-600' : 'text-red-600'}>
                    {lessonTitle ? '✓' : '✗'} 课时标题
                  </span>
                  {lessonTitle && <span className="text-gray-500">({lessonTitle})</span>}
                </div>
                <div className="flex items-center gap-2">
                  <span className={lessonContent ? 'text-green-600' : 'text-red-600'}>
                    {lessonContent ? '✓' : '✗'} 课时内容
                  </span>
                  {lessonContent && <span className="text-gray-500">({lessonContent.length} 字符)</span>}
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
              
              <div className="flex items-center gap-4">
                {!canSave && (
                  <span className="text-sm text-red-500">
                    请填写所有必填字段
                  </span>
                )}
                
                <button
                  onClick={handleSave}
                  disabled={!canSave || saving}
                  className={`px-6 py-2 rounded-lg flex items-center gap-2 ${
                    canSave 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <Save className="w-4 h-4" />
                  {saving ? '保存中...' : '保存课程'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 使用提示 */}
        <div className="mt-6 bg-amber-50 rounded-lg p-4">
          <h3 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            使用说明
          </h3>
          <ul className="text-sm text-amber-800 space-y-1">
            <li>• 直接从飞书复制内容，粘贴到内容框中</li>
            <li>• 内容会保持原有的文本格式</li>
            <li>• 图片暂时会显示为【图片】标记，后续可以手动替换</li>
            <li>• 所有必填字段都填写后，保存按钮会变为蓝色</li>
          </ul>
        </div>
      </div>
    </div>
  );
}