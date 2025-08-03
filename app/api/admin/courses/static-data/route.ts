import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const COURSE_DATA_PATH = path.join(process.cwd(), 'lib', 'course-data.ts');

export async function GET() {
  try {
    // 动态导入course-data
    const { courseSections } = await import('@/lib/course-data');
    return NextResponse.json(courseSections);
  } catch (error) {
    console.error('Failed to load course data:', error);
    return NextResponse.json({ error: 'Failed to load course data' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { sectionKey, lessonId, content } = await request.json();

    // 读取当前文件内容
    const fileContent = await fs.readFile(COURSE_DATA_PATH, 'utf-8');
    
    // 动态导入获取当前数据
    const { courseSections } = await import('@/lib/course-data');
    
    // 更新指定的课时内容
    const section = courseSections[sectionKey];
    if (!section) {
      return NextResponse.json({ error: 'Section not found' }, { status: 404 });
    }

    const lessonIndex = section.lessons.findIndex((l: any) => l.id === lessonId);
    if (lessonIndex === -1) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }

    // 替换文件中的内容
    // 这是一个简化的实现，实际中可能需要更复杂的解析
    const contentEscaped = content
      .replace(/\\/g, '\\\\')
      .replace(/'/g, "\\'")
      .replace(/\n/g, '\\n');

    // 查找并替换特定课时的content字段
    const lessonPattern = new RegExp(
      `(id:\\s*'${lessonId}'[^}]*?content:\\s*)'[^']*'`,
      's'
    );
    
    let updatedContent = fileContent;
    if (lessonPattern.test(fileContent)) {
      updatedContent = fileContent.replace(lessonPattern, `$1'${contentEscaped}'`);
    } else {
      // 如果没有content字段，添加一个
      const lessonIdPattern = new RegExp(`(id:\\s*'${lessonId}'[^}]*?)(,)`);
      updatedContent = fileContent.replace(
        lessonIdPattern,
        `$1,\n        content: '${contentEscaped}'$2`
      );
    }

    // 写回文件
    await fs.writeFile(COURSE_DATA_PATH, updatedContent, 'utf-8');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update course data:', error);
    return NextResponse.json(
      { error: 'Failed to update course data' },
      { status: 500 }
    );
  }
}