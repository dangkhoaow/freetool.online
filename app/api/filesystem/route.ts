import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import os from 'os';

// Function to read directory recursively
const readDirectoryRecursively = (dirPath: string, depth = 0, maxDepth = 10): any[] => {
  console.log(`Reading directory: ${dirPath} at depth ${depth}`);
  
  try {
    if (depth > maxDepth) {
      console.log(`Max depth reached for ${dirPath}, returning placeholder indicator`);
      // Instead of empty array, return a special indicator that this folder has more content
      return [{ 
        name: '...', 
        path: path.join(dirPath, '...'),
        type: 'more-items',
        isPlaceholder: true
      }];
    }
    
    if (!fs.existsSync(dirPath)) {
      console.error(`Directory does not exist: ${dirPath}`);
      return [];
    }
    
    // Use try-catch for readdirSync to handle potential permission issues
    let items;
    try {
      items = fs.readdirSync(dirPath, { withFileTypes: true });
      console.log(`Found ${items.length} items in ${dirPath}`);
    } catch (error) {
      console.error(`Error reading directory contents ${dirPath}:`, error);
      return [];
    }
    
    return items
      .filter(item => !item.name.startsWith('.')) // Filter out hidden files
      .map(item => {
        const itemPath = path.join(dirPath, item.name);
        console.log(`Processing item: ${itemPath}, isDirectory: ${item.isDirectory()}`);
        
        try {
          if (item.isDirectory()) {
            // Skip node_modules and .git folders to avoid huge responses
            if (item.name === 'node_modules' || item.name === '.git' || item.name === '.next') {
              return {
                name: item.name,
                path: itemPath,
                type: 'folder',
                children: [] // Empty array to indicate it's a folder that wasn't fully processed
              };
            }
            
            return {
              name: item.name,
              path: itemPath,
              type: 'folder',
              children: readDirectoryRecursively(itemPath, depth + 1, maxDepth)
            };
          } else {
            // It's a file
            return {
              name: item.name,
              path: itemPath,
              type: 'file',
              extension: path.extname(item.name).slice(1) // Get extension without the dot
            };
          }
        } catch (error) {
          console.error(`Error processing item ${itemPath}:`, error);
          return {
            name: item.name,
            path: itemPath,
            type: 'error',
            error: (error as Error).message
          };
        }
      });
  } catch (error) {
    console.error(`Error in recursive directory read for ${dirPath}:`, error);
    return [];
  }
};

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    let dirPath = searchParams.get('path') || '';
    const maxDepth = parseInt(searchParams.get('maxDepth') || '10', 10);
    
    console.log(`API request to read filesystem at path: ${dirPath}, maxDepth: ${maxDepth}`);
    
    // If no path specified, use current project directory as fallback
    if (!dirPath) {
      // Use a default directory from user's home as fallback
      // This creates a better initial experience when the page loads
      const homeDir = os.homedir();
      const defaultDirs = [
        // Common project directories
        path.join(homeDir, 'Documents'),
        path.join(homeDir, 'Projects'),
        path.join(homeDir, 'Desktop'),
        process.cwd()
      ];
      
      // Find the first directory that exists
      dirPath = defaultDirs.find(dir => fs.existsSync(dir)) || process.cwd();
      console.log(`No path specified, using default directory: ${dirPath}`);
    }
    
    // Validate path exists
    if (!fs.existsSync(dirPath)) {
      console.error(`Path does not exist: ${dirPath}`);
      return NextResponse.json({ 
        success: false, 
        error: `Path does not exist: ${dirPath}` 
      }, { status: 404 });
    }
    
    // Check if path is a directory
    const stats = fs.statSync(dirPath);
    if (!stats.isDirectory()) {
      console.error(`Path is not a directory: ${dirPath}`);
      return NextResponse.json({ 
        success: false, 
        error: `Path is not a directory: ${dirPath}` 
      }, { status: 400 });
    }
    
    // Read the directory
    const structure = readDirectoryRecursively(dirPath, 0, maxDepth);
    console.log(`Successfully read directory structure with ${structure.length} root items`);
    
    return NextResponse.json({ 
      success: true,
      path: dirPath,
      structure
    });
  } catch (error) {
    console.error('Error in filesystem API:', error);
    return NextResponse.json({ 
      success: false, 
      error: (error as Error).message 
    }, { status: 500 });
  }
}
