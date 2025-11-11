# Contributing to CleubAutomation

Thank you for your interest in contributing to CleubAutomation! This document provides guidelines and instructions for contributing.

## Code of Conduct

Please be respectful and professional in all interactions.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:

   ```bash
   git clone https://github.com/YOUR_USERNAME/CleubAutomation.git
   cd CleubAutomation
   ```

3. **Create a feature branch**:

   ```bash
   git checkout -b feature/your-feature-name
   ```

4. **Make your changes** and test thoroughly

5. **Commit with clear messages**:

   ```bash
   git commit -m "feat: add new feature"
   git commit -m "fix: resolve issue"
   git commit -m "docs: update documentation"
   ```

6. **Push to your fork**:

   ```bash
   git push origin feature/your-feature-name
   ```

7. **Create a Pull Request** on GitHub

## Commit Message Guidelines

Use conventional commits format:

- `feat:` - A new feature
- `fix:` - A bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, semicolons, etc.)
- `refactor:` - Code refactoring without feature changes
- `perf:` - Performance improvements
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

Example:

```
feat: add profile menu dropdown component

- Implement ProfileMenu component with avatar
- Add dropdown with View Profile, Settings, and Sign Out
- Integrate with AuthContext for user data
- Add profile dialog showing user information
```

## Code Style

- Use TypeScript for all new code
- Follow React best practices and hooks patterns
- Use functional components
- Keep components focused and reusable
- Add prop types using TypeScript interfaces
- Use Tailwind CSS for styling (no inline styles)

## Testing

Before submitting a PR:

- Test your changes locally: `npm run dev`
- Build for production: `npm run build`
- Check for TypeScript errors
- Test on mobile if UI changes were made

## Pull Request Process

1. Update README.md if needed
2. Add descriptions of your changes
3. Reference any related issues
4. Wait for review and address feedback
5. Ensure all checks pass before merge

## Reporting Issues

When reporting bugs, include:

- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Screenshots/videos if applicable
- Environment details (OS, browser, Node version)

## Questions?

Feel free to open a discussion or contact the maintainers.

Thank you for contributing!
