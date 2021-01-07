# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.5] - 2021-01-07

- Fixed [Issue #28](https://github.com/netsuite-upload-org/netsuite-upload/issues/28)  Directory Setting seems to apply differently between Pull Folder and Push/Pull file.
### Changed
- Changed function downloadDirectoryFromNetSuite body in netSuiteBl.js
## [1.2.4] - 2019-12-26

- Closes Issue #31 "Add Netsuite dependency command doesn't work properly" https://github.com/netsuite-upload-org/netsuite-upload/issues/31

### Added

- Added support for pushing a whole folder. Thank you @alejndr https://github.com/netsuite-upload-org/netsuite-upload/pull/35

## [1.2.2] - 2019-09-13

### Changed

- Added support for uploading and downloading .ts TypeScript files. https://github.com/netsuite-upload-org/netsuite-upload/pull/32
- Updated npm dependencies to eliminate security vulnerabilities.

## [1.1.2] - 2019-02-08

### Changed

- Publishing to VS Code Marketplace under a new publisher name, `nsupload-org`. This will make it appear as a different extension than the old one. Going to remove the old extension from the VS Code Marketplace.
- Added keybinding for upload. Ctrl+n,Ctrl+u.  This complements the download keybinding, Ctrl+n,Ctrl+d.
- Improved some Settings descriptions.

### Fixed

- Checking the version of the RESTlet was too strict. I don't need the version of the Extension to equal the version of the RESTlet. I just need all the supported functions to work properly.

## [1.0.2] - 2019-02-07

### Fixed

- Fixed OAuth support. NetSuite OAuth is weird.

### Added

- Assigned a version to the RESTlet, and created a GET request that will pull down the version number of the RESTlet. This allows the extension to detect when the RESTlet version is not up-to-date, and to warn the user. There's also a new palette command, `Get NSUpload RESTlet version` which will fetch the value and display it in a notification.
- Continued improving error handling. Now can detect bad authentication and warn the user.

### Changed

- This release requires that you update the RESTlet in NetSuite. Find the RESTlet at `netSuiteRestlet\vscodeExtensionRestlet.js`.

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
