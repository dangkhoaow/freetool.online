import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    console.log('File operation API request received');
    
    // Parse the request body
    const body = await request.json();
    const { action, path: filePath, content } = body;
    
    console.log(`File operation: ${action} for path: ${filePath}`);
    
    // Validate inputs
    if (!action || !filePath) {
      console.error('Missing required parameters');
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required parameters' 
      }, { status: 400 });
    }
    
    // Perform the requested action
    switch (action) {
      case 'createFile':
        return await createFile(filePath, content || '');
      case 'createFolder':
        return await createFolder(filePath);
      case 'deleteFile':
        return await deleteFile(filePath);
      case 'deleteFolder':
        return await deleteFolder(filePath);
      case 'renameFile':
        return await renameFile(filePath, body.newPath);
      case 'saveFile':
        return await saveFile(filePath, content || '');
      default:
        console.error(`Unsupported action: ${action}`);
        return NextResponse.json({ 
          success: false, 
          error: `Unsupported action: ${action}` 
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in file operation:', error);
    return NextResponse.json({ 
      success: false, 
      error: (error as Error).message 
    }, { status: 500 });
  }
}

// Create a new file
async function createFile(filePath: string, content: string) {
  try {
    // Create directory if it doesn't exist
    const directory = path.dirname(filePath);
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
      console.log(`Created directory: ${directory}`);
    }
    
    // Check if file already exists
    if (fs.existsSync(filePath)) {
      console.error(`File already exists: ${filePath}`);
      return NextResponse.json({ 
        success: false, 
        error: `File already exists: ${filePath}` 
      }, { status: 400 });
    }
    
    // Write the file
    fs.writeFileSync(filePath, content);
    console.log(`File created: ${filePath}`);
    
    return NextResponse.json({ 
      success: true, 
      message: `File created: ${filePath}` 
    });
  } catch (error) {
    console.error(`Error creating file ${filePath}:`, error);
    return NextResponse.json({ 
      success: false, 
      error: (error as Error).message 
    }, { status: 500 });
  }
}

// Create a new folder
async function createFolder(folderPath: string) {
  try {
    // Check if folder already exists
    if (fs.existsSync(folderPath)) {
      console.error(`Folder already exists: ${folderPath}`);
      return NextResponse.json({ 
        success: false, 
        error: `Folder already exists: ${folderPath}` 
      }, { status: 400 });
    }
    
    // Create the folder
    fs.mkdirSync(folderPath, { recursive: true });
    console.log(`Folder created: ${folderPath}`);
    
    return NextResponse.json({ 
      success: true, 
      message: `Folder created: ${folderPath}` 
    });
  } catch (error) {
    console.error(`Error creating folder ${folderPath}:`, error);
    return NextResponse.json({ 
      success: false, 
      error: (error as Error).message 
    }, { status: 500 });
  }
}

// Delete a file
async function deleteFile(filePath: string) {
  try {
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      return NextResponse.json({ 
        success: false, 
        error: `File not found: ${filePath}` 
      }, { status: 404 });
    }
    
    // Check if it's a file
    const stats = fs.statSync(filePath);
    if (!stats.isFile()) {
      console.error(`Not a file: ${filePath}`);
      return NextResponse.json({ 
        success: false, 
        error: `Not a file: ${filePath}` 
      }, { status: 400 });
    }
    
    // Delete the file
    fs.unlinkSync(filePath);
    console.log(`File deleted: ${filePath}`);
    
    return NextResponse.json({ 
      success: true, 
      message: `File deleted: ${filePath}` 
    });
  } catch (error) {
    console.error(`Error deleting file ${filePath}:`, error);
    return NextResponse.json({ 
      success: false, 
      error: (error as Error).message 
    }, { status: 500 });
  }
}

// Delete a folder
async function deleteFolder(folderPath: string) {
  try {
    // Check if folder exists
    if (!fs.existsSync(folderPath)) {
      console.error(`Folder not found: ${folderPath}`);
      return NextResponse.json({ 
        success: false, 
        error: `Folder not found: ${folderPath}` 
      }, { status: 404 });
    }
    
    // Check if it's a directory
    const stats = fs.statSync(folderPath);
    if (!stats.isDirectory()) {
      console.error(`Not a folder: ${folderPath}`);
      return NextResponse.json({ 
        success: false, 
        error: `Not a folder: ${folderPath}` 
      }, { status: 400 });
    }
    
    // Delete the folder and its contents
    fs.rmSync(folderPath, { recursive: true, force: true });
    console.log(`Folder deleted: ${folderPath}`);
    
    return NextResponse.json({ 
      success: true, 
      message: `Folder deleted: ${folderPath}` 
    });
  } catch (error) {
    console.error(`Error deleting folder ${folderPath}:`, error);
    return NextResponse.json({ 
      success: false, 
      error: (error as Error).message 
    }, { status: 500 });
  }
}

// Rename a file or folder
async function renameFile(oldPath: string, newPath: string) {
  try {
    // Validate new path
    if (!newPath) {
      console.error('New path is required');
      return NextResponse.json({ 
        success: false, 
        error: 'New path is required' 
      }, { status: 400 });
    }
    
    // Check if source exists
    if (!fs.existsSync(oldPath)) {
      console.error(`Source not found: ${oldPath}`);
      return NextResponse.json({ 
        success: false, 
        error: `Source not found: ${oldPath}` 
      }, { status: 404 });
    }
    
    // Check if destination already exists
    if (fs.existsSync(newPath)) {
      console.error(`Destination already exists: ${newPath}`);
      return NextResponse.json({ 
        success: false, 
        error: `Destination already exists: ${newPath}` 
      }, { status: 400 });
    }
    
    // Rename/move the file or folder
    fs.renameSync(oldPath, newPath);
    console.log(`Renamed: ${oldPath} -> ${newPath}`);
    
    return NextResponse.json({ 
      success: true, 
      message: `Renamed: ${oldPath} -> ${newPath}` 
    });
  } catch (error) {
    console.error(`Error renaming ${oldPath} to ${newPath}:`, error);
    return NextResponse.json({ 
      success: false, 
      error: (error as Error).message 
    }, { status: 500 });
  }
}

// Save content to an existing file
async function saveFile(filePath: string, content: string) {
  try {
    // Create directory if it doesn't exist
    const directory = path.dirname(filePath);
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
      console.log(`Created directory: ${directory}`);
    }
    
    // Write the file (overwrite if exists)
    fs.writeFileSync(filePath, content);
    console.log(`File saved: ${filePath}`);
    
    return NextResponse.json({ 
      success: true, 
      message: `File saved: ${filePath}` 
    });
  } catch (error) {
    console.error(`Error saving file ${filePath}:`, error);
    return NextResponse.json({ 
      success: false, 
      error: (error as Error).message 
    }, { status: 500 });
  }
}
