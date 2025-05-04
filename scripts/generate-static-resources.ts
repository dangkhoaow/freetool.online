import * as fs from 'fs';
import * as path from 'path';

// Function to recursively scan directories and collect file paths
function scanDirectory(directory: string, baseDir: string = ''): string[] {
  console.log(`Scanning directory: ${path.join(baseDir, directory)}`);
  
  const publicPath = path.join(process.cwd(), 'public', baseDir, directory);
  let filePaths: string[] = [];

  try {
    // Get all files and directories in the current directory
    const items = fs.readdirSync(publicPath);
    console.log(`Found ${items.length} items in ${publicPath}`);

    // Process each item
    for (const item of items) {
      // Skip .DS_Store files and other hidden files
      if (item.startsWith('.')) {
        console.log(`Skipping hidden file: ${item}`);
        continue;
      }

      const itemPath = path.join(publicPath, item);
      const relativePath = path.join(baseDir, directory, item);
      const stats = fs.statSync(itemPath);

      if (stats.isDirectory()) {
        // Recursively scan subdirectories
        console.log(`Found directory: ${relativePath}`);
        const subDirFiles = scanDirectory(item, path.join(baseDir, directory));
        filePaths = [...filePaths, ...subDirFiles];
      } else {
        // Add file path to the list
        const formattedPath = '/' + relativePath.replace(/\\/g, '/');
        console.log(`Found file: ${formattedPath}`);
        filePaths.push(formattedPath);
      }
    }
  } catch (error) {
    console.error(`Error scanning directory ${publicPath}:`, error);
  }

  return filePaths;
}

// Function to read the 404.html file content
function get404HtmlContent(): string {
  try {
    const filePath = path.join(process.cwd(), 'public', '404.html');
    console.log(`Reading 404.html file from: ${filePath}`);
    
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      console.log(`Successfully read 404.html (${content.length} bytes)`);
      return content;
    } else {
      console.error(`404.html file not found at ${filePath}`);
      return '';
    }
  } catch (error) {
    console.error(`Error reading 404.html:`, error);
    return '';
  }
}

// Main function to generate the static resources list
async function generateStaticResources() {
  console.log('Starting to generate static resources list...');
  
  // Scan the public directory
  const staticResources = scanDirectory('');
  
  // Define the reserved paths that aren't part of the public directory
  const reservedPaths = [
    '/_next',
    '/api',
    '/health',
    '/not-found',
  ];
  
  // Combine the static resources with reserved paths
  const allReservedPaths = [...new Set([...reservedPaths, ...staticResources])];
  
  // Read the 404.html content
  const custom404Html = get404HtmlContent();
  
  // Create the output object
  const output = {
    staticResources,
    reservedPaths: allReservedPaths
  };
  
  // Write the results to a JSON file
  const outputPath = path.join(process.cwd(), 'public', 'static-resources.json');
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
  console.log(`Static resources list generated at: ${outputPath}`);
  
  // Write the results to a TypeScript file as well for direct import
  const tsOutputPath = path.join(process.cwd(), 'lib', 'static-resources.ts');
  const tsContent = `// Auto-generated file. DO NOT EDIT.
// Generated on ${new Date().toISOString()}

export const STATIC_RESOURCES = ${JSON.stringify(staticResources, null, 2)};

export const RESERVED_PATHS = ${JSON.stringify(allReservedPaths, null, 2)};

export const CUSTOM_404_HTML = ${JSON.stringify(custom404Html)};
`;
  
  // Ensure the lib directory exists
  if (!fs.existsSync(path.join(process.cwd(), 'lib'))) {
    fs.mkdirSync(path.join(process.cwd(), 'lib'));
  }
  
  fs.writeFileSync(tsOutputPath, tsContent);
  console.log(`Static resources TypeScript file generated at: ${tsOutputPath}`);
}

// Run the function
generateStaticResources().catch(error => {
  console.error('Error generating static resources:', error);
  process.exit(1);
});
