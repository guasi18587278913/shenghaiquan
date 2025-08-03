'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Link, Loader2, AlertCircle, CheckCircle, Settings } from 'lucide-react';

export default function FeishuAPIImportPage() {
  const router = useRouter();
  const [documentUrl, setDocumentUrl] = useState('');
  const [sectionTitle, setSectionTitle] = useState('');
  const [sectionSlug, setSectionSlug] = useState('');
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonContent, setLessonContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  // 从飞书API获取文档内容
  const fetchDocument = async () => {
    if (!documentUrl) {
      setError('请输入飞书文档链接');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch('/api/admin/courses/import-feishu', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ documentUrl }),
      });

      const data = await response.json();

      if (response.ok) {
        setLessonContent(data.content);
        setSuccess(true);
        
        // 自动填充标题（如果还没有填写）
        if (!lessonTitle && data.content) {
          // 尝试从内容中提取第一个标题
          const firstHeading = data.content.match(/^#\s+(.+)$/m);
          if (firstHeading) {
            setLessonTitle(firstHeading[1]);
          }
        }
      } else {
        setError(data.error || '导入失败');
      }
    } catch (error) {
      setError('网络错误，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  // 保存课程
  const handleSave = async () => {
    if (!sectionTitle || !sectionSlug || !lessonTitle || !lessonContent) {
      setError('请填写所有必填字段');
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
          description: '从飞书API导入的章节',
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
        throw new Error('保存失败');
      }
    } catch (error) {
      setError('保存失败：' + error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 pt-24">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold mb-6">飞书API导入</h1>

          {/* API配置状态 */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 text-blue-800">
              <Settings className="w-5 h-5" />
              <span className="font-medium">飞书API配置</span>
            </div>
            <p className="text-sm text-blue-600 mt-1">
              请确保已在环境变量中配置 FEISHU_APP_ID 和 FEISHU_APP_SECRET
            </p>
          </div>

          <div className="space-y-6">
            {/* 飞书文档URL */}
            <div>
              <label className="block text-sm font-medium mb-2">
                飞书文档链接 <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={documentUrl}
                  onChange={(e) => setDocumentUrl(e.target.value)}
                  placeholder="https://xxx.feishu.cn/docx/xxxxxx"
                  className="flex-1 px-4 py-2 border rounded-lg"
                />
                <button
                  onClick={fetchDocument}
                  disabled={isLoading || !documentUrl}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      获取中...
                    </>
                  ) : (
                    <>
                      <Link className="w-4 h-4" />
                      获取文档
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* 错误提示 */}
            {error && (
              <div className="p-4 bg-red-50 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                <div className="text-red-800">
                  <p className="font-medium">错误</p>
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            )}

            {/* 成功提示 */}
            {success && (
              <div className="p-4 bg-green-50 rounded-lg flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div className="text-green-800">
                  <p className="font-medium">获取成功</p>
                  <p className="text-sm">文档内容已加载，请填写其他信息</p>
                </div>
              </div>
            )}

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
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                
                {/* 内容预览 */}
                {lessonContent && (
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      内容预览
                    </label>
                    <div className="border rounded-lg p-4 bg-gray-50 max-h-96 overflow-auto">
                      <pre className="whitespace-pre-wrap font-mono text-sm">
                        {lessonContent}
                      </pre>
                    </div>
                  </div>
                )}
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
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
              >
                {saving ? '保存中...' : '保存课程'}
              </button>
            </div>
          </div>
        </div>

        {/* 使用说明 */}
        <div className="mt-6 bg-amber-50 rounded-lg p-4">
          <h3 className="font-semibold text-amber-900 mb-2">配置说明</h3>
          <div className="text-sm text-amber-800 space-y-2">
            <p>要使用飞书API导入功能，你需要：</p>
            <ol className="list-decimal list-inside space-y-1 ml-4">
              <li>在飞书开放平台创建应用</li>
              <li>获取 App ID 和 App Secret</li>
              <li>在项目根目录的 .env.local 文件中配置：
                <pre className="mt-2 p-2 bg-amber-100 rounded">
{`FEISHU_APP_ID=你的AppID
FEISHU_APP_SECRET=你的AppSecret`}
                </pre>
              </li>
              <li>给应用添加文档读取权限</li>
              <li>确保文档对应用可见（公开或添加应用权限）</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}