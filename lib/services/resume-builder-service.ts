import { jsPDF } from "jspdf"

export interface PersonalInfo {
  fullName: string
  email: string
  phone: string
  address: string
  website?: string
  linkedin?: string
  summary: string
}

export interface Education {
  id: string
  institution: string
  degree: string
  fieldOfStudy: string
  startDate: string
  endDate: string
  description: string
}

export interface WorkExperience {
  id: string
  company: string
  position: string
  location: string
  startDate: string
  endDate: string
  current: boolean
  description: string
}

export interface Skill {
  id: string
  name: string
  level: number
}

export interface ResumeData {
  personalInfo: PersonalInfo
  education: Education[]
  workExperience: WorkExperience[]
  skills: Skill[]
  template: string
}

export interface ResumeTemplate {
  id: string
  name: string
  preview: string
}

export const resumeTemplates: ResumeTemplate[] = [
  {
    id: "professional",
    name: "Professional",
    preview: "/modern-resume-layout.png",
  },
  {
    id: "modern",
    name: "Modern",
    preview: "/clean-professional-resume.png",
  },
  {
    id: "minimal",
    name: "Minimal",
    preview: "/clean-minimal-resume.png",
  },
]

export const defaultResumeData: ResumeData = {
  personalInfo: {
    fullName: "",
    email: "",
    phone: "",
    address: "",
    website: "",
    linkedin: "",
    summary: "",
  },
  education: [],
  workExperience: [],
  skills: [],
  template: "professional",
}

export const saveResumeToLocalStorage = (resumeData: ResumeData): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem("resumeData", JSON.stringify(resumeData))
  }
}

export const getResumeFromLocalStorage = (): ResumeData | null => {
  if (typeof window !== "undefined") {
    const savedData = localStorage.getItem("resumeData")
    if (savedData) {
      return JSON.parse(savedData)
    }
  }
  return null
}

export const generateResumePDF = (resumeData: ResumeData): jsPDF => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  })

  // Set font
  doc.setFont("helvetica")

  // Personal Info Section
  doc.setFontSize(24)
  doc.setTextColor(0, 0, 0)
  doc.text(resumeData.personalInfo.fullName, 20, 20)

  doc.setFontSize(10)
  doc.setTextColor(100, 100, 100)
  let contactInfoY = 25
  if (resumeData.personalInfo.email) {
    doc.text(`Email: ${resumeData.personalInfo.email}`, 20, contactInfoY)
    contactInfoY += 5
  }
  if (resumeData.personalInfo.phone) {
    doc.text(`Phone: ${resumeData.personalInfo.phone}`, 20, contactInfoY)
    contactInfoY += 5
  }
  if (resumeData.personalInfo.address) {
    doc.text(`Address: ${resumeData.personalInfo.address}`, 20, contactInfoY)
    contactInfoY += 5
  }
  if (resumeData.personalInfo.website) {
    doc.text(`Website: ${resumeData.personalInfo.website}`, 20, contactInfoY)
    contactInfoY += 5
  }
  if (resumeData.personalInfo.linkedin) {
    doc.text(`LinkedIn: ${resumeData.personalInfo.linkedin}`, 20, contactInfoY)
    contactInfoY += 5
  }

  // Summary
  if (resumeData.personalInfo.summary) {
    contactInfoY += 5
    doc.setFontSize(14)
    doc.setTextColor(0, 0, 0)
    doc.text("Professional Summary", 20, contactInfoY)
    contactInfoY += 5
    doc.setFontSize(10)
    doc.setTextColor(0, 0, 0)

    const summaryLines = doc.splitTextToSize(resumeData.personalInfo.summary, 170)
    doc.text(summaryLines, 20, contactInfoY)
    contactInfoY += summaryLines.length * 5 + 5
  }

  // Work Experience
  if (resumeData.workExperience.length > 0) {
    doc.setFontSize(14)
    doc.setTextColor(0, 0, 0)
    doc.text("Work Experience", 20, contactInfoY)
    contactInfoY += 5

    resumeData.workExperience.forEach((exp) => {
      doc.setFontSize(12)
      doc.setTextColor(0, 0, 0)
      doc.text(exp.position, 20, contactInfoY)
      contactInfoY += 5

      doc.setFontSize(10)
      doc.setTextColor(100, 100, 100)
      doc.text(`${exp.company}, ${exp.location}`, 20, contactInfoY)
      contactInfoY += 5

      doc.text(`${exp.startDate} - ${exp.current ? "Present" : exp.endDate}`, 20, contactInfoY)
      contactInfoY += 5

      doc.setTextColor(0, 0, 0)
      const descLines = doc.splitTextToSize(exp.description, 170)
      doc.text(descLines, 20, contactInfoY)
      contactInfoY += descLines.length * 5 + 5
    })
  }

  // Education
  if (resumeData.education.length > 0) {
    doc.setFontSize(14)
    doc.setTextColor(0, 0, 0)
    doc.text("Education", 20, contactInfoY)
    contactInfoY += 5

    resumeData.education.forEach((edu) => {
      doc.setFontSize(12)
      doc.setTextColor(0, 0, 0)
      doc.text(`${edu.degree} in ${edu.fieldOfStudy}`, 20, contactInfoY)
      contactInfoY += 5

      doc.setFontSize(10)
      doc.setTextColor(100, 100, 100)
      doc.text(edu.institution, 20, contactInfoY)
      contactInfoY += 5

      doc.text(`${edu.startDate} - ${edu.endDate}`, 20, contactInfoY)
      contactInfoY += 5

      if (edu.description) {
        doc.setTextColor(0, 0, 0)
        const descLines = doc.splitTextToSize(edu.description, 170)
        doc.text(descLines, 20, contactInfoY)
        contactInfoY += descLines.length * 5 + 5
      } else {
        contactInfoY += 5
      }
    })
  }

  // Skills
  if (resumeData.skills.length > 0) {
    doc.setFontSize(14)
    doc.setTextColor(0, 0, 0)
    doc.text("Skills", 20, contactInfoY)
    contactInfoY += 5

    const skillsPerRow = 3
    const skillWidth = 50
    let currentSkillIndex = 0

    while (currentSkillIndex < resumeData.skills.length) {
      let rowText = ""
      for (let i = 0; i < skillsPerRow && currentSkillIndex < resumeData.skills.length; i++) {
        const skill = resumeData.skills[currentSkillIndex]
        rowText += skill.name
        if (i < skillsPerRow - 1 && currentSkillIndex < resumeData.skills.length - 1) {
          rowText += " • "
        }
        currentSkillIndex++
      }
      doc.setFontSize(10)
      doc.setTextColor(0, 0, 0)
      doc.text(rowText, 20, contactInfoY)
      contactInfoY += 5
    }
  }

  return doc
}
