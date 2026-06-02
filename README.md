<div align="center">
  <img src="https://github.com/Kobar-Project/KoBar/raw/master/build/icon.png" alt="KoBar Logo" width="120"/>
  <h1>Pin Window to Top - KoBar Plugin</h1>
  <p><em>Pin third-party application windows to stay always on top.</em></p>
  
  [![KoBar Ecosystem](https://img.shields.io/badge/KoBar-Ecosystem-f4a125?style=for-the-badge&logo=electron&logoColor=white)](https://github.com/Kobar-Project)
  [![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)
</div>

---

KoBar is a versatile platform designed to host a rich ecosystem of plugins, seamlessly integrating powerful tools directly into your daily workflow. As a core extension for this ecosystem, **Pin Window to Top** gives KoBar users the ultimate OS-level window management capability.

## What is Pin Window to Top?

Sometimes, you need a specific application (like a notepad, reference image, or calculator) to stay visible above all other windows, but the application itself lacks an "always-on-top" feature. **Pin Window to Top** is a utility plugin for KoBar that bridges this gap, allowing you to force any third-party window to remain glued to the top of your screen stack.

## Key Features

- **Global Window Pinning:** Select any active window from your operating system and pin it to the topmost layer.
- **Easy Unpinning:** Quickly toggle the pinned state off when you no longer need the window in the foreground.
- **Native OS Integration:** Utilizes deep Electron and native OS APIs (via native modules or shell scripts) to manipulate external window properties safely.
- **Cross-Platform:** Supports both Windows (via `user32.dll` or PowerShell abstractions) and macOS (via AppleScript/Swift bridges) to ensure feature parity.
- **Lightweight UI:** Operates entirely from a sleek, minimal dropdown or selection tool within the KoBar sidebar, requiring no complex configurations.

## Configuration & Usage

1. **Launch the Plugin:** Click the Pin icon (`push_pin`) in the KoBar sidebar.
2. **Select a Window:** A list of currently open and active application windows will appear. 
3. **Pin It:** Click on the target application from the list. The application will instantly be forced to an always-on-top state.
4. **Unpin:** To revert the behavior, simply reopen the plugin and click on the pinned application again to toggle it off, or close the target application.

---

## ✉️ Contact

For support or inquiries, you can contact us at [hello@kobar.org](mailto:hello@kobar.org).

[KoBar.org](https://kobar.org)

---

## 💛 Sponsors & Backers

If you find KoBar useful and want to support its ongoing development, consider backing the project through any of the platforms below:

<p align="center">
  <a href="https://www.patreon.com/kobarproject" target="_blank">
    <img src="https://img.shields.io/badge/Patreon-F96854?style=for-the-badge&logo=patreon&logoColor=white" alt="Become a Patron" />
  </a>
  <a href="https://opencollective.com/kobar" target="_blank">
    <img src="https://img.shields.io/badge/Open_Collective-7FADF2?style=for-the-badge&logo=open-collective&logoColor=white" alt="Open Collective" />
  </a>
</p>