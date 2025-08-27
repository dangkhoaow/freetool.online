"use client"

import { useState } from "react"
import { AVNavigation } from "@/components/av-foundation/av-navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send, 
  MessageCircle,
  Users,
  Building,
  Globe,
  Heart,
  Star,
  CheckCircle
} from "lucide-react"

export default function AVContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    category: "",
    message: ""
  })
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Simulate form submission
    setIsSubmitted(true)
    setTimeout(() => setIsSubmitted(false), 3000)
  }

  const contactInfo = [
    {
      icon: Mail,
      title: "Email Us",
      content: "info@avfoundation.org",
      description: "We'll respond within 24 hours",
      gradient: "from-primary/20 to-primary/5",
    },
    {
      icon: Phone,
      title: "Call Us",
      content: "+84 (0) 123 456 789",
      description: "Mon-Fri, 9:00 AM - 6:00 PM (ICT)",
      gradient: "from-secondary/20 to-secondary/5",
    },
    {
      icon: MapPin,
      title: "Visit Us",
      content: "District 1, Ho Chi Minh City",
      description: "Vietnam Cultural Heritage Center",
      gradient: "from-accent/20 to-accent/5",
    },
    {
      icon: Clock,
      title: "Office Hours",
      content: "Monday - Saturday",
      description: "9:00 AM - 6:00 PM (ICT)",
      gradient: "from-primary/15 to-secondary/10",
    },
  ]

  const inquiryTypes = [
    { value: "general", label: "General Inquiry" },
    { value: "research", label: "Research & Academic" },
    { value: "partnership", label: "Partnership Opportunity" },
    { value: "media", label: "Media & Press" },
    { value: "donation", label: "Donation & Support" },
    { value: "technical", label: "Technical Support" },
  ]

  const reasons = [
    {
      icon: Users,
      title: "Expert Guidance",
      description: "Connect with our art historians and cultural experts for authentic insights."
    },
    {
      icon: Heart,
      title: "Community Support",
      description: "Join our passionate community of Vietnamese art enthusiasts and collectors."
    },
    {
      icon: Globe,
      title: "Global Network",
      description: "Access our international network of museums, galleries, and cultural institutions."
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      <AVNavigation />
      
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-primary/5 to-secondary/5 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-96 h-96 bg-primary rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-80 h-80 bg-secondary rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
              <MessageCircle className="w-4 h-4" />
              Get In Touch
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold text-foreground">
              Contact
              <span className="block bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                A&V Foundation
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Have questions about Vietnamese art, need research assistance, or want to collaborate? 
              We're here to help connect you with our cultural heritage community.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-20 bg-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6 mb-16">
            <div className="inline-flex items-center gap-2 bg-secondary/10 text-secondary px-4 py-2 rounded-full text-sm font-medium">
              <Building className="w-4 h-4" />
              Contact Information
            </div>
            <h2 className="text-3xl lg:text-5xl font-bold text-foreground">
              Multiple Ways to
              <span className="block bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">
                Reach Us
              </span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {contactInfo.map((info, index) => (
              <Card
                key={info.title}
                className={`group modern-card border-0 bg-gradient-to-br ${info.gradient} backdrop-blur-sm hover:shadow-xl transition-all duration-300`}
              >
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 bg-white dark:bg-card rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300">
                    <info.icon className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl font-bold">{info.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-2">
                  <p className="text-lg font-semibold text-foreground">{info.content}</p>
                  <CardDescription className="text-sm text-muted-foreground">
                    {info.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-20 bg-gradient-to-b from-background to-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            {/* Form */}
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full text-sm font-medium">
                  <Send className="w-4 h-4" />
                  Send Us a Message
                </div>
                <h2 className="text-3xl lg:text-4xl font-bold text-foreground leading-tight">
                  Let's Start a
                  <span className="block text-accent">Conversation</span>
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Whether you're a researcher, artist, collector, or simply passionate about Vietnamese culture, 
                  we'd love to hear from you and discuss how we can support your interests.
                </p>
              </div>

              <Card className="border-0 bg-gradient-to-br from-white/50 to-white/20 dark:from-card/50 dark:to-card/20 backdrop-blur-sm">
                <CardContent className="p-8">
                  {!isSubmitted ? (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="name" className="text-sm font-medium">Your Name</Label>
                          <Input
                            id="name"
                            type="text"
                            placeholder="Enter your full name"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            className="h-12 bg-white/50 dark:bg-card/50 border-white/20"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="your.email@example.com"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            className="h-12 bg-white/50 dark:bg-card/50 border-white/20"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="category" className="text-sm font-medium">Inquiry Type</Label>
                          <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                            <SelectTrigger className="h-12 bg-white/50 dark:bg-card/50 border-white/20">
                              <SelectValue placeholder="Select inquiry type" />
                            </SelectTrigger>
                            <SelectContent>
                              {inquiryTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="subject" className="text-sm font-medium">Subject</Label>
                          <Input
                            id="subject"
                            type="text"
                            placeholder="Brief subject line"
                            value={formData.subject}
                            onChange={(e) => setFormData({...formData, subject: e.target.value})}
                            className="h-12 bg-white/50 dark:bg-card/50 border-white/20"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="message" className="text-sm font-medium">Your Message</Label>
                        <Textarea
                          id="message"
                          placeholder="Tell us more about your inquiry, research needs, or how we can help..."
                          value={formData.message}
                          onChange={(e) => setFormData({...formData, message: e.target.value})}
                          className="min-h-32 bg-white/50 dark:bg-card/50 border-white/20 resize-none"
                          required
                        />
                      </div>

                      <Button 
                        type="submit" 
                        size="lg" 
                        className="w-full font-semibold px-8 py-6 rounded-xl text-lg group"
                      >
                        <Send className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform" />
                        Send Message
                      </Button>
                    </form>
                  ) : (
                    <div className="text-center py-12 space-y-6">
                      <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
                      </div>
                      <h3 className="text-2xl font-bold text-foreground">Message Sent Successfully!</h3>
                      <p className="text-muted-foreground">
                        Thank you for reaching out. We'll review your message and get back to you within 24 hours.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Why Contact Us */}
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
                  <Star className="w-4 h-4" />
                  Why Contact Us
                </div>
                <h2 className="text-3xl lg:text-4xl font-bold text-foreground leading-tight">
                  Connecting You with
                  <span className="block text-primary">Vietnamese Culture</span>
                </h2>
              </div>

              <div className="space-y-6">
                {reasons.map((reason, index) => (
                  <Card key={index} className="border-0 bg-gradient-to-br from-white/30 to-white/10 dark:from-card/30 dark:to-card/10 backdrop-blur-sm">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                          <reason.icon className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-foreground mb-2">{reason.title}</h3>
                          <p className="text-muted-foreground leading-relaxed">{reason.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Image with floating element */}
              <div className="relative">
                <div className="aspect-[4/3] rounded-3xl overflow-hidden bg-gradient-to-br from-secondary/10 to-accent/10 p-3">
                  <div className="w-full h-full rounded-2xl overflow-hidden shadow-2xl">
                    <img
                      src="/av-foundation/vietnamese-art-gallery.png"
                      alt="Vietnamese art gallery and cultural center"
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                </div>

                {/* Floating contact badge */}
                <div className="absolute -top-6 -right-6 bg-white dark:bg-card p-4 rounded-2xl shadow-xl glass">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-secondary mb-1">24h</div>
                    <div className="text-xs text-muted-foreground">Response Time</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ / Quick Links */}
      <section className="py-20 bg-gradient-to-br from-card to-background relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-20 w-96 h-96 bg-primary rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-secondary rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6 mb-16">
            <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full text-sm font-medium">
              <Users className="w-4 h-4" />
              Quick Resources
            </div>
            <h2 className="text-3xl lg:text-5xl font-bold text-foreground">
              Before You Contact
              <span className="block bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
                Explore These
              </span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { 
                title: "Browse Collection", 
                description: "Explore our comprehensive artwork database", 
                href: "/av-foundation/collection",
                gradient: "from-primary/20 to-primary/5"
              },
              { 
                title: "Artist Profiles", 
                description: "Learn about featured Vietnamese artists", 
                href: "/av-foundation/artists",
                gradient: "from-secondary/20 to-secondary/5"
              },
              { 
                title: "Latest News", 
                description: "Stay updated with events and exhibitions", 
                href: "/av-foundation/news",
                gradient: "from-accent/20 to-accent/5"
              },
              { 
                title: "About Us", 
                description: "Learn more about our mission and history", 
                href: "/av-foundation/about",
                gradient: "from-primary/15 to-secondary/10"
              }
            ].map((link, index) => (
              <Card
                key={link.title}
                className={`group modern-card border-0 bg-gradient-to-br ${link.gradient} backdrop-blur-sm hover:shadow-xl transition-all duration-300`}
              >
                <CardContent className="p-6 text-center space-y-4">
                  <h3 className="text-lg font-bold text-foreground">{link.title}</h3>
                  <p className="text-sm text-muted-foreground">{link.description}</p>
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="w-full bg-white/50 dark:bg-card/50 backdrop-blur-sm border-white/20 hover:bg-white/70 dark:hover:bg-card/70"
                  >
                    <Link href={link.href} className="flex items-center gap-2">
                      Visit Page
                      <Send className="w-4 h-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
