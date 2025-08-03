'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getSections, getSectionLessons } from '@/lib/strapi-api'
import type { StrapiSection, StrapiLesson } from '@/lib/strapi-api'

interface SectionWithLessons extends StrapiSection {
  lessons: StrapiLesson[]
}

export default function StrapiCoursesPage() {
  const [sections, setSections] = useState<SectionWithLessons[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        // 获取所有章节
        const sectionsData = await getSections()
        
        // 为每个章节获取课程
        const sectionsWithLessons = await Promise.all(
          sectionsData.map(async (section) => {
            const lessons = await getSectionLessons(section.id)
            return { ...section, lessons }
          })
        )
        
        setSections(sectionsWithLessons)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">课程中心（Strapi 版）</h1>
          <p>加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">课程中心（Strapi 版）</h1>
        
        {sections.length === 0 ? (
          <p className="text-gray-600">暂无课程数据</p>
        ) : (
          <div className="space-y-8">
            {sections.map((section) => (
              <div key={section.id} className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-semibold mb-4">{section.title}</h2>
                {section.description && (
                  <p className="text-gray-600 mb-4">{section.description}</p>
                )}
                
                {section.lessons.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    {section.lessons.map((lesson) => (
                      <Link
                        key={lesson.id}
                        href={`/courses/strapi/${section.slug}/${lesson.slug}`}
                        className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <h3 className="font-medium mb-2">{lesson.title}</h3>
                        {lesson.description && (
                          <p className="text-sm text-gray-600 mb-2">{lesson.description}</p>
                        )}
                        <div className="flex items-center justify-between text-sm">
                          {lesson.duration && (
                            <span className="text-gray-500">时长: {lesson.duration}</span>
                          )}
                          {lesson.videoUrl && (
                            <span className="text-blue-600">包含视频</span>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">该章节暂无课程</p>
                )}
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            提示：这是从 Strapi CMS 实时获取的数据。
            <br />
            在 Strapi 中编辑内容后，刷新页面即可看到更新。
          </p>
        </div>
      </div>
    </div>
  )
}