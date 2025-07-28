'use client';

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Phone, Shield, ArrowRight, Waves, ArrowLeft } from 'lucide-react';

export default function PhoneLoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [step, setStep] = useState<'phone' | 'code'>('phone');

  // 倒计时效果
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // 发送验证码
  const handleSendCode = async () => {
    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
      setError('请输入正确的手机号');
      return;
    }

    setIsSending(true);
    setError('');

    try {
      const response = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || '发送失败');
      } else {
        setStep('code');
        setCountdown(60);
        // 开发环境显示验证码
        if (data.code && process.env.NODE_ENV === 'development') {
          alert(`开发环境验证码：${data.code}`);
        }
      }
    } catch (error) {
      setError('发送失败，请稍后重试');
    } finally {
      setIsSending(false);
    }
  };

  // 验证码登录
  const handleCodeLogin = async () => {
    if (!code || code.length !== 6) {
      setError('请输入6位验证码');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await signIn('phone', {
        phone,
        code,
        redirect: false,
      });

      if (result?.error) {
        setError('验证码错误或已过期');
      } else {
        router.push('/');
        router.refresh();
      }
    } catch (error) {
      setError('登录失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center p-4">
      {/* 背景装饰 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full blur-3xl opacity-30" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-cyan-100 to-teal-100 rounded-full blur-3xl opacity-30" />
      </div>

      <div className="w-full max-w-md relative">
        {/* Logo和标题 */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <Waves className="w-10 h-10 text-blue-600" />
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              深海圈
            </span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">手机号快速登录</h1>
          <p className="text-gray-600">安全便捷，无需记住密码</p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/50">
          {/* 错误提示 */}
          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm mb-6">
              {error}
            </div>
          )}

          {step === 'phone' ? (
            /* 输入手机号步骤 */
            <div className="space-y-6">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  手机号
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="请输入手机号"
                    maxLength={11}
                  />
                </div>
              </div>

              <button
                onClick={handleSendCode}
                disabled={isSending || !phone}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 px-4 rounded-xl hover:from-blue-700 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSending ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    发送中...
                  </>
                ) : (
                  <>
                    获取验证码
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          ) : (
            /* 输入验证码步骤 */
            <div className="space-y-6">
              <div className="text-center mb-4">
                <p className="text-sm text-gray-600">
                  验证码已发送至
                  <span className="font-medium text-gray-900 ml-1">{phone}</span>
                </p>
              </div>

              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                  验证码
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Shield className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="code"
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-center text-lg font-medium tracking-widest"
                    placeholder="请输入6位验证码"
                    maxLength={6}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <button
                  onClick={() => {
                    setStep('phone');
                    setCode('');
                  }}
                  className="text-gray-600 hover:text-gray-900 flex items-center gap-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                  返回修改手机号
                </button>
                {countdown > 0 ? (
                  <span className="text-gray-500">{countdown}s 后可重新发送</span>
                ) : (
                  <button
                    onClick={handleSendCode}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    重新发送
                  </button>
                )}
              </div>

              <button
                onClick={handleCodeLogin}
                disabled={isLoading || code.length !== 6}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 px-4 rounded-xl hover:from-blue-700 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    登录中...
                  </>
                ) : (
                  <>
                    确认登录
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          )}

          {/* 分割线 */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">其他登录方式</span>
            </div>
          </div>

          {/* 其他登录方式 */}
          <div className="text-center">
            <Link href="/login" className="text-sm text-blue-600 hover:text-blue-700">
              使用密码登录
            </Link>
          </div>

          {/* 开发环境提示 */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-6 p-4 bg-amber-50 rounded-xl">
              <p className="text-sm text-amber-800">
                <strong>开发环境提示：</strong><br />
                验证码会在控制台显示，实际生产环境会通过短信发送
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}