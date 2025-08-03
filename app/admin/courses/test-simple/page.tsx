'use client';

import { useState } from 'react';

export default function SimpleTestPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  const testAPI = async () => {
    setLoading(true);
    setResult('测试中...');
    
    try {
      // 测试环境变量
      const envRes = await fetch('/api/admin/courses/test-feishu-env');
      const envData = await envRes.json();
      
      setResult(prev => prev + '\n\n环境变量检查：');
      setResult(prev => prev + '\n- FEISHU_APP_ID: ' + (envData.hasAppId ? '✅ 已配置' : '❌ 未配置'));
      setResult(prev => prev + '\n- FEISHU_APP_SECRET: ' + (envData.hasAppSecret ? '✅ 已配置' : '❌ 未配置'));
      
      if (!envData.hasAppId || !envData.hasAppSecret) {
        setResult(prev => prev + '\n\n❌ 请先配置环境变量');
        setLoading(false);
        return;
      }
      
      // 测试Token
      setResult(prev => prev + '\n\n正在获取访问令牌...');
      const tokenRes = await fetch('/api/admin/courses/test-feishu-token');
      const tokenData = await tokenRes.json();
      
      if (tokenData.success) {
        setResult(prev => prev + '\n✅ 成功获取访问令牌');
        setResult(prev => prev + '\n- Token长度: ' + tokenData.tokenLength + ' 字符');
        setResult(prev => prev + '\n- 有效期: ' + tokenData.expiresIn + ' 秒');
      } else {
        setResult(prev => prev + '\n❌ 获取令牌失败: ' + tokenData.error);
        if (tokenData.code) {
          setResult(prev => prev + '\n- 错误代码: ' + tokenData.code);
        }
      }
      
    } catch (error) {
      setResult(prev => prev + '\n\n❌ 测试失败: ' + error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 pt-24">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold mb-6">飞书API简单测试</h1>
          
          <button
            onClick={testAPI}
            disabled={loading}
            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? '测试中...' : '点击测试'}
          </button>
          
          {result && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <pre className="whitespace-pre-wrap font-mono text-sm">{result}</pre>
            </div>
          )}
          
          <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
            <h3 className="font-bold mb-2">检查步骤：</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>确保 .env.local 文件存在</li>
              <li>确保配置了 FEISHU_APP_ID 和 FEISHU_APP_SECRET</li>
              <li>重启开发服务器 (Ctrl+C 然后 npm run dev)</li>
              <li>刷新此页面后点击测试按钮</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}