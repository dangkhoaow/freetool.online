"use client"

import { WebLLMService } from "../webllm/webllm-service"
import * as XLSX from "xlsx"
import JSON5 from 'json5'; // Import json5 for parsing AI output

interface ChartData {
  labels: string[]
  datasets: Array<{
    label: string
    data: number[]
    backgroundColor?: string | string[]
    borderColor?: string | string[]
    borderWidth?: number
    fill?: boolean
  }>
}

export class DataProcessor {
  // Colors for chart datasets
  private readonly colors = [
    "rgba(75, 192, 192, 0.6)",
    "rgba(54, 162, 235, 0.6)",
    "rgba(255, 99, 132, 0.6)",
    "rgba(255, 206, 86, 0.6)",
    "rgba(153, 102, 255, 0.6)",
    "rgba(255, 159, 64, 0.6)",
    "rgba(199, 199, 199, 0.6)",
    "rgba(83, 102, 255, 0.6)",
    "rgba(40, 159, 64, 0.6)",
    "rgba(210, 199, 199, 0.6)",
  ]

  private readonly borderColors = [
    "rgba(75, 192, 192, 1)",
    "rgba(54, 162, 235, 1)",
    "rgba(255, 99, 132, 1)",
    "rgba(255, 206, 86, 1)",
    "rgba(153, 102, 255, 1)",
    "rgba(255, 159, 64, 1)",
    "rgba(199, 199, 199, 1)",
    "rgba(83, 102, 255, 1)",
    "rgba(40, 159, 64, 1)",
    "rgba(210, 199, 199, 1)",
  ]

  constructor() {}

  /**
   * Process Excel file and convert to CSV
   */
  async processExcelFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer)
          const workbook = XLSX.read(data, { type: 'array' })
          const firstSheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[firstSheetName]
          const csv = XLSX.utils.sheet_to_csv(worksheet)
          resolve(csv)
        } catch (error) {
          reject(error)
        }
      }
      reader.onerror = () => reject(new Error('Error reading file'))
      reader.readAsArrayBuffer(file)
    })
  }

  /**
   * Validate Chart.js data structure
   */
  static validateChartData(chartData: any): boolean {
    if (!chartData || !Array.isArray(chartData.labels) || !Array.isArray(chartData.datasets)) return false;
    const n = chartData.labels.length;
    if (n === 0) return false;
    for (const ds of chartData.datasets) {
      if (!Array.isArray(ds.data) || ds.data.length !== n) return false;
    }
    return true;
  }

  /**
   * Process data with LLM to analyze and structure it
   */
  async processDataWithLLM(
    data: string, 
    chartType: string,
    llmService: WebLLMService
  ): Promise<any> {
    // Check data size - if too large, we need to sample it
    const estimatedTokens = this.estimateTokenCount(data);
    let processedData = data;
    let dataWasSampled = false;
    
    // If data is too large (>3000 tokens to leave room for prompt), sample it
    if (estimatedTokens > 3000) {
      console.log(`[DataProcessor] Data is too large (est. ${estimatedTokens} tokens), sampling...`);
      const { sampledData, sampled } = this.sampleLargeData(data);
      processedData = sampledData;
      dataWasSampled = sampled;
      console.log(`[DataProcessor] Sampled data size: ${this.estimateTokenCount(processedData)} tokens`);
    }

    try {
      // Prepare a tailored prompt for the LLM based on chart type
      const samplingNote = dataWasSampled ? 
        "\n\nNOTE: The data provided is a representative sample of a larger dataset due to token limitations." : 
        "";
        
      let chartInstructions = '';
      switch (chartType) {
        case 'bar':
        case 'line':
          chartInstructions = `\n- Use one dataset.\n- The dataset label should be the value column name (e.g. 'Amount', 'Sales', etc.).\n- The data array must match the order of the labels array.\n- Example: { labels: ['A','B'], datasets: [{ label: 'Amount', data: [1,2] }] }`;
          break;
        case 'pie':
        case 'doughnut':
        case 'polarArea':
          chartInstructions = `\n- Use one dataset.\n- The dataset label should be the value column name.\n- The data array must match the order of the labels array.\n- Example: { labels: ['A','B'], datasets: [{ label: 'Amount', data: [1,2] }] }`;
          break;
        default:
          chartInstructions = '\n- Output a valid Chart.js v4 config object.';
      }
      const prompt = `
You are a data visualization assistant. Given the following data, generate a valid Chart.js v4 configuration object for a "${chartType}" chart.\n\nThe output must be a JavaScript object compatible with Chart.js v4, with these fields:\n\n{\n  type: "${chartType}", // Chart.js v4 chart type, e.g. 'bar', 'line', etc.\n  data: {\n    labels: [...], // array of categories (e.g. months, names, etc.)\n    datasets: [\n      { label: "...", data: [...], backgroundColor: "...", borderColor: "...", borderWidth: 1 }\n      // ... more datasets if needed\n    ]\n  },\n  options: {\n    responsive: true,\n    maintainAspectRatio: false,\n    plugins: {\n      title: { display: true, text: "My Chart", font: { size: 16 } },\n      legend: { position: "top" },\n      tooltip: { mode: "index", intersect: false }\n    }\n  }\n}\n\nIMPORTANT:\n- DO NOT return data as an array.\n- The 'data' field MUST be a single object with 'labels' (array) and 'datasets' (array).\n- If there are multiple series, use multiple datasets, NOT multiple data objects.\n- Do not wrap your output in variable assignments (e.g. do NOT use 'const config = ...').\n- Do not include any explanations, only output the JavaScript object.\n${chartInstructions}\n\nUse the data below to populate the config:\n\n\`\`\`\n${processedData}\n\`\`\`\n\n- Only output the JavaScript object, no explanations.\n- Make sure the config is valid for Chart.js v4 and the "${chartType}" chart type.\n- Do not use any library other than Chart.js v4.${samplingNote}`;
      // Log the final prompt before sending to AI
      console.log('[DataProcessor] Final prompt to AI:', prompt);
      // Query the LLM
      const response = await llmService.generate(
        [
          { role: "system", content: "You are a helpful data analysis assistant." },
          { role: "user", content: prompt }
        ],
        {
          temperature: 0.1,
          maxTokens: 2048,
        }
      );
      // Extract the JSON from the response
      let responseText = response.message.content;
      console.log('[DataProcessor] Raw AI output:', responseText);
      // Strip code block markers if present
      let cleaned = responseText.trim();
      if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```[a-zA-Z]*\n?/, '').replace(/```$/, '').trim();
      }
      // Try to extract JS object if wrapped in assignment (e.g. const config = {...})
      const assignMatch = cleaned.match(/^(const|let|var)\s+\w+\s*=\s*(\{[\s\S]*\})/);
      if (assignMatch && assignMatch[2]) {
        cleaned = assignMatch[2];
        console.log('[DataProcessor] Extracted object from assignment:', cleaned);
      }
      // Remove trailing console.log or similar statements
      cleaned = cleaned.replace(/console\.log\([^)]+\);?/g, '').trim();
      console.log('[DataProcessor] Cleaned AI output:', cleaned);
      let parsedConfig: any;
      try {
        // Use JSON5 to parse both JSON and JS-style objects from LLM
        parsedConfig = JSON5.parse(cleaned);
      } catch (e) {
        console.log('[DataProcessor] Could not parse AI output as JSON5:', cleaned);
        throw new Error('Could not extract valid JSON from LLM response');
      }
      // Validate Chart.js config structure
      // Log the structure for debugging
      if (!parsedConfig || typeof parsedConfig !== 'object') {
        console.log('[DataProcessor] Parsed config is not an object:', parsedConfig);
        throw new Error('AI output is not a valid object');
      }
      if (Array.isArray(parsedConfig.data)) {
        console.log('[DataProcessor] ERROR: Chart.js config "data" is an array, expected object. Value:', parsedConfig.data);
        // Attempt auto-fix: merge all labels/datasets from array into a single object
        try {
          const merged: ChartData = { labels: [], datasets: [] };
          for (const entry of parsedConfig.data) {
            if (Array.isArray(entry.labels)) {
              merged.labels.push(...entry.labels);
            }
            if (Array.isArray(entry.datasets)) {
              merged.datasets.push(...entry.datasets);
            }
          }
          // Remove duplicate labels (optional, but usually best for x-axis)
          merged.labels = Array.from(new Set(merged.labels));
          // Check all datasets: pad/truncate data arrays to match merged.labels length if possible
          for (const ds of merged.datasets) {
            if (Array.isArray(ds.data) && ds.data.length !== merged.labels.length) {
              // Pad with nulls or truncate
              if (ds.data.length < merged.labels.length) {
                ds.data = ds.data.concat(Array(merged.labels.length - ds.data.length).fill(null));
              } else {
                ds.data = ds.data.slice(0, merged.labels.length);
              }
            }
          }
          parsedConfig.data = merged;
          console.log('[DataProcessor] Auto-fixed data array to object. Result:', merged);
        } catch (fixErr) {
          console.log('[DataProcessor] Auto-fix for data array failed:', fixErr);
          throw new Error('Chart.js config "data" is an array, expected object.');
        }
      }
      if (!parsedConfig.type || !parsedConfig.data || !Array.isArray(parsedConfig.data.labels) || !Array.isArray(parsedConfig.data.datasets)) {
        console.log('[DataProcessor] AI Chart.js config missing required fields, falling back. Type:', parsedConfig.type, 'Data:', parsedConfig.data);
        // Fallback to CSV/manual
        if (data.includes(',') && data.includes('\n')) {
          const csvData = this.parseCSV(data);
          if (DataProcessor.validateChartData(csvData)) {
            return {
              type: chartType,
              data: csvData,
              options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  title: { display: true, text: "My Chart", font: { size: 16 } },
                  legend: { position: "top" },
                  tooltip: { mode: "index", intersect: false }
                }
              }
            };
          }
        }
        const fallback = this.parseDataManually(data, chartType);
        if (DataProcessor.validateChartData(fallback)) {
          return {
            type: chartType,
            data: fallback,
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                title: { display: true, text: "My Chart", font: { size: 16 } },
                legend: { position: "top" },
                tooltip: { mode: "index", intersect: false }
              }
            }
          };
        }
        throw new Error('Unable to create valid chart config from LLM or fallback.');
      }
      // Additional structure validation
      if (!Array.isArray(parsedConfig.data.labels)) {
        console.log('[DataProcessor] ERROR: data.labels is not an array:', parsedConfig.data.labels);
        throw new Error('Chart.js config data.labels is not an array.');
      }
      if (!Array.isArray(parsedConfig.data.datasets)) {
        console.log('[DataProcessor] ERROR: data.datasets is not an array:', parsedConfig.data.datasets);
        throw new Error('Chart.js config data.datasets is not an array.');
      }
      // Check each dataset
      for (const ds of parsedConfig.data.datasets) {
        if (!Array.isArray(ds.data)) {
          console.log('[DataProcessor] ERROR: dataset.data is not an array:', ds);
          throw new Error('Chart.js config dataset.data is not an array.');
        }
        if (ds.data.length !== parsedConfig.data.labels.length) {
          console.log('[DataProcessor] WARNING: dataset.data length does not match labels length. Auto-fixing. Dataset:', ds, 'Labels:', parsedConfig.data.labels);
          // Auto-fix: Either pad or truncate the dataset data to match labels length
          if (ds.data.length < parsedConfig.data.labels.length) {
            // Pad with nulls or zeros
            ds.data = [...ds.data, ...Array(parsedConfig.data.labels.length - ds.data.length).fill(0)];
          } else {
            // Truncate
            ds.data = ds.data.slice(0, parsedConfig.data.labels.length);
          }
          console.log('[DataProcessor] After auto-fix, dataset:', ds.data);
        }
      }
      // Sanitize RGBA colors in datasets to ensure alpha is between 0 and 1
      function sanitizeRgba(color: string): string {
        return color.replace(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/g, (match, r, g, b, a) => {
          let alpha = Math.min(Math.max(parseFloat(a), 0), 1);
          return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        });
      }
      if (parsedConfig?.data?.datasets) {
        for (const ds of parsedConfig.data.datasets) {
          if (typeof ds.backgroundColor === 'string') ds.backgroundColor = sanitizeRgba(ds.backgroundColor);
          if (typeof ds.borderColor === 'string') ds.borderColor = sanitizeRgba(ds.borderColor);
        }
      }
      // Chart.js config is valid
      return parsedConfig;
    } catch (error) {
      console.error("Error processing data with LLM:", error);
      // Fallback: Try to parse the data ourselves
      const fallback = this.parseDataManually(data, chartType);
      if (DataProcessor.validateChartData(fallback)) {
        return {
          type: chartType,
          data: fallback,
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: { display: true, text: "My Chart", font: { size: 16 } },
              legend: { position: "top" },
              tooltip: { mode: "index", intersect: false }
            }
          }
        };
      }
      throw new Error('Unable to create valid chart config from LLM or fallback.');
    }
  }

  /**
   * Manual data parsing as fallback if LLM fails
   */
  private parseDataManually(data: string, chartType: string): ChartData {
    // Try to detect if it's CSV
    if (data.includes(',') && data.includes('\n')) {
      return this.parseCSV(data)
    }
    
    // Try to parse as JSON
    try {
      const jsonData = JSON.parse(data)
      return this.parseJSON(jsonData)
    } catch (e) {
      // Not valid JSON
    }
    
    // Default fallback - treat as simple key-value pairs
    return this.parseSimpleText(data)
  }

  /**
   * Parse CSV data
   */
  private parseCSV(data: string): ChartData {
    const lines = data.trim().split('\n')
    const headers = lines[0].split(',').map(h => h.trim())
    
    const labels = []
    const datasets = []
    
    // If we have more than 2 columns, first column is labels, rest are datasets
    if (headers.length > 1) {
      // Extract labels from first column
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim())
        labels.push(values[0])
      }
      
      // Create a dataset for each column (except first)
      for (let col = 1; col < headers.length; col++) {
        const dataset: { label: string; data: number[] } = {
          label: headers[col],
          data: []
        }
        
        for (let row = 1; row < lines.length; row++) {
          const values = lines[row].split(',').map(v => v.trim())
          dataset.data.push(parseFloat(values[col]) || 0)
        }
        
        datasets.push(dataset)
      }
    } else {
      // Only one column - use row numbers as labels
      const dataset: { label: string; data: number[] } = {
        label: headers[0],
        data: []
      }
      
      for (let i = 1; i < lines.length; i++) {
        labels.push(`Item ${i}`)
        dataset.data.push(parseFloat(lines[i]) || 0)
      }
      
      datasets.push(dataset)
    }
    
    return { labels, datasets }
  }

  /**
   * Parse JSON data
   */
  private parseJSON(data: any): ChartData {
    const labels: string[] = []
    const datasets: Array<{label: string; data: number[]}> = [{
      label: 'Value',
      data: []
    }]
    
    // Check if it's an array of objects
    if (Array.isArray(data) && typeof data[0] === 'object') {
      // Get all possible keys
      const keys = new Set<string>()
      data.forEach(item => {
        Object.keys(item).forEach(key => keys.add(key))
      })
      
      // Find a suitable label key and value key
      let labelKey = ''
      let valueKeys = []
      
      // Prefer keys like 'name', 'category', 'label' for labels
      const possibleLabelKeys = ['name', 'category', 'label', 'title', 'id']
      for (const key of possibleLabelKeys) {
        if (keys.has(key)) {
          labelKey = key
          break
        }
      }
      
      // If no good label key found, use the first string/date key
      if (!labelKey) {
        for (const key of keys) {
          if (typeof data[0][key] === 'string' || data[0][key] instanceof Date) {
            labelKey = key
            break
          }
        }
      }
      
      // If still no label key, use the first key
      if (!labelKey && keys.size > 0) {
        labelKey = Array.from(keys)[0]
      }
      
      // Find numeric value keys
      for (const key of keys) {
        if (key !== labelKey && typeof data[0][key] === 'number') {
          valueKeys.push(key)
        }
      }
      
      // Extract labels
      data.forEach(item => {
        labels.push(String(item[labelKey]))
      })
      
      // Create datasets for each value key
      datasets.length = 0 // Clear default dataset
      valueKeys.forEach((key, index) => {
        datasets.push({
          label: key,
          data: data.map(item => typeof item[key] === 'number' ? item[key] : 0)
        })
      })
    } else if (typeof data === 'object') {
      // Simple object with key-value pairs
      Object.keys(data).forEach(key => {
        labels.push(key)
        datasets[0].data.push(typeof data[key] === 'number' ? data[key] : 0)
      })
    }
    
    return { labels, datasets }
  }

  /**
   * Parse simple text data (fallback)
   */
  private parseSimpleText(data: string): ChartData {
    const lines = data.trim().split('\n')
    const labels: string[] = []
    const values: number[] = []
    
    lines.forEach(line => {
      const parts = line.split(/[,:;\t]+/)
      if (parts.length >= 2) {
        labels.push(parts[0].trim())
        values.push(parseFloat(parts[1].trim()) || 0)
      }
    })
    
    return {
      labels,
      datasets: [{
        label: 'Value',
        data: values
      }]
    }
  }

  /**
   * Generate chart configuration based on data and chart type
   */
  async generateChartConfig(
    data: any, 
    chartType: string,
    title: string
  ): Promise<any> {
    // Apply colors to datasets
    data.data.datasets = data.data.datasets.map((dataset: any, index: number) => {
      const colorIndex = index % this.colors.length
      
      // Different chart types need different color configurations
      if (['pie', 'doughnut', 'polarArea'].includes(chartType)) {
        return {
          ...dataset,
          backgroundColor: this.colors,
          borderColor: this.borderColors,
          borderWidth: 1
        }
      } else if (chartType === 'line') {
        return {
          ...dataset,
          backgroundColor: this.colors[colorIndex],
          borderColor: this.borderColors[colorIndex],
          borderWidth: 2,
          fill: false
        }
      } else if (chartType === 'radar') {
        return {
          ...dataset,
          backgroundColor: this.colors[colorIndex] + '80', // Add transparency
          borderColor: this.borderColors[colorIndex],
          borderWidth: 2,
          fill: true
        }
      } else if (chartType === 'scatter' || chartType === 'bubble') {
        return {
          ...dataset,
          backgroundColor: this.colors[colorIndex],
          borderColor: this.borderColors[colorIndex],
          borderWidth: 1
        }
      } else {
        // Bar, horizontalBar, etc.
        return {
          ...dataset,
          backgroundColor: this.colors[colorIndex],
          borderColor: this.borderColors[colorIndex],
          borderWidth: 1
        }
      }
    })

    // Configure based on chart type
    let chartConfig: any = {
      type: this.mapChartType(chartType),
      data: data.data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: title,
            font: {
              size: 16
            }
          },
          legend: {
            position: 'top',
          },
          tooltip: {
            mode: 'index',
            intersect: false,
          }
        },
      }
    }

    // Special configurations for specific chart types
    if (chartType === 'stackedBar') {
      chartConfig.type = 'bar'
      chartConfig.options.scales = {
        x: {
          stacked: true,
        },
        y: {
          stacked: true
        }
      }
    } else if (chartType === 'horizontalBar') {
      chartConfig.type = 'bar'
      chartConfig.options.indexAxis = 'y'
    } else if (['pie', 'doughnut', 'polarArea'].includes(chartType)) {
      // For pie/doughnut charts, we need a different data structure
      if (data.data.datasets.length > 1) {
        // If multiple datasets, use the first one
        chartConfig.data = {
          labels: data.data.labels,
          datasets: [{
            label: data.data.datasets[0].label,
            data: data.data.datasets[0].data,
            backgroundColor: this.colors.slice(0, data.data.labels.length),
            borderColor: this.borderColors.slice(0, data.data.labels.length),
            borderWidth: 1
          }]
        }
      }
    }

    return chartConfig
  }

  /**
   * Map chart type to Chart.js type
   */
  private mapChartType(chartType: string): string {
    const typeMap: Record<string, string> = {
      'bar': 'bar',
      'line': 'line',
      'pie': 'pie',
      'doughnut': 'doughnut',
      'polarArea': 'polarArea',
      'radar': 'radar',
      'scatter': 'scatter',
      'bubble': 'bubble',
      'stackedBar': 'bar', // Will add stacked option in config
      'horizontalBar': 'bar', // Will set indexAxis to 'y'
    }

    return typeMap[chartType] || 'bar' // Default to bar if unknown
  }

  /**
   * Estimate token count for a given string
   */
  private estimateTokenCount(data: string): number {
    // More accurate token estimate: ~4 chars per token is typical for English text
    return Math.ceil(data.length / 4);
  }

  /**
   * Sample large data to fit within token limits
   */
  private sampleLargeData(data: string): { sampledData: string, sampled: boolean } {
    const lines = data.trim().split('\n');
    
    // Always keep the header row
    if (lines.length <= 2) {
      return { sampledData: data, sampled: false };
    }
    
    const header = lines[0];
    const dataRows = lines.slice(1);
    
    // If we have a modest amount of data, keep it all
    if (dataRows.length < 100) {
      return { sampledData: data, sampled: false };
    }
    
    // Determine how to sample based on data size
    let sampledRows: string[] = [];
    
    if (dataRows.length <= 500) {
      // For medium datasets: systematic sampling - keep every nth row
      const n = Math.ceil(dataRows.length / 50); // Target ~50 rows
      sampledRows = dataRows.filter((_, idx) => idx % n === 0);
    } else {
      // For large datasets: stratified sampling - keep beginning, middle and end
      // This preserves structure and trends better than random sampling
      const beginCount = 20;
      const middleCount = 20;
      const endCount = 20;
      
      // Get samples from beginning
      sampledRows.push(...dataRows.slice(0, beginCount));
      
      // Get samples from middle
      const middleStart = Math.floor((dataRows.length - middleCount) / 2);
      sampledRows.push(...dataRows.slice(middleStart, middleStart + middleCount));
      
      // Get samples from end
      sampledRows.push(...dataRows.slice(-endCount));
    }
    
    // Ensure there are no duplicates if the dataset is very small
    sampledRows = [...new Set(sampledRows)];
    
    // Reconstruct the data with header and sampled rows
    const sampledData = [header, ...sampledRows].join('\n');
    
    console.log(`[DataProcessor] Sampled data rows from ${dataRows.length} to ${sampledRows.length}`);
    return { sampledData, sampled: true };
  }
}
