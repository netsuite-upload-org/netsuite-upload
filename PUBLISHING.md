# Publishing Process

## Making changes

Create a branch, make changes in the branch.

Update package.json as needed. Update the version number manually and consider updating any dependencies.

Use `npm audit` to check for security vulnerabilies and `npm audit fix` to fix them, then test.

Update `README.md` and `CHANGELOG.md` as needed.

Commit the branch and open a PR for review.

Review the code and when approved, merge to master.

## Build with VSCE

Minor revision:

```powershell
vsce package
```

## Release in  Github

In Github, go to Releases tab. Create a new release.

Click "Draft a new release".

Specify the version tag for both "Tag version" and "Release title" like: v1.0.4

Copy CHANGELOG.md details into the text area for "Describe this release."

Drag the .vsix file outputted from `vsce package` into the "Attach binaries" area in the Github release.

Click `Publish release` button.

## Release to VS Code Marketplace.

Use same version number that you used in the `vsce package` step.

```powershell
vsce publish 1.x.x
```

Package and publish to VS Code Marketplace.
