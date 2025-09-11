# Basic HTML Recording Example

This example shows how to record simple HTML content as a video.

## HTML Content

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Basic Example</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0;
            padding: 50px;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
        }
        .container {
            text-align: center;
            max-width: 600px;
        }
        h1 {
            font-size: 3em;
            margin-bottom: 20px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        p {
            font-size: 1.3em;
            line-height: 1.6;
            margin-bottom: 30px;
        }
        .highlight {
            background-color: rgba(255,255,255,0.2);
            padding: 10px 20px;
            border-radius: 25px;
            display: inline-block;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Welcome to Video Recorder MCP!</h1>
        <p>This is a simple example of converting HTML content into a beautiful video.</p>
        <div class="highlight">
            Perfect for tutorials, presentations, and content creation!
        </div>
    </div>
</body>
</html>
```

## MCP Tool Call

```javascript
// Using the record_html_to_video tool
{
  "html": "<!DOCTYPE html><html lang=\"en\"><head><meta charset=\"UTF-8\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\"><title>Basic Example</title><style>body{font-family:'Arial',sans-serif;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);margin:0;padding:50px;min-height:100vh;display:flex;align-items:center;justify-content:center;color:white}.container{text-align:center;max-width:600px}h1{font-size:3em;margin-bottom:20px;text-shadow:2px 2px 4px rgba(0,0,0,0.3)}p{font-size:1.3em;line-height:1.6;margin-bottom:30px}.highlight{background-color:rgba(255,255,255,0.2);padding:10px 20px;border-radius:25px;display:inline-block}</style></head><body><div class=\"container\"><h1>Welcome to Video Recorder MCP!</h1><p>This is a simple example of converting HTML content into a beautiful video.</p><div class=\"highlight\">Perfect for tutorials, presentations, and content creation!</div></div></body></html>",
  "outputPath": "./output/basic-example.mp4",
  "duration": 5,
  "preset": "youtube",
  "fps": 2
}
```

## Expected Output

- **File**: `./output/basic-example.mp4`
- **Duration**: 5 seconds
- **Resolution**: 1920x1080 (YouTube preset)
- **Frame Rate**: 2 FPS
- **Content**: Static display of the styled HTML page

## Use Cases

This basic example is perfect for:
- Welcome messages
- Simple announcements  
- Text-based content presentation
- Quick tutorials or explanations
- Social media posts with text content