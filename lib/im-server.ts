import crypto from 'crypto';

export class IMService {
  private appId: string;
  private key: string;

  constructor() {
    this.appId = process.env.TENCENT_IM_APPID || '';
    this.key = process.env.TENCENT_IM_KEY || '';
  }

  // 生成 UserSig (简化版本)
  generateUserSig(userId: string, expire = 86400 * 7): string {
    const currentTime = Math.floor(Date.now() / 1000);
    const expireTime = currentTime + expire;
    
    const obj = {
      TLS: {
        ver: '2.0',
        sig: '',
        expire: expireTime,
        time: currentTime
      }
    };

    const content = `TLS.ver=2.0&TLS.identifier=${userId}&TLS.sdkappid=${this.appId}&TLS.expire=${expireTime}&TLS.time=${currentTime}&TLS.sig=`;
    
    const signature = crypto
      .createHmac('sha256', Buffer.from(this.key, 'base64'))
      .update(content)
      .digest('base64');

    obj.TLS.sig = signature;
    
    const compressed = Buffer.from(JSON.stringify(obj)).toString('base64');
    return compressed.replace(/\+/g, '*').replace(/\//g, '-').replace(/=/g, '_');
  }

  // 验证 UserSig
  verifyUserSig(userId: string, userSig: string): boolean {
    try {
      const decodedSig = userSig.replace(/\*/g, '+').replace(/-/g, '/').replace(/_/g, '=');
      const buffer = Buffer.from(decodedSig, 'base64');
      const obj = JSON.parse(buffer.toString());
      
      const currentTime = Math.floor(Date.now() / 1000);
      
      // 检查是否过期
      if (obj.TLS.expire < currentTime) {
        return false;
      }
      
      // 验证签名
      const content = `TLS.ver=2.0&TLS.identifier=${userId}&TLS.sdkappid=${this.appId}&TLS.expire=${obj.TLS.expire}&TLS.time=${obj.TLS.time}&TLS.sig=`;
      const expectedSig = crypto
        .createHmac('sha256', Buffer.from(this.key, 'base64'))
        .update(content)
        .digest('base64');
      
      return obj.TLS.sig === expectedSig;
    } catch (error) {
      return false;
    }
  }
}