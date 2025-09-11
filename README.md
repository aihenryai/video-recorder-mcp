# Video Recorder MCP

A Model Context Protocol (MCP) server for recording HTML content and URLs as videos with advanced customization options.

## 🎬 Features

- **HTML to Video**: Convert HTML content directly to video
- **URL Recording**: Capture any webpage as video content  
- **Multiple Presets**: YouTube, Instagram, TikTok, and custom formats
- **Audio Support**: Add background audio tracks to videos
- **Subtitle Support**: Embed text overlays and captions
- **Customizable Output**: Control dimensions, FPS, and quality
- **Screenshot-based**: Uses Puppeteer for high-quality rendering
- **FFmpeg Integration**: Professional video encoding and processing

## 🛠 Requirements

### System Dependencies
- **Node.js** 18.0.0 or higher
- **FFmpeg** (required for video processing)
- **Chromium/Chrome** (installed automatically with Puppeteer)

### FFmpeg Installation
```bash
# Ubuntu/Debian
sudo apt update && sudo apt install ffmpeg

# macOS with Homebrew
brew install ffmpeg

# Windows with Chocolatey
choco install ffmpeg
```

## 📦 Installation

### Option 1: Clone Repository
```bash
git clone https://github.com/aihenryai/video-recorder-mcp.git
cd video-recorder-mcp
npm install
```

### Option 2: NPM Package (coming soon)
```bash
npm install -g video-recorder-mcp
```

## 🚀 Usage

### With Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "video-recorder": {
      "command": "node",
      "args": ["/path/to/video-recorder-mcp/src/index.js"],
      "env": {}
    }
  }
}
```

### Standalone Usage
```bash
npm start
# or
node src/index.js
```

## 🎯 Available Tools

### 1. record_html_to_video
Convert HTML content to video format.

**Parameters:**
- `html` (required): HTML content to record
- `outputPath` (required): Output video file path
- `duration`: Recording duration in seconds (default: 5)
- `fps`: Frames per second (default: 2)
- `width`: Video width in pixels (default: 1920)
- `height`: Video height in pixels (default: 1080)
- `preset`: Video preset - "youtube", "instagram", "tiktok", "custom" (default: "youtube")
- `audioPath`: Optional background audio file path
- `subtitles`: Optional subtitles text

### 2. record_url_to_video
Record any webpage URL as video.

**Parameters:**
- `url` (required): URL to record
- `outputPath` (required): Output video file path
- `duration`: Recording duration in seconds (default: 10)
- `fps`: Frames per second (default: 2) 
- `width`: Video width in pixels (default: 1920)
- `height`: Video height in pixels (default: 1080)
- `preset`: Video preset (default: "youtube")
- `audioPath`: Optional background audio file path
- `subtitles`: Optional subtitles text

## 📐 Presets

| Preset | Resolution | Aspect Ratio | Use Case |
|--------|------------|--------------|----------|
| youtube | 1920×1080 | 16:9 | YouTube videos |
| instagram | 1080×1080 | 1:1 | Instagram posts |
| tiktok | 1080×1920 | 9:16 | TikTok/Stories |
| custom | User-defined | Custom | Custom requirements |

## 💡 Example Usage

### Simple HTML Recording
```javascript
// Through MCP client (like Claude)
record_html_to_video({
  html: "<h1>Hello World!</h1><p>This is a test video.</p>",
  outputPath: "./output/hello-world.mp4",
  duration: 5,
  preset: "youtube"
})
```

### URL Recording with Audio
```javascript
record_url_to_video({
  url: "https://example.com",
  outputPath: "./output/website-demo.mp4",
  duration: 10,
  audioPath: "./audio/background-music.mp3",
  preset: "instagram"
})
```

### Advanced HTML with Subtitles
```javascript
record_html_to_video({
  html: `
    <div style="font-family: Arial; text-align: center; padding: 50px;">
      <h1>Product Demo</h1>
      <p>This is our amazing new feature!</p>
    </div>
  `,
  outputPath: "./output/product-demo.mp4",
  duration: 8,
  width: 1920,
  height: 1080,
  fps: 3,
  subtitles: "Welcome to our product demo - showcasing new features",
  audioPath: "./audio/demo-music.mp3"
})
```

## 🏗 Architecture

```
Video Recorder MCP
├── Browser Control (Puppeteer)
│   ├── HTML Rendering
│   ├── Screenshot Capture
│   └── Dynamic Content Handling
├── Video Processing (FFmpeg)
│   ├── Frame Sequence Conversion
│   ├── Audio Track Mixing
│   └── Subtitle Overlay
└── MCP Protocol Interface
    ├── Tool Registration
    ├── Parameter Validation
    └── Error Handling
```

## 🔧 Configuration

### Environment Variables
- `PUPPETEER_EXECUTABLE_PATH`: Custom Chrome/Chromium path
- `FFMPEG_PATH`: Custom FFmpeg binary path
- `TEMP_DIR`: Custom temporary directory (default: system temp)

### Performance Tuning
For better performance on servers:
```bash
export PUPPETEER_ARGS="--no-sandbox --disable-dev-shm-usage"
```

## 🐛 Troubleshooting

### Common Issues

**FFmpeg not found:**
```bash
# Verify FFmpeg installation
ffmpeg -version

# Add to PATH if needed (Linux/macOS)
export PATH=$PATH:/usr/local/bin
```

**Puppeteer Chrome issues:**
```bash
# Install dependencies (Ubuntu)
sudo apt install -y gconf-service libasound2 libatk1.0-0 libc6 libcairo2 \
  libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 \
  libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 \
  libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 \
  libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 \
  libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation \
  libappindicator1 libnss3 lsb-release xdg-utils wget
```

**Memory issues with large videos:**
- Reduce FPS (use 1-2 for most cases)
- Decrease video dimensions
- Split long recordings into segments

## 🤝 Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes with tests
4. Submit a pull request

### Development Setup
```bash
git clone https://github.com/aihenryai/video-recorder-mcp.git
cd video-recorder-mcp
npm install
npm run dev  # Watch mode for development
```

## 📋 Roadmap

- [ ] **Real-time Streaming**: WebRTC integration for live recording
- [ ] **AI Optimization**: Intelligent frame sampling and quality optimization  
- [ ] **React/Vue Support**: Direct framework rendering capabilities
- [ ] **Cloud Storage**: Direct upload to AWS S3, Google Drive, etc.
- [ ] **Batch Processing**: Multiple URL/HTML recording in parallel
- [ ] **Custom Transitions**: Slide transitions and effects
- [ ] **Interactive Elements**: Click simulation and form filling
- [ ] **Mobile Responsiveness**: Device emulation and responsive testing

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Repository**: https://github.com/aihenryai/video-recorder-mcp
- **Issues**: https://github.com/aihenryai/video-recorder-mcp/issues
- **MCP Documentation**: https://modelcontextprotocol.io/docs
- **NPM Package**: (coming soon)

## 🙏 Acknowledgments

- Built with the [Model Context Protocol](https://modelcontextprotocol.io/)
- Powered by [Puppeteer](https://pptr.dev/) for browser automation
- Video processing by [FFmpeg](https://ffmpeg.org/)
- Developed for the Claude AI ecosystem

---

**Made with ❤️ for the AI and automation community**