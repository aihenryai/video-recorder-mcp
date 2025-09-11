# Source Code

This directory contains the main implementation of the Video Recorder MCP server.

## Files

- `index.js` - Main server implementation with all MCP tools and video recording logic

## Architecture

The server implements the Model Context Protocol (MCP) with the following tools:
- `record_html_to_video` - Convert HTML content to video
- `record_url_to_video` - Record webpage URLs as video
- `record_file_to_video` - Record local files as video
- `check_ffmpeg_status` - Verify FFmpeg installation
- `get_environment_info` - Get system information

The implementation uses Puppeteer for browser automation and FFmpeg for video processing.