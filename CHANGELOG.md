# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.1] - 2019-02-05

### Added

- This release adds a feature requested by [@JonnyBoy333](https://github.com/JonnyBoy333). It allows for a setting to change the base folder path to upload scripts. For example, if you keep a copy of all scripts in SuiteScripts/Developer, then you can change this setting and push and pull files there. When you're done with development, you can change the setting back and push files to production.

### Changed

- This release requires that you update the RESTlet in NetSuite. Find the RESTlet at `netSuiteRestlet\vscodeExtensionRestlet.js`.

## [1.0.0] - 2019-02-05

Original author Tomáš Tvrdý [tvrdytom](https://github.com/tvrdytom) has turned over ownership of this project to me. I'm releasing an updated version 1.0 with many fixes.

See the [readme.md](https://github.com/netsuite-upload-org/netsuite-upload) for install instructions. This version is not in the VS Code Marketplace yet.

- Enabled pushing up the active document in the editor using a keybinding (I chose Ctrl+U, personally).
- Improved cross-platform support (mac). Previously, Windows local file paths were assumed.
- Now properly recognizes and sets the correct file type by inspecting the filename extension when uploading a new file to NetSuite. Supports all file extensions that are documented in NetSuite documentation.
- Improved file vs. folder recognition in the left explorer pane. Previously, if a file type wasn't a type of code file that VS Code knew about (like a .csv file), the NetSuite context menu wouldn't show.
- Improved messaging. More comprehensive messages will be shown in the VS Code "toast" notification when a file or folder operation succeeds or fails.
- Stopped using node-rest-client and replaced with SuperAgent, easier to use.

I attempted to add OAuth support. I'd appreciate if anyone would like to try a test. I couldn't get it working on my machine. Config instructions are in the README.md.

*If you upgrade to this version, you **must** also upgrade the RESTlet `vscodeExtensionRestlet.js` in NetSuite.*
