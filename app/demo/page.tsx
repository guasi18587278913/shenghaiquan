'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { MessageCircle, Users, Zap, CheckCircle, ArrowRight } from 'lucide-react';
import UserChat from '@/components/chat/UserChat';

export default function DemoPage() {
  const { data: session } = useSession();
  const [currentStep, setCurrentStep] = useState(0);

  const demoSteps = [
    {
      title: '欢迎来到深海圈IM系统',
      description: '实时聊天，连接每一位学员',
      icon: MessageCircle,
      action: null
    },
    {
      title: '第一步：登录账号',
      description: '使用测试账号快速登录',
      icon: Users,
      action: '前往登录'
    },
    {
      title: '第二步：开始聊天',
      description: '点击右下角聊天按钮，搜索其他用户',
      icon: Zap,
      action: '开始体验'
    },
    {
      title: '功能特性',
      description: '实时消息、在线状态、多窗口聊天',
      icon: CheckCircle,
      action: null
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50">
      {/* 顶部导航 */}
      <div className="bg-white/80 backdrop-blur border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">深海圈IM系统演示</h1>
            {session?.user && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">当前用户：</span>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {session.user.name?.[0] || 'U'}
                  </div>
                  <span className="font-medium">{session.user.name || '未登录'}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* 步骤指示器 */}
        <div className="flex items-center justify-center mb-12">
          {demoSteps.map((step, index) => (
            <div key={index} className="flex items-center">
              <button
                onClick={() => setCurrentStep(index)}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                  currentStep === index
                    ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white scale-110'
                    : currentStep > index
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {currentStep > index ? (
                  <CheckCircle className="w-6 h-6" />
                ) : (
                  <span className="font-bold">{index + 1}</span>
                )}
              </button>
              {index < demoSteps.length - 1 && (
                <div className={`w-24 h-1 mx-2 ${
                  currentStep > index ? 'bg-green-500' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* 当前步骤内容 */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              {demoSteps[currentStep].icon && (
                <demoSteps[currentStep].icon className="w-10 h-10 text-teal-600" />
              )}
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {demoSteps[currentStep].title}
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              {demoSteps[currentStep].description}
            </p>

            {/* 操作按钮 */}
            <div className="flex items-center justify-center gap-4">
              {currentStep > 0 && (
                <button
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                >
                  上一步
                </button>
              )}
              
              {currentStep === 1 && !session?.user && (
                <a
                  href="/test-accounts"
                  className="px-8 py-3 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center gap-2"
                >
                  前往登录页面
                  <ArrowRight className="w-5 h-5" />
                </a>
              )}
              
              {currentStep < demoSteps.length - 1 && (
                <button
                  onClick={() => setCurrentStep(currentStep + 1)}
                  className="px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center gap-2"
                >
                  下一步
                  <ArrowRight className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 功能展示卡片 */}
        {currentStep === 3 && (
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-teal-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">实时通讯</h3>
              <p className="text-gray-600">消息即时送达，无需刷新页面</p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-cyan-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">在线状态</h3>
              <p className="text-gray-600">实时显示用户在线/离线状态</p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <MessageCircle className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">多窗口聊天</h3>
              <p className="text-gray-600">同时与多人聊天，切换自如</p>
            </div>
          </div>
        )}
      </div>

      {/* 聊天组件 */}
      {session?.user && <UserChat />}
    </div>
  );
}