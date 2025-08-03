import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const data = await request.json();
    console.log('创建课程框架:', data);

    // 检查章节是否已存在
    const existingSection = await prisma.courseSection.findUnique({
      where: { slug: data.slug }
    });

    if (existingSection) {
      // 如果已存在，更新而不是创建
      console.log(`章节 ${data.slug} 已存在，将更新内容`);
      
      // 为每个课程创建或更新
      for (const courseData of data.courses) {
        const existingCourse = await prisma.course.findFirst({
          where: {
            slug: courseData.slug,
            sectionId: existingSection.id
          }
        });

        if (existingCourse) {
          console.log(`课程 ${courseData.slug} 已存在，跳过`);
          continue;
        }

        // 创建新课程
        const course = await prisma.course.create({
          data: {
            title: courseData.title,
            slug: courseData.slug,
            description: courseData.description || '',
            sectionId: existingSection.id,
            order: data.courses.indexOf(courseData) + 1
          }
        });

        // 创建章节和课时
        for (const chapterData of courseData.chapters) {
          const chapter = await prisma.chapter.create({
            data: {
              title: chapterData.title,
              courseId: course.id,
              order: chapterData.order
            }
          });

          // 创建课时（暂时留空内容）
          for (const lessonData of chapterData.lessons) {
            await prisma.lesson.create({
              data: {
                title: lessonData.title,
                type: lessonData.type,
                content: '', // 内容暂时留空
                videoId: lessonData.vodId || null,
                videoDuration: lessonData.duration || 0,
                chapterId: chapter.id,
                order: lessonData.order,
                isFree: false
              }
            });
          }
        }
      }

      return NextResponse.json({ 
        success: true, 
        section: existingSection,
        message: '章节已存在，新增课程已添加'
      });
    }

    // 创建新章节
    const section = await prisma.courseSection.create({
      data: {
        title: data.title,
        slug: data.slug,
        description: data.description || '',
        order: await getNextSectionOrder(),
        requiredTier: 'ANNUAL'
      }
    });

    // 创建课程
    for (const courseData of data.courses) {
      const course = await prisma.course.create({
        data: {
          title: courseData.title,
          slug: courseData.slug,
          description: courseData.description || '',
          sectionId: section.id,
          order: data.courses.indexOf(courseData) + 1
        }
      });

      // 创建章节
      for (const chapterData of courseData.chapters) {
        const chapter = await prisma.chapter.create({
          data: {
            title: chapterData.title,
            courseId: course.id,
            order: chapterData.order
          }
        });

        // 创建课时（暂时留空内容）
        for (const lessonData of chapterData.lessons) {
          await prisma.lesson.create({
            data: {
              title: lessonData.title,
              type: lessonData.type,
              content: '', // 内容暂时留空，后续填充
              videoId: lessonData.vodId || null,
              videoDuration: lessonData.duration || 0,
              chapterId: chapter.id,
              order: lessonData.order,
              isFree: false
            }
          });
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      section,
      message: '课程框架创建成功'
    });

  } catch (error: any) {
    console.error('创建课程框架失败:', error);
    return NextResponse.json(
      { 
        error: '创建失败', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// 获取下一个章节顺序号
async function getNextSectionOrder() {
  const lastSection = await prisma.courseSection.findFirst({
    orderBy: { order: 'desc' }
  });
  return (lastSection?.order || 0) + 1;
}