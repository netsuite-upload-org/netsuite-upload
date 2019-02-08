# Publishing Process

Update package.json as needed.

Update `README.md` and `CHANGELOG.md` as needed.

Commit changes to github.

Package and publish to VS Code Marketplace.

Minor revision:

```powershell
vsce publish minor|patch
vsce package
```

In Github, go to Releases tab. Create a new release.

Click "Draft a new release".

Specify the version tag for both "Tag version" and "Release title" like: v1.0.4

Copy CHANGELOG.md details into the text area for "Describe this release."

Drag the .vsix file outputted from `vsce package` into the "Attach binaries" area in the Github release.

Click `Publish release` button.

Done.
