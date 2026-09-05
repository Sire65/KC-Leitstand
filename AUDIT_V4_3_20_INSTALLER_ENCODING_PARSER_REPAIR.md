# AUDIT V4.3.23 - Installer Encoding and Parser Repair

- PowerShell 5.1 installer converted to strict ASCII-compatible source.
- Removed Unicode punctuation and German special characters from executable script text.
- Retained graphical FolderBrowserDialog rooted at This PC.
- Added packaging gate requirement: installer script must be parser-checked before release.
- Existing progress, certificate verification, copy verification, shortcut and diagnosis functions retained.
