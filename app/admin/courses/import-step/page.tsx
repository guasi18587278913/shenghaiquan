'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, Image as ImageIcon, FileText, ChevronRight, Check } from 'lucide-react';

interface ImagePlaceholder {
  id: string;
  placeholder: string;
  url?: string;
}

export default function StepByStepImportPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // 基础信息
  const [sectionTitle, setSectionTitle] = useState('');
  const [sectionSlug, setSectionSlug] = useState('');
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonContent, setLessonContent] = useState('');
  
  // 步骤控制
  const [currentStep, setCurrentStep] = useState(1);
  const [saving, setSaving] = useState(false);
  
  // 图片管理
  const [imagePlaceholders, setImagePlaceholders] = useState<ImagePlaceholder[]>([]);
  const [uploadingImageId, setUploadingImageId] = useState<string | null>(null);

  // 步骤1完成后处理
  const handleStep1Complete = () => {
    // 识别内容中的图片占位符
    const placeholders: ImagePlaceholder[] = [];
    const imageMatches = lessonContent.match(/【图片】|\[图片\]|\(图片\)/g);
    
    if (imageMatches) {
      imageMatches.forEach((match, index) => {
        placeholders.push({
          id: `img-${index}`,
          placeholder: match,
          url: undefined
        });
      });
    }
    
    setImagePlaceholders(placeholders);
    setCurrentStep(2);
  };

  // 处理图片上传
  const handleImageUpload = async (file: File, placeholderId: string) => {
    setUploadingImageId(placeholderId);
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        
        // 更新占位符的URL
        setImagePlaceholders(prev => 
          prev.map(p => p.id === placeholderId ? { ...p, url: data.url } : p)
        );
        
        // 替换内容中的占位符
        const placeholder = imagePlaceholders.find(p => p.id === placeholderId);
        if (placeholder) {
          setLessonContent(prev => {
            // 只替换第一个匹配的占位符
            return prev.replace(placeholder.placeholder, `![图片](${data.url})`);
          });
        }
      } else {
        alert('图片上传失败');
      }
    } catch (error) {
      alert('图片上传失败');
    } finally {
      setUploadingImageId(null);
    }
  };

  // 保存课程
  const handleSave = async () => {
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
      alert('导入失败：' + error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 pt-24">
      <div className="max-w-4xl mx-auto">
        {/* 步骤指示器 */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            <div className={`flex items-center ${currentStep >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}>
                {currentStep > 1 ? <Check className="w-5 h-5" /> : '1'}
              </div>
              <span className="ml-2 font-medium">填写信息</span>
            </div>
            
            <ChevronRight className="w-5 h-5 text-gray-400" />
            
            <div className={`flex items-center ${currentStep >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}>
                2
              </div>
              <span className="ml-2 font-medium">上传图片</span>
            </div>
          </div>
        </div>

        {/* 步骤1：基础信息 */}
        {currentStep === 1 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-6">步骤1：填写课程信息</h2>
            
            <div className="space-y-6">
              {/* 章节信息 */}
              <div>
                <h3 className="text-lg font-semibold mb-4">章节信息</h3>
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
                  </div>
                </div>
              </div>

              {/* 课时信息 */}
              <div>
                <h3 className="text-lg font-semibold mb-4">课时信息</h3>
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
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      课时内容 <span className="text-red-500">*</span>
                      <span className="text-xs text-gray-500 ml-2">
                        （从飞书复制文本内容，图片位置用【图片】标记）
                      </span>
                    </label>
                    <textarea
                      value={lessonContent}
                      onChange={(e) => setLessonContent(e.target.value)}
                      placeholder="粘贴飞书文档的文本内容...
例如：
这是第一段文字
【图片】
这是第二段文字
【图片】"
                      className="w-full px-4 py-2 border rounded-lg font-mono text-sm"
                      rows={10}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleStep1Complete}
                  disabled={!sectionTitle || !sectionSlug || !lessonTitle || !lessonContent}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                >
                  下一步：上传图片
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 步骤2：上传图片 */}
        {currentStep === 2 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-6">步骤2：上传图片</h2>
            
            {imagePlaceholders.length > 0 ? (
              <div className="space-y-4">
                <p className="text-gray-600">
                  检测到 {imagePlaceholders.length} 个图片位置，请依次上传对应的图片：
                </p>
                
                {imagePlaceholders.map((placeholder, index) => (
                  <div key={placeholder.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-medium">图片 {index + 1}</span>
                        {placeholder.url ? (
                          <Check className="w-5 h-5 text-green-600" />
                        ) : (
                          <ImageIcon className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                      
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleImageUpload(file, placeholder.id);
                          }
                        }}
                        className="hidden"
                        id={`file-${placeholder.id}`}
                      />
                      
                      <label
                        htmlFor={`file-${placeholder.id}`}
                        className={`px-4 py-2 rounded-lg cursor-pointer ${
                          placeholder.url 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        } ${uploadingImageId === placeholder.id ? 'opacity-50' : ''}`}
                      >
                        {uploadingImageId === placeholder.id ? '上传中...' : 
                         placeholder.url ? '重新上传' : '选择图片'}
                      </label>
                    </div>
                    
                    {placeholder.url && (
                      <div className="mt-2">
                        <img 
                          src={placeholder.url} 
                          alt={`图片 ${index + 1}`}
                          className="max-w-xs rounded border"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <ImageIcon className="w-12 h-12 mx-auto mb-2" />
                <p>没有检测到图片占位符</p>
                <p className="text-sm mt-2">如果你的内容中有图片，请确保使用【图片】标记</p>
              </div>
            )}

            <div className="flex justify-between mt-6">
              <button
                onClick={() => setCurrentStep(1)}
                className="px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                返回上一步
              </button>
              
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
              >
                {saving ? '保存中...' : '完成并保存'}
              </button>
            </div>
          </div>
        )}

        {/* 使用说明 */}
        <div className="mt-6 bg-blue-50 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">使用说明</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>1. 在飞书中复制文档内容（纯文本）</li>
            <li>2. 图片位置用【图片】标记代替</li>
            <li>3. 第二步会让你依次上传对应的图片</li>
            <li>4. 系统会自动将图片插入到正确位置</li>
          </ul>
        </div>
      </div>
    </div>
  );
}