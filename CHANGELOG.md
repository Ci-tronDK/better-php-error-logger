# Change Log


## [Change Log]
Version 0.1.13 22/11 2022 17.22 CET
- Made a mistake in previous version, where I ignored the out folder with the bundled file and had not set the main property to the bundled file in in package.json. So the extension was not working. This is now fixed.

Version 0.1.12 22/11 2022 17.05 CET
- Made some small refactorings and bundled the code using esbuild.

Version 0.1.11 3/11 2022 17.00 CET
- Added php-parser license text to LICENSE.md and made position a little better after change in last update.

Version 0.1.10 29/10 2022 15.19 CEST
- Installed PHP Parser to make it easier to find out which kind of variable is selected for better positioning of error_logs and made some changes to positioning, can still be better. Updated README.md file, changed some text and moved all default settings values to top and added some asterisk notes. Commented out deletion of echo's, because I changed how they work a while ago.

Version 0.1.0 20/10 2022 20.02 CEST
- Wrong version number in previous update, read description there.

Version 0.0.10 20/10 2022 19.22 CEST
- Added some keywords to package.json and also added bugs, author and license fields. Changed how output buffer works when printing output buffer and also a small change when var_dumping variable, so it will not be set to a variable.

Version 0.0.99 19/10 2022 18.01 CEST
- Made so it also prints "Output buffer" and position is correct when printing output buffer, removed " and ' from string, so it is easier to print an array value. Fixed missing dot on all versions in changelog.

Version 0.0.98 27/9 2022 21.40 CEST
- Added Github sponsor link and fixed readme error about printing call stack.

Version 0.0.97 18/9 2022 12.15 CEST
- Added defaultname as selectedVarString and defaultVariable as selectedVar when nothing is selected, so things work better. Made an option to print Call Stack as an array.

Version 0.0.96 17/9 2022 13.18 CEST
- Moved functions to different files. Changed how var_dumping is working again, so it is easier to create a string name for variable, when var_dumping. But user have to set both ${selectedVar} and ${selectedVarString} in settings, by default the same, except when var_dumping; when echoing variable will be changed to var_dump(${selectedVar}), when error_logging a new variable will be created called $var_dump. Removed parentheses when echoing. When var_dumping and echoing all periods before the selected variable will be changed to commas, so text will be printed in correct order. Deletion may not work correctly now.

Version 0.0.93 5/8 2022 22.58 CEST
- Changed how var_dumping works again, so user should not have to use settings. So removed varDumpVariableSettings and made it back to just varDumpVariable. But it doesn't work with $$ variables yet. Deleted from README.md to reflect change.

Version 0.0.91 19/7 2022 18.48 CEST
- Small change to README.md, so tables should look better.

Version 0.0.90 25/6 2022 15.35 CEST
- Made so you can use output buffer shortcut together with the other shortcuts. Changed how var_dump_variable works, so it belongs to varDumpSettings in settings. Updated README.md.

Version 0.0.88 9/6 2022 18.31 CEST
- Changed how it works, when it not should print right after array, so that it prints after ;. Will be made better later. Changed to typescript.

Version 0.0.84 1/6 2022 21.33 CEST
- Removed a space in call stack. When you delete error_logs new lines before will also be removed and an error message will appear when nothing to delete. Made so it should work better if you error_log parameters in functions, where { not is on same line. Also made so it should work better on arrays, so if you will error_log an array, where values are being set. It will put the error_logs after ;.

Version 0.0.81 31/5 2022 20.42 CEST
- Made so when you have set a setting for the default shortcut to true, it will do the opposite in shortcuts, so it doesn't do the same. Changed README.md to reflect change.

Version 0.0.80 31/5 2022 19.11 CEST
- Made so when you delete error_logs, it also removes new lines. Made so you can also print current output buffer.

Version 0.0.79 30/5 2022 19.20 CEST
- Made so when you delete error_logs, you also delete var_dumps and echos and default variable. Changed shortcuts. Updated README.md to reflect change.

Version 0.0.78 26/5 2022 22.39 CEST
- Added so you can delete all error_logs in file by pressing Ctrl + Alt + Shift + X.

Version 0.0.77 26/5 2022 14.28 CEST
- Added some defaults for settings.

Version 0.0.76 26/5 2022 13.45 CEST
- Changed how var_dumping works again. :) So it creates a variable, and user can set occurences of that variable to be replaced by the selected values in settings. Small fixes. Made README.md prettier and changed to reflect change.

Version 0.0.75 25/5 2022 19.57 CEST
- Changed how var_dumping works, so there are nothing with special characters. It uses a temporary variable to store the old variable. Changed how it checks for settings/keyboard shortcuts. Removed all settings with special chars. Changed command name from callStack to printWithCallStack.

Version 0.0.74 23/5 2022 19.57 CEST
- Made so a new line is added when selection is on last line, so it works better. Made so var_dump works correctly when using keyboard shortcuts. If the selected line contains text, things will be inserted on the line under. Made so it works with multiple dollarsigns and users can change value to be uses instead when var_dumping.

Version 0.0.73 22/5 2022 14.04 CEST
- Made so commands also works in command palette. Added keywords in package.json.  Changed command names, so it should be easier to find all shortcuts for the extension. 
Added check to see if braces are balanced when selected text and check to see if selection contains ;. Error messages will be shown. Changed LICENSE.md to MIT license. Small changes in README.md.

Version 0.0.72 21/5 2022 19.02 CEST
- Made something so keyboard shortcuts should have different names in shortcut settings.

Version 0.0.71 21/5 2022 16.32 CEST
- Made so it is possible to use keyboard shortcuts to print with call stack, var_dump Variable and use echo instead. Changed so variables that starts with $_ uses $__ instead, so it works with special chars. Updated readme to reflect change.

Version 0.0.70 21/5 2022 12.14 CEST
- Made so when so it works when var_dumping is used on functions. It creates variable based on function name and replaces e.g. parentheses wih special characters, whcih user can change if it doesn't work for them (e.g. if the characters isn't supported). In the varable name I have added a special space character befor var_dump. This is also user changeable. Updated README.md to reflect change.

Version 0.0.67 19/5 2022 17.35 CEST
- Made so it should be possible to edit defaultVariable in Settings UI and not possible to add other properties to object. Made so it only removes last line when var_dumping. Made indentation better when var_dumping.

Version 0.0.66 18/5 2022 18.33 CEST
- Added settings for default variable name, and changed setting for variable value to object instead of string. Made so it should be possible to change all settings in Settings UI. Made var_dump look better and uses a variable with variable name equal to variable + _var_dump and removes new lines from ob_get_clean(). Made so newlines work better in editor.

Version 0.0.65 17/5 2022 18.45 CEST
- Added repository to package.json and added a LICENSE.md file. Made so you can use error_log when no variable is selected, you can choose default value for the variable that will be created and logged. Moved \<br> inside parentheses when echoing. Added an icon for the extension. Changed readme to reflect change and better formatting.

Version 0.0.61 16/5 2022 21.42 CEST
- Uses \<br> for new line instead of \n when useEchoInstead is set to true.

Version 0.060 16/5 2022 20.07 CEST
- Fixed so it uses replaceAll instead of 2 times replace. Changed print call stack to one line. Added setting to also var_dump variable. Added another setting to echo instead of error_log. Changed the default error logs. Changed description to say that the extension is customisable.

Version 0.0.54, 7/5 2022 11.25 CEST
- Added changelogs for other versions and corrected mistake where it said version 0.052 instead of 0.053. Made line number in parantheses as default and changed description to reflect the change.

Version 0.0.53, 4/5 2022 16.50 CEST
- Added \ to new Exception when printing call stack. And added newline after printing call stack. Added changelog for version 0.053.

Version 0.0.52, 3/5 2022 19.38 CEST
- Made so it replaces all ${selectedVar} with the selected variable instead of only the first one.

Version 0.0.51, 3/5 2022 19.11 CEST
- Made so if you select an array with key, it will always use "" instead of '' for the key, so it works when printing out the variable name.

Version 0.0.5, 3/5 2022 18.55 CEST
- Added settings so you can choose how you error logs look like and choose to also print call stack, added explanation to description.

Version 0.0.2, 3/5 2022 16.44 CEST
- Removed space before printing line number in error log.

Version 0.0.1, 2/5 2022 18.02 CEST
- Initial release  