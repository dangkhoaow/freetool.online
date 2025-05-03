"use client";

import { useState } from "react";
import { Flame, Zap, ArrowRight } from "lucide-react";
import Footer from "@/components/footer";
import ToolsGrid from "@/components/tools-grid";
import { tools, categories } from "@/lib/config/tools";

export default function ToolsPage() {
  const [activeCategory, setActiveCategory] = useState("all");

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="py-16">
        <div className="container px-4 mx-auto">
          <h1 className="text-4xl font-bold text-center mb-4 dark:text-white">
            All Online Tools
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-center max-w-2xl mx-auto mb-12">
            Explore our complete collection of free browser-based tools. All tools work directly in your browser with no uploads required.
          </p>

          {/* Interactive Tools Grid with Categories */}
          <ToolsGrid 
            tools={tools} 
            categories={categories} 
            onCategoryChange={handleCategoryChange}
          />

          {/* Category Sections for SEO - Only show when not viewing All */}
          {activeCategory === "all" ? null : (
            <div className="mt-16 space-y-12">
              {categories.filter(category => category.id !== "all").map((category) => (
                <section key={category.id} id={category.id} className="pt-8">
                  <h2 className="text-2xl font-bold mb-6 border-b pb-2 dark:text-white dark:border-gray-700">{category.name}</h2>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tools
                      .filter((tool) => tool.category === category.id)
                      .map((tool) => (
                        <div 
                          key={tool.id}
                          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-all hover:shadow-md flex flex-col relative"
                        >
                          {tool.isHot && (
                            <div className="absolute top-2 right-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 py-0.5 rounded-full text-xs font-bold flex items-center">
                              <Flame className="h-3 w-3 mr-1" />
                              HOT
                            </div>
                          )}
                          {tool.isNew && (
                            <div className="absolute top-2 right-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-2 py-0.5 rounded-full text-xs font-bold flex items-center">
                              <Zap className="h-3 w-3 mr-1" />
                              NEW
                            </div>
                          )}
                          <div className={`h-40 flex items-center justify-center bg-gradient-to-r ${tool.color} dark:from-blue-900/20 dark:to-indigo-900/20`}>
                            {tool.icon}
                          </div>
                          <div className="p-6 flex flex-col flex-grow">
                            <div className="flex-grow">
                              <h3 className="text-xl font-bold mb-2 dark:text-white">{tool.title}</h3>
                              <p className="text-gray-600 dark:text-gray-300">
                                {tool.description}
                              </p>
                            </div>
                            <div className="mt-4">
                              <a
                                href={`/${tool.id}`}
                                className="inline-flex w-full justify-center items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 text-sm font-medium transition-colors"
                                aria-label={`Use ${tool.title}`}
                              >
                                Use Tool <ArrowRight className="h-4 w-4" aria-hidden="true" />
                              </a>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}