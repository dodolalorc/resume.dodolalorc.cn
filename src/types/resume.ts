export type EditorSection = 'profile' | 'education' | 'experience' | 'projects' | 'awards'
export type ResumeSize = 'xsmall' | 'small' | 'standard' | 'large'
export type ResumeLocale = 'zh' | 'en'
export type LocalizedText = string | {
  zh?: string
  en?: string
}

export interface avatarConfig {
  url: string
  rounded?: boolean
  size?: number
}

export interface jobIntention {
  position?: LocalizedText
  city?: LocalizedText
  salary?: LocalizedText
}

export type prependType = 'icon' | 'text' | 'both' | 'none'

export interface LinkField {
  url: string
  label: LocalizedText
}

export interface Profile {
  name?: LocalizedText
  avatar?: avatarConfig
  prepend?: prependType
  email?: string
  phone?: string
  school?: LocalizedText
  major?: LocalizedText
  ranking?: LocalizedText
  gpa?: LocalizedText
  gender?: LocalizedText
  birthplace?: LocalizedText
  researchInfo?: Array<{
    label?: LocalizedText
    value?: LocalizedText
  }>
  github?: LinkField
  blog?: LinkField
  zhihu?: string
  xiaohongshu?: string
  wechat?: string
  workExpYear?: LocalizedText
  jobIntention?: jobIntention
}

export interface ExperienceConfig {
  kind?: 'work' | 'skills' | 'campus'
  title?: LocalizedText
  jobTitle?: LocalizedText
  company?: LocalizedText
  partment?: LocalizedText
  jobTime?: string[]
  jobDesc?: LocalizedText[]
}

export interface CourseConfig {
  name: LocalizedText
  grade?: LocalizedText
}

export interface EducationConfig {
  school?: LocalizedText
  degree?: LocalizedText
  major?: LocalizedText
  schoolTags?: LocalizedText[]
  majorTags?: LocalizedText[]
  gpa?: LocalizedText
  ranking?: LocalizedText
  languageCertificates?: LocalizedText[]
  courses?: CourseConfig[]
  eduTime?: string[]
  eduDesc?: LocalizedText
}

export interface ProjectLink {
  url: string
  label: LocalizedText
}

export interface Project {
  name: LocalizedText
  link?: ProjectLink
  role?: LocalizedText
  authorRank?: LocalizedText
  venue?: LocalizedText
  status?: LocalizedText
  techStack?: string[]
  projectTime?: string[]
  projectDesc?: LocalizedText
  projectAchievements?: LocalizedText[]
  mainWork?: Array<{
    title: LocalizedText
    desc: LocalizedText
  }>
}

export interface Award {
  title: LocalizedText
  level?: LocalizedText
  issuer?: LocalizedText
  category?: LocalizedText
  date?: string
}

export interface ResumeConfig {
  profile: Profile
  education: Array<EducationConfig>
  experience: Array<ExperienceConfig>
  projects?: Array<Project>
  awards?: Array<Award>
  research?: ResumeConfig
}
