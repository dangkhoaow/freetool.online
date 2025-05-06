import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    console.log('API request to read file content');
    const searchParams = request.nextUrl.searchParams;
    const filePath = searchParams.get('path');
    
    // Validate file path
    if (!filePath) {
      console.error('No file path provided');
      return NextResponse.json({ 
        success: false, 
        error: 'No file path provided' 
      }, { status: 400 });
    }
    
    console.log(`Reading file content from: ${filePath}`);
    
    // Add additional error handling and validation
    try {
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        console.error(`File does not exist: ${filePath}`);
        return NextResponse.json({ 
          success: false, 
          error: `File does not exist: ${filePath}` 
        }, { status: 404 });
      }
      
      // Check if path is a file
      const stats = fs.statSync(filePath);
      if (!stats.isFile()) {
        console.error(`Path is not a file: ${filePath}`);
        return NextResponse.json({ 
          success: false, 
          error: `Path is not a file: ${filePath}` 
        }, { status: 400 });
      }
      
      // Read file content with explicit encoding
      const content = fs.readFileSync(filePath, { encoding: 'utf-8' });
      console.log(`Successfully read file content (${content.length} bytes)`);
      
      // Get file name from path
      const fileName = path.basename(filePath);
      
      // Determine language from file extension
      const extension = path.extname(filePath).slice(1).toLowerCase();
      console.log(`File extension: ${extension}, filename: ${fileName}`);
      
      // Map common extensions to languages
      const languageMap: Record<string, string> = {
        js: 'javascript',
        jsx: 'javascript',
        ts: 'typescript',
        tsx: 'typescript',
        html: 'html',
        css: 'css',
        json: 'json',
        md: 'markdown',
        py: 'python',
        java: 'java',
        c: 'c',
        cpp: 'cpp',
        cs: 'csharp',
        go: 'go',
        php: 'php',
        rb: 'ruby',
        rs: 'rust',
        swift: 'swift',
        txt: 'plaintext',
        // Add more language mappings as needed
      };
      
      // Return file content, name and language
      return NextResponse.json({
        success: true,
        content,
        name: fileName,
        path: filePath,
        language: languageMap[extension] || 'plaintext',
        size: stats.size,
        lastModified: stats.mtime
      });
    } catch (fsError: any) {
      console.error('File system error:', fsError);
      return NextResponse.json({ 
        success: false, 
        error: `File system error: ${fsError.message}` 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Server error handling file content request:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error while reading file' 
    }, { status: 500 });
  }
}
