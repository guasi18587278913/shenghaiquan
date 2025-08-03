'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FileText, Video, Image, Plus, Save, Trash2, Eye } from 'lucide-react';
// import { CourseContentEditor } from '@/components/course-content-editor';
import { RichFeishuEditor } from '@/components/rich-feishu-editor';
import { EnhancedMarkdownEditor } from '@/components/enhanced-markdown-editor';

interface LessonData {
  title: string;
  type: 'TEXT_ONLY' | 'VIDEO_TEXT';
  content: string;
  videoFileId?: string;
  videoDuration?: number;
  isFree: boolean;
}

interface SectionData {
  title: string;
  slug: string;
  description: string;
  lessons: LessonData[];
}

export default function FeishuImportPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [importing, setImporting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [editorType, setEditorType] = useState<'rich' | 'markdown'>('markdown'); // 默认使用 Markdown 编辑器
  
  const [sectionData, setSectionData] = useState<SectionData>({
    title: '',
    slug: '',
    description: '',
    lessons: []
  });

  const [currentLessonIndex, setCurrentLessonIndex] = useState<number | null>(null);

  const addLesson = () => {
    const newLesson: LessonData = {
      title: '',
      type: 'TEXT_ONLY',
      content: '',
      isFree: false
    };
    setSectionData({
      ...sectionData,
      lessons: [...sectionData.lessons, newLesson]
    });
    setCurrentLessonIndex(sectionData.lessons.length);
  };

  const updateLesson = (index: number, data: Partial<LessonData>) => {
    const updatedLessons = [...sectionData.lessons];
    updatedLessons[index] = { ...updatedLessons[index], ...data };
    setSectionData({ ...sectionData, lessons: updatedLessons });
  };

  const deleteLesson = (index: number) => {
    if (confirm('确定删除这个课时吗？')) {
      const lessons = [...sectionData.lessons];
      lessons.splice(index, 1);
      setSectionData({ ...sectionData, lessons });
      if (currentLessonIndex === index) {
        setCurrentLessonIndex(null);
      }
    }
  };

  const handleVODUpload = async () => {
    // 获取VOD上传签名
    const response = await fetch('/api/vod/signature');
    const { signature } = await response.json();
    
    // 这里集成腾讯云VOD上传SDK
    alert('VOD上传功能需要集成腾讯云SDK，获取到签名：' + signature);
  };

  const handleImport = async () => {
    if (!sectionData.title || !sectionData.slug || sectionData.lessons.length === 0) {
      alert('请填写完整信息');
      return;
    }

    setImporting(true);
    try {
      const response = await fetch('/api/admin/courses/sections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...sectionData,
          lessons: sectionData.lessons.map((lesson, index) => ({
            ...lesson,
            order: index + 1,
            videoUrl: lesson.videoFileId ? `vod://${lesson.videoFileId}` : undefined,
            duration: lesson.videoDuration
          }))
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
      setImporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部步骤指示器 */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">飞书文档导入</h1>
            <button
              onClick={() => router.push('/admin/courses')}
              className="text-gray-600 hover:text-gray-900"
            >
              返回管理页
            </button>
          </div>
          <div className="flex items-center gap-8">
            <div className={`flex items-center gap-2 ${currentStep >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}>1</div>
              <span>设置章节信息</span>
            </div>
            <div className={`flex items-center gap-2 ${currentStep >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}>2</div>
              <span>导入课时内容</span>
            </div>
            <div className={`flex items-center gap-2 ${currentStep >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}>3</div>
              <span>预览并发布</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {/* 步骤1：章节信息 */}
        {currentStep === 1 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-6">步骤1：设置章节信息</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  章节标题 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={sectionData.title}
                  onChange={(e) => setSectionData({...sectionData, title: e.target.value})}
                  placeholder="例如：基础篇"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  URL标识 <span className="text-red-500">*</span>
                  <span className="text-xs text-gray-500 ml-2">（用于生成访问链接）</span>
                </label>
                <input
                  type="text"
                  value={sectionData.slug}
                  onChange={(e) => setSectionData({...sectionData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')})}
                  placeholder="例如：basics（只能使用英文、数字、连字符）"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  访问地址将会是：/courses/{sectionData.slug || 'xxx'}/课程名
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">章节描述</label>
                <textarea
                  value={sectionData.description}
                  onChange={(e) => setSectionData({...sectionData, description: e.target.value})}
                  placeholder="简要描述这个章节的内容"
                  className="w-full px-4 py-2 border rounded-lg"
                  rows={3}
                />
              </div>
            </div>
            <div className="mt-6 flex justify-between items-center">
              <div>
                {(!sectionData.title || !sectionData.slug) && (
                  <p className="text-sm text-red-500">
                    请填写必填字段（带 * 号的字段）
                  </p>
                )}
              </div>
              <button
                onClick={() => setCurrentStep(2)}
                disabled={!sectionData.title || !sectionData.slug}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                下一步
              </button>
            </div>
          </div>
        )}

        {/* 步骤2：导入课时 */}
        {currentStep === 2 && (
          <div className="flex gap-6">
            {/* 左侧：课时列表 */}
            <div className="w-80 bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">课时列表</h3>
                <button
                  onClick={addLesson}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-2">
                {sectionData.lessons.map((lesson, index) => (
                  <div
                    key={index}
                    onClick={() => setCurrentLessonIndex(index)}
                    className={`p-3 rounded-lg cursor-pointer ${
                      currentLessonIndex === index 
                        ? 'bg-blue-50 border-blue-200 border' 
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-1">
                        {lesson.type === 'VIDEO_TEXT' ? (
                          <Video className="w-4 h-4 text-gray-500" />
                        ) : (
                          <FileText className="w-4 h-4 text-gray-500" />
                        )}
                        <span className="text-sm truncate">
                          {lesson.title || `课时 ${index + 1}`}
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteLesson(index);
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    {lesson.isFree && (
                      <span className="text-xs text-green-600">免费</span>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-6 space-y-2">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="w-full py-2 text-gray-600 hover:text-gray-900"
                >
                  上一步
                </button>
                <button
                  onClick={() => setCurrentStep(3)}
                  disabled={sectionData.lessons.length === 0}
                  className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                >
                  预览内容
                </button>
              </div>
            </div>

            {/* 右侧：课时编辑 */}
            <div className="flex-1 bg-white rounded-lg shadow p-6">
              {currentLessonIndex !== null ? (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">编辑课时内容</h3>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">课时标题</label>
                    <input
                      type="text"
                      value={sectionData.lessons[currentLessonIndex].title}
                      onChange={(e) => updateLesson(currentLessonIndex, { title: e.target.value })}
                      placeholder="例如：1.1 玩起来！通过AI，10分钟发布你的第一款网站产品！"
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium mb-2">类型</label>
                      <select
                        value={sectionData.lessons[currentLessonIndex].type}
                        onChange={(e) => updateLesson(currentLessonIndex, { 
                          type: e.target.value as 'TEXT_ONLY' | 'VIDEO_TEXT' 
                        })}
                        className="w-full px-4 py-2 border rounded-lg"
                      >
                        <option value="TEXT_ONLY">纯文档</option>
                        <option value="VIDEO_TEXT">视频+文档</option>
                      </select>
                    </div>
                    <div>
                      <label className="flex items-center gap-2 mt-8">
                        <input
                          type="checkbox"
                          checked={sectionData.lessons[currentLessonIndex].isFree}
                          onChange={(e) => updateLesson(currentLessonIndex, { 
                            isFree: e.target.checked 
                          })}
                        />
                        <span className="text-sm">免费试看</span>
                      </label>
                    </div>
                  </div>

                  {sectionData.lessons[currentLessonIndex].type === 'VIDEO_TEXT' && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium mb-3">视频设置</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium mb-2">腾讯云VOD FileId</label>
                          <input
                            type="text"
                            value={sectionData.lessons[currentLessonIndex].videoFileId || ''}
                            onChange={(e) => updateLesson(currentLessonIndex, { 
                              videoFileId: e.target.value 
                            })}
                            placeholder="例如：387702307629xxx"
                            className="w-full px-4 py-2 border rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">视频时长（秒）</label>
                          <input
                            type="number"
                            value={sectionData.lessons[currentLessonIndex].videoDuration || ''}
                            onChange={(e) => updateLesson(currentLessonIndex, { 
                              videoDuration: parseInt(e.target.value) 
                            })}
                            placeholder="例如：600"
                            className="w-full px-4 py-2 border rounded-lg"
                          />
                        </div>
                        <button
                          onClick={handleVODUpload}
                          className="text-blue-600 hover:text-blue-700 text-sm"
                        >
                          上传视频到VOD →
                        </button>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium mb-2">课时内容</label>
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-xs text-gray-500">
                        从飞书直接复制内容粘贴到下方编辑器，图片和格式会自动保留
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <label className="flex items-center gap-1 cursor-pointer">
                          <input
                            type="radio"
                            name="editor"
                            value="markdown"
                            checked={editorType === 'markdown'}
                            onChange={() => setEditorType('markdown')}
                          />
                          <span>Markdown编辑器</span>
                        </label>
                        <label className="flex items-center gap-1 cursor-pointer">
                          <input
                            type="radio"
                            name="editor"
                            value="rich"
                            checked={editorType === 'rich'}
                            onChange={() => setEditorType('rich')}
                          />
                          <span>富文本编辑器</span>
                        </label>
                      </div>
                    </div>
                    {editorType === 'markdown' ? (
                      <EnhancedMarkdownEditor
                        content={sectionData.lessons[currentLessonIndex].content}
                        onChange={(content) => updateLesson(currentLessonIndex, { content })}
                      />
                    ) : (
                      <RichFeishuEditor
                        content={sectionData.lessons[currentLessonIndex].content}
                        onChange={(content) => updateLesson(currentLessonIndex, { content })}
                      />
                    )}
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <FileText className="w-12 h-12 mx-auto mb-3" />
                    <p>点击左侧课时进行编辑</p>
                    <p className="text-sm mt-2">或点击 + 添加新课时</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 步骤3：预览 */}
        {currentStep === 3 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-6">步骤3：预览并发布</h2>
            
            <div className="border rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold mb-2">{sectionData.title}</h3>
              <p className="text-gray-600 mb-4">{sectionData.description}</p>
              <p className="text-sm text-gray-500">URL: /courses/{sectionData.slug}</p>
              
              <div className="mt-6 space-y-4">
                {sectionData.lessons.map((lesson, index) => (
                  <div key={index} className="border rounded p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{lesson.title}</h4>
                      <div className="flex items-center gap-3 text-sm">
                        {lesson.type === 'VIDEO_TEXT' && (
                          <span className="text-blue-600">包含视频</span>
                        )}
                        {lesson.isFree && (
                          <span className="text-green-600">免费</span>
                        )}
                      </div>
                    </div>
                    <div 
                      className="text-sm text-gray-600 line-clamp-3"
                      dangerouslySetInnerHTML={{ 
                        __html: lesson.content.substring(0, 200) + '...' 
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setCurrentStep(2)}
                className="px-6 py-2 text-gray-600 hover:text-gray-900"
              >
                返回编辑
              </button>
              <button
                onClick={handleImport}
                disabled={importing}
                className="px-8 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 flex items-center gap-2"
              >
                {importing ? '导入中...' : (
                  <>
                    <Save className="w-5 h-5" />
                    确认导入
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* 使用提示 */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-3">使用提示</h3>
          <div className="space-y-2 text-sm text-blue-800">
            <p>📝 <strong>从飞书复制内容</strong>：直接复制飞书文档内容，粘贴到编辑器中，格式会自动保留</p>
            <p>🖼️ <strong>图片处理</strong>：可以直接粘贴截图，或拖拽图片文件到编辑器</p>
            <p>🎥 <strong>视频上传</strong>：先将视频上传到腾讯云VOD，获取FileId后填入</p>
            <p>💡 <strong>建议</strong>：每个课时控制在10-15分钟，便于学员消化吸收</p>
          </div>
        </div>
      </div>
    </div>
  );
}