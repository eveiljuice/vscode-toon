<div align="center">


# 🎨 Toon Language Support

**Full-featured VS Code extension for the TOON format**

[![VS Code](https://img.shields.io/badge/VS%20Code-1.85+-007ACC?logo=visual-studio-code)](https://code.visualstudio.com/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-3178C6?logo=typescript)](https://www.typescriptlang.org/)

[Features](#-features) • [Installation](#-installation) • [Usage](#-usage) • [Contributing](#-contributing) • [Examples](#-examples)

</div>

---

## 📋 About

**Toon Language Support** is a comprehensive [VS Code extension](https://marketplace.visualstudio.com/items?itemName=Timo1153.toon-lang&ssr=false#review-details) that provides syntax highlighting, validation, auto-completion, and formatting for the [TOON format](https://github.com/toon-format/toon) — a token-oriented data format optimized for LLM processing.

This extension transforms your VS Code into a powerful editor for `.toon` files, making it easy to work with tabular arrays, inline arrays, mixed arrays, and all TOON format features.

## ✨ Features

### 🎯 Core Capabilities

- **🔤 Full Syntax Highlighting**
  - Tabular arrays with field definitions
  - Inline arrays with comma/tab/pipe delimiters
  - Mixed arrays with list markers
  - Root-level arrays
  - Strings, numbers, booleans, and null values
  - Comments (single-line and block)

- **⚡ Smart Auto-completion**
  - Snippets for all array types
  - Property templates
  - Boolean and null value suggestions

- **✅ Real-time Validation**
  - Array length mismatch detection
  - Visual warnings in the editor
  - Configurable validation settings

- **🎨 Code Formatting**
  - Auto-indentation (2-space standard)
  - Consistent formatting rules
  - Format on save support

- **💡 Hover Information**
  - Detailed array information
  - Delimiter type display
  - Field definitions for tabular arrays

- **📁 File Icons**
  - Custom icon theme for `.toon` files
  - Visual file identification

## 🚀 Installation

### From VS Code Marketplace

1. Open VS Code
2. Go to Extensions (`Ctrl+Shift+X` / `Cmd+Shift+X`)
3. Search for "Toon Language Support"
4. Click **Install**

### From Source

```bash
# Clone the repository
git clone https://github.com/eveiljuice/vscode-toon.git
cd vscode-toon

# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Press F5 to run in Extension Development Host
```

## 📖 Usage

### Basic Workflow

1. Create or open a `.toon` file
2. Start typing — syntax highlighting activates automatically
3. Use `Ctrl+Space` for auto-completion
4. Use `Shift+Alt+F` to format your document
5. Hover over arrays to see detailed information

### Configuration

Add to your VS Code `settings.json`:

```json
{
  "toon.validation.enabled": true
}
```

## 💻 Examples

### Tabular Array

```toon
users[3]{id,name,email,plan,active}:
  1,Alice Mitchell,alice@mitchell.com,Premium,true
  2,Michael Chen,michael.chen@example.com,Basic,true
  3,Jennifer Kumar,jennifer.kumar@example.com,Enterprise,false
```

### Inline Array

```toon
tags[2]: analytics,notifications
features[3]: search,filter,sort
```

### Mixed Array

```toon
items[3]:
  - 1
  - a: 1
  - x
```

### Root Array

```toon
[2]: x,y
```

### Custom Delimiters

**Tab delimiter:**
```toon
items[2\t]{sku\tqty\tprice}:
  A1\t2\t9.99
  B2\t1\t14.5
```

**Pipe delimiter:**
```toon
data[2|]{name|value}:
  Alice|admin
  Bob|user
```

### Validation Example

The extension automatically validates array declarations:

```toon
users[3]{id,name}:  // ⚠️ Warning: declared 3 but has 2 items
  1,Alice
  2,Bob
```

## 🏗️ Project Structure

```
vscode-toon/
├── src/
│   └── extension.ts          # Main extension logic
├── syntaxes/
│   └── toon.tmLanguage.json  # TextMate grammar for syntax highlighting
├── icons/
│   ├── toon-icon.svg         # Custom icon for .toon files
│   └── toon-icon-theme.json  # Icon theme configuration
├── language-configuration.json # Language configuration (comments, brackets, etc.)
├── package.json              # Extension manifest
├── tsconfig.json             # TypeScript configuration
└── README.md                 # This file
```

## 🤝 Contributing

Im welcome contributions! Here's how you can help:

### Getting Started

1. **Fork the repository**
   ```bash
   git clone https://github.com/eveiljuice/vscode-toon.git
   cd vscode-toon
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Make your changes**
   - Edit files in `src/` for extension logic
   - Edit `syntaxes/toon.tmLanguage.json` for syntax highlighting
   - Edit `language-configuration.json` for language features

4. **Test your changes**
   ```bash
   npm run compile
   # Press F5 in VS Code to launch Extension Development Host
   ```

5. **Submit a Pull Request**
   - Create a new branch: `git checkout -b feature/your-feature-name`
   - Commit your changes: `git commit -m "Add: your feature description"`
   - Push to your fork: `git push origin feature/your-feature-name`
   - Open a PR on GitHub

### Development Guidelines

- **Code Style**: Follow TypeScript best practices
- **Testing**: Test your changes in Extension Development Host before submitting
- **Documentation**: Update README if adding new features
- **Commits**: Use clear, descriptive commit messages

### Areas for Contribution

- 🐛 **Bug fixes**: Report and fix issues
- ✨ **New features**: Add support for new TOON format features
- 📚 **Documentation**: Improve examples and documentation
- 🎨 **Syntax highlighting**: Enhance color schemes and highlighting
- ⚡ **Performance**: Optimize validation and formatting

### Reporting Issues

Found a bug? Have a feature request? [Open an issue](https://github.com/eveiljuice/vscode-toon/issues)!

Please include:
- VS Code version
- Extension version
- Steps to reproduce
- Expected vs actual behavior
- Sample `.toon` file (if applicable)

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- [TOON Format Specification](https://github.com/toon-format/toon)
- [VS Code Extension API](https://code.visualstudio.com/api)
- [TextMate Grammar Documentation](https://macromates.com/manual/en/language_grammars)

## 🙏 Acknowledgments

- Built for the [TOON format](https://github.com/toon-format/toon) community
- Inspired by modern token-oriented data formats

---

<div align="center">

**Made with ❤️ for the TOON community**

[⭐ Star this repo](https://github.com/eveiljuice/vscode-toon) • [🐛 Report Bug](https://github.com/eveiljuice/vscode-toon/issues) • [💡 Request Feature](https://github.com/eveiljuice/vscode-toon/issues)

</div>
