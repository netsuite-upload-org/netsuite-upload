# netsuite-upload VS Code plugin

**netsuite-upload** is a Visual Studio Code extension that allows you to manage your SuiteScript files directly from VS Code. It also helps you with defining new modules and adding server-side module dependecies.

## Under New Management

In February 2019, original author original author Tomáš Tvrdý [@tvrdytom](https://github.com/tvrdytom) transferred ownership of this project to me [@silverl](https://github.com/silverl). The last version under this line of development was `0.1.3`.

New releases will be versioned `1.0+`.

If you are having problems with the `1.0+` release line, then make sure you've updated the `vscodeExtensionRestlet.js` RESTlet to the latest version.

## Features

### 1. Push and Pull Files and Folders between VS Code and the NetSuite File Cabinet

Right-click a file or folder in the navigation panel to see the context menu options:

- `Pull file from NetSuite` - downloads a file from NetSuite
- `Push file to NetSuite` - uploads a file to NetSuite
- `Delete file in NetSuite` - deletes a file in NetSuite
- `Compare file with NetSuite` - diff your local version with the NetSuite version
- `Pull folder from NetSuite` - Download the folder and all contents from NetSuite

![Snippet & commands](img/netsuite_upload.gif)

### 2. NetSuite-Specific Code Snippets & Commands

- `Snippets for module initialization` - type _defineRestlet..._, choose your module type and hit enter
- `Commands for adding new NetSuite/custom dependencies` - open command line (`Ctrl`-`Shift`-`P`) and type
  - _add netsuite dependency_ for choosing of the NetSuite built-in module from the list
  - _add custom dependency_ for defining od custom dependecies

![Snippet & commands](img/snippet_addModule.gif)

### 3. Re-Base the Root Folder
You can rebase the root folder through the `netSuiteUpload.rootDirectory` setting. This might be useful if you have a folder in the NS file cabinet called `SuiteScripts\Development` where you experiment with scripts before you move them to a `SuiteScripts\Production` folder.

In this kind of work flow, you might do development work within `SuiteScripts\Development`. When you're satisfied, you'd change Settings.json (or Workspace settings in your `.vscode\settings.json` file) to change the base to `SuiteScripts\Production`. Then you'd push up all the files you were working with.

Nothing changes on your local disk due to this setting change. It only modifies the root folder in NetSuite where files get pushed to or pulled from.

This was a requested enhancement. Most people would probably be better off using a sandbox environment as it would be easy to lose track of which files were modified, and which versions of which files were in Development vs Production.

## Very Important Fact

Your VS Code project **MUST MUST MUST** be rooted at a folder that maps or corresponds to NetSuite's "SuiteScripts" file cabinet folder. This extension assumes the working root is equivalent to the remote "SuiteScripts" folder.

## Installation of 1.0.x version

Since this extension is under new leadership, I'm waiting until I get some beta testing on the v1.0.X release before I update the VS Code Marketplace extension.

Therefore, I'm asking everyone to manually install from the Github Releases tab.

The procedure:

- Uninstall Old: If you have a previous version from the Marketplace installed, uninstall it. (Command palette -> Extensions: Show Installed Extensions)
- Uninstall `netsuite-upload`
- Download the `netsuite-upload-1.0.0.vsix` file from the [Github Releases tab](https://github.com/netsuite-upload-org/netsuite-upload/releases)
- In VS Code: Command palette -> Extensions: Install from VSIX
- Update/upgrade the vscodeExtensionRestlet.js script in NetSuite with the version contained within the .zip file from the Releases tab.

## Setup

### NetSuite setup

- Upload `netSuiteRestlet/vscodeExtensionRestlet.js` file somewhere in the `SuiteScripts` folder in NetSuite
- Create a new Script record for this RESTlet.
- Create a new Script Deployment for this Script. Note the URL. The RESTlet URL will be set in `settings.json`.

_Future versions of this VS Code Extension may require that you upgrade the RESTlet file in NetSuite. Take note if the extension receives an update, and check back here._

### VSCode project setup

- Open your local root **SuiteScripts** folder in VSCode. The VS Code project root folder MUST be the same as the root of your SuiteScripts folder in NetSuite.
- Create or update the project `settings.json` inside the `.vscode` folder (see below)
- Copy the following code to `settings.json` and update with your settings

### Authentication

This extension supports accessing the RESTlet script deployment using either NLAuth authorization or OAuth 1.0 authorization.

NLAuth is supported. OAuth is attempted in the code, but I couldn't make it work locally. I could use some testers.

#### Authentication Option 1: NLAuth Authorization

Place the following in either Workspace settings or general User settings:

```javascript
{
  // Authentication header
  "netSuiteUpload.authentication": "NLAuth nlauth_account=<ACCOUNTID>, nlauth_email=<LOGIN>, nlauth_signature=<PASSWORD>, nlauth_role=<ROLE>",

}
```

- ACCOUNTID - Your NetSuite account ID number
- LOGIN - Your email address used to log into NetSuite
- PASSWORD - Your password
- ROLE - The NetSuite RoleID for which you have web service/API permissions.

#### Authentication Option 2: OAuth

Generating the necessary tokens for OAuth is covered in the NetSuite help site. It's not fun.

- If you wish to use OAuth authentication instead of basic authentication you can leave the authentication header blank and use the OAuth settings properties.
- First, generate an Integration record in NetSuite, make sure the 'token based authentication' scheme is checked, and hang on to the token and secret details.
- Second, log into a role you wish to use for authentication. From the "manage tokens center", generate a new token and secret using the Integration from the previous step.
- Input the 4 values from above (NetSuite key and token and Consumer key and token) in the corresponding settings options.
- Set the `realm` setting equal to your numeric NetSuite account number.

### Authorization - User Role Permissions

This extension is going to be calling a NetSuite RESTlet that will be manipulating files and folders in the SuiteScripts folder of the File Cabinet. Therefore, the user being authenticated must have sufficient permissions assigned to their Role to allow these file changes, and to call the RESTlet script deployment.

At a minimum, the Role must have the following **Setup** permissions (please let me know if I have any of these wrong):

- Access Token Management - Full
- Allow JS / HTML Uploads - Full
- Log in using Access Tokens - Full
- SuiteScript - Full
- User Access Tokens - Full
- Web Services - Full

### settings.json

```javascript
{
  // Authentication header for NLAuth
  "netSuiteUpload.authentication": "NLAuth nlauth_account=<ACCOUNTID>, nlauth_email=<LOGIN>, nlauth_signature=<PASSWORD>, nlauth_role=<ROLE>",

  // Script Deployment URL for the deployed vscodeExtensionRestlet.js
  "netSuiteUpload.restlet": "<RESTlet URL>",

  // Temporary folder (e.g. C:\\temp or /tmp) - used for storing compared files
  "netSuiteUpload.tempFolder": "<TEMP FOLDER PATH>"

  // If attempting OAuth, fill out these
  // Oauth NetSuite Key or Token ID
  "netSuiteUpload.netSuiteKey": "<NETSUITE TOKEN KEY>",
  // Oauth NetSuite Secret
  "netSuiteUpload.netSuiteSecret": "<NETSUITE SECRET>",
  // Oauth NetSuite Consumer Key
  "netSuiteUpload.consumerToken": "<CONSUMER TOKEN>",
  // Oauth NetSuite Consumer Secret
  "netSuiteUpload.consumerSecret": "<CONSUMER SECRET>",
  // Account number
  "netSuiteUpload.realm": "<NETSUITE ACCOUNT NUMBER>",

// Base NetSuite folder path to upload script to (e.g. "SuiteScripts/Developer"). Default if unset is "SuiteScripts".
  "netSuiteUpload.rootDirectory": "<BASE FOLDER PATH>"
}
```

### keybindings.json

I like to add a keybinding to upload the document in the current tab.

Add the following to your `keybindings.json` file:

```javascript
{ "key": "ctrl+u",                "command": "netsuite-upload.uploadFile"},
```

## Limitations

The plugin is using a RESTlet for the communication with NetSuite. RESTlets have some governance limitations. Current implementation does not deal with this, so there could be problems pulling folders containing a lot of items from NetSuite.
