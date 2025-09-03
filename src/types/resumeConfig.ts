interface avatarConfig {
  url: string // 照片链接
  rounded: boolean // 是否圆形照片
  size: number // 照片大小(px)
}

interface Profile {
  name: string // 姓名
  avatar: avatarConfig // 照片
  email: string // 邮箱
  phone: string // 电话
}

interface ExperienceConfig {
  jobTitle: string // 职位
  company: string // 公司
  years: string // 工作年限
  description: string // 工作描述
}

export interface ResumeConfig {
  profile: Profile
  education: Array<{
    school: string // 学校
    degree: string // 学位
    major: string // 专业
    edu_time: string[] // 就读时间
  }>
  experience: Array<ExperienceConfig>
  skills: Array<string> // 技能
}
