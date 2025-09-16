# 🎬 Video Recorder MCP

An MCP (Model Context Protocol) server for recording HTML content and URLs to video files with precise timing control.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org)
[![MCP SDK](https://img.shields.io/badge/MCP-SDK-blue)](https://github.com/modelcontextprotocol/sdk)

## ✨ Features

- 🎯 **Precise Timing Control** - Define exact duration for each slide/section
- 📹 **HTML to Video** - Convert any HTML content to MP4 videos
- 🌐 **URL Recording** - Record any website or web application
- 🎵 **Audio Support** - Add background music or narration to recordings  
- 🎞️ **High Quality** - Configurable resolution and frame rate (up to 1080p, 60fps)
- 🎨 **Animation Support** - Preserves CSS animations and transitions
- 📁 **Organized Output** - Automatic file management with unique job IDs

## 📋 Prerequisites

### Required Software
- **Node.js** >= 18.0.0
- **npm** >= 8.0.0
- **FFmpeg** - Must be installed and accessible in PATH

### Installing FFmpeg

#### Windows
```bash
# Using Chocolatey
choco install ffmpeg

# Or download from: https://ffmpeg.org/download.html
```

#### macOS
```bash
# Using Homebrew
brew install ffmpeg
```

#### Linux
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install ffmpeg

# Fedora
sudo dnf install ffmpeg

# Arch
sudo pacman -S ffmpeg
```

## 🚀 Installation

1. **Clone the repository**
```bash
git clone https://github.com/aihenryai/video-recorder-mcp.git
cd video-recorder-mcp
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure Claude Desktop**

Add to your Claude Desktop configuration file:

**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Linux**: `~/.config/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "video-recorder": {
      "command": "node",
      "args": ["C:/path/to/video-recorder-mcp/src/index.js"],
      "env": {}
    }
  }
}
```

4. **Start the server**
```bash
npm start
```

For development with auto-restart:
```bash
npm run dev
```

## 📖 Usage

### Basic Recording with Multiple Slides

```javascript
// Record a presentation with different timing for each slide
record_html_to_video({
  input: `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        .slide {
          display: none;
          width: 100vw;
          height: 100vh;
          font-family: Arial;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 3em;
        }
        .slide:first-child { display: flex; background: #FF6B6B; }
        .slide:nth-child(2) { background: #4ECDC4; }
        .slide:nth-child(3) { background: #45B7D1; }
      </style>
    </head>
    <body>
      <div class="slide">Welcome - 3 seconds</div>
      <div class="slide">Main Content - 5 seconds</div>
      <div class="slide">Thank You - 2 seconds</div>
    </body>
    </html>
  `,
  slideTimings: [3, 5, 2],  // Duration for each slide in seconds
  fps: 30,
  width: 1920,
  height: 1080
})
```

### Recording a Website with Audio

```javascript
record_html_to_video({
  input: "https://example.com",
  slideTimings: [5, 10, 5],  // Different sections of the page
  audioPath: "C:/path/to/narration.mp3",
  fps: 30,
  width: 1920,
  height: 1080
})
```

### Single Page Recording

```javascript
// For a single static page, use one timing value
record_html_to_video({
  input: "<h1>Hello World</h1>",
  slideTimings: [10],  // Record for 10 seconds
  fps: 24,
  width: 1280,
  height: 720
})
```

## 🔧 API Reference

### Tools

#### `record_html_to_video`
Records HTML content or URL to a video file with precise timing control.

**Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `input` | string | Yes | - | HTML content or URL to record |
| `slideTimings` | array | No | [10] | Duration in seconds for each slide/section |
| `fps` | number | No | 30 | Frames per second (1-60) |
| `width` | number | No | 1920 | Video width in pixels |
| `height` | number | No | 1080 | Video height in pixels |
| `audioPath` | string | No | - | Path to audio file (mp3/wav) |

**Returns:**
```javascript
{
  jobId: "unique-job-id",
  outputPath: "/path/to/output.mp4",
  duration: 15,  // Total duration in seconds
  slideTimings: [3, 5, 7],
  resolution: "1920x1080",
  fps: 30
}
```

#### `list_recordings`
Lists all available recordings with metadata.

**Returns:**
```javascript
[
  {
    jobId: "job-id",
    path: "/path/to/video.mp4",
    size: "12.5 MB",
    created: "2025-01-16T10:30:00Z"
  }
]
```

#### `get_recording_status`
Gets the status of a specific recording job.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `jobId` | string | Yes | The job ID to check |

## 🎯 How It Works

1. **Content Loading**: The server loads your HTML or navigates to the URL
2. **Slide Detection**: Automatically detects slides/sections in your content
3. **Frame Generation**: Captures screenshots at the specified FPS for each slide
4. **Timing Control**: Server-side control ensures precise timing for each section
5. **Video Encoding**: FFmpeg combines frames into a high-quality MP4 video
6. **Audio Mixing**: Optional audio track is synchronized with the video

## 📁 Project Structure

```
video-recorder-mcp/
├── src/
│   └── index.js           # Main MCP server implementation
├── recordings/            # Output directory for videos
│   └── [job-id]/         # Each recording in its own folder
│       ├── frames/       # Temporary frame storage
│       └── output.mp4    # Final video file
├── package.json          # Dependencies and scripts
├── LICENSE              # MIT License
├── .gitignore          # Git ignore rules
└── README.md           # This file
```

## ⚙️ Configuration

### Limitations
- Maximum video duration: 5 minutes (300 seconds)
- Maximum resolution: 4K (3840x2160)
- Supported audio formats: MP3, WAV, AAC

### Performance Tips
- Lower FPS (24-30) for presentations
- Higher FPS (60) for animations
- Optimize HTML/CSS for better performance
- Pre-compress audio files

## 🐛 Troubleshooting

### Common Issues

#### FFmpeg not found
```
Error: FFmpeg not found in PATH
```
**Solution**: Install FFmpeg and ensure it's in your system PATH.

#### Browser launch failed
```
Error: Failed to launch browser
```
**Solution**: Install required dependencies:
```bash
# Ubuntu/Debian
sudo apt-get install -y libx11-xcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6

# Windows - Usually works out of the box
# macOS - Usually works out of the box
```

#### Memory issues with long recordings
**Solution**: Reduce FPS or resolution, or split into shorter segments.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Puppeteer](https://pptr.dev/) - Headless Chrome automation
- [FFmpeg](https://ffmpeg.org/) - Video processing
- [MCP SDK](https://github.com/modelcontextprotocol/sdk) - Model Context Protocol

## 📧 Support

For issues and questions, please [open an issue](https://github.com/aihenryai/video-recorder-mcp/issues) on GitHub.

---

**Made with ❤️ by Henry**