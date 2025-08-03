'use client';

import { useState, useEffect } from 'react';
import { Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function TestFeishuPage() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);
  const [documentUrl, setDocumentUrl] = useState('');

  // 测试飞书API配置
  const testFeishuAPI = async () => {
    setIsLoading(true);
    setTestResults(null);

    const results = {
      envCheck: { status: 'pending', message: '检查环境变量...' },
      tokenFetch: { status: 'pending', message: '获取访问令牌...' },
      documentAccess: { status: 'pending', message: '访问文档...' },
      imageAccess: { status: 'pending', message: '测试图片访问...' },
    };

    try {
      // 1. 检查环境变量
      const envResponse = await fetch('/api/admin/courses/test-feishu-env');
      const envData = await envResponse.json();
      
      if (envData.hasAppId && envData.hasAppSecret) {
        results.envCheck = { 
          status: 'success', 
          message: '环境变量已配置',
          details: `App ID: ${envData.appIdPreview}`
        };
      } else {
        results.envCheck = { 
          status: 'error', 
          message: '环境变量未配置',
          details: '请在 .env.local 中配置 FEISHU_APP_ID 和 FEISHU_APP_SECRET'
        };
        setTestResults(results);
        setIsLoading(false);
        return;
      }

      setTestResults({ ...results });

      // 2. 测试获取 Token
      const tokenResponse = await fetch('/api/admin/courses/test-feishu-token');
      const tokenData = await tokenResponse.json();

      if (tokenData.success) {
        results.tokenFetch = { 
          status: 'success', 
          message: '成功获取访问令牌',
          details: `Token 长度: ${tokenData.tokenLength} 字符`
        };
      } else {
        results.tokenFetch = { 
          status: 'error', 
          message: '获取令牌失败',
          details: tokenData.error
        };
        setTestResults(results);
        setIsLoading(false);
        return;
      }

      setTestResults({ ...results });

      // 3. 如果提供了文档URL，测试文档访问
      if (documentUrl) {
        const docResponse = await fetch('/api/admin/courses/test-feishu-doc', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ documentUrl })
        });
        const docData = await docResponse.json();

        if (docData.success) {
          results.documentAccess = { 
            status: 'success', 
            message: '成功访问文档',
            details: `文档块数量: ${docData.blockCount}`
          };
          
          // 4. 测试图片访问
          if (docData.hasImages) {
            results.imageAccess = { 
              status: 'success', 
              message: '检测到图片',
              details: `图片数量: ${docData.imageCount}`
            };
          } else {
            results.imageAccess = { 
              status: 'info', 
              message: '文档中没有图片',
              details: '无需测试图片访问'
            };
          }
        } else {
          results.documentAccess = { 
            status: 'error', 
            message: '访问文档失败',
            details: docData.error
          };
          results.imageAccess = { 
            status: 'skip', 
            message: '跳过图片测试',
            details: '需要先成功访问文档'
          };
        }
      } else {
        results.documentAccess = { 
          status: 'skip', 
          message: '未提供文档URL',
          details: '输入文档URL以测试文档访问'
        };
        results.imageAccess = { 
          status: 'skip', 
          message: '跳过图片测试',
          details: '需要提供文档URL'
        };
      }

      setTestResults(results);
    } catch (error) {
      console.error('测试失败:', error);
      setTestResults({
        ...results,
        error: { 
          status: 'error', 
          message: '测试过程出错',
          details: error instanceof Error ? error.message : '未知错误'
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'info':
        return <AlertCircle className="w-5 h-5 text-blue-500" />;
      case 'skip':
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
      default:
        return <Loader2 className="w-5 h-5 text-gray-500 animate-spin" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      case 'skip':
        return 'bg-gray-50 border-gray-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 pt-24 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8 pt-24">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold mb-6">飞书API配置测试</h1>

          <div className="space-y-6">
            {/* 文档URL输入 */}
            <div>
              <label className="block text-sm font-medium mb-2">
                飞书文档URL（可选）
              </label>
              <input
                type="text"
                value={documentUrl}
                onChange={(e) => setDocumentUrl(e.target.value)}
                placeholder="https://xxx.feishu.cn/docx/xxxxx"
                className="w-full px-4 py-2 border rounded-lg"
              />
              <p className="text-xs text-gray-500 mt-1">
                提供文档URL可以测试文档访问权限
              </p>
            </div>

            {/* 测试按钮 */}
            <button
              onClick={testFeishuAPI}
              disabled={isLoading}
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  测试中...
                </>
              ) : (
                '开始测试'
              )}
            </button>

            {/* 测试结果 */}
            {testResults && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">测试结果</h2>
                
                {Object.entries(testResults).map(([key, result]: [string, any]) => (
                  <div
                    key={key}
                    className={`border rounded-lg p-4 ${getStatusColor(result.status)}`}
                  >
                    <div className="flex items-start gap-3">
                      {getStatusIcon(result.status)}
                      <div className="flex-1">
                        <p className="font-medium">{result.message}</p>
                        {result.details && (
                          <p className="text-sm text-gray-600 mt-1">{result.details}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 配置说明 */}
            <div className="mt-8 p-4 bg-amber-50 rounded-lg">
              <h3 className="font-semibold text-amber-900 mb-2">配置检查清单</h3>
              <ul className="text-sm text-amber-800 space-y-1">
                <li>✓ 在 .env.local 中配置了 FEISHU_APP_ID</li>
                <li>✓ 在 .env.local 中配置了 FEISHU_APP_SECRET</li>
                <li>✓ 应用已发布</li>
                <li>✓ 添加了文档读取权限</li>
                <li>✓ 重启了开发服务器（npm run dev）</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}