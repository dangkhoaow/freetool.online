import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    console.log('API request to create folder');
    
    // Parse request body
    const body = await request.json();
    const { path: folderPath } = body;
    
    // Validate folder path
    if (!folderPath) {
      console.error('No folder path provided');
      return NextResponse.json({ 
        success: false, 
        error: 'No folder path provided' 
      }, { status: 400 });
    }
    
    console.log(`Creating folder at: ${folderPath}`);
    
    // Check if folder already exists
    if (fs.existsSync(folderPath)) {
      console.error(`Folder already exists: ${folderPath}`);
      return NextResponse.json({ 
        success: false, 
        error: `Folder already exists: ${folderPath}` 
      }, { status: 409 });
    }
    
    // Create folder and parent directories if they don't exist
    fs.mkdirSync(folderPath, { recursive: true });
    console.log(`Folder created successfully: ${folderPath}`);
    
    return NextResponse.json({ 
      success: true,
      path: folderPath,
      name: path.basename(folderPath)
    });
  } catch (error: any) {
    console.error('Error creating folder:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Internal server error'
    }, { status: 500 });
  }
}
