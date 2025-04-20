"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import TextToMD5Section from "./text-to-md5-section"
import MD5ToTextSection from "./md5-to-text-section"

export default function ConverterTool() {
  const [activeTab, setActiveTab] = useState<string>("text-to-md5")

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden mb-12">
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6">MD5 Converter Tool</h2>

        <Tabs defaultValue="text-to-md5" onValueChange={setActiveTab} value={activeTab}>
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="text-to-md5">Text to MD5</TabsTrigger>
            <TabsTrigger value="md5-to-text">MD5 to Text</TabsTrigger>
          </TabsList>

          <TabsContent value="text-to-md5">
            <TextToMD5Section />
          </TabsContent>

          <TabsContent value="md5-to-text">
            <MD5ToTextSection />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
