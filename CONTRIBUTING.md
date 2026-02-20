# Contributing to FashionAI Studio

Thank you for your interest in contributing to FashionAI Studio! This document provides guidelines and instructions for contributing.

## 🎯 Ways to Contribute

- 🐛 Report bugs and issues
- ✨ Suggest new features
- 📝 Improve documentation
- 🔧 Submit bug fixes
- 🚀 Add new features
- 🎨 Improve UI/UX
- ⚡ Optimize performance

## 📋 Before You Start

1. **Check existing issues** - Search for existing issues to avoid duplicates
2. **Discuss major changes** - Open an issue first for significant changes
3. **Follow code style** - Maintain consistency with existing code
4. **Write tests** - Include tests for new features

## 🔧 Development Setup

### 1. Fork & Clone

```bash
# Fork the repository on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/FashionAI.git
cd FashionAI
```

### 2. Set Up Services

#### AI Service (Python)
```bash
cd services/ai-service
python -m venv .venv
.venv\Scripts\activate  # Windows
source .venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
pip install -r requirements-dev.txt  # Development dependencies
```

#### Backend (Node.js)
```bash
cd services/backend
npm install
```

#### Frontend (React)
```bash
cd services/frontend
npm install
```

### 3. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

## 📝 Coding Standards

### Python (AI Service)
- Follow **PEP 8** style guide
- Use **type hints** where appropriate
- Write **docstrings** for functions and classes
- Max line length: **100 characters**
- Use **Black** for formatting: `black .`
- Use **flake8** for linting: `flake8 .`
- Run **pytest** for tests: `pytest tests/`

```python
def process_image(image_path: str, size: tuple[int, int] = (512, 512)) -> np.ndarray:
    """
    Process an image for AI model input.
    
    Args:
        image_path: Path to the image file
        size: Target size as (width, height)
        
    Returns:
        Processed image as numpy array
    """
    # Implementation here
    pass
```

### JavaScript/TypeScript (Backend & Frontend)
- Follow **ESLint** configuration
- Use **Prettier** for formatting
- Use **TypeScript** for type safety (frontend)
- Use **async/await** over promises
- Prefer **const** over let, avoid var
- Use **meaningful variable names**

```typescript
// Good
const fetchUserProfile = async (userId: string): Promise<User> => {
  const response = await api.get(`/users/${userId}`);
  return response.data;
};

// Avoid
var x = function(id) { return fetch('/users/' + id); }
```

### Git Commit Messages
Follow conventional commits format:

```
type(scope): subject

body (optional)

footer (optional)
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(ai-service): add outfit matching algorithm
fix(backend): resolve authentication token expiration
docs(readme): update installation instructions
refactor(frontend): simplify dashboard component structure
```

## 🧪 Testing

### Python Tests
```bash
cd services/ai-service
pytest tests/ -v
pytest tests/ --cov=app  # With coverage
```

### JavaScript Tests
```bash
cd services/backend
npm test

cd services/frontend
npm test
```

### Integration Tests
```bash
cd tests/integration
npm test
```

## 📤 Submitting Changes

### 1. Commit Your Changes
```bash
git add .
git commit -m "feat(scope): add amazing feature"
```

### 2. Push to Your Fork
```bash
git push origin feature/your-feature-name
```

### 3. Create Pull Request
1. Go to the original repository on GitHub
2. Click "New Pull Request"
3. Select your fork and branch
4. Fill in the PR template:
   - **Description**: What changes did you make?
   - **Motivation**: Why are these changes needed?
   - **Testing**: How did you test the changes?
   - **Screenshots**: Include if UI changes

### 4. PR Review Process
- Maintainers will review your PR
- Address any requested changes
- Once approved, your PR will be merged!

## 🐛 Reporting Bugs

Use the issue template and include:
- **Clear title** and description
- **Steps to reproduce** the bug
- **Expected behavior** vs actual behavior
- **Screenshots** if applicable
- **Environment details** (OS, versions, etc.)

## 💡 Suggesting Features

When suggesting features:
- **Search existing issues** first
- **Describe the problem** you're trying to solve
- **Propose a solution** with examples
- **Explain the benefits** to users

## 📜 Code of Conduct

- Be respectful and inclusive
- Welcome newcomers
- Focus on constructive feedback
- Help maintain a positive environment

## 📞 Questions?

- Open an issue for general questions
- Join our discussions on GitHub
- Check existing documentation

## 🙏 Thank You!

Your contributions make FashionAI Studio better for everyone. We appreciate your time and effort!

---

**Happy Coding! 🚀**
