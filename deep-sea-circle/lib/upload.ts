import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import sharp from 'sharp'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export interface UploadOptions {
  maxSize?: number
  allowedTypes?: string[]
  resize?: {
    width: number
    height: number
  }
}

export class UploadError extends Error {
  constructor(message: string, public code: string) {
    super(message)
    this.name = 'UploadError'
  }
}

// 确保上传目录存在
async function ensureUploadDir(dir: string) {
  try {
    await mkdir(dir, { recursive: true })
  } catch (error) {
    console.error('Failed to create upload directory:', error)
  }
}

// 生成唯一文件名
export function generateFileName(originalName: string): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  const ext = originalName.split('.').pop()
  return `${timestamp}-${random}.${ext}`
}

// 验证文件
export function validateFile(
  file: { size: number; mimetype: string },
  options: UploadOptions = {}
): void {
  const maxSize = options.maxSize || MAX_FILE_SIZE
  const allowedTypes = options.allowedTypes || ALLOWED_IMAGE_TYPES

  if (file.size > maxSize) {
    throw new UploadError(
      `文件大小超过限制（最大 ${maxSize / 1024 / 1024}MB）`,
      'FILE_TOO_LARGE'
    )
  }

  if (!allowedTypes.includes(file.mimetype)) {
    throw new UploadError(
      '不支持的文件类型',
      'INVALID_FILE_TYPE'
    )
  }
}

// 处理图片上传
export async function uploadImage(
  file: Buffer,
  filename: string,
  options: UploadOptions = {}
): Promise<string> {
  const uploadDir = join(process.cwd(), 'public', 'uploads', 'images')
  await ensureUploadDir(uploadDir)

  const filePath = join(uploadDir, filename)
  let processedBuffer = file

  // 如果需要调整大小
  if (options.resize) {
    processedBuffer = await sharp(file)
      .resize(options.resize.width, options.resize.height, {
        fit: 'cover',
        position: 'center'
      })
      .toBuffer()
  }

  // 写入文件
  await writeFile(filePath, processedBuffer)

  // 返回公共访问路径
  return `/uploads/images/${filename}`
}

// 处理头像上传
export async function uploadAvatar(file: Buffer, userId: string): Promise<string> {
  const filename = `avatar-${userId}-${Date.now()}.jpg`
  
  // 处理头像：调整大小并转换为JPEG
  const processedBuffer = await sharp(file)
    .resize(200, 200, {
      fit: 'cover',
      position: 'center'
    })
    .jpeg({ quality: 85 })
    .toBuffer()

  const uploadDir = join(process.cwd(), 'public', 'uploads', 'avatars')
  await ensureUploadDir(uploadDir)
  
  const filePath = join(uploadDir, filename)
  await writeFile(filePath, processedBuffer)

  return `/uploads/avatars/${filename}`
}

// 删除文件
export async function deleteFile(publicPath: string): Promise<void> {
  if (!publicPath || !publicPath.startsWith('/uploads/')) {
    return
  }

  const filePath = join(process.cwd(), 'public', publicPath)
  
  try {
    const { unlink } = await import('fs/promises')
    await unlink(filePath)
  } catch (error) {
    console.error('Failed to delete file:', error)
  }
}