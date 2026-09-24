<p align="center"><a href="https://armaanshashvat2014-dot.github.io/github-protect/"><img src="https://github.com/armaanshashvat2014-dot/github-protect/raw/main/icon.svg" width="96" alt="GitHub Protector shield"></a></p>

# GitHub Protector™

**Free, local-first browser security tools for checking suspicious links, downloads, file names, ZIP archives, browser-extension permissions and scam messages.**

[🚀 Try GitHub Protector](https://armaanshashvat2014-dot.github.io/github-protect/) · [📚 Security guides](https://armaanshashvat2014-dot.github.io/github-protect/security-guides/) · [⭐ Rate & give feedback](https://armaanshashvat2014-dot.github.io/github-protect/?feedback=1) · [📤 Share safely](https://armaanshashvat2014-dot.github.io/github-protect/share/)

## What it includes

| Tool | Purpose |
| --- | --- |
| [Suspicious Link Checker](https://armaanshashvat2014-dot.github.io/github-protect/suspicious-link-checker/) | Reviews visible URL signals such as look-alike domains, raw IP addresses and risky download patterns |
| [Scam Message Checker](https://armaanshashvat2014-dot.github.io/github-protect/scam-message-checker/) | Highlights urgency, impersonation, payment pressure and suspicious-link language |
| [Extension Permission Checker](https://armaanshashvat2014-dot.github.io/github-protect/chrome-extension-permission-checker/) | Explains powerful browser-extension permissions |
| [Double File Extension Checker](https://armaanshashvat2014-dot.github.io/github-protect/double-file-extension-checker/) | Detects misleading names such as `invoice.pdf.exe` |
| [ZIP Safety Checker](https://armaanshashvat2014-dot.github.io/github-protect/zip-file-safety-checker/) | Reviews archive contents locally for risky file types and naming patterns |
| [SHA-256 File Checker](https://armaanshashvat2014-dot.github.io/github-protect/sha-256-file-checker/) | Calculates a file fingerprint locally without uploading the file |
| [Security Guides](https://armaanshashvat2014-dot.github.io/github-protect/security-guides/) | Practical guides for downloads, browser warnings, extensions and misleading files |

## How the project works

- **Web app / PWA:** checks files, folders, URLs and text selected by the user using browser-supported analysis.
- **Browser extension:** watches browser downloads, warns about suspicious executable or script types and keeps a local warning history.
- **Local-first design:** file contents and scanner inputs are not sent to a GitHub Protector database.
- **Optional analytics:** only loads after a visitor explicitly accepts it and never receives scanner inputs.

## Install the web app

1. Open [GitHub Protector](https://armaanshashvat2014-dot.github.io/github-protect/) in Chrome, Edge, Brave, Opera or another modern browser.
2. Use the browser's **Install app** or **Add to Home Screen** option.
3. The installed PWA opens in its own window and can cache supported tools for offline use.

## Install the extension for testing

1. Download or clone this repository.
2. Open `chrome://extensions` in Chrome, Edge, Brave or Opera.
3. Enable **Developer mode**.
4. Choose **Load unpacked**.
5. Select the repository's `extension` folder.

## Help improve it

Try one real task, then report what happened:

- Was the correct tool easy to find?
- Was the result understandable?
- Did any button fail?
- Did a safe item receive an unreasonable warning?
- What browser and operating system were used?

Use the in-app **Rate & feedback** panel for product feedback. It stays on that device and does not connect to GitHub. Developers can still use repository issues for technical code problems. Never attach private files, passwords, recovery codes or personal messages.

## Important safety boundary

GitHub Protector is a defensive assistant, not a replacement for Microsoft Defender, macOS security controls or another trusted antivirus. Browser-based checks can identify warning signals but cannot prove that a file, link or extension is safe. Keep operating-system protection, browser updates and real-time security enabled.

## Privacy and API safety

- Selected files are not executed.
- Extension warning history is stored locally.
- Public API keys are not committed to this repository.
- Services such as Google Safe Browsing and VirusTotal require service-specific terms and credentials stored behind a private backend.

Read the full [Privacy page](https://armaanshashvat2014-dot.github.io/github-protect/privacy/).

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md) before proposing changes. For responsible project sharing, use the original posts in [SOCIAL_POSTS.md](SOCIAL_POSTS.md).

## Version

Web app **6.2.0** · Extension **2.0.0**
