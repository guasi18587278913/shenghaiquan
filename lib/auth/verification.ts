// 存储验证码的临时方案（生产环境建议使用 Redis）
export const verificationCodes = new Map<string, { code: string; timestamp: number }>();

// 验证码验证函数
export function verifyCode(phone: string, code: string): boolean {
  const stored = verificationCodes.get(phone);
  if (!stored) return false;
  
  // 检查是否过期（5分钟）
  if (Date.now() - stored.timestamp > 5 * 60 * 1000) {
    verificationCodes.delete(phone);
    return false;
  }
  
  // 验证码是否匹配
  if (stored.code === code) {
    verificationCodes.delete(phone); // 使用后删除
    return true;
  }
  
  return false;
}