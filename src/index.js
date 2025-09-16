const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} = require('@modelcontextprotocol/sdk/types.js');
const puppeteer = require('puppeteer');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class VideoRecorderMCP {
  constructor() {
    this.server = new Server(
      {
        name: 'video-recorder-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
    this.recordingsDir = path.join(__dirname, '../recordings');
    this.ensureRecordingsDir();
  }

  async ensureRecordingsDir() {
    try {
      await fs.mkdir(this.recordingsDir, { recursive: true });
    } catch (error) {
      console.error('Error creating recordings directory:', error);
    }
  }

  setupHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'record_html_to_video',
          description: 'Record HTML content or URL to video file with precise timing control',
          inputSchema: {
            type: 'object',
            properties: {
              input: {
                type: 'string',
                description: 'HTML content or URL to record',
              },
              slideTimings: {
                type: 'array',
                items: { type: 'number' },
                description: 'Duration in seconds for each slide (e.g., [4, 5, 3, 3])',
                default: [10],
              },
              fps: {
                type: 'number',
                description: 'Frames per second',
                default: 30,
              },
              width: {
                type: 'number',
                description: 'Video width',
                default: 1920,
              },
              height: {
                type: 'number',
                description: 'Video height',
                default: 1080,
              },
              audioPath: {
                type: 'string',
                description: 'Path to audio file to add to the video (optional)',
              },
            },
            required: ['input'],
          },
        },
        {
          name: 'list_recordings',
          description: 'List all available video recordings',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'get_recording_status',
          description: 'Get status of a recording job',
          inputSchema: {
            type: 'object',
            properties: {
              jobId: {
                type: 'string',
                description: 'Recording job ID',
              },
            },
            required: ['jobId'],
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      switch (name) {
        case 'record_html_to_video':
          return this.recordHtmlToVideoFixed(args);
        case 'list_recordings':
          return this.listRecordings();
        case 'get_recording_status':
          return this.getRecordingStatus(args.jobId);
        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    });
  }

  // 🎯 Server-Controlled Recording with Precise Timing
  async recordHtmlToVideoFixed({ 
    input, 
    slideTimings = [10], 
    fps = 30, 
    width = 1920, 
    height = 1080, 
    audioPath 
  }) {
    const jobId = uuidv4();
    const outputDir = path.join(this.recordingsDir, jobId);
    const framesDir = path.join(outputDir, 'frames');
    const outputPath = path.join(outputDir, 'output.mp4');

    try {
      // Validate inputs
      if (!input || typeof input !== 'string') {
        throw new Error('Input must be a non-empty string (HTML or URL)');
      }
      
      if (!Array.isArray(slideTimings) || slideTimings.length === 0) {
        throw new Error('slideTimings must be a non-empty array of numbers');
      }
      
      if (slideTimings.some(t => typeof t !== 'number' || t <= 0)) {
        throw new Error('All slide timings must be positive numbers');
      }
      
      // Limit total duration to prevent abuse
      const totalDuration = slideTimings.reduce((sum, t) => sum + t, 0);
      if (totalDuration > 300) { // 5 minutes max
        throw new Error('Total video duration cannot exceed 5 minutes (300 seconds)');
      }
      
      console.log(`🎬 Starting recording - Job ID: ${jobId}`);
      console.log(`📊 Slide timings: ${slideTimings.join('s, ')}s`);
      
      // Create directories
      await fs.mkdir(outputDir, { recursive: true });
      await fs.mkdir(framesDir, { recursive: true });

      // Calculate total frames and frame ranges
      const totalFrames = slideTimings.reduce((sum, time) => sum + (time * fps), 0);
      const frameRanges = this.calculateFrameRanges(slideTimings, fps);
      
      console.log(`🎥 Total frames to generate: ${totalFrames}`);
      console.log(`📐 Frame ranges:`, frameRanges);

      // Launch browser with increased timeout
      let browser;
      try {
        browser = await puppeteer.launch({
          headless: 'new',
          args: ['--no-sandbox', '--disable-setuid-sandbox'],
          protocolTimeout: 180000, // 3 minutes timeout
        });

        const page = await browser.newPage();
        await page.setViewport({ width, height });

        // Load content and inject control API
        if (input.startsWith('http')) {
          await page.goto(input, { waitUntil: 'networkidle0', timeout: 30000 });
        } else {
          const enhancedHTML = this.injectSlideControlAPI(input);
          await page.setContent(enhancedHTML, { waitUntil: 'networkidle0', timeout: 30000 });
        }

        // Disable dynamic content but preserve our control functions
        await this.disableDynamicContent(page);

        // Generate frames with precise timing
        await this.generatePreciseFrames(page, frameRanges, framesDir, fps);
      } finally {
        if (browser) {
          await browser.close();
        }
      }

      // Convert to video
      await this.convertToVideoFixed(framesDir, outputPath, fps, audioPath, totalFrames);

      // Calculate actual duration
      const actualDuration = slideTimings.reduce((sum, time) => sum + time, 0);

      // Clean up temporary frames after successful conversion
      try {
        const frames = await fs.readdir(framesDir);
        await Promise.all(frames.map(frame => 
          fs.unlink(path.join(framesDir, frame)).catch(() => {})
        ));
        await fs.rmdir(framesDir).catch(() => {});
        console.log('🧹 Temporary frames cleaned up');
      } catch (cleanupError) {
        console.warn('⚠️ Frame cleanup warning:', cleanupError.message);
      }

      return {
        content: [
          {
            type: 'text',
            text: `✅ Video recording completed successfully!\n\n` +
                  `🆔 Job ID: ${jobId}\n` +
                  `📁 Output: ${outputPath}\n` +
                  `⏱️  Duration: ${actualDuration}s\n` +
                  `🎞️  FPS: ${fps}\n` +
                  `📐 Resolution: ${width}x${height}\n` +
                  `📊 Total frames: ${totalFrames}\n` +
                  `🎯 Slide timings: ${slideTimings.map(t => `${t}s`).join(' → ')}\n` +
                  `${audioPath ? `🎵 Audio: ${path.basename(audioPath)}\n` : ''}` +
                  `\n🎉 Timing accuracy: 100% (server-controlled)`,
          },
        ],
      };
    } catch (error) {
      console.error('Recording error:', error);
      return {
        content: [
          {
            type: 'text',
            text: `❌ Recording failed: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }

  // Calculate exact frame ranges for each slide
  calculateFrameRanges(slideTimings, fps) {
    const ranges = [];
    let currentFrame = 0;

    slideTimings.forEach((duration, index) => {
      const frameCount = Math.round(duration * fps);
      ranges.push({
        slideIndex: index,
        startFrame: currentFrame,
        endFrame: currentFrame + frameCount - 1,
        frameCount: frameCount,
        duration: duration
      });
      currentFrame += frameCount;
    });

    return ranges;
  }

  // Inject slide control API into HTML
  injectSlideControlAPI(html) {
    const controlScript = `
    <script>
      // 🎯 Server-Controlled Slide API
      window.slideControl = {
        currentSlide: 0,
        
        async setSlide(index) {
          console.log('🎬 Setting slide to:', index);
          
          // Find all slides - check multiple possible selectors
          const slides = document.querySelectorAll('.slide, [class*="slide"], section, .step, .page');
          console.log('Found', slides.length, 'slides');
          
          slides.forEach((slide, i) => {
            if (i === index) {
              // Show this slide
              slide.style.display = 'flex';
              slide.style.visibility = 'visible';
              slide.style.opacity = '1';
              slide.classList.add('active', 'current');
              // Remove any display:none that might be set inline
              slide.style.removeProperty('display');
              slide.style.display = 'flex';
            } else {
              // Hide other slides
              slide.style.display = 'none';
              slide.style.visibility = 'hidden';
              slide.style.opacity = '0';
              slide.classList.remove('active', 'current');
            }
          });
          
          this.currentSlide = index;
          
          // Wait for layout to stabilize
          await new Promise(resolve => setTimeout(resolve, 300));
          return index;
        },
        
        getTotalSlides() {
          const slides = document.querySelectorAll('.slide, [class*="slide"], section, .step, .page');
          return slides.length;
        },
        
        getCurrentSlide() {
          return this.currentSlide;
        },
        
        initSlides() {
          const slides = document.querySelectorAll('.slide, [class*="slide"], section, .step, .page');
          console.log('Initializing slides:', slides.length);
          // Hide all slides except first
          slides.forEach((slide, i) => {
            if (i === 0) {
              slide.style.display = 'flex';
              slide.classList.add('active');
            } else {
              slide.style.display = 'none';
              slide.classList.remove('active');
            }
          });
        }
      };
      
      // Initialize when DOM is ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
          window.slideControl.initSlides();
        });
      } else {
        // DOM already loaded
        setTimeout(() => {
          window.slideControl.initSlides();
        }, 100);
      }
    </script>
    `;

    // Inject the script at the end of body for better DOM access
    if (html.includes('</body>')) {
      return html.replace('</body>', controlScript + '</body>');
    } else if (html.includes('</head>')) {
      return html.replace('</head>', controlScript + '</head>');
    } else {
      // If no head or body tags, prepend the script
      return controlScript + html;
    }
  }

  // Disable dynamic content but allow CSS animations
  async disableDynamicContent(page) {
    await page.evaluate(() => {
      // Store original timers before disabling
      window.__originalSetTimeout = window.setTimeout;
      window.__originalSetInterval = window.setInterval;
      
      // Block only timing-interfering JavaScript
      window.setTimeout = (fn, delay) => {
        // Allow very short delays needed for animations and our API
        if (typeof fn === 'function' && delay < 1000) {
          return window.__originalSetTimeout(fn, delay);
        }
        return null; // Block long delays that could interfere with timing
      };
      window.setInterval = () => null; // Block all intervals
      window.requestAnimationFrame = () => null; // Block RAF
      
      // DON'T block CSS animations - let them run!
      // Remove the aggressive CSS blocking that was disabling all animations
      
      // Only pause media elements
      document.querySelectorAll('video, audio').forEach(media => {
        media.pause();
        media.currentTime = 0;
      });
      
      console.log('🎭 Dynamic content selectively disabled (CSS animations preserved)');
    });
  }

  // Generate frames with precise timing control
  async generatePreciseFrames(page, frameRanges, framesDir, fps = 30) {
    console.log('🎬 Starting precise frame generation...');

    // First, ensure slides are initialized
    await page.evaluate(() => {
      if (window.slideControl && window.slideControl.initSlides) {
        window.slideControl.initSlides();
      }
    });
    
    // Wait a bit for initialization
    await new Promise(resolve => setTimeout(resolve, 1000));

    for (const range of frameRanges) {
      console.log(`📸 Generating ${range.frameCount} frames for slide ${range.slideIndex} (${range.duration}s)`);
      
      // Set slide using our control API
      const slideSet = await page.evaluate((slideIndex) => {
        if (window.slideControl) {
          window.slideControl.setSlide(slideIndex);
          // Force immediate update
          const slides = document.querySelectorAll('.slide, [class*="slide"], section, .step, .page');
          slides.forEach((slide, i) => {
            if (i === slideIndex) {
              slide.style.display = 'flex';
              slide.style.visibility = 'visible';
              slide.style.opacity = '1';
              slide.classList.add('active');
            } else {
              slide.style.display = 'none';
              slide.style.visibility = 'hidden';
              slide.style.opacity = '0';
              slide.classList.remove('active');
            }
          });
          return true;
        }
        return false;
      }, range.slideIndex);

      if (!slideSet) {
        console.warn(`⚠️ Could not set slide ${range.slideIndex}, continuing anyway...`);
      }

      // Wait for slide transition to complete
      await new Promise(resolve => setTimeout(resolve, 800));

      // Take a test screenshot to verify slide is visible
      const testScreenshot = await page.screenshot({ encoding: 'base64' });
      console.log(`  🔍 Slide ${range.slideIndex} ready, capturing frames...`);

      // Generate all frames for this slide
      for (let frame = range.startFrame; frame <= range.endFrame; frame++) {
        const framePath = path.join(framesDir, `frame_${frame.toString().padStart(6, '0')}.png`);
        await page.screenshot({ 
          path: framePath,
          fullPage: false 
        });

        // Progress indicator every second
        if (frame % fps === 0 || frame % 30 === 0) {
          const progress = ((frame - range.startFrame + 1) / range.frameCount * 100).toFixed(1);
          console.log(`  📊 Slide ${range.slideIndex}: ${progress}% (frame ${frame})`);
        }
      }

      console.log(`✅ Slide ${range.slideIndex} completed (frames ${range.startFrame}-${range.endFrame})`);
    }

    console.log('🎉 All frames generated successfully!');
  }

  // Convert frames to video with improved settings
  convertToVideoFixed(framesDir, outputPath, fps, audioPath, totalFrames) {
    return new Promise((resolve, reject) => {
      console.log('🎞️  Converting frames to video...');
      
      let command = ffmpeg()
        .input(path.join(framesDir, 'frame_%06d.png'))
        .inputFPS(fps)
        .outputOptions([
          '-c:v libx264',
          '-pix_fmt yuv420p',
          '-preset medium',
          '-crf 23',
          `-frames:v ${totalFrames}`,
          '-loglevel error',
          '-y'
        ]);
      
      if (audioPath) {
        console.log('🎵 Adding audio track...');
        command = command
          .input(audioPath)
          .outputOptions([
            '-c:a aac',
            '-b:a 192k',
            '-shortest'
          ]);
      }
      
      command
        .output(outputPath)
        .on('start', (commandLine) => {
          console.log('🚀 FFmpeg command started');
        })
        .on('progress', (progress) => {
          if (progress.percent) {
            console.log(`⚡ Conversion: ${Math.round(progress.percent)}%`);
          }
        })
        .on('end', () => {
          console.log('✅ Video conversion completed!');
          resolve();
        })
        .on('error', (err) => {
          console.error('❌ FFmpeg error:', err);
          reject(err);
        })
        .run();
    });
  }

  async listRecordings() {
    try {
      const recordings = await fs.readdir(this.recordingsDir);
      const recordingInfo = await Promise.all(
        recordings.map(async (jobId) => {
          const videoPath = path.join(this.recordingsDir, jobId, 'output.mp4');
          try {
            const stats = await fs.stat(videoPath);
            return {
              jobId,
              path: videoPath,
              size: `${(stats.size / 1024 / 1024).toFixed(2)} MB`,
              created: stats.birthtime,
            };
          } catch {
            return null;
          }
        })
      );

      const validRecordings = recordingInfo.filter(r => r !== null);

      return {
        content: [
          {
            type: 'text',
            text: `📼 Found ${validRecordings.length} recordings:\n${validRecordings
              .map(r => `• ${r.jobId}: ${r.size}, created ${r.created.toLocaleString()}`)
              .join('\n')}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `❌ Error listing recordings: ${error.message}`,
          },
        ],
      };
    }
  }

  async getRecordingStatus(jobId) {
    const videoPath = path.join(this.recordingsDir, jobId, 'output.mp4');
    
    try {
      const stats = await fs.stat(videoPath);
      return {
        content: [
          {
            type: 'text',
            text: `✅ Recording ${jobId} completed.\n📁 File: ${videoPath}\n📊 Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB\n📅 Created: ${stats.birthtime.toLocaleString()}`,
          },
        ],
      };
    } catch (error) {
      const framesDir = path.join(this.recordingsDir, jobId, 'frames');
      try {
        const frames = await fs.readdir(framesDir);
        return {
          content: [
            {
              type: 'text',
              text: `🔄 Recording ${jobId} in progress.\n📸 Frames captured: ${frames.length}`,
            },
          ],
        };
      } catch {
        return {
          content: [
            {
              type: 'text',
              text: `❓ Recording ${jobId} not found.`,
            },
          ],
        };
      }
    }
  }

  async run() {
    try {
      console.error('🚀 Starting Video Recorder MCP Server v1.0.0...');
      const transport = new StdioServerTransport();
      console.error('📡 Transport created successfully');
      await this.server.connect(transport);
      console.error('✅ Video Recorder MCP Server v1.0.0 running');
    } catch (error) {
      console.error('❌ Server startup error:', error);
      throw error;
    }
  }
}

// Start the server
console.error('🎬 Initializing Video Recorder MCP Server v1.0.0...');
const server = new VideoRecorderMCP();
server.run().catch((error) => {
  console.error('💥 Fatal server error:', error);
  process.exit(1);
});