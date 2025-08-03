'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';

interface ImportTemplate {
  sectionTitle: string;
  sectionSlug: string;
  sectionDescription: string;
  lessons: {
    title: string;
    type: 'TEXT_ONLY' | 'VIDEO_TEXT';
    content: string;
    isFree: boolean;
  }[];
}

export default function FileImportPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [importing, setImporting] = useState(false);
  const [fileContent, setFileContent] = useState<string>('');
  const [parsedData, setParsedData] = useState<ImportTemplate | null>(null);
  const [error, setError] = useState<string>('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    setFileContent(text);
    
    try {
      // 尝试解析 JSON
      if (file.name.endsWith('.json')) {
        const data = JSON.parse(text);
        setParsedData(data);
        setError('');
      } else {
        // 解析 Markdown 格式
        parseMarkdown(text);
      }
    } catch (err) {
      setError('文件格式错误，请检查');
    }
  };

  const parseMarkdown = (text: string) => {
    try {
      const lines = text.split('\n');
      const data: ImportTemplate = {
        sectionTitle: '',
        sectionSlug: '',
        sectionDescription: '',
        lessons: []
      };

      let currentLesson: any = null;
      let inLesson = false;

      for (const line of lines) {
        // 解析章节信息
        if (line.startsWith('# ') && !inLesson) {
          data.sectionTitle = line.substring(2).trim();
          data.sectionSlug = data.sectionTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        } else if (line.startsWith('## ') && !data.sectionDescription) {
          data.sectionDescription = line.substring(3).trim();
        } else if (line.startsWith('### ')) {
          // 新课时
          if (currentLesson) {
            data.lessons.push(currentLesson);
          }
          currentLesson = {
            title: line.substring(4).trim(),
            type: 'TEXT_ONLY',
            content: '',
            isFree: false
          };
          inLesson = true;
        } else if (currentLesson && line.trim()) {
          // 课时内容
          if (line.includes('[视频]')) {
            currentLesson.type = 'VIDEO_TEXT';
          }
          if (line.includes('[免费]')) {
            currentLesson.isFree = true;
          }
          currentLesson.content += line + '\n';
        }
      }

      if (currentLesson) {
        data.lessons.push(currentLesson);
      }

      setParsedData(data);
      setError('');
    } catch (err) {
      setError('Markdown 解析失败');
    }
  };

  const handleImport = async () => {
    if (!parsedData) return;

    setImporting(true);
    try {
      const response = await fetch('/api/admin/courses/sections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...parsedData,
          lessons: parsedData.lessons.map((lesson, index) => ({
            ...lesson,
            order: index + 1
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

  const downloadTemplate = () => {
    const template: ImportTemplate = {
      sectionTitle: "示例章节",
      sectionSlug: "example-section",
      sectionDescription: "这是一个示例章节",
      lessons: [
        {
          title: "第一课：入门介绍",
          type: "TEXT_ONLY",
          content: "这是课程内容，支持 **Markdown** 格式。\n\n## 小标题\n\n- 列表项1\n- 列表项2",
          isFree: true
        },
        {
          title: "第二课：进阶内容",
          type: "VIDEO_TEXT",
          content: "这节课包含视频内容。",
          isFree: false
        }
      ]
    };

    const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'course-import-template.json';
    a.click();
  };

  const downloadMarkdownTemplate = () => {
    const template = `# 深海生物探索

## 探索神秘的深海世界，了解深海生物的独特适应性

### 第一课：深海环境介绍 [免费]

深海是指水深超过200米的海域，这里是地球上最神秘的地方之一。

#### 主要特点
- 永恒的黑暗
- 极高的水压
- 低温环境
- 食物稀缺

深海占据了地球上95%的生存空间，却是我们了解最少的地方。

### 第二课：发光生物的奥秘 [视频]

生物发光是深海生物最神奇的特征之一。

#### 发光的用途
1. 吸引猎物
2. 寻找配偶
3. 防御天敌
4. 种内交流

超过90%的深海生物具有发光能力。`;

    const blob = new Blob([template], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'course-import-template.md';
    a.click();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 pt-20">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">文件导入课程</h1>

        {/* 文件上传区域 */}
        <div className="bg-white rounded-lg shadow p-8 mb-6">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <label className="cursor-pointer">
              <span className="text-lg text-gray-600">点击上传课程文件</span>
              <input
                type="file"
                accept=".json,.md,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
            <p className="text-sm text-gray-500 mt-2">支持 JSON、Markdown 格式</p>
          </div>

          {/* 下载模板 */}
          <div className="mt-6 flex gap-4 justify-center">
            <button
              onClick={downloadTemplate}
              className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              下载 JSON 模板
            </button>
            <button
              onClick={downloadMarkdownTemplate}
              className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              下载 Markdown 模板
            </button>
          </div>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        {/* 预览区域 */}
        {parsedData && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">预览导入内容</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-700">章节信息</h3>
                <p className="text-lg">{parsedData.sectionTitle}</p>
                <p className="text-sm text-gray-600">{parsedData.sectionDescription}</p>
                <p className="text-sm text-gray-500">URL: {parsedData.sectionSlug}</p>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-700 mb-2">课时列表（{parsedData.lessons.length} 个）</h3>
                <div className="space-y-2">
                  {parsedData.lessons.map((lesson, index) => (
                    <div key={index} className="border rounded p-3 bg-gray-50">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{lesson.title}</span>
                        <div className="flex gap-2">
                          {lesson.type === 'VIDEO_TEXT' && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">视频</span>
                          )}
                          {lesson.isFree && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">免费</span>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{lesson.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex gap-4">
          <button
            onClick={handleImport}
            disabled={!parsedData || importing}
            className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
          >
            {importing ? '导入中...' : (
              <>
                <CheckCircle className="w-5 h-5" />
                确认导入
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

        {/* 格式说明 */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-3">文件格式说明</h3>
          
          <div className="space-y-4 text-sm text-blue-800">
            <div>
              <h4 className="font-medium mb-1">JSON 格式：</h4>
              <pre className="bg-white rounded p-3 overflow-x-auto">
{`{
  "sectionTitle": "章节标题",
  "sectionSlug": "url-slug",
  "sectionDescription": "章节描述",
  "lessons": [
    {
      "title": "课时标题",
      "type": "TEXT_ONLY",
      "content": "课时内容",
      "isFree": false
    }
  ]
}`}
              </pre>
            </div>
            
            <div>
              <h4 className="font-medium mb-1">Markdown 格式：</h4>
              <pre className="bg-white rounded p-3 overflow-x-auto">
{`# 章节标题
## 章节描述

### 课时标题 [免费] [视频]
课时内容...`}
              </pre>
              <p className="mt-2">标记说明：[免费] 表示免费课时，[视频] 表示包含视频</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}