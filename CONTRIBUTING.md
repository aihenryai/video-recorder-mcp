# Contributing to Video Recorder MCP

First off, thank you for considering contributing to Video Recorder MCP! It's people like you that make this tool better for everyone.

## Code of Conduct

By participating in this project, you agree to abide by our code of conduct:
- Be respectful and inclusive
- Welcome newcomers and help them get started
- Focus on constructive criticism
- Accept feedback gracefully

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates. When creating a bug report, include:

- A clear and descriptive title
- Steps to reproduce the issue
- Expected behavior vs actual behavior
- Your environment (OS, Node version, FFmpeg version)
- Screenshots or error messages if applicable
- Sample code that demonstrates the problem

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When suggesting an enhancement:

- Use a clear and descriptive title
- Provide a detailed description of the proposed feature
- Explain why this enhancement would be useful
- Include code examples if relevant

### Pull Requests

1. Fork the repo and create your branch from `main`
2. If you've added code that should be tested, add tests
3. Ensure your code follows the existing style
4. Update the documentation
5. Write a clear commit message

## Development Setup

```bash
# Clone your fork
git clone https://github.com/your-username/video-recorder-mcp.git
cd video-recorder-mcp

# Install dependencies
npm install

# Run in development mode
npm run dev
```

## Style Guidelines

### JavaScript Style

- Use ES6+ features when appropriate
- Use meaningful variable names
- Add comments for complex logic
- Keep functions small and focused
- Use async/await over callbacks

### Commit Messages

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters
- Reference issues and pull requests when relevant

Example:
```
Add slideTimings validation

- Validate slideTimings array is not empty
- Ensure all values are positive numbers
- Add maximum duration limit

Fixes #123
```

## Testing

Before submitting a PR:

1. Test basic HTML recording
2. Test URL recording
3. Test with audio
4. Test error cases
5. Verify no memory leaks

## Documentation

- Update README.md if you change functionality
- Add JSDoc comments for new functions
- Include examples for new features

## Questions?

Feel free to open an issue with the label "question" if you need help.

Thank you for contributing! 🎉