# Manual Test Plan

## Test NLAuth Authentication

Configure NLAuth authentication in Workspace settings. Comment out all OAuth fields.

Run: Command Palette…NetSuite: Get RESTlet Version

Expected Result: Window notification with current RESTlet version.

## Test OAuth Authentication

Comment out NLAuth and configure OAuth parameters in Workspace settings.

Run: Command Palette…NetSuite: Get RESTlet Version

Expected Result: Window notification with current RESTlet version.

## Test file upload and remote folder creation

Create a local folder that does not exist in NetSuite.

Place 2 files in it.

- Cannot be 0-length, as that fails.
- One should be .txt
- One should be .csv

Push up the .txt. Should create the folder and the file in NetSuite

Push up the .csv. Check that the file exists in NetSuite

## Test folder download

Delete the .txt and .csv files from the folder created in the earlier step.

Pull the directory from NetSuite

Show that both files came down.

## Test file compare

Modify the .txt file locally.

Run a file comparison. See that the diff is shown.

## Test remote delete

Right click the .csv file in the file explorer and choose "Delete file in NetSuite". Confirm it worked.

Attempt to download the .csv file. Should produce an error message.

## Test changing the remote subfolder

Change the rootDirectory setting in Workspace settings to some other folder where you have write access. Maybe a subfolder under SuiteScripts like SuiteScripts/Test (you might need to create this folder in NetSuite ahead of time).

Push the .csv file to NetSuite.

Check that the .csv file landed in the remote custom subfolder as expected.