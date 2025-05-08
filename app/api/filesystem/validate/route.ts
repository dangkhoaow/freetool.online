import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

/**
 * GET handler for validating if a file or folder path exists
 * This endpoint is used by the VSCode editor to validate folder paths
 * before attempting to open them
 */
export async function GET(request: NextRequest) {
  console.log('Filesystem validate API called');
  
  try {
    // Get the path from the URL params
    const { searchParams } = new URL(request.url);
    const pathToCheck = searchParams.get('path');
    console.log(`Validating path: ${pathToCheck}`);
    
    if (!pathToCheck) {
      console.error('No path provided for validation');
      return NextResponse.json({ 
        success: false, 
        exists: false,
        error: 'No path provided' 
      }, { status: 400 });
    }
    
    // Check if the path exists
    const exists = fs.existsSync(pathToCheck);
    console.log(`Path ${pathToCheck} exists: ${exists}`);
    
    // Also check if it's a directory if it exists
    let isDirectory = false;
    if (exists) {
      try {
        const stats = fs.statSync(pathToCheck);
        isDirectory = stats.isDirectory();
        console.log(`Path ${pathToCheck} is directory: ${isDirectory}`);
      } catch (statError) {
        console.error(`Error checking if path is directory: ${statError}`);
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      exists,
      isDirectory,
      path: pathToCheck
    });
    
  } catch (error) {
    console.error('Error validating path:', error);
    return NextResponse.json({ 
      success: false, 
      exists: false,
      error: (error as Error).message 
    }, { status: 500 });
  }
}
