'use client';

import { useState } from 'react';
import { Upload, Video, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

export default function VideoUploadPage() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [videoInfo, setVideoInfo] = useState<any>(null);
  const [error, setError] = useState('');

  const handleUpload = async (file: File) => {
    setUploading(true);
    setError('');
    setProgress(0);
    
    try {
      // 1. 获取上传签名
      const signRes = await fetch('/api/vod/signature');
      if (!signRes.ok) {
        throw new Error('获取上传签名失败');
      }
      const { signature } = await signRes.json();
      
      // 2. 动态导入VOD SDK
      const TcVod = (await import('vod-js-sdk-v6')).default;
      
      // 3. 创建上传实例
      const uploader = new TcVod({
        getSignature: () => Promise.resolve(signature)
      });
      
      // 4. 执行上传
      const result = await uploader.upload({
        mediaFile: file,
        reportProgress: (info: any) => {
          setProgress(Math.floor(info.percent * 100));
        }
      });
      
      // 5. 保存上传结果
      setVideoInfo({
        fileId: result.fileId,
        url: result.video?.url || `https://vod.tencentcloudapi.com/${result.fileId}`,
        name: file.name,
        size: file.size,
        coverUrl: result.cover?.url
      });
      
    } catch (error: any) {
      console.error('上传失败:', error);
      setError(error.message || '上传失败，请重试');
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Byte';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)).toString());
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">上传教学视频</h1>
      
      <div className="bg-white rounded-lg shadow p-6">
        <input
          type="file"
          accept="video/*"
          onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
          className="hidden"
          id="video-upload"
          disabled={uploading}
        />
        
        <label htmlFor="video-upload" className={`block ${uploading ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
          <div className={`border-2 border-dashed rounded-lg p-12 text-center transition ${
            uploading ? 'border-gray-300 bg-gray-50' : 'border-gray-300 hover:border-blue-500'
          }`}>
            {uploading ? (
              <div>
                <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-blue-500" />
                <p className="text-lg font-medium">上传中... {progress}%</p>
                <div className="w-64 mx-auto mt-4 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            ) : (
              <>
                <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-lg">点击或拖拽视频文件到此处</p>
                <p className="text-sm text-gray-500 mt-2">
                  支持 MP4, MOV, AVI, MKV, FLV 等格式
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  使用腾讯云VOD服务，支持大文件上传和自动转码
                </p>
              </>
            )}
          </div>
        </label>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
            <p className="text-red-700">{error}</p>
          </div>
        )}
        
        {videoInfo && (
          <div className="mt-6 space-y-4">
            <div className="flex items-start">
              <CheckCircle className="w-6 h-6 text-green-500 mt-0.5 mr-2" />
              <div className="flex-1">
                <h3 className="font-semibold text-lg">上传成功！</h3>
                <p className="text-gray-600 text-sm mt-1">视频已上传到腾讯云VOD</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div>
                <span className="text-sm text-gray-500">文件名：</span>
                <span className="text-sm font-medium">{videoInfo.name}</span>
              </div>
              <div>
                <span className="text-sm text-gray-500">文件大小：</span>
                <span className="text-sm font-medium">{formatFileSize(videoInfo.size)}</span>
              </div>
              <div>
                <span className="text-sm text-gray-500">FileID：</span>
                <span className="text-sm font-mono bg-gray-200 px-2 py-1 rounded">{videoInfo.fileId}</span>
              </div>
            </div>

            {videoInfo.coverUrl && (
              <div>
                <p className="text-sm text-gray-500 mb-2">视频封面：</p>
                <img 
                  src={videoInfo.coverUrl} 
                  alt="视频封面" 
                  className="w-64 h-36 object-cover rounded"
                />
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                提示：视频正在后台处理中，可能需要几分钟才能完成转码。
                你可以将FileID保存到课程中，系统会自动获取播放地址。
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}