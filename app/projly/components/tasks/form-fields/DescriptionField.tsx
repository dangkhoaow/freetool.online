import { Label } from "@/components/ui/label";
import { useEditor, EditorContent, Extension } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import { Bold, Italic, Link as LinkIcon, List, ListOrdered, Heading1, Heading2, Underline as UnderlineIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

// Custom extension for better link styling
const CustomLinkStyling = Extension.create({
  name: 'customLinkStyling',
  addGlobalAttributes() {
    return [
      {
        types: ['link'],
        attributes: {
          class: {
            default: 'break-all text-blue-600 underline hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300',
            parseHTML: element => element.getAttribute('class'),
            renderHTML: attributes => {
              return {
                class: 'break-all text-blue-600 underline hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300',
              };
            },
          },
        },
      },
    ];
  },
});

interface DescriptionFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export function DescriptionField({ value, onChange }: DescriptionFieldProps) {
  console.log('[PROJLY:TASK_FORM] Rendering DescriptionField component');
  
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'break-all text-blue-600 underline hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300',
        },
      }),
      Underline,
      CustomLinkStyling,
    ],
    content: value,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
    editorProps: {
      attributes: {
        class: 'focus:outline-none',
      },
    },
  });
  
  // Update editor content when value prop changes
  useEffect(() => {
    if (editor && editor.getHTML() !== value) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  // Add link button handler
  const addLink = () => {
    if (!editor) return;
    
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);
    
    // cancelled
    if (url === null) {
      return;
    }
    
    // empty
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    
    // update link
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="description">Description</Label>
      
      <div className="border rounded-md overflow-hidden">
        {/* Editor Toolbar */}
        <div className="flex items-center gap-1 p-1 bg-gray-50 dark:bg-gray-900 border-b flex-wrap">
          <Button 
            type="button" 
            variant="ghost" 
            size="sm"
            className={cn("p-1 h-8 w-8", editor?.isActive('bold') ? 'bg-gray-200 dark:bg-gray-700' : '')}
            onClick={() => editor?.chain().focus().toggleBold().run()}
          >
            <Bold className="h-4 w-4" />
          </Button>
          
          <Button 
            type="button" 
            variant="ghost" 
            size="sm"
            className={cn("p-1 h-8 w-8", editor?.isActive('italic') ? 'bg-gray-200 dark:bg-gray-700' : '')}
            onClick={() => editor?.chain().focus().toggleItalic().run()}
          >
            <Italic className="h-4 w-4" />
          </Button>
          
          <Button 
            type="button" 
            variant="ghost" 
            size="sm"
            className={cn("p-1 h-8 w-8", editor?.isActive('underline') ? 'bg-gray-200 dark:bg-gray-700' : '')}
            onClick={() => editor?.chain().focus().toggleUnderline().run()}
          >
            <UnderlineIcon className="h-4 w-4" />
          </Button>
          
          <Button 
            type="button" 
            variant="ghost" 
            size="sm"
            className={cn("p-1 h-8 w-8", editor?.isActive('link') ? 'bg-gray-200 dark:bg-gray-700' : '')}
            onClick={addLink}
          >
            <LinkIcon className="h-4 w-4" />
          </Button>
          
          <div className="w-[1px] h-6 bg-gray-200 dark:bg-gray-700 mx-1" />
          
          <Button 
            type="button" 
            variant="ghost" 
            size="sm"
            className={cn("p-1 h-8 w-8", editor?.isActive('heading', { level: 1 }) ? 'bg-gray-200 dark:bg-gray-700' : '')}
            onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
          >
            <Heading1 className="h-4 w-4" />
          </Button>
          
          <Button 
            type="button" 
            variant="ghost" 
            size="sm"
            className={cn("p-1 h-8 w-8", editor?.isActive('heading', { level: 2 }) ? 'bg-gray-200 dark:bg-gray-700' : '')}
            onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
          >
            <Heading2 className="h-4 w-4" />
          </Button>
          
          <div className="w-[1px] h-6 bg-gray-200 dark:bg-gray-700 mx-1" />
          
          <Button 
            type="button" 
            variant="ghost" 
            size="sm"
            className={cn("p-1 h-8 w-8", editor?.isActive('bulletList') ? 'bg-gray-200 dark:bg-gray-700' : '')}
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
          >
            <List className="h-4 w-4" />
          </Button>
          
          <Button 
            type="button" 
            variant="ghost" 
            size="sm"
            className={cn("p-1 h-8 w-8", editor?.isActive('orderedList') ? 'bg-gray-200 dark:bg-gray-700' : '')}
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Editor Content */}
        <div className="p-2 prose prose-sm dark:prose-invert w-full max-w-none">
          <EditorContent 
            editor={editor} 
            className="min-h-[400px] outline-none focus-visible:outline-none focus:outline-none focus-within:outline-none break-words" 
            style={{ 
              wordBreak: 'break-word',
              overflowWrap: 'break-word'
            }}
          />
        </div>
      </div>
    </div>
  );
}
