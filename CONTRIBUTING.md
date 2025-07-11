# Contributing to RealtorAI

First off, thank you for considering contributing to RealtorAI! It's people like you that make RealtorAI such a great tool for real estate professionals.

## Table of Contents
- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Style Guidelines](#style-guidelines)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)
- [Community](#community)

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code:

- Use welcoming and inclusive language
- Be respectful of differing viewpoints and experiences
- Gracefully accept constructive criticism
- Focus on what is best for the community
- Show empathy towards other community members

## Getting Started

1. Fork the repository on GitHub
2. Clone your fork locally
3. Create a new branch for your feature or fix
4. Make your changes
5. Push to your fork and submit a pull request

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates. When creating a bug report, include:

- A clear and descriptive title
- Steps to reproduce the issue
- Expected behavior
- Actual behavior
- Screenshots (if applicable)
- Your environment details (browser, OS, etc.)

**Bug Report Template:**
```markdown
## Description
A clear description of the bug

## Steps to Reproduce
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

## Expected Behavior
What you expected to happen

## Actual Behavior
What actually happened

## Environment
- Browser: [e.g. Chrome 91]
- OS: [e.g. Windows 10]
- Device: [e.g. iPhone 12]
```

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

- A clear and descriptive title
- A detailed description of the proposed enhancement
- Explain why this enhancement would be useful
- List any alternative solutions you've considered

### Code Contributions

#### Local Development

```bash
# Clone your fork
git clone https://github.com/YOUR-USERNAME/realtor-ai.git
cd realtor-ai

# Install dependencies
npm install

# Create a new branch
git checkout -b feature/your-feature-name

# Start development server
npm run dev
```

#### Areas for Contribution

- **UI/UX Improvements**: Enhance the user interface
- **New Features**: Add new functionality
- **Bug Fixes**: Fix reported issues
- **Documentation**: Improve or translate documentation
- **Tests**: Add missing tests
- **Performance**: Optimize existing code
- **API Integrations**: Add new data sources

## Development Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- Git
- Modern web browser

### Environment Setup

1. Copy `.env.example` to `.env.local`
2. Add necessary API keys (see [API_GUIDE.md](API_GUIDE.md))
3. Configure feature flags as needed

### Running Tests

```bash
# Run unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Run linting
npm run lint

# Run type checking (if using TypeScript)
npm run type-check
```

## Style Guidelines

### JavaScript/React Style

- Use ES6+ features
- Prefer functional components with hooks
- Use meaningful variable and function names
- Keep components small and focused
- Use proper prop validation

**Example Component:**
```jsx
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const ExampleComponent = ({ title, onAction }) => {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Effect logic here
  }, []);

  const handleClick = async () => {
    setIsLoading(true);
    try {
      await onAction();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="example-component">
      <h2>{title}</h2>
      <button onClick={handleClick} disabled={isLoading}>
        {isLoading ? 'Loading...' : 'Click Me'}
      </button>
    </div>
  );
};

ExampleComponent.propTypes = {
  title: PropTypes.string.isRequired,
  onAction: PropTypes.func.isRequired
};

export default ExampleComponent;
```

### CSS/Tailwind Guidelines

- Use Tailwind utilities when possible
- Create custom components for repeated patterns
- Follow mobile-first approach
- Maintain consistent spacing

### File Organization

```
src/
├── components/        # Reusable components
│   ├── common/       # Shared components
│   ├── features/     # Feature-specific components
│   └── layouts/      # Layout components
├── context/          # React Context providers
├── hooks/            # Custom hooks
├── services/         # API and external services
├── utils/            # Helper functions
└── styles/           # Global styles
```

## Commit Messages

Follow the conventional commits specification:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

**Examples:**
```bash
feat: add market forecast component
fix: resolve API timeout issue in property search
docs: update API configuration guide
style: format code with prettier
refactor: simplify preference tracking logic
test: add unit tests for matching algorithm
chore: update dependencies
```

## Pull Request Process

1. **Before submitting:**
   - Ensure your code follows the style guidelines
   - Add tests for new functionality
   - Update documentation if needed
   - Run `npm run lint` and fix any issues
   - Test your changes thoroughly

2. **PR Description Template:**
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tested on desktop
- [ ] Tested on mobile
- [ ] Added/updated tests
- [ ] All tests pass

## Screenshots (if applicable)
Add screenshots here

## Related Issues
Closes #123
```

3. **Review Process:**
   - PRs require at least one review
   - Address review feedback promptly
   - Keep PRs focused and small when possible
   - Be patient and respectful

## Development Tips

### Working with APIs

When adding new API integrations:
1. Add configuration to `.env.example`
2. Create service file in `src/services/api/`
3. Implement error handling and retry logic
4. Add fallback for when API is unavailable
5. Update API_GUIDE.md with setup instructions

### Performance Considerations

- Use React.memo for expensive components
- Implement proper loading states
- Cache API responses appropriately
- Lazy load heavy components
- Optimize images and assets

### Testing Checklist

Before submitting a PR, test:
- [ ] Desktop browsers (Chrome, Firefox, Safari)
- [ ] Mobile browsers
- [ ] PWA functionality
- [ ] Offline mode
- [ ] Different screen sizes
- [ ] API error scenarios

## Community

### Getting Help

- Check the [documentation](./docs)
- Search existing issues
- Ask in discussions
- Join our Discord (if available)

### Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Project website (if applicable)

## Questions?

Feel free to:
- Open an issue for questions
- Start a discussion
- Reach out to maintainers

Thank you for contributing to RealtorAI! 🏠🤖