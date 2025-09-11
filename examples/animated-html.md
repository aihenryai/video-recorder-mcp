# Advanced HTML with Animations Example

This example demonstrates recording HTML content with CSS animations and dynamic effects.

## Animated HTML Content

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Animated Example</title>
    <style>
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        @keyframes pulse {
            0%, 100% {
                transform: scale(1);
            }
            50% {
                transform: scale(1.05);
            }
        }

        @keyframes colorShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 0;
            min-height: 100vh;
            background: linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab);
            background-size: 400% 400%;
            animation: colorShift 15s ease infinite;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .container {
            text-align: center;
            color: white;
            max-width: 800px;
            padding: 40px;
        }

        h1 {
            font-size: 4em;
            margin-bottom: 30px;
            animation: fadeInUp 2s ease-out;
            text-shadow: 2px 2px 8px rgba(0,0,0,0.3);
        }

        .subtitle {
            font-size: 1.5em;
            margin-bottom: 40px;
            animation: fadeInUp 2s ease-out 0.5s both;
        }

        .features {
            display: flex;
            justify-content: space-around;
            flex-wrap: wrap;
            gap: 30px;
            margin-top: 50px;
        }

        .feature {
            background: rgba(255, 255, 255, 0.15);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 30px;
            flex: 1;
            min-width: 200px;
            animation: fadeInUp 2s ease-out 1s both;
        }

        .feature h3 {
            font-size: 1.8em;
            margin-bottom: 15px;
            animation: pulse 2s infinite;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Video Recorder MCP</h1>
        <p class="subtitle">Transform your HTML into stunning videos</p>
        
        <div class="features">
            <div class="feature">
                <h3>🎬</h3>
                <h3>High Quality</h3>
                <p>Professional video output with customizable settings</p>
            </div>
            <div class="feature">
                <h3>⚡</h3>
                <h3>Fast Processing</h3>
                <p>Efficient rendering with optimized performance</p>
            </div>
            <div class="feature">
                <h3>🎨</h3>
                <h3>Full Customization</h3>
                <p>Complete control over output format and quality</p>
            </div>
        </div>
    </div>
</body>
</html>
```

## MCP Tool Call

```javascript
// Recording animated content with higher FPS for smooth motion
{
  "html": "[Minified HTML content above]",
  "outputPath": "./output/animated-demo.mp4",
  "duration": 12,
  "preset": "youtube",
  "fps": 4,
  "width": 1920,
  "height": 1080,
  "subtitles": "Professional HTML to Video conversion with stunning animations"
}
```

## Configuration Notes

### Optimal Settings for Animations

- **FPS**: Use 4-5 FPS for smooth animation capture
- **Duration**: Allow enough time for animations to complete (10-15 seconds)
- **Resolution**: Full HD (1920x1080) for crisp details

### Animation Considerations

1. **CSS Animations**: All standard CSS animations are supported
2. **Timing**: Consider animation duration when setting video length
3. **Performance**: Complex animations may require higher FPS
4. **Transitions**: Hover effects won't be captured (use CSS animations instead)

## Use Cases

Perfect for:
- **Product Demonstrations**: Showcase features with smooth animations
- **Brand Presentations**: Professional animated content
- **Educational Content**: Engaging visual explanations
- **Marketing Videos**: Eye-catching promotional content
- **Social Media**: Animated posts that stand out

## Advanced Tips

1. **Stagger Animations**: Use animation-delay for sequential effects
2. **Infinite Loops**: Great for continuous motion during recording
3. **Responsive Design**: Test animations at different viewport sizes
4. **Performance**: Optimize complex animations for better recording quality