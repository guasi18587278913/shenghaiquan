'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, Image as ImageIcon } from 'lucide-react';

export default function QuickImportPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [sectionTitle, setSectionTitle] = useState('');
  const [sectionSlug, setSectionSlug] = useState('');
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonContent, setLessonContent] = useState('');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // 处理图片上传
  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        const imageUrl = data.url;
        
        // 将图片添加到内容中
        const imageMarkdown = `\n![图片](${imageUrl})\n`;
        setLessonContent(prev => prev + imageMarkdown);
        setUploadedImages(prev => [...prev, imageUrl]);
      } else {
        alert('图片上传失败');
      }
    } catch (error) {
      alert('图片上传失败');
    } finally {
      setUploading(false);
    }
  };

  // 处理文件选择
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  // 处理粘贴事件
  const handlePaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      
      // 处理图片粘贴
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) {
          handleImageUpload(file);
        }
      }
    }
  };

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
        const error = await response.text();
        throw new Error(error);
      }
    } catch (error) {
      alert('导入失败：' + error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 pt-24">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold mb-6">快速课程导入（支持图片）</h1>
          
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
                    <span className="text-xs text-gray-500 ml-2">（支持粘贴图片）</span>
                  </label>
                  <textarea
                    value={lessonContent}
                    onChange={(e) => setLessonContent(e.target.value)}
                    onPaste={handlePaste}
                    placeholder="在这里粘贴飞书文档的内容，可以直接粘贴图片..."
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={10}
                  />
                  
                  {/* 图片上传按钮 */}
                  <div className="mt-2 flex items-center gap-4">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm"
                    >
                      <ImageIcon className="w-4 h-4" />
                      {uploading ? '上传中...' : '上传图片'}
                    </button>
                    
                    {uploadedImages.length > 0 && (
                      <span className="text-sm text-gray-600">
                        已上传 {uploadedImages.length} 张图片
                      </span>
                    )}
                  </div>
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

        {/* 使用说明 */}
        <div className="mt-6 bg-blue-50 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">使用说明</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• 文本内容：直接从飞书复制粘贴</li>
            <li>• 图片方式1：复制图片后在内容框中粘贴（Ctrl+V）</li>
            <li>• 图片方式2：点击"上传图片"按钮选择本地图片</li>
            <li>• 图片会自动上传并插入到内容中</li>
            <li>• 内容支持 Markdown 格式</li>
          </ul>
        </div>
      </div>
    </div>
  );
}