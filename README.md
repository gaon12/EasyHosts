# Easy Hosts

<div align="center">

  **Manage your local hosts entries efficiently**

  [![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/gaon12/easyhosts)
  [![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
  [![Built with Tauri](https://img.shields.io/badge/built%20with-Tauri-FFC131.svg)](https://tauri.app/)

</div>

---

## 📖 Overview

Easy Hosts is a modern cross-platform desktop application that simplifies management of the hosts file on Windows, Linux, and macOS. With an intuitive interface, powerful features, and automatic backups, Easy Hosts makes it easy to manage domain-to-IP mappings for local development, ad blocking, and network testing.

### Why Easy Hosts?

- **User-Friendly Interface**: Clean, modern UI with dark mode support
- **Safe Editing**: Automatic backups before every save
- **Multi-Language**: Support for English and Korean (한국어)
- **Profile Management**: Save and switch between different host configurations
- **Network Testing**: Built-in ping testing and DNS lookup
- **Smart Organization**: Tag-based filtering and duplicate detection
- **Version Control**: Undo/Redo support with 50-state history

---

## ✨ Features

### Core Features

- ✅ **Visual Hosts Editor**: Toggle entries on/off without deleting them
- ✅ **Bulk Management**: Add, edit, or delete multiple entries efficiently
- ✅ **Search & Filter**: Quick search and tag-based filtering
- ✅ **Duplicate Detection**: Automatically detect conflicting domain mappings
- ✅ **Network Tools**: Built-in ping test and DNS lookup

### Advanced Features

- 🔄 **Undo/Redo**: 50-state history with Ctrl+Z/Ctrl+Y support
- 💾 **Auto Backup**: Automatic backups on every save
- 📁 **Profile System**: Save and load different host configurations
- 🌐 **Multi-Language**: English and Korean language support
- 🎨 **Dark Mode**: Beautiful dark theme for late-night coding
- 📤 **Import/Export**: JSON and hosts file format support
- 🏷️ **Tag System**: Organize entries with custom tags

### Safety & Security

- 🔒 **Administrator Detection**: Warns if running without admin privileges
- 💾 **Automatic Backups**: Creates timestamped backups before changes
- ✅ **Input Validation**: Prevents invalid IP addresses and domains
- 🛡️ **XSS Protection**: Sanitizes all user input
- 📝 **Version Management**: Data format versioning for compatibility

---

## 🖼️ Screenshots

> 📸 *Screenshots coming soon*

---

## 🚀 Getting Started

### System Requirements

- **Operating System**:
  - Windows 10/11 (64-bit)
  - Linux (Ubuntu 20.04+, Fedora 35+, or equivalent)
  - macOS 11 Big Sur or later
- **Privileges**:
  - Windows: Administrator rights required for saving changes
  - Linux: Root or sudo privileges required
  - macOS: Sudo privileges required
- **Disk Space**: ~50MB

### Installation

#### Windows

1. **Download** the Windows installer (.msi or .exe) from the [Releases](https://github.com/gaon12/easyhosts/releases) page
2. **Run** the installer and follow the setup wizard
3. **Launch** Easy Hosts as Administrator (right-click → "Run as administrator")
4. **Follow** the onboarding tutorial on first launch

#### Linux

1. **Download** the appropriate package for your distribution:
   - `.deb` for Debian/Ubuntu
   - `.rpm` for Fedora/RHEL
   - `.AppImage` for universal Linux
2. **Install** the package:
   ```bash
   # For Debian/Ubuntu
   sudo dpkg -i easyhosts_*.deb

   # For Fedora/RHEL
   sudo rpm -i easyhosts_*.rpm

   # For AppImage
   chmod +x easyhosts_*.AppImage
   ```
3. **Run** with sudo:
   ```bash
   sudo easyhosts
   ```

#### macOS

1. **Download** the `.dmg` file from the [Releases](https://github.com/yourusername/easyhosts/releases) page
2. **Open** the DMG and drag Easy Hosts to Applications
3. **Run** from Terminal with sudo:
   ```bash
   sudo /Applications/EasyHosts.app/Contents/MacOS/EasyHosts
   ```

### Running with Elevated Privileges

To save changes to the hosts file, Easy Hosts must run with elevated privileges:

**Windows:**
- Right-click `EasyHosts.exe` → Select "Run as administrator"
- Or set permanent admin mode in Properties → Compatibility tab

**Linux:**
```bash
sudo easyhosts
```

**macOS:**
```bash
sudo /Applications/EasyHosts.app/Contents/MacOS/EasyHosts
```

---

## 📘 Usage Guide

### First Launch

On first launch, Easy Hosts displays an onboarding tutorial covering:
1. What is a hosts file?
2. Administrator privilege requirements
3. Automatic backup system
4. Basic navigation

### Adding a New Entry

1. Click the **"Add Entry"** button
2. Enter the **IP address** (e.g., `127.0.0.1`)
3. Enter one or more **domains** (space-separated)
4. Add an optional **comment** for documentation
5. Add optional **tags** for organization (comma-separated)
6. Click **"Add Entry"** or press **Ctrl+Enter**

**💡 Tip**: Click the DNS lookup button (🔍) to automatically resolve a domain to its IP address

### Editing Entries

- Click the **Edit** icon on any entry card
- Modify the fields as needed
- Click **"Save Changes"**

### Toggling Entries

- Click the **toggle switch** on any entry to enable/disable it
- Disabled entries are commented out in the hosts file (prefixed with `#`)

### Searching and Filtering

- Use the **search bar** to find entries by IP, domain, or comment
- Click **tags** in the filter bar to show only entries with those tags
- Click the **"Clear filters"** button to reset

### Managing Profiles

1. Open **Settings** → **"Manage Profiles"**
2. Click **"Create New Profile"** to save current configuration
3. Click a profile card to **activate** it
4. Use the **trash icon** to delete unwanted profiles

**Use Cases**:
- Development profile with local service mappings
- Production testing profile
- Ad-blocking profile
- Client-specific profiles

### Backups

Easy Hosts automatically creates a backup before every save. To restore:

1. Open **Settings** → **"Manage Backups"**
2. Select a backup from the list
3. Click **"Restore"** to revert to that backup

### Import/Export

**Export**:
1. Open **Settings** → **"Export"**
2. Choose format (JSON or Hosts file)
3. Select save location

**Import**:
1. Open **Settings** → **"Import"**
2. Select a JSON backup file
3. Choose **"Merge"** or **"Replace"** mode
4. Click **"Import"**

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Z` | Undo |
| `Ctrl+Y` or `Ctrl+Shift+Z` | Redo |
| `Ctrl+Enter` | Save entry in Add/Edit modal |
| `Escape` | Close modal |

---

## 🏗️ Architecture

### Technology Stack

**Frontend**:
- **React 19** - UI framework
- **TypeScript** - Type-safe development
- **Vite** - Build tool and dev server
- **CSS Variables** - Theme system

**Backend**:
- **Tauri 2** - Desktop application framework
- **Rust** - High-performance backend

**Key Libraries**:
- `lucide-react` - Icon library
- `@tauri-apps/plugin-dialog` - File dialogs
- `@tauri-apps/plugin-fs` - File system access

### Project Structure

```
EasyHosts/
├── src/
│   ├── components/         # React components
│   │   ├── AddEntryModal.tsx
│   │   ├── BackupModal.tsx
│   │   ├── EntryCard.tsx
│   │   ├── ExportModal.tsx
│   │   ├── Header.tsx
│   │   ├── ImportModal.tsx
│   │   ├── OnboardingModal.tsx
│   │   ├── PermissionModal.tsx
│   │   ├── ProfileModal.tsx
│   │   ├── SearchBar.tsx
│   │   ├── SectionHeader.tsx
│   │   └── SettingsModal.tsx
│   ├── contexts/           # React contexts
│   │   └── LanguageContext.tsx
│   ├── i18n/               # Internationalization
│   │   ├── index.ts
│   │   └── languages/
│   │       ├── en.ts
│   │       └── ko.ts
│   ├── utils/              # Utility functions
│   │   └── version.ts
│   ├── App.tsx             # Main application component
│   ├── types.ts            # TypeScript type definitions
│   ├── index.css           # Global styles
│   └── main.tsx            # Application entry point
├── src-tauri/              # Rust backend (Tauri)
├── package.json
├── tsconfig.json
└── vite.config.ts
```

### Data Flow

1. **User Action** → React Component
2. **Component** → Tauri API (`invoke()`)
3. **Tauri Backend** → File System / OS APIs
4. **Response** → Component State
5. **State Update** → UI Re-render

### State Management

- **Local State**: `useState` for component-specific data
- **Context API**: `LanguageContext` for global language settings
- **History Stack**: Undo/Redo with 50-state limit
- **LocalStorage**: Persistent settings (theme, language, onboarding)

---

## 🛠️ Development Setup

### Prerequisites

- **Node.js** 18+ and npm
- **Rust** 1.70+
- **Windows SDK** (for Tauri development)

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/easyhosts.git
   cd easyhosts
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run in development mode**
   ```bash
   npm run tauri dev
   ```

4. **Build for production**
   ```bash
   npm run tauri build
   ```

### Development Scripts

```bash
npm run dev          # Run Vite dev server only
npm run build        # Build frontend only
npm run tauri dev    # Run full Tauri app in dev mode
npm run tauri build  # Build production executable
```

### Code Style

- **TypeScript**: Strict mode enabled
- **React**: Functional components with hooks
- **CSS**: CSS variables for theming
- **Naming**: PascalCase for components, camelCase for functions

---

## 🔍 Feature Documentation

### Undo/Redo System

The undo/redo system maintains a history stack of up to 50 states:

```typescript
// History stored as deep copies
history: HostsData[]
historyIndex: number

// Operations
undo(): void      // Navigate back in history
redo(): void      // Navigate forward in history
addToHistory(data: HostsData): void  // Add new state
```

**Limitations**:
- Maximum 50 states (oldest states are discarded)
- History cleared on app restart
- Branching: Creating a new state from middle of history discards "future" states

### Version Management

Data format versioning ensures compatibility:

```typescript
interface HostsData {
  version?: string;  // e.g., "1.0.0"
  entries: HostEntry[];
  sections: Section[];
}
```

- **Major version** changes break compatibility
- **Minor/Patch** changes maintain compatibility
- Legacy data (no version field) is automatically migrated

### Tag System

Tags provide flexible organization:

- **Auto-generated**: Untagged entries get an automatic "etc" tag
- **Filtering**: Click tags to filter entries
- **Limits**: Maximum 20 tags per entry
- **Validation**: Each tag limited to 50 characters

### Duplicate Detection

The duplicate detection system warns when multiple entries map the same domain to different IPs:

```typescript
interface DuplicateEntry {
  domain: string;
  entries: Array<{ index: number; ip: string }>;
}
```

This helps prevent DNS resolution conflicts.

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

### Reporting Bugs

1. Check existing [Issues](https://github.com/yourusername/easyhosts/issues)
2. Create a new issue with:
   - Clear description
   - Steps to reproduce
   - Expected vs actual behavior
   - System information (Windows version, app version)

### Suggesting Features

1. Open a [Feature Request](https://github.com/yourusername/easyhosts/issues/new)
2. Describe the use case and benefit
3. Provide examples if applicable

### Code Contributions

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** changes (`git commit -m 'Add amazing feature'`)
4. **Push** to branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines

- Write type-safe TypeScript
- Use React hooks and functional components
- Follow existing code style
- Add comments for complex logic
- Test on Windows 10 and 11
- Update documentation as needed

---

## 🗺️ Roadmap

### Completed Features

- [x] **Cross-Platform Support**: Windows, Linux, and macOS
- [x] **Multi-Language Support**: English and Korean
- [x] **Profile Management**: Save and switch between configurations
- [x] **Automatic Backups**: Timestamped backups on every save
- [x] **Undo/Redo**: 50-state history

### Planned Features

- [ ] **REL-01**: Network-based automatic profile switching (SSID detection)
- [ ] **REL-02**: Extended network diagnostics (Traceroute, HTTP status checks)
- [ ] **Future**: Syntax highlighting in raw edit mode
- [ ] **Future**: Command-line interface (CLI)
- [ ] **Future**: Additional languages (Spanish, French, German, Japanese)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Tauri Team** - For the amazing desktop app framework
- **React Team** - For the powerful UI library
- **Lucide** - For the beautiful icon set
- **Community** - For feedback and contributions

---

## 📞 Support

- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/yourusername/easyhosts/issues)
- 💡 **Feature Requests**: [GitHub Discussions](https://github.com/yourusername/easyhosts/discussions)
- 📧 **Email**: support@easyhosts.com

---

<div align="center">

Made with ❤️ for developers who need better hosts file management

**[Website](https://easyhosts.com)** • **[Documentation](https://docs.easyhosts.com)** • **[Releases](https://github.com/yourusername/easyhosts/releases)**

</div>
