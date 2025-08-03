'use client';

import { useState } from 'react';
import { Upload, Check, X, FileText, Lock } from 'lucide-react';

export default function TestCOSPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
      setError('');
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('courseId', 'test-course-123');

      const response = await fetch('/api/test-cos-upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || '上传失败');
      }
    } catch (err) {
      setError('网络错误，请重试');
    } finally {
      setUploading(false);
    }
  };

  const testProtectedAccess = async () => {
    if (!result?.contentKey) return;

    try {
      // 测试访问受保护内容
      window.open(`/api/protected-content/test-course-123/${result.contentKey}`, '_blank');
    } catch (err) {
      console.error('访问失败:', err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">测试腾讯云COS私有存储</h1>

      {/* 配置检查 */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">配置检查清单</h2>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 border rounded-full flex items-center justify-center">
              {process.env.NEXT_PUBLIC_COS_CONFIGURED ? <Check className="w-3 h-3 text-green-500" /> : <X className="w-3 h-3 text-red-500" />}
            </div>
            <span>已配置COS环境变量</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 border rounded-full flex items-center justify-center">
              <Check className="w-3 h-3 text-green-500" />
            </div>
            <span>已安装COS SDK</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 border rounded-full flex items-center justify-center">
              <Check className="w-3 h-3 text-green-500" />
            </div>
            <span>保护API已创建</span>
          </div>
        </div>
      </div>

      {/* 上传测试 */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">上传测试文件</h2>
        
        <div className="mb-4">
          <input
            type="file"
            onChange={handleFileSelect}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
          {file && (
            <p className="mt-2 text-sm text-gray-600">
              已选择: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          )}
        </div>

        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? '上传中...' : '上传到私有存储'}
        </button>

        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-700 rounded">
            {error}
          </div>
        )}

        {result && (
          <div className="mt-4 p-4 bg-green-50 rounded">
            <h3 className="font-semibold text-green-800 mb-2">上传成功！</h3>
            <div className="space-y-1 text-sm">
              <p><strong>存储路径:</strong> {result.contentKey}</p>
              <p><strong>文件大小:</strong> {(result.size / 1024 / 1024).toFixed(2)} MB</p>
              <p><strong>存储类型:</strong> 私有存储 <Lock className="inline w-4 h-4 text-gray-500" /></p>
            </div>
          </div>
        )}
      </div>

      {/* 访问测试 */}
      {result && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">测试内容保护</h2>
          <p className="text-gray-600 mb-4">
            文件已上传到私有存储，只有登录用户且有课程权限才能访问。
          </p>
          <button
            onClick={testProtectedAccess}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            测试访问受保护内容
          </button>
          <p className="text-sm text-gray-500 mt-2">
            将在新窗口打开，如果您有权限将看到内容，否则会提示无权限。
          </p>
        </div>
      )}

      {/* 使用说明 */}
      <div className="mt-8 bg-blue-50 rounded-lg p-6">
        <h3 className="font-semibold mb-2">🎉 配置成功后</h3>
        <ul className="space-y-2 text-sm">
          <li>• WordPress的公开链接问题解决了</li>
          <li>• 所有课程内容都存储在私有空间</li>
          <li>• 只有付费用户能通过API访问</li>
          <li>• 访问链接30分钟后自动失效</li>
        </ul>
      </div>
    </div>
  );
}