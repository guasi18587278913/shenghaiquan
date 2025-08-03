'use client'

import { useEffect, useState } from 'react'
import { getSections, getAllLessons } from '@/lib/strapi-api'
import type { StrapiSection, StrapiLesson } from '@/lib/strapi-api'

export default function TestStrapiPage() {
  const [sections, setSections] = useState<StrapiSection[]>([])
  const [lessons, setLessons] = useState<StrapiLesson[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [sectionsData, lessonsData] = await Promise.all([
          getSections(),
          getAllLessons()
        ])
        setSections(sectionsData)
        setLessons(lessonsData)
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
          <h1 className="text-3xl font-bold mb-8">Strapi 连接测试</h1>
          <p>加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Strapi 连接测试</h1>
        
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">章节 (Sections)</h2>
          <div className="bg-white rounded-lg shadow p-6">
            {sections.length > 0 ? (
              <ul className="space-y-2">
                {sections.map((section) => (
                  <li key={section.id} className="border-b pb-2">
                    <p className="font-medium">{section.title} (#{section.order})</p>
                    <p className="text-sm text-gray-600">Slug: {section.slug}</p>
                    <p className="text-xs text-gray-500">{section.description}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p>没有找到章节数据</p>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4">课程 (Lessons)</h2>
          <div className="bg-white rounded-lg shadow p-6">
            {lessons.length > 0 ? (
              <div className="space-y-4">
                {lessons.map((lesson) => (
                  <div key={lesson.id} className="border-b pb-4">
                    <p className="font-medium">{lesson.title} (#{lesson.order})</p>
                    <p className="text-sm text-gray-600">Slug: {lesson.slug}</p>
                    {lesson.duration && (
                      <p className="text-sm text-gray-500">时长: {lesson.duration}</p>
                    )}
                    {lesson.videoUrl && (
                      <p className="text-sm text-blue-600">有视频</p>
                    )}
                    <div className="mt-2">
                      <p className="text-sm font-medium">内容预览:</p>
                      <div 
                        className="text-xs text-gray-600 max-h-20 overflow-hidden"
                        dangerouslySetInnerHTML={{ 
                          __html: lesson.content.substring(0, 200) + '...' 
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>没有找到课程数据</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}