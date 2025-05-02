import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth/jwt';
import os from 'os';
import { execSync } from 'child_process';
import fs from 'fs';

/**
 * GET handler for system metrics
 */
export async function GET(req: NextRequest) {
  try {
    // Verify admin token
    const token = req.headers.get('authorization')?.split(' ')[1];
    const isAdminUser = await isAdmin(token);
    
    if (!isAdminUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }
    
    // Calculate CPU usage
    const cpuUsage = getCpuUsage();
    
    // Get memory information
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const memoryPercentage = (usedMem / totalMem) * 100;
    
    // Get disk information for both root and NVMe disks
    const { rootDisk, nvmeDisk, nvmeMounts, swapInfo } = getDiskInfo();
    
    // Get uptime
    const uptime = os.uptime();
    
    return NextResponse.json({
      cpu: cpuUsage,
      memory: {
        total: totalMem,
        used: usedMem,
        free: freeMem,
        percentage: memoryPercentage,
      },
      disk: rootDisk,
      nvmeDisk,
      nvmeMounts,
      swap: swapInfo,
      uptime,
    });
  } catch (error) {
    console.error('Error getting system metrics:', error);
    return NextResponse.json(
      { error: 'Failed to get system metrics' },
      { status: 500 }
    );
  }
}

/**
 * Calculate CPU usage percentage
 */
function getCpuUsage(): number {
  try {
    // For a real implementation, this would track CPU usage over time
    // This is a simple approximation
    const cpus = os.cpus();
    let idle = 0;
    let total = 0;
    
    for (const cpu of cpus) {
      idle += cpu.times.idle;
      total += cpu.times.user + cpu.times.nice + cpu.times.sys + cpu.times.idle + cpu.times.irq;
    }
    
    // Approximate usage percentage
    return 100 - ((idle / total) * 100);
  } catch (error) {
    console.error('Error calculating CPU usage:', error);
    return 0;
  }
}

/**
 * Get disk space information for both root and NVMe disks
 */
function getDiskInfo() {
  try {
    const rootDir = '/';
    const result: any = {
      rootDisk: null,
      nvmeDisk: null,
      nvmeMounts: [],
      swapInfo: null
    };
    
    // Get disk information for root directory
    const rootDfOutput = execSync(`df -k ${rootDir}`).toString();
    const rootLines = rootDfOutput.trim().split('\n');
    const rootStats = rootLines[1].split(/\s+/);
    
    // Parse root disk information
    const rootTotal = parseInt(rootStats[1]) * 1024; // Convert to bytes
    const rootUsed = parseInt(rootStats[2]) * 1024;
    const rootFree = parseInt(rootStats[3]) * 1024;
    const rootPercentage = (rootUsed / rootTotal) * 100;
    
    result.rootDisk = {
      total: rootTotal,
      used: rootUsed,
      free: rootFree,
      percentage: rootPercentage,
    };
    
    // First check if NVMe info file exists (created by our postdeploy hook)
    const nvmeInfoPath = '/var/app/current/nvme-info.json';
    if (fs.existsSync(nvmeInfoPath)) {
      try {
        console.log('NVMe info file found, reading data...');
        const nvmeInfo = JSON.parse(fs.readFileSync(nvmeInfoPath, 'utf8'));
        console.log('NVMe info parsed:', JSON.stringify(nvmeInfo));
        
        // Check if NVMe is available
        if (nvmeInfo.nvmeAvailable) {
          console.log('NVMe is available according to info file');
          // Convert human-readable sizes to bytes (approximate)
          const sizeToBytes = (size: string): number => {
            if (!size || size === '0') return 0;
            
            const num = parseFloat(size.replace(/[^0-9.]/g, ''));
            if (size.includes('G')) return num * 1024 * 1024 * 1024;
            if (size.includes('M')) return num * 1024 * 1024;
            if (size.includes('K')) return num * 1024;
            return num;
          };
          
          // Update nvmeDisk info from file
          result.nvmeDisk = {
            total: sizeToBytes(nvmeInfo.diskInfo.total),
            used: sizeToBytes(nvmeInfo.diskInfo.used),
            free: sizeToBytes(nvmeInfo.diskInfo.available),
            percentage: nvmeInfo.diskInfo.usedPercent,
            mountPoint: nvmeInfo.mountPoint,
            device: nvmeInfo.device || '/dev/nvme1n1'
          };
          
          // Process mounts array if available
          if (nvmeInfo.mounts && Array.isArray(nvmeInfo.mounts)) {
            result.nvmeMounts = nvmeInfo.mounts.map((mount: any) => {
              // For each mount, create a standardized mount object
              return {
                mountPoint: mount.mountPoint,
                device: nvmeInfo.device, // Use parent device
                type: mount.type,
                size: mount.size,
                // These are placeholder values since we can't easily get per-directory usage
                total: sizeToBytes(mount.size),
                used: 0,
                free: 0,
                percentage: 0
              };
            });
          } else if (nvmeInfo.cacheDirectories && Array.isArray(nvmeInfo.cacheDirectories)) {
            // Old format support - convert cache directories to mounts
            result.nvmeMounts = nvmeInfo.cacheDirectories.map((dir: string) => {
              return {
                mountPoint: `${nvmeInfo.mountPoint}/${dir}`,
                device: nvmeInfo.device || '/dev/nvme1n1',
                type: dir.replace(/-/g, ' '),
                // Placeholder values
                total: 0,
                used: 0,
                free: 0,
                percentage: 0
              };
            });
          }
          
          // Add swap info if available in the NVMe info file
          if (nvmeInfo.swapEnabled) {
            // Try to get swap from system
            try {
              const swapOutput = execSync('swapon --show=SIZE,USED --bytes').toString().trim();
              if (swapOutput && swapOutput.length > 0) {
                const swapLines = swapOutput.trim().split('\n');
                // Skip header line
                if (swapLines.length > 1) {
                  const swapStats = swapLines[1].split(/\s+/);
                  const swapTotal = parseInt(swapStats[0]);
                  const swapUsed = parseInt(swapStats[1]);
                  const swapFree = swapTotal - swapUsed;
                  const swapPercentage = (swapUsed / swapTotal) * 100;
                  
                  result.swapInfo = {
                    total: swapTotal,
                    used: swapUsed,
                    free: swapFree,
                    percentage: swapPercentage
                  };
                }
              }
            } catch (error) {
              console.error('Error getting swap info:', error);
              // Provide fallback values
              result.swapInfo = {
                total: 1024 * 1024 * 1024, // 1GB (default swap size)
                used: 0,
                free: 1024 * 1024 * 1024,
                percentage: 0
              };
            }
          }
          
          // Return early since we have complete NVMe data
          return result;
        } else {
          console.log('NVMe not available according to info file');
        }
      } catch (error) {
        console.error('Error parsing NVMe info file:', error);
      }
    }
    
    // Fallback to legacy detection if no NVMe info file or if reading failed
    console.log('Falling back to legacy NVMe detection...');
    
    // Try to detect NVMe mount at common locations
    const nvmeMountPoints = [
      '/mnt/nvme_data',
      '/mnt/nvme',
      '/var/app/current/uploads' // Legacy location
    ];
    
    for (const mountPoint of nvmeMountPoints) {
      try {
        if (fs.existsSync(mountPoint)) {
          // Get device name for the mount point
          const mountOutput = execSync(`findmnt -n -o SOURCE ${mountPoint} 2>/dev/null`).toString().trim();
          
          if (mountOutput && mountOutput.includes('nvme')) {
            // NVMe disk is mounted
            const nvmeDfOutput = execSync(`df -k ${mountPoint}`).toString();
            const nvmeLines = nvmeDfOutput.trim().split('\n');
            const nvmeStats = nvmeLines[1].split(/\s+/);
            
            // Parse NVMe disk information
            const nvmeTotal = parseInt(nvmeStats[1]) * 1024; // Convert to bytes
            const nvmeUsed = parseInt(nvmeStats[2]) * 1024;
            const nvmeFree = parseInt(nvmeStats[3]) * 1024;
            const nvmePercentage = (nvmeUsed / nvmeTotal) * 100;
            
            result.nvmeDisk = {
              total: nvmeTotal,
              used: nvmeUsed,
              free: nvmeFree,
              percentage: nvmePercentage,
              mountPoint: mountPoint,
              device: mountOutput
            };
            
            // Add common directories as mounts
            const nvmeDirs = ['node_modules', 'npm-cache', 'nginx-cache'];
            for (const dir of nvmeDirs) {
              const dirPath = `${mountPoint}/${dir}`;
              if (fs.existsSync(dirPath)) {
                result.nvmeMounts.push({
                  mountPoint: dirPath,
                  device: mountOutput,
                  type: dir.replace(/-/g, ' '),
                  total: nvmeTotal,
                  used: nvmeUsed,
                  free: nvmeFree,
                  percentage: nvmePercentage
                });
              }
            }
            
            break; // Found NVMe, no need to check other mount points
          }
        }
      } catch (error) {
        console.error(`Error checking for NVMe disk at ${mountPoint}:`, error);
      }
    }
    
    // Get swap information if not already set
    if (!result.swapInfo) {
      try {
        const swapOutput = execSync('swapon --show=SIZE,USED --bytes').toString().trim();
        if (swapOutput && swapOutput.length > 0) {
          const swapLines = swapOutput.trim().split('\n');
          // Skip header line
          if (swapLines.length > 1) {
            const swapStats = swapLines[1].split(/\s+/);
            const swapTotal = parseInt(swapStats[0]);
            const swapUsed = parseInt(swapStats[1]);
            const swapFree = swapTotal - swapUsed;
            const swapPercentage = (swapUsed / swapTotal) * 100;
            
            result.swapInfo = {
              total: swapTotal,
              used: swapUsed,
              free: swapFree,
              percentage: swapPercentage
            };
          }
        }
      } catch (error) {
        console.error('Error getting swap info:', error);
      }
    }
    
    return result;
  } catch (error) {
    console.error('Error getting disk info:', error);
    // Fallback to some default values
    return {
      rootDisk: {
        total: 1000 * 1024 * 1024 * 1024, // 1TB
        used: 300 * 1024 * 1024 * 1024,   // 300GB
        free: 700 * 1024 * 1024 * 1024,   // 700GB
        percentage: 30,
      },
      nvmeDisk: null,
      nvmeMounts: [],
      swapInfo: null
    };
  }
}
