'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function TestStylesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 p-8 pt-24">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* 样式测试 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold mb-4">样式测试页面</h1>
          
          <div className="space-y-4">
            <p>如果你能看到下面的按钮样式，说明 CSS 正常加载：</p>
            
            <div className="flex gap-3 flex-wrap">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                蓝色按钮
              </button>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                绿色按钮
              </button>
              <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                红色按钮
              </button>
            </div>
          </div>
        </div>

        {/* 认证状态 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">认证状态</h2>
          
          <div className="space-y-2">
            <p>状态: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{status}</span></p>
            {session ? (
              <>
                <p>已登录用户: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{session.user?.phone || session.user?.email}</span></p>
                <p>用户ID: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{session.user?.id}</span></p>
              </>
            ) : (
              <p className="text-red-600">未登录</p>
            )}
          </div>
        </div>

        {/* 导航链接 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">快速导航</h2>
          
          <div className="space-y-3">
            <div>
              <a 
                href="/login" 
                className="text-blue-600 hover:underline block"
              >
                → 登录页面
              </a>
            </div>
            
            <div>
              <a 
                href="/admin/courses" 
                className="text-blue-600 hover:underline block"
              >
                → 课程管理页面
              </a>
            </div>
            
            <div>
              <a 
                href="/admin/courses/import-feishu" 
                className="text-blue-600 hover:underline block"
              >
                → 飞书导入页面
              </a>
            </div>
            
            <div className="pt-4">
              <button
                onClick={() => router.push('/admin/courses/import-feishu')}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                使用 Router 跳转到飞书导入
              </button>
            </div>
          </div>
        </div>

        {/* 环境信息 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">环境信息</h2>
          
          <div className="space-y-2">
            <p>当前路径: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{typeof window !== 'undefined' ? window.location.pathname : 'N/A'}</span></p>
            <p>端口: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{typeof window !== 'undefined' ? window.location.port || '80' : 'N/A'}</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}