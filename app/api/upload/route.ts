import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { uploadImage, uploadAvatar, validateFile, generateFileName, UploadError } from '@/lib/upload'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: '请先登录' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string

    if (!file) {
      return NextResponse.json(
        { error: '请选择要上传的文件' },
        { status: 400 }
      )
    }

    // 验证文件
    try {
      validateFile({
        size: file.size,
        mimetype: file.type
      })
    } catch (error) {
      if (error instanceof UploadError) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        )
      }
      throw error
    }

    // 将文件转换为Buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    let url: string

    // 根据上传类型处理
    switch (type) {
      case 'avatar':
        url = await uploadAvatar(buffer, session.user.id)
        break
      
      case 'post':
        const filename = generateFileName(file.name)
        url = await uploadImage(buffer, filename, {
          resize: { width: 800, height: 600 }
        })
        break
      
      default:
        const defaultFilename = generateFileName(file.name)
        url = await uploadImage(buffer, defaultFilename)
    }

    return NextResponse.json({
      url,
      message: '上传成功'
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: '上传失败，请稍后重试' },
      { status: 500 }
    )
  }
}