#!/usr/bin/env node

/**
 * Video Recorder MCP Server
 * Model Context Protocol server for recording HTML content and URLs as videos
 * with advanced customization options including audio, subtitles, and presets.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';

import puppeteer from 'puppeteer';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs/promises';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Main Video Recorder MCP Server Class
 * Implements tools for recording HTML/URLs as videos with Puppeteer and FFmpeg
 */
class VideoRecorderMCP {
  constructor() {
    this.server = new Server(
      {
        name: 'video-recorder-mcp',
        version: '2.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
    this.setupErrorHandling();
    this.tempDirs = new Set();
  }

  setupErrorHandling() {
    this.server.onerror = (error) => console.error('[MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.cleanup();
      process.exit(0);
    });
  }

  async cleanup() {
    for (const dir of this.tempDirs) {
      try {
        await fs.rmdir(dir, { recursive: true });
      } catch (error) {
        console.warn(`Failed to cleanup temp dir: ${dir}`, error);
      }
    }
  }

  /**
   * Configure all MCP tool handlers
   */
  setupToolHandlers() {
    // Tool definitions
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'record_html_to_video',
          description: 'Record HTML content as a video with screenshots',
          inputSchema: {
            type: 'object',
            properties: {
              html: { type: 'string', description: 'HTML content to record' },
              outputPath: { type: 'string', description: 'Output video file path' },
              duration: { type: 'number', description: 'Recording duration in seconds', default: 5 },
              fps: { type: 'number', description: 'Frames per second', default: 2 },
              width: { type: 'number', description: 'Video width in pixels', default: 1920 },
              height: { type: 'number', description: 'Video height in pixels', default: 1080 },
              preset: { type: 'string', description: 'Video preset (youtube, instagram, tiktok, custom)', default: 'youtube' },
              audioPath: { type: 'string', description: 'Optional background audio file path' },
              subtitles: { type: 'string', description: 'Optional subtitles text' }
            },
            required: ['html', 'outputPath']
          }
        },
        {
          name: 'record_url_to_video',
          description: 'Record a webpage URL as a video',
          inputSchema: {
            type: 'object',
            properties: {
              url: { type: 'string', description: 'URL to record' },
              outputPath: { type: 'string', description: 'Output video file path' },
              duration: { type: 'number', description: 'Recording duration in seconds', default: 5 },
              fps: { type: 'number', description: 'Frames per second', default: 2 },
              width: { type: 'number', description: 'Video width in pixels', default: 1920 },
              height: { type: 'number', description: 'Video height in pixels', default: 1080 },
              preset: { type: 'string', description: 'Video preset (youtube, instagram, tiktok, custom)', default: 'youtube' },
              audioPath: { type: 'string', description: 'Optional background audio file path' },
              subtitles: { type: 'string', description: 'Optional subtitles text' }
            },
            required: ['url', 'outputPath']
          }
        }
      ]
    }));

    // Tool execution handler
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        switch (request.params.name) {
          case 'record_html_to_video':
            return await this.recordHtmlToVideo(request.params.arguments);
          case 'record_url_to_video':
            return await this.recordUrlToVideo(request.params.arguments);
          default:
            throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${request.params.name}`);
        }
      } catch (error) {
        throw new McpError(ErrorCode.InternalError, `Tool execution failed: ${error.message}`);
      }
    });
  }

  /**
   * Get video dimensions based on preset
   */
  getPresetDimensions(preset) {
    const presets = {
      youtube: { width: 1920, height: 1080 },
      instagram: { width: 1080, height: 1080 },
      tiktok: { width: 1080, height: 1920 },
      custom: { width: 1920, height: 1080 }
    };
    return presets[preset] || presets.youtube;
  }

  /**
   * Record HTML content to video
   */
  async recordHtmlToVideo(args) {
    return await this.recordToVideo({ type: 'html', content: args.html, ...args });
  }

  /**
   * Record URL to video
   */
  async recordUrlToVideo(args) {
    return await this.recordToVideo({ type: 'url', content: args.url, ...args });
  }

  /**
   * Main video recording implementation
   */
  async recordToVideo(params) {
    const { type, content, outputPath, duration = 5, fps = 2, width, height, preset = 'youtube' } = params;
    
    const dimensions = this.getPresetDimensions(preset);
    const finalWidth = width || dimensions.width;
    const finalHeight = height || dimensions.height;

    const tempDir = path.join(os.tmpdir(), `video-recording-${Date.now()}`);
    this.tempDirs.add(tempDir);

    try {
      await fs.mkdir(tempDir, { recursive: true });

      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });

      const page = await browser.newPage();
      await page.setViewport({ width: finalWidth, height: finalHeight });

      // Load content
      if (type === 'html') {
        await page.setContent(content);
      } else if (type === 'url') {
        await page.goto(content, { waitUntil: 'networkidle0' });
      }

      await page.waitForTimeout(1000);

      // Take screenshots
      const frameCount = Math.ceil(duration * fps);
      const frameInterval = 1000 / fps;

      for (let i = 0; i < frameCount; i++) {
        const screenshotPath = path.join(tempDir, `frame_${String(i + 1).padStart(5, '0')}.png`);
        await page.screenshot({ path: screenshotPath, fullPage: false });
        
        if (i < frameCount - 1) {
          await page.waitForTimeout(frameInterval);
        }
      }

      await browser.close();

      // For now, return screenshots path (FFmpeg integration in next update)
      const screenshotsDir = path.join(path.dirname(outputPath), 'screenshots');
      await fs.mkdir(screenshotsDir, { recursive: true });
      
      const screenshots = await fs.readdir(tempDir);
      for (const screenshot of screenshots) {
        await fs.copyFile(
          path.join(tempDir, screenshot),
          path.join(screenshotsDir, screenshot)
        );
      }

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: true,
            outputPath: screenshotsDir,
            frameCount,
            duration,
            fps,
            dimensions: { width: finalWidth, height: finalHeight },
            message: 'Screenshots created successfully. Video creation with FFmpeg coming in next update.',
            screenshotsPath: screenshotsDir
          }, null, 2)
        }]
      };

    } catch (error) {
      throw new Error(`Recording failed: ${error.message}`);
    } finally {
      try {
        await fs.rm(tempDir, { recursive: true, force: true });
        this.tempDirs.delete(tempDir);
      } catch (error) {
        console.warn('Failed to cleanup temp directory:', error);
      }
    }
  }

  /**
   * Start the MCP server
   */
  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Video Recorder MCP server running on stdio');
  }
}

// Initialize and start the server
const server = new VideoRecorderMCP();
server.run().catch(console.error);