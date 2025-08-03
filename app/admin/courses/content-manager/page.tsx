'use client';

import { useState, useEffect } from 'react';
import { 
  FileText, 
  Video, 
  FileCode, 
  Upload, 
  Check, 
  Loader2,
  Download,
  Eye,
  Trash2,
  Plus,
  RefreshCw
} from 'lucide-react';
import { courseSections } from '@/lib/course-data';

interface ContentItem {
  id: string;
  type: 'text' | 'video' | 'pdf' | 'image';
  name: string;
  size?: number;
  url?: string;
  key?: string;
  uploadedAt?: Date;
}

export default function CourseContentManager() {
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [selectedLesson, setSelectedLesson] = useState<any>(null);
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [importingWP, setImportingWP] = useState(false);

  // 获取所有章节
  const sections = Object.values(courseSections);

  // 当选择章节时，显示该章节的课程
  const currentSection = sections.find(s => s.id === selectedSection);

  // 处理文件上传
  const handleFileUpload = async (file: File, type: string) => {
    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('courseId', selectedLesson.id);
      formData.append('sectionId', selectedSection);
      formData.append('type', type);

      const response = await fetch('/api/admin/courses/upload-content', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        // 添加到内容列表
        const newContent: ContentItem = {
          id: Date.now().toString(),
          type: type as any,
          name: file.name,
          size: file.size,
          key: data.contentKey,
          uploadedAt: new Date()
        };
        
        setContents([...contents, newContent]);
        alert('上传成功！');
      } else {
        alert(data.error || '上传失败');
      }
    } catch (error) {
      console.error('上传错误:', error);
      alert('上传失败，请重试');
    } finally {
      setUploading(false);
    }
  };

  // 从WordPress导入内容
  const handleWordPressImport = async () => {
    if (!selectedLesson?.wordpressSlug) {
      alert('该课程没有关联的WordPress文章');
      return;
    }

    setImportingWP(true);
    
    try {
      const response = await fetch('/api/admin/courses/import-wordpress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wordpressSlug: selectedLesson.wordpressSlug,
          lessonId: selectedLesson.id,
          sectionId: selectedSection
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert('WordPress内容导入成功！');
        // 刷新内容列表
        setContents([...contents, {
          id: Date.now().toString(),
          type: 'text',
          name: 'WordPress导入内容',
          key: data.contentKey,
          uploadedAt: new Date()
        }]);
      } else {
        alert(data.error || '导入失败');
      }
    } catch (error) {
      console.error('导入错误:', error);
      alert('导入失败，请重试');
    } finally {
      setImportingWP(false);
    }
  };

  // 预览内容
  const handlePreview = (content: ContentItem) => {
    // 生成预览链接
    const previewUrl = `/api/protected-content/${selectedSection}/${selectedLesson.id}/${content.key}`;
    window.open(previewUrl, '_blank');
  };

  // 删除内容
  const handleDelete = async (content: ContentItem) => {
    if (!confirm('确定要删除这个内容吗？')) return;
    
    // TODO: 调用删除API
    setContents(contents.filter(c => c.id !== content.id));
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">课程内容管理</h1>
      
      <div className="grid grid-cols-4 gap-6">
        {/* 左侧：章节和课程列表 */}
        <div className="space-y-4">
          {/* 章节选择 */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="font-semibold mb-3">选择章节</h2>
            <select 
              className="w-full border rounded p-2"
              value={selectedSection}
              onChange={(e) => {
                setSelectedSection(e.target.value);
                setSelectedLesson(null);
                setContents([]);
              }}
            >
              <option value="">请选择章节</option>
              {sections.map(section => (
                <option key={section.id} value={section.id}>
                  {section.title}
                </option>
              ))}
            </select>
          </div>

          {/* 课程列表 */}
          {currentSection && (
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="font-semibold mb-3">课程列表</h2>
              <div className="space-y-2">
                {currentSection.lessons.map(lesson => (
                  <div
                    key={lesson.id}
                    onClick={() => setSelectedLesson(lesson)}
                    className={`p-3 rounded cursor-pointer flex items-center justify-between
                      ${selectedLesson?.id === lesson.id ? 'bg-blue-50 border-blue-500 border' : 'hover:bg-gray-50 border border-gray-200'}`}
                  >
                    <div className="flex items-center gap-2">
                      {lesson.type === 'article' && <FileText className="w-4 h-4 text-gray-500" />}
                      {lesson.type === 'video' && <Video className="w-4 h-4 text-blue-500" />}
                      {lesson.type === 'wordpress' && <FileCode className="w-4 h-4 text-green-500" />}
                      <div>
                        <p className="text-sm font-medium">{lesson.title}</p>
                        <p className="text-xs text-gray-500">{lesson.duration}</p>
                      </div>
                    </div>
                    {lesson.isFree && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">免费</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 右侧：内容管理区 */}
        <div className="col-span-3 bg-white rounded-lg shadow p-6">
          {selectedLesson ? (
            <div>
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">{selectedLesson.title}</h3>
                <p className="text-sm text-gray-600">
                  课程类型：{selectedLesson.type} | 时长：{selectedLesson.duration}
                </p>
              </div>

              {/* 上传区域 */}
              <div className="mb-8">
                <h4 className="font-medium mb-4">上传内容</h4>
                <div className="grid grid-cols-3 gap-4">
                  {/* 文本内容上传 */}
                  <div className="border-2 border-dashed rounded-lg p-4 text-center">
                    <FileText className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm font-medium mb-2">文本内容</p>
                    {selectedLesson.type === 'wordpress' && selectedLesson.wordpressSlug ? (
                      <button
                        onClick={handleWordPressImport}
                        disabled={importingWP}
                        className="w-full px-3 py-2 bg-green-500 text-white text-sm rounded hover:bg-green-600 disabled:opacity-50"
                      >
                        {importingWP ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin inline mr-1" />
                            导入中...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="w-4 h-4 inline mr-1" />
                            从WordPress导入
                          </>
                        )}
                      </button>
                    ) : (
                      <>
                        <input
                          type="file"
                          accept=".html,.txt,.md"
                          onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'text')}
                          className="hidden"
                          id="text-upload"
                          disabled={uploading}
                        />
                        <label htmlFor="text-upload" className="block">
                          <span className="px-3 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 cursor-pointer inline-block">
                            上传HTML/MD
                          </span>
                        </label>
                      </>
                    )}
                  </div>

                  {/* 视频上传 */}
                  <div className="border-2 border-dashed rounded-lg p-4 text-center">
                    <Video className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm font-medium mb-2">视频内容</p>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'video')}
                      className="hidden"
                      id="video-upload"
                      disabled={uploading}
                    />
                    <label htmlFor="video-upload" className="block">
                      <span className="px-3 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 cursor-pointer inline-block">
                        上传视频
                      </span>
                    </label>
                  </div>

                  {/* PDF/文档上传 */}
                  <div className="border-2 border-dashed rounded-lg p-4 text-center">
                    <FileCode className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm font-medium mb-2">作业/资料</p>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.ppt,.pptx"
                      onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'pdf')}
                      className="hidden"
                      id="pdf-upload"
                      disabled={uploading}
                    />
                    <label htmlFor="pdf-upload" className="block">
                      <span className="px-3 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 cursor-pointer inline-block">
                        上传文档
                      </span>
                    </label>
                  </div>
                </div>

                {uploading && (
                  <div className="mt-4 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-500" />
                    <p className="text-sm text-gray-600 mt-2">上传中...</p>
                  </div>
                )}
              </div>

              {/* 已上传内容列表 */}
              <div>
                <h4 className="font-medium mb-4">已上传内容</h4>
                {contents.length > 0 ? (
                  <div className="space-y-2">
                    {contents.map(content => (
                      <div key={content.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-center gap-3">
                          {content.type === 'text' && <FileText className="w-5 h-5 text-gray-500" />}
                          {content.type === 'video' && <Video className="w-5 h-5 text-blue-500" />}
                          {content.type === 'pdf' && <FileCode className="w-5 h-5 text-red-500" />}
                          <div>
                            <p className="font-medium text-sm">{content.name}</p>
                            {content.size && (
                              <p className="text-xs text-gray-500">
                                {(content.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handlePreview(content)}
                            className="p-1 hover:bg-gray-200 rounded"
                            title="预览"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(content)}
                            className="p-1 hover:bg-red-100 rounded text-red-500"
                            title="删除"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Upload className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>该课程还没有上传任何内容</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-16 text-gray-500">
              <FileCode className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg">请先选择一个课程</p>
              <p className="text-sm mt-2">从左侧选择章节和课程，然后上传或导入内容</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}