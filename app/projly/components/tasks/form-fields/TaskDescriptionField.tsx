import React, { useRef } from "react";
import { useFormContext } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { TaskFormValues } from "../schemas/taskSchema";
import { useEditor, EditorContent, Extension } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import { Bold, Italic, Link as LinkIcon, List, ListOrdered, Heading1, Heading2, Underline as UnderlineIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
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

export function TaskDescriptionField() {
  const form = useFormContext<TaskFormValues>();
  // Initialize content once
  const initialContent = useRef(form.getValues('description') || '');
  
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
    content: initialContent.current,
    editorProps: {
      attributes: {
        class: 'prose prose-sm dark:prose-invert focus:outline-none',
        style: 'line-height: 1.4; outline: none;',
      },
    },
  });
  
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
    <>
      <style jsx>{`
        .ProseMirror {
          outline: none !important;
          border: none !important;
          line-height: 1.4 !important;
        }
        .ProseMirror:focus {
          outline: none !important;
          border: none !important;
          box-shadow: none !important;
        }
        .ProseMirror p {
          margin: 0.5em 0 !important;
        }
        .ProseMirror ul, .ProseMirror ol {
          margin: 0.5em 0 !important;
        }
        .ProseMirror h1, .ProseMirror h2, .ProseMirror h3 {
          margin: 0.5em 0 !important;
        }
      `}</style>
    <FormField
      control={form.control}
      name="description"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Description</FormLabel>
          <FormControl>
            <div 
              className="border rounded-md overflow-hidden min-h-[300px]" 
              onClick={() => editor?.chain().focus().run()}
            >
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
              <div className="p-3 w-full max-w-none">
                <EditorContent
                  editor={editor}
                  className="min-h-[100px] outline-none focus-visible:outline-none focus:outline-none focus-within:outline-none break-words ProseMirror-focused"
                  style={{ 
                    wordBreak: 'break-word', 
                    overflowWrap: 'break-word',
                    lineHeight: '1.0',
                    outline: 'none'
                  }}
                  onBlur={() => form.setValue('description', editor?.getHTML() || '', { shouldDirty: true, shouldValidate: true })}
                />
              </div>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    </>
  );
}
