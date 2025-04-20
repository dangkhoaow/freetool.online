"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { FileText, Download, Plus, Trash2, Eye, RefreshCw } from "lucide-react"
import { v4 as uuidv4 } from "uuid"
import {
  type ResumeData,
  type PersonalInfo,
  type Education,
  type WorkExperience,
  type Skill,
  defaultResumeData,
  saveResumeToLocalStorage,
  getResumeFromLocalStorage,
  generateResumePDF,
  resumeTemplates,
} from "@/lib/services/resume-builder-service"

export default function ResumeBuilder() {
  const [resumeData, setResumeData] = useState<ResumeData>(defaultResumeData)
  const [activeTab, setActiveTab] = useState("personal")
  const [previewMode, setPreviewMode] = useState(false)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)

  useEffect(() => {
    const savedData = getResumeFromLocalStorage()
    if (savedData) {
      setResumeData(savedData)
    }
  }, [])

  useEffect(() => {
    saveResumeToLocalStorage(resumeData)
  }, [resumeData])

  const updatePersonalInfo = (field: keyof PersonalInfo, value: string) => {
    setResumeData({
      ...resumeData,
      personalInfo: {
        ...resumeData.personalInfo,
        [field]: value,
      },
    })
  }

  const addEducation = () => {
    const newEducation: Education = {
      id: uuidv4(),
      institution: "",
      degree: "",
      fieldOfStudy: "",
      startDate: "",
      endDate: "",
      description: "",
    }
    setResumeData({
      ...resumeData,
      education: [...resumeData.education, newEducation],
    })
  }

  const updateEducation = (id: string, field: keyof Education, value: string) => {
    setResumeData({
      ...resumeData,
      education: resumeData.education.map((edu) => (edu.id === id ? { ...edu, [field]: value } : edu)),
    })
  }

  const removeEducation = (id: string) => {
    setResumeData({
      ...resumeData,
      education: resumeData.education.filter((edu) => edu.id !== id),
    })
  }

  const addWorkExperience = () => {
    const newWorkExperience: WorkExperience = {
      id: uuidv4(),
      company: "",
      position: "",
      location: "",
      startDate: "",
      endDate: "",
      current: false,
      description: "",
    }
    setResumeData({
      ...resumeData,
      workExperience: [...resumeData.workExperience, newWorkExperience],
    })
  }

  const updateWorkExperience = (id: string, field: keyof WorkExperience, value: string | boolean) => {
    setResumeData({
      ...resumeData,
      workExperience: resumeData.workExperience.map((exp) => (exp.id === id ? { ...exp, [field]: value } : exp)),
    })
  }

  const removeWorkExperience = (id: string) => {
    setResumeData({
      ...resumeData,
      workExperience: resumeData.workExperience.filter((exp) => exp.id !== id),
    })
  }

  const addSkill = () => {
    const newSkill: Skill = {
      id: uuidv4(),
      name: "",
      level: 3,
    }
    setResumeData({
      ...resumeData,
      skills: [...resumeData.skills, newSkill],
    })
  }

  const updateSkill = (id: string, field: keyof Skill, value: string | number) => {
    setResumeData({
      ...resumeData,
      skills: resumeData.skills.map((skill) => (skill.id === id ? { ...skill, [field]: value } : skill)),
    })
  }

  const removeSkill = (id: string) => {
    setResumeData({
      ...resumeData,
      skills: resumeData.skills.filter((skill) => skill.id !== id),
    })
  }

  const selectTemplate = (templateId: string) => {
    setResumeData({
      ...resumeData,
      template: templateId,
    })
  }

  const generatePreview = () => {
    try {
      const doc = generateResumePDF(resumeData)
      const pdfBlob = doc.output("blob")
      const url = URL.createObjectURL(pdfBlob)
      setPdfUrl(url)
      setPreviewMode(true)
      return url
    } catch (error) {
      console.error("Error generating PDF preview:", error)
      return null
    }
  }

  const downloadResume = () => {
    try {
      const doc = generateResumePDF(resumeData)
      const fileName = `${resumeData.personalInfo.fullName.replace(/\s+/g, "_")}_Resume.pdf`
      doc.save(fileName)
    } catch (error) {
      console.error("Error downloading PDF:", error)
    }
  }

  const resetForm = () => {
    if (window.confirm("Are you sure you want to reset all resume data? This cannot be undone.")) {
      setResumeData(defaultResumeData)
      setActiveTab("personal")
      setPreviewMode(false)
      setPdfUrl(null)
    }
  }

  return (
    <section id="resume-builder" className="py-16 px-4 bg-gray-50">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-4">Resume Builder</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Create a professional resume in minutes. Fill in your details, customize your template, and download your
            resume as a PDF.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {!previewMode ? (
            <>
              <div className="lg:col-span-2">
                <Card>
                  <CardContent className="p-6">
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                      <TabsList className="grid grid-cols-5 mb-6">
                        <TabsTrigger value="personal">Personal</TabsTrigger>
                        <TabsTrigger value="education">Education</TabsTrigger>
                        <TabsTrigger value="experience">Experience</TabsTrigger>
                        <TabsTrigger value="skills">Skills</TabsTrigger>
                        <TabsTrigger value="template">Template</TabsTrigger>
                      </TabsList>

                      <TabsContent value="personal">
                        <h3 className="text-xl font-semibold mb-4">Personal Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <Label htmlFor="fullName">Full Name *</Label>
                            <Input
                              id="fullName"
                              value={resumeData.personalInfo.fullName}
                              onChange={(e) => updatePersonalInfo("fullName", e.target.value)}
                              placeholder="John Doe"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="email">Email *</Label>
                            <Input
                              id="email"
                              type="email"
                              value={resumeData.personalInfo.email}
                              onChange={(e) => updatePersonalInfo("email", e.target.value)}
                              placeholder="john.doe@example.com"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="phone">Phone *</Label>
                            <Input
                              id="phone"
                              value={resumeData.personalInfo.phone}
                              onChange={(e) => updatePersonalInfo("phone", e.target.value)}
                              placeholder="(123) 456-7890"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="address">Address *</Label>
                            <Input
                              id="address"
                              value={resumeData.personalInfo.address}
                              onChange={(e) => updatePersonalInfo("address", e.target.value)}
                              placeholder="123 Main St, City, State"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="website">Website (Optional)</Label>
                            <Input
                              id="website"
                              value={resumeData.personalInfo.website}
                              onChange={(e) => updatePersonalInfo("website", e.target.value)}
                              placeholder="www.johndoe.com"
                            />
                          </div>
                          <div>
                            <Label htmlFor="linkedin">LinkedIn (Optional)</Label>
                            <Input
                              id="linkedin"
                              value={resumeData.personalInfo.linkedin}
                              onChange={(e) => updatePersonalInfo("linkedin", e.target.value)}
                              placeholder="linkedin.com/in/johndoe"
                            />
                          </div>
                        </div>
                        <div className="mb-4">
                          <Label htmlFor="summary">Professional Summary *</Label>
                          <Textarea
                            id="summary"
                            value={resumeData.personalInfo.summary}
                            onChange={(e) => updatePersonalInfo("summary", e.target.value)}
                            placeholder="A brief summary of your professional background and skills"
                            className="h-32"
                            required
                          />
                        </div>
                      </TabsContent>

                      <TabsContent value="education">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-xl font-semibold">Education</h3>
                          <Button onClick={addEducation} size="sm" className="gap-1">
                            <Plus className="h-4 w-4" /> Add Education
                          </Button>
                        </div>

                        {resumeData.education.length === 0 ? (
                          <div className="text-center py-8 text-gray-500">
                            <FileText className="h-12 w-12 mx-auto mb-2 opacity-30" />
                            <p>No education entries yet. Click "Add Education" to get started.</p>
                          </div>
                        ) : (
                          resumeData.education.map((edu, index) => (
                            <div key={edu.id} className="mb-6 p-4 border rounded-lg bg-gray-50">
                              <div className="flex justify-between items-center mb-4">
                                <h4 className="font-medium">Education #{index + 1}</h4>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => removeEducation(edu.id)}
                                  className="gap-1"
                                >
                                  <Trash2 className="h-4 w-4" /> Remove
                                </Button>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                  <Label htmlFor={`institution-${edu.id}`}>Institution *</Label>
                                  <Input
                                    id={`institution-${edu.id}`}
                                    value={edu.institution}
                                    onChange={(e) => updateEducation(edu.id, "institution", e.target.value)}
                                    placeholder="University Name"
                                    required
                                  />
                                </div>
                                <div>
                                  <Label htmlFor={`degree-${edu.id}`}>Degree *</Label>
                                  <Input
                                    id={`degree-${edu.id}`}
                                    value={edu.degree}
                                    onChange={(e) => updateEducation(edu.id, "degree", e.target.value)}
                                    placeholder="Bachelor of Science"
                                    required
                                  />
                                </div>
                                <div>
                                  <Label htmlFor={`field-${edu.id}`}>Field of Study *</Label>
                                  <Input
                                    id={`field-${edu.id}`}
                                    value={edu.fieldOfStudy}
                                    onChange={(e) => updateEducation(edu.id, "fieldOfStudy", e.target.value)}
                                    placeholder="Computer Science"
                                    required
                                  />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <Label htmlFor={`startDate-${edu.id}`}>Start Date *</Label>
                                    <Input
                                      id={`startDate-${edu.id}`}
                                      value={edu.startDate}
                                      onChange={(e) => updateEducation(edu.id, "startDate", e.target.value)}
                                      placeholder="MM/YYYY"
                                      required
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor={`endDate-${edu.id}`}>End Date *</Label>
                                    <Input
                                      id={`endDate-${edu.id}`}
                                      value={edu.endDate}
                                      onChange={(e) => updateEducation(edu.id, "endDate", e.target.value)}
                                      placeholder="MM/YYYY or Present"
                                      required
                                    />
                                  </div>
                                </div>
                              </div>
                              <div>
                                <Label htmlFor={`description-${edu.id}`}>Description (Optional)</Label>
                                <Textarea
                                  id={`description-${edu.id}`}
                                  value={edu.description}
                                  onChange={(e) => updateEducation(edu.id, "description", e.target.value)}
                                  placeholder="Relevant coursework, achievements, or activities"
                                  className="h-24"
                                />
                              </div>
                            </div>
                          ))
                        )}
                      </TabsContent>

                      <TabsContent value="experience">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-xl font-semibold">Work Experience</h3>
                          <Button onClick={addWorkExperience} size="sm" className="gap-1">
                            <Plus className="h-4 w-4" /> Add Experience
                          </Button>
                        </div>

                        {resumeData.workExperience.length === 0 ? (
                          <div className="text-center py-8 text-gray-500">
                            <FileText className="h-12 w-12 mx-auto mb-2 opacity-30" />
                            <p>No work experience entries yet. Click "Add Experience" to get started.</p>
                          </div>
                        ) : (
                          resumeData.workExperience.map((exp, index) => (
                            <div key={exp.id} className="mb-6 p-4 border rounded-lg bg-gray-50">
                              <div className="flex justify-between items-center mb-4">
                                <h4 className="font-medium">Experience #{index + 1}</h4>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => removeWorkExperience(exp.id)}
                                  className="gap-1"
                                >
                                  <Trash2 className="h-4 w-4" /> Remove
                                </Button>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                  <Label htmlFor={`company-${exp.id}`}>Company *</Label>
                                  <Input
                                    id={`company-${exp.id}`}
                                    value={exp.company}
                                    onChange={(e) => updateWorkExperience(exp.id, "company", e.target.value)}
                                    placeholder="Company Name"
                                    required
                                  />
                                </div>
                                <div>
                                  <Label htmlFor={`position-${exp.id}`}>Position *</Label>
                                  <Input
                                    id={`position-${exp.id}`}
                                    value={exp.position}
                                    onChange={(e) => updateWorkExperience(exp.id, "position", e.target.value)}
                                    placeholder="Software Engineer"
                                    required
                                  />
                                </div>
                                <div>
                                  <Label htmlFor={`location-${exp.id}`}>Location *</Label>
                                  <Input
                                    id={`location-${exp.id}`}
                                    value={exp.location}
                                    onChange={(e) => updateWorkExperience(exp.id, "location", e.target.value)}
                                    placeholder="City, State"
                                    required
                                  />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <Label htmlFor={`startDate-${exp.id}`}>Start Date *</Label>
                                    <Input
                                      id={`startDate-${exp.id}`}
                                      value={exp.startDate}
                                      onChange={(e) => updateWorkExperience(exp.id, "startDate", e.target.value)}
                                      placeholder="MM/YYYY"
                                      required
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor={`endDate-${exp.id}`}>End Date *</Label>
                                    <Input
                                      id={`endDate-${exp.id}`}
                                      value={exp.endDate}
                                      onChange={(e) => updateWorkExperience(exp.id, "endDate", e.target.value)}
                                      placeholder="MM/YYYY"
                                      required
                                      disabled={exp.current}
                                    />
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 mb-4">
                                <Switch
                                  id={`current-${exp.id}`}
                                  checked={exp.current}
                                  onCheckedChange={(checked) => updateWorkExperience(exp.id, "current", checked)}
                                />
                                <Label htmlFor={`current-${exp.id}`}>I currently work here</Label>
                              </div>
                              <div>
                                <Label htmlFor={`description-${exp.id}`}>Description *</Label>
                                <Textarea
                                  id={`description-${exp.id}`}
                                  value={exp.description}
                                  onChange={(e) => updateWorkExperience(exp.id, "description", e.target.value)}
                                  placeholder="Describe your responsibilities and achievements"
                                  className="h-32"
                                  required
                                />
                              </div>
                            </div>
                          ))
                        )}
                      </TabsContent>

                      <TabsContent value="skills">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-xl font-semibold">Skills</h3>
                          <Button onClick={addSkill} size="sm" className="gap-1">
                            <Plus className="h-4 w-4" /> Add Skill
                          </Button>
                        </div>

                        {resumeData.skills.length === 0 ? (
                          <div className="text-center py-8 text-gray-500">
                            <FileText className="h-12 w-12 mx-auto mb-2 opacity-30" />
                            <p>No skills added yet. Click "Add Skill" to get started.</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {resumeData.skills.map((skill) => (
                              <div key={skill.id} className="p-4 border rounded-lg bg-gray-50">
                                <div className="flex justify-between items-center mb-2">
                                  <Label htmlFor={`skill-${skill.id}`}>Skill Name</Label>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeSkill(skill.id)}
                                    className="h-8 w-8 p-0"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                                <Input
                                  id={`skill-${skill.id}`}
                                  value={skill.name}
                                  onChange={(e) => updateSkill(skill.id, "name", e.target.value)}
                                  placeholder="e.g., JavaScript, Project Management"
                                  className="mb-2"
                                />
                                <div className="mb-1">
                                  <div className="flex justify-between text-xs text-gray-500">
                                    <span>Beginner</span>
                                    <span>Intermediate</span>
                                    <span>Expert</span>
                                  </div>
                                </div>
                                <Slider
                                  value={[skill.level]}
                                  min={1}
                                  max={5}
                                  step={1}
                                  onValueChange={(value) => updateSkill(skill.id, "level", value[0])}
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </TabsContent>

                      <TabsContent value="template">
                        <h3 className="text-xl font-semibold mb-4">Choose a Template</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {resumeTemplates.map((template) => (
                            <div
                              key={template.id}
                              className={`border rounded-lg p-2 cursor-pointer transition-all ${
                                resumeData.template === template.id
                                  ? "border-blue-500 ring-2 ring-blue-200"
                                  : "hover:border-gray-300"
                              }`}
                              onClick={() => selectTemplate(template.id)}
                            >
                              <div className="aspect-[3/4] mb-2 bg-gray-100 rounded overflow-hidden">
                                <img
                                  src={template.preview || "/placeholder.svg"}
                                  alt={`${template.name} template preview`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <p className="text-center font-medium">{template.name}</p>
                            </div>
                          ))}
                        </div>
                      </TabsContent>
                    </Tabs>

                    <div className="flex justify-between mt-6 pt-6 border-t">
                      <Button variant="outline" onClick={resetForm} className="gap-2">
                        <RefreshCw className="h-4 w-4" /> Reset Form
                      </Button>
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={generatePreview} className="gap-2">
                          <Eye className="h-4 w-4" /> Preview
                        </Button>
                        <Button onClick={downloadResume} className="gap-2">
                          <Download className="h-4 w-4" /> Download PDF
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="lg:col-span-1">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-4">Resume Tips</h3>
                    <ul className="space-y-3 text-sm">
                      <li className="flex gap-2">
                        <div className="flex-shrink-0 h-5 w-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                          1
                        </div>
                        <p>Keep your resume concise and focused on relevant experience.</p>
                      </li>
                      <li className="flex gap-2">
                        <div className="flex-shrink-0 h-5 w-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                          2
                        </div>
                        <p>Use action verbs to describe your accomplishments.</p>
                      </li>
                      <li className="flex gap-2">
                        <div className="flex-shrink-0 h-5 w-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                          3
                        </div>
                        <p>Quantify your achievements with numbers when possible.</p>
                      </li>
                      <li className="flex gap-2">
                        <div className="flex-shrink-0 h-5 w-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                          4
                        </div>
                        <p>Tailor your resume for each job application.</p>
                      </li>
                      <li className="flex gap-2">
                        <div className="flex-shrink-0 h-5 w-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                          5
                        </div>
                        <p>Proofread carefully to avoid spelling and grammar errors.</p>
                      </li>
                    </ul>

                    <Separator className="my-6" />

                    <h3 className="text-xl font-semibold mb-4">Resume Sections</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-4 w-4 rounded-full ${
                            resumeData.personalInfo.fullName &&
                            resumeData.personalInfo.email &&
                            resumeData.personalInfo.phone &&
                            resumeData.personalInfo.address &&
                            resumeData.personalInfo.summary
                              ? "bg-green-500"
                              : "bg-gray-300"
                          }`}
                        ></div>
                        <p>Personal Information</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-4 w-4 rounded-full ${
                            resumeData.education.length > 0 ? "bg-green-500" : "bg-gray-300"
                          }`}
                        ></div>
                        <p>Education</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-4 w-4 rounded-full ${
                            resumeData.workExperience.length > 0 ? "bg-green-500" : "bg-gray-300"
                          }`}
                        ></div>
                        <p>Work Experience</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-4 w-4 rounded-full ${
                            resumeData.skills.length > 0 ? "bg-green-500" : "bg-gray-300"
                          }`}
                        ></div>
                        <p>Skills</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`h-4 w-4 rounded-full bg-green-500`}></div>
                        <p>Template</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            <div className="lg:col-span-3">
              <Card>
                <CardContent className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold">Resume Preview</h3>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setPreviewMode(false)} className="gap-2">
                        <FileText className="h-4 w-4" /> Edit Resume
                      </Button>
                      <Button onClick={downloadResume} className="gap-2">
                        <Download className="h-4 w-4" /> Download PDF
                      </Button>
                    </div>
                  </div>
                  <div className="border rounded-lg overflow-hidden bg-white">
                    {pdfUrl && (
                      <iframe
                        src={pdfUrl}
                        className="w-full h-[800px]"
                        title="Resume Preview"
                        aria-label="Resume Preview"
                      />
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
