<script lang="ts" setup>
// 导入所有图标
import EmailIcon from '@/assets/icons/email.svg'
import PhoneIcon from '@/assets/icons/phone.svg'
import GithubIcon from '@/assets/icons/github.svg'
import GithubAltIcon from '@/assets/icons/github-alt.svg'
import BlogIcon from '@/assets/icons/blog.svg'
import BilibiliIcon from '@/assets/icons/bilibili.svg'
import ZhihuIcon from '@/assets/icons/zhihu.svg'
import BriefcaseIcon from '@/assets/icons/briefcase.svg'
import GraduationCapIcon from '@/assets/icons/graduation-cap.svg'
import StarIcon from '@/assets/icons/star.svg'
import TrophyIcon from '@/assets/icons/trophy.svg'
import LinkIcon from '@/assets/icons/link.svg'
import FilePdfIcon from '@/assets/icons/file-pdf.svg'
import FanIcon from '@/assets/icons/fan.svg'
import CommentIcon from '@/assets/icons/comment.svg'
import ThumbsUpIcon from '@/assets/icons/thumbs-up.svg'
import HeartIcon from '@/assets/icons/heart.svg'
import FaceSmileIcon from '@/assets/icons/face-smile.svg'
import BookIcon from '@/assets/icons/book.svg'
import LaptopIcon from '@/assets/icons/laptop.svg'
import LocationDotIcon from '@/assets/icons/location-dot.svg'
import DollarSignIcon from '@/assets/icons/dollar-sign.svg'
import WechatIcon from '@/assets/icons/wechat.svg'

import { computed } from 'vue'

const name = defineModel('name', { type: String, required: true })

// 图标映射表
const iconMap: Record<string, typeof EmailIcon> = {
  email: EmailIcon,
  phone: PhoneIcon,
  github: GithubIcon,
  'github-alt': GithubAltIcon,
  blog: BlogIcon,
  bilibili: BilibiliIcon,
  zhihu: ZhihuIcon,
  briefcase: BriefcaseIcon,
  'graduation-cap': GraduationCapIcon,
  star: StarIcon,
  trophy: TrophyIcon,
  link: LinkIcon,
  'file-pdf': FilePdfIcon,
  fan: FanIcon,
  comment: CommentIcon,
  'thumbs-up': ThumbsUpIcon,
  heart: HeartIcon,
  'face-smile': FaceSmileIcon,
  book: BookIcon,
  laptop: LaptopIcon,
  'location-dot': LocationDotIcon,
  'dollar-sign': DollarSignIcon,
  wechat: WechatIcon,
  edit: CommentIcon,
  'rotate-left': FanIcon,
  'file-export': LinkIcon,
}

// 使用计算属性来动态选择图标组件
const iconComponent = computed(() => {
  return iconMap[name.value] || FaceSmileIcon // 如果找不到对应图标，使用默认的笑脸图标
})
</script>

<template>
  <div class="icon-logo">
    <component :is="iconComponent" />
  </div>
</template>

<style scoped>
.icon-logo {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 2px;
}
</style>
