export interface avatarConfig {
  url: string // 照片链接
  rounded?: boolean // 是否圆形照片
  size?: number // 照片大小(px)
}

export interface jobIntention {
  position?: string // 意向职位
  city?: string // 意向城市
  salary?: string // 期望薪资
}

export type prependType = 'icon' | 'text' | 'both' | 'none' // 基本信息的前置内容

export interface Profile {
  name?: string // 姓名
  avatar?: avatarConfig // 照片
  prepend?: prependType // 基本信息的前置内容
  email?: string // 邮箱
  phone?: string // 电话
  github?: string // GitHub 链接
  blog?: string // 个人博客链接
  zhihu?: string // 知乎链接
  xiaohongshu?: string // 小红书链接
  wechat?: string // 微信链接
  workExpYear?: string // 工作经验年限
  jobIntention?: jobIntention
}

export interface ExperienceConfig {
  jobTitle?: string // 职位
  company?: string // 公司
  years?: string // 工作年限
  description?: string // 工作描述
}

export interface EducationConfig {
  school?: string // 学校
  degree?: string // 学位
  major?: string // 专业
  edu_time?: string[] // 就读时间
}

export interface ResumeConfig {
  profile: Profile
  education: Array<EducationConfig>
  experience: Array<ExperienceConfig>
  skills: Array<string> // 技能
}
