'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Upload, FileText, Image, Video, Plus, Trash2, Save } from 'lucide-react';

interface CourseImportData {
  sectionTitle: string;
  sectionSlug: string;
  sectionDescription: string;
  lessons: {
    title: string;
    type: 'TEXT_ONLY' | 'VIDEO_TEXT';
    content: string;
    videoFile?: File;
    imageFiles?: File[];
    videoUrl?: string;
    imageUrls?: string[];
    isFree: boolean;
  }[];
}

export default function CourseImportPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [importing, setImporting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  
  const [importData, setImportData] = useState<CourseImportData>({
    sectionTitle: '',
    sectionSlug: '',
    sectionDescription: '',
    lessons: []
  });

  const addLesson = () => {
    setImportData({
      ...importData,
      lessons: [...importData.lessons, {
        title: '',
        type: 'TEXT_ONLY',
        content: '',
        isFree: false
      }]
    });
  };

  const updateLesson = (index: number, field: string, value: any) => {
    const updatedLessons = [...importData.lessons];
    updatedLessons[index] = { ...updatedLessons[index], [field]: value };
    setImportData({ ...importData, lessons: updatedLessons });
  };

  const handleImageUpload = async (lessonIndex: number, files: FileList) => {
    const lesson = importData.lessons[lessonIndex];
    const imageFiles = Array.from(files);
    
    updateLesson(lessonIndex, 'imageFiles', [
      ...(lesson.imageFiles || []),
      ...imageFiles
    ]);
  };

  const handleVideoUpload = (lessonIndex: number, file: File) => {
    updateLesson(lessonIndex, 'videoFile', file);
  };

  const uploadFile = async (file: File, type: 'image' | 'video') => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`/api/upload/${type}`, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`上传失败: ${response.statusText}`);
    }
    
    const result = await response.json();
    return result.data.url;
  };

  const handleSubmit = async () => {
    if (!session) {
      alert('请先登录');
      router.push('/login');
      return;
    }

    setImporting(true);
    setUploadProgress('开始导入课程...');

    try {
      // 1. 上传所有文件
      for (let i = 0; i < importData.lessons.length; i++) {
        const lesson = importData.lessons[i];
        setUploadProgress(`正在处理第 ${i + 1} 课时...`);

        // 上传视频
        if (lesson.videoFile) {
          setUploadProgress(`上传视频: ${lesson.videoFile.name}`);
          const videoUrl = await uploadFile(lesson.videoFile, 'video');
          lesson.videoUrl = videoUrl;
        }

        // 上传图片
        if (lesson.imageFiles && lesson.imageFiles.length > 0) {
          lesson.imageUrls = [];
          for (const imageFile of lesson.imageFiles) {
            setUploadProgress(`上传图片: ${imageFile.name}`);
            const imageUrl = await uploadFile(imageFile, 'image');
            lesson.imageUrls.push(imageUrl);
          }
          
          // 将图片URL插入到content中
          let updatedContent = lesson.content;
          lesson.imageUrls.forEach((url, index) => {
            updatedContent += `\n\n![图片${index + 1}](${url})\n`;
          });
          lesson.content = updatedContent;
        }
      }

      // 2. 保存到数据库
      setUploadProgress('保存课程数据...');
      const sectionData = {
        title: importData.sectionTitle,
        slug: importData.sectionSlug,
        description: importData.sectionDescription,
        lessons: importData.lessons.map((lesson, index) => ({
          title: lesson.title,
          type: lesson.type,
          content: lesson.content,
          videoUrl: lesson.videoUrl,
          isFree: lesson.isFree,
          order: index + 1
        }))
      };

      const response = await fetch('/api/admin/courses/sections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sectionData)
      });

      if (response.ok) {
        alert('课程导入成功！');
        router.push('/admin/courses');
      } else {
        const error = await response.json();
        throw new Error(error.error || '保存失败');
      }
      
    } catch (error) {
      console.error('导入错误:', error);
      alert(`导入失败: ${error.message}`);
    } finally {
      setImporting(false);
      setUploadProgress('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 pt-20">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">批量导入课程</h1>
        
        {/* 章节信息 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">章节信息</h2>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="章节标题"
              value={importData.sectionTitle}
              onChange={(e) => setImportData({...importData, sectionTitle: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg"
            />
            <input
              type="text"
              placeholder="URL标识 (如: introduction)"
              value={importData.sectionSlug}
              onChange={(e) => setImportData({...importData, sectionSlug: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg"
            />
            <textarea
              placeholder="章节描述"
              value={importData.sectionDescription}
              onChange={(e) => setImportData({...importData, sectionDescription: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg"
              rows={3}
            />
          </div>
        </div>

        {/* 课时列表 */}
        <div className="space-y-4 mb-6">
          {importData.lessons.map((lesson, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">课时 {index + 1}</h3>
                <button
                  onClick={() => {
                    const lessons = [...importData.lessons];
                    lessons.splice(index, 1);
                    setImportData({...importData, lessons});
                  }}
                  className="text-red-600 hover:bg-red-50 p-2 rounded"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="课时标题"
                  value={lesson.title}
                  onChange={(e) => updateLesson(index, 'title', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                />
                
                <select
                  value={lesson.type}
                  onChange={(e) => updateLesson(index, 'type', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="TEXT_ONLY">纯文档</option>
                  <option value="VIDEO_TEXT">视频+文档</option>
                </select>
                
                <textarea
                  placeholder="课时内容（支持Markdown格式）"
                  value={lesson.content}
                  onChange={(e) => updateLesson(index, 'content', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                  rows={6}
                />
                
                {/* 图片上传 */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <label className="flex flex-col items-center cursor-pointer">
                    <Image className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600">上传图片（可多选）</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => e.target.files && handleImageUpload(index, e.target.files)}
                      className="hidden"
                    />
                  </label>
                  {lesson.imageFiles && lesson.imageFiles.length > 0 && (
                    <div className="mt-2 text-sm text-gray-600">
                      已选择 {lesson.imageFiles.length} 张图片
                    </div>
                  )}
                </div>
                
                {/* 视频上传 */}
                {lesson.type === 'VIDEO_TEXT' && (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    <label className="flex flex-col items-center cursor-pointer">
                      <Video className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-600">上传视频</span>
                      <input
                        type="file"
                        accept="video/*"
                        onChange={(e) => e.target.files && handleVideoUpload(index, e.target.files[0])}
                        className="hidden"
                      />
                    </label>
                    {lesson.videoFile && (
                      <div className="mt-2 text-sm text-gray-600">
                        已选择: {lesson.videoFile.name}
                      </div>
                    )}
                  </div>
                )}
                
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={lesson.isFree}
                    onChange={(e) => updateLesson(index, 'isFree', e.target.checked)}
                  />
                  <span className="text-sm">免费试看</span>
                </label>
              </div>
            </div>
          ))}
        </div>

        {/* 添加课时按钮 */}
        <button
          onClick={addLesson}
          className="w-full mb-6 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 flex items-center justify-center gap-2 text-gray-600"
        >
          <Plus className="w-5 h-5" />
          添加课时
        </button>

        {/* 进度提示 */}
        {uploadProgress && (
          <div className="mb-4 p-4 bg-blue-50 rounded-lg text-blue-700">
            {uploadProgress}
          </div>
        )}

        {/* 提交按钮 */}
        <div className="flex gap-4">
          <button
            onClick={handleSubmit}
            disabled={importing || importData.lessons.length === 0}
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
            onClick={() => router.push('/admin/courses')}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            返回
          </button>
        </div>

        {/* 使用说明 */}
        <div className="mt-8 bg-yellow-50 rounded-lg p-6">
          <h3 className="font-semibold text-yellow-900 mb-2">使用说明</h3>
          <ul className="space-y-1 text-sm text-yellow-800">
            <li>• 支持上传图片格式：JPG, PNG, GIF, WebP</li>
            <li>• 支持上传视频格式：MP4, WebM, OGG, MOV, AVI（最大500MB）</li>
            <li>• 图片会自动压缩并生成缩略图</li>
            <li>• 上传的图片URL会自动添加到课时内容末尾</li>
            <li>• 课时内容支持Markdown格式</li>
          </ul>
        </div>
      </div>
    </div>
  );
}