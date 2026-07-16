export type EditorSection = 'profile' | 'education' | 'experience' | 'skills' | 'campus' | 'projects' | 'awards'
export type ResumeSize = 'xsmall' | 'small' | 'standard' | 'large'
export type ResumeLocale = 'zh' | 'en'
export type LocalizedText = string | {
  zh?: string
  en?: string
}

export interface AvatarConfig {
  url: string
  rounded?: boolean
  size?: number
}

export interface JobIntention {
  position?: LocalizedText
  city?: LocalizedText
  salary?: LocalizedText
}

export type PrependType = 'icon' | 'text' | 'both' | 'none'

/** @deprecated Use AvatarConfig. */
export type avatarConfig = AvatarConfig
/** @deprecated Use JobIntention. */
export type jobIntention = JobIntention
/** @deprecated Use PrependType. */
export type prependType = PrependType

export interface LinkField {
  url: string
  label: LocalizedText
}

export interface Profile {
  name?: LocalizedText
  avatar?: AvatarConfig
  prepend?: PrependType
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
  jobIntention?: JobIntention
}

export interface ExperienceConfig {
  jobTitle?: LocalizedText
  company?: LocalizedText
  partment?: LocalizedText
  jobTime?: string[]
  jobDesc?: LocalizedText[]
}

export interface SkillItem {
  title?: LocalizedText
  jobDesc?: LocalizedText[]
}

export interface CampusItem {
  title?: LocalizedText
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

export interface ResumeContent {
  profile: Profile
  education: Array<EducationConfig>
  experience: Array<ExperienceConfig>
  skills?: Array<SkillItem>
  campus?: Array<CampusItem>
  projects?: Array<Project>
  awards?: Array<Award>
}

/** Content rendered by the research template. It intentionally cannot nest another research resume. */
export type ResearchResumeConfig = ResumeContent

/** Version 1 of the portable JSON document used for import and export. */
export interface ResumeConfig extends ResumeContent {
  schemaVersion?: 1
  research?: ResearchResumeConfig
}
