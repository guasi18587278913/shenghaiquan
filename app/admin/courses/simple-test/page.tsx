'use client';

import { useState } from 'react';

export default function SimpleTestPage() {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const testSave = async () => {
    setLoading(true);
    setMessage('正在测试保存...');
    
    try {
      const testData = {
        title: '测试章节',
        slug: 'test-section-' + Date.now(),
        description: '这是一个测试章节',
        lessons: [
          {
            title: '测试课时',
            type: 'TEXT_ONLY',
            content: '这是测试内容',
            isFree: false,
            order: 1
          }
        ]
      };

      const response = await fetch('/api/admin/courses/sections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testData)
      });

      const result = await response.json();
      
      if (response.ok) {
        setMessage('保存成功！' + JSON.stringify(result));
      } else {
        setMessage('保存失败：' + JSON.stringify(result));
      }
    } catch (error: any) {
      setMessage('错误：' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">保存功能测试</h1>
      
      <button
        onClick={testSave}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? '测试中...' : '测试保存'}
      </button>
      
      {message && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <pre className="whitespace-pre-wrap">{message}</pre>
        </div>
      )}
    </div>
  );
}