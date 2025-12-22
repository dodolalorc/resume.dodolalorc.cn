export type EditorSection = 'profile' | 'education' | 'experience' | 'projects' | 'awards'
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
  jobTitle?: string // 职位名称
  company?: string // 公司
  partment?: string // 部门
  jobTime?: string[] // 工作时间
  jobDesc?: string[] // 工作描述(支持 markdown)
}

export interface EducationConfig {
  school?: string // 学校
  degree?: string // 学位
  major?: string // 专业
  eduTime?: string[] // 就读时间
  eduDesc?: string // 在校描述(支持 markdown)
}

export interface Project {
  name: string // 项目名称
  link?: string // 项目链接
  role?: string // 在项目中的角色
  techStack?: string[] // 技术栈
  projectTime?: string[] // 项目时间
  projectDesc?: string // 项目描述(支持 markdown)
  projectAchievements?: string[] // 项目成果
  // 主要工作内容
  mainWork?: Array<{
    title: string // 工作内容标题
    desc: string // 工作内容描述(支持 markdown)
  }>
}

export interface Award {
  title: string // 奖项名称
  level?: string // 奖项等级
  date?: string // 获奖时间
}

export interface ResumeConfig {
  profile: Profile
  education: Array<EducationConfig>
  experience: Array<ExperienceConfig>
  projects?: Array<Project>
  awards?: Array<Award> // 奖项
}
