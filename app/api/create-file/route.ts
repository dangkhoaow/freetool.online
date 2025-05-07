import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    console.log('API request to create file');
    
    // Parse request body
    const body = await request.json();
    const { path: filePath, content = '' } = body;
    
    // Validate file path
    if (!filePath) {
      console.error('No file path provided');
      return NextResponse.json({ 
        success: false, 
        error: 'No file path provided' 
      }, { status: 400 });
    }
    
    console.log(`Creating file at: ${filePath}`);
    
    // Check if file already exists
    if (fs.existsSync(filePath)) {
      console.error(`File already exists: ${filePath}`);
      return NextResponse.json({ 
        success: false, 
        error: `File already exists: ${filePath}` 
      }, { status: 409 });
    }
    
    // Create parent directories if they don't exist
    const dirPath = path.dirname(filePath);
    if (!fs.existsSync(dirPath)) {
      console.log(`Creating parent directories: ${dirPath}`);
      fs.mkdirSync(dirPath, { recursive: true });
    }
    
    // Write file to disk
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`File created successfully: ${filePath}`);
    
    return NextResponse.json({ 
      success: true,
      path: filePath,
      name: path.basename(filePath)
    });
  } catch (error: any) {
    console.error('Error creating file:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Internal server error'
    }, { status: 500 });
  }
}
