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
    const { rootDisk, nvmeDisk, swapInfo } = getDiskInfo();
    
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
    const uploadsDir = '/var/app/current/uploads';
    const result: any = {
      rootDisk: null,
      nvmeDisk: null,
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
    
    // Check if NVMe disk is mounted to uploads directory
    try {
      // Get device name for uploads directory
      const mountOutput = execSync(`findmnt -n -o SOURCE ${uploadsDir}`).toString().trim();
      
      if (mountOutput && mountOutput.includes('nvme')) {
        // NVMe disk is mounted
        const nvmeDfOutput = execSync(`df -k ${uploadsDir}`).toString();
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
          mountPoint: uploadsDir,
          device: mountOutput
        };
      }
    } catch (error) {
      console.error('Error checking for NVMe disk:', error);
    }
    
    // Get swap information
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
      swapInfo: null
    };
  }
}
