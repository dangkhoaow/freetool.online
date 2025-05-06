import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';

export async function GET(request: NextRequest) {
  try {
    console.log('API request to download folder');
    const searchParams = request.nextUrl.searchParams;
    const folderPath = searchParams.get('path');
    
    // Validate folder path
    if (!folderPath) {
      console.error('No folder path provided');
      return NextResponse.json({ 
        success: false, 
        error: 'No folder path provided' 
      }, { status: 400 });
    }
    
    console.log(`Preparing download for folder: ${folderPath}`);
    
    // Check if folder exists
    if (!fs.existsSync(folderPath)) {
      console.error(`Folder does not exist: ${folderPath}`);
      return NextResponse.json({ 
        success: false, 
        error: `Folder does not exist: ${folderPath}` 
      }, { status: 404 });
    }
    
    // Check if path is a directory
    const stats = fs.statSync(folderPath);
    if (!stats.isDirectory()) {
      console.error(`Path is not a directory: ${folderPath}`);
      return NextResponse.json({ 
        success: false, 
        error: `Path is not a directory: ${folderPath}` 
      }, { status: 400 });
    }
    
    // Create a new JSZip instance
    const zip = new JSZip();
    
    // Helper function to recursively add files to the zip
    const addFilesToZip = (directory: string, zipFolder: JSZip) => {
      const items = fs.readdirSync(directory, { withFileTypes: true });
      
      for (const item of items) {
        const fullPath = path.join(directory, item.name);
        const relativePath = path.relative(folderPath, fullPath);
        
        // Skip node_modules, .git, and hidden files
        if (item.name === 'node_modules' || 
            item.name === '.git' || 
            item.name === '.next' || 
            item.name.startsWith('.')) {
          continue;
        }
        
        if (item.isDirectory()) {
          // Recursively add files from subdirectory
          addFilesToZip(fullPath, zipFolder.folder(relativePath) as JSZip);
        } else {
          try {
            // Read file and add to zip
            const fileContent = fs.readFileSync(fullPath);
            zipFolder.file(relativePath, fileContent);
          } catch (error) {
            console.error(`Error reading file ${fullPath}:`, error);
            // Continue with other files on error
          }
        }
      }
    };
    
    // Add all files to the zip
    console.log('Adding files to zip...');
    addFilesToZip(folderPath, zip);
    
    // Generate the zip file
    console.log('Generating zip file...');
    const zipBuffer = await zip.generateAsync({
      type: 'nodebuffer',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 }
    });
    
    // Get the folder name for the zip file
    const folderName = path.basename(folderPath);
    
    // Return the zip file
    console.log(`Zip file generated for ${folderName}, size: ${zipBuffer.length} bytes`);
    
    // Create response with zip file
    const response = new NextResponse(zipBuffer);
    
    // Set headers for download
    response.headers.set('Content-Type', 'application/zip');
    response.headers.set('Content-Disposition', `attachment; filename="${folderName}.zip"`);
    response.headers.set('Content-Length', zipBuffer.length.toString());
    
    return response;
  } catch (error) {
    console.error('Error generating zip file:', error);
    return NextResponse.json({ 
      success: false, 
      error: (error as Error).message 
    }, { status: 500 });
  }
}
