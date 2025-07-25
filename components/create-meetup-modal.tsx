'use client'

import { useState } from 'react'
import { X, MapPin, Calendar, Clock, Users, MessageSquare } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface CreateMeetupModalProps {
  isOpen: boolean
  onClose: () => void
  defaultCity?: string
  defaultDate?: string
}

export function CreateMeetupModal({ isOpen, onClose, defaultCity, defaultDate }: CreateMeetupModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    city: defaultCity || '',
    location: '',
    date: defaultDate || '',
    time: '',
    maxParticipants: '10',
    wechatGroup: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: 实际的提交逻辑
    alert('组局创建成功！')
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 背景遮罩 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />

          {/* 弹窗内容 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden">
              {/* 头部 */}
              <div className="bg-gradient-to-r from-[#0891A1] to-[#00A8CC] p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-2xl font-bold">创建组局</h2>
                  <button
                    onClick={onClose}
                    className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <p className="text-white/90">发起同城线下交流活动，认识更多圈友</p>
              </div>

              {/* 表单 */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-120px)]">
                {/* 活动标题 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    活动标题 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="例如：深圳AI创业者下午茶"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0891A1] focus:border-transparent"
                  />
                </div>

                {/* 活动描述 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    活动描述 <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="介绍一下活动内容、适合什么人参加..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0891A1] focus:border-transparent resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* 城市 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <MapPin className="w-4 h-4 inline mr-1" />
                      城市 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="例如：深圳"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0891A1] focus:border-transparent"
                    />
                  </div>

                  {/* 具体地点 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      具体地点 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="例如：星巴克(科技园店)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0891A1] focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* 日期 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      日期 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0891A1] focus:border-transparent"
                    />
                  </div>

                  {/* 时间 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Clock className="w-4 h-4 inline mr-1" />
                      时间 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      required
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0891A1] focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* 人数限制 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Users className="w-4 h-4 inline mr-1" />
                      人数限制
                    </label>
                    <select
                      value={formData.maxParticipants}
                      onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0891A1] focus:border-transparent"
                    >
                      <option value="5">5人</option>
                      <option value="10">10人</option>
                      <option value="15">15人</option>
                      <option value="20">20人</option>
                      <option value="30">30人</option>
                      <option value="50">50人</option>
                      <option value="0">不限</option>
                    </select>
                  </div>

                  {/* 微信群 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <MessageSquare className="w-4 h-4 inline mr-1" />
                      微信群二维码
                    </label>
                    <input
                      type="text"
                      value={formData.wechatGroup}
                      onChange={(e) => setFormData({ ...formData, wechatGroup: e.target.value })}
                      placeholder="可选"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0891A1] focus:border-transparent"
                    />
                  </div>
                </div>

                {/* 提示信息 */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-700">
                    💡 组局创建后，其他圈友可以报名参加。建议创建微信群方便沟通。
                  </p>
                </div>

                {/* 按钮 */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-gradient-to-r from-[#0891A1] to-[#00A8CC] text-white rounded-lg hover:shadow-lg transform hover:scale-[1.02] transition-all"
                  >
                    发布组局
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}