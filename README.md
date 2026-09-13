# GitHub Protect

An installable browser safety project with two parts:

- **PWA:** manually scans selected files and folders locally.
- **Chrome extension:** watches downloads, pauses risky executable/script types, warns about suspicious links, and stores a local history.

## Install the extension for testing

1. Download or clone this repository.
2. Open `chrome://extensions` in Chrome or Edge.
3. Enable **Developer mode**.
4. Choose **Load unpacked** and select the `extension` folder.

## Important limitations

This project is a defensive safety assistant, not a replacement for Microsoft Defender or another trusted antivirus. Filename and structural checks can flag risks but cannot prove a file is safe. Keep Windows real-time protection and SmartScreen enabled.

## Cloud reputation integrations

Google Safe Browsing and VirusTotal require credentials and service-specific terms. API keys must be kept on a private backend, never committed to this public repository or included in the extension. The extension currently uses local heuristic warnings only.

## Privacy

The extension stores its warning history locally. It does not upload downloads or execute selected files.
