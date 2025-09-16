# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-01-16

### 🎉 Public Release - Production Ready

### Added
- **Precise Slide Timing Control**: New `slideTimings` array parameter for exact control of each slide duration
- **Server-Controlled Timing**: Server-side timing mechanism ensures perfect accuracy
- **Multi-Slide Support**: Automatic detection and control of slides in HTML content
- **Slide Control API**: Injectable JavaScript API for managing slide transitions
- **Enhanced Frame Generation**: Precise frame-by-frame capture based on timing arrays
- **Smart Cleanup**: Automatic removal of temporary frame files after video generation
- **Input Validation**: Comprehensive validation for all input parameters
- **Duration Limits**: 5-minute maximum to prevent resource abuse

### Improved
- **Memory Management**: Better browser cleanup with try-finally blocks
- **Error Handling**: More robust error recovery and reporting
- **CSS Animation Support**: Preserves animations while controlling timing
- **Browser Timeout**: Increased timeout for complex pages (3 minutes)
- **Frame Accuracy**: 100% timing accuracy with server control

### Fixed
- **White Screen Issues**: Fixed slide transition problems causing blank frames
- **Memory Leaks**: Proper browser closure in all scenarios
- **Slide Detection**: Improved selector matching for various HTML structures
- **DOM Loading**: Better initialization timing for slide control

### Security
- Input sanitization and validation
- Maximum duration enforcement (300 seconds)
- Resource cleanup on errors
- Safe file path handling

### Technical Details
- MCP SDK 0.5.0 compatibility
- Puppeteer 22.15.0 with headless Chrome
- FFmpeg integration for video encoding
- UUID-based job management
- Node.js 18+ requirement

## [0.9.0] - 2025-01-15 (Beta)

### Added
- Beta testing of slideTimings feature
- Initial server-controlled timing implementation
- Basic slide detection algorithm

## [0.1.0] - 2025-01-14 (Alpha)

### Added
- Initial development version
- Basic HTML to video recording
- Simple duration-based recording
- FFmpeg integration setup
- MCP server foundation