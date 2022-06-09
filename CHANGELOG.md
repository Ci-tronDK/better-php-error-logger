# Change Log


## [Change Log]
Version 0.088 9/6 2022 18.31 CEST
- Changed how it works, when it not should print right after array, so that it prints after ;. Will be made better later. Changed to typescript.

Version 0.084 1/6 2022 21.33 CEST
- Removed a space in call stack. When you delete error_logs new lines before will also be removed and an error message will appear when nothing to delete. Made so it should work better if you error_log parameters in functions, where { not is on same line. Also made so it should work better on arrays, so if you will error_log an array, where values are being set. It will put the error_logs after ;.

Version 0.081 31/5 2022 20.42 CEST
- Made so when you have set a setting for the default shortcut to true, it will do the opposite in shortcuts, so it doesn't do the same. Changed README.md to reflect change.

Version 0.080 31/5 2022 19.11 CEST
- Made so when you delete error_logs, it also removes new lines. Made so you can also print current output buffer.

Version 0.079 30/5 2022 19.20 CEST
- Made so when you delete error_logs, you also delete var_dumps and echos and default variable. Changed shortcuts. Updated README.md to reflect change.

Version 0.078 26/5 2022 22.39 CEST
- Added so you can delete all error_logs in file by pressing Ctrl + Alt + Shift + X.

Version 0.077 26/5 2022 14.28 CEST
- Added some defaults for settings.

Version 0.076 26/5 2022 13.45 CEST
- Changed how var_dumping works again. :) So it creates a variable, and user can set occurences of that variable to be replaced by the selected values in settings. Small fixes. Made README.md prettier and changed to reflect change.

Version 0.075 25/5 2022 19.57 CEST
- Changed how var_dumping works, so there are nothing with special characters. It uses a temporary variable to store the old variable. Changed how it checks for settings/keyboard shortcuts. Removed all settings with special chars. Changed command name from callStack to printWithCallStack.

Version 0.074 23/5 2022 19.57 CEST
- Made so a new line is added when selection is on last line, so it works better. Made so var_dump works correctly when using keyboard shortcuts. If the selected line contains text, things will be inserted on the line under. Made so it works with multiple dollarsigns and users can change value to be uses instead when var_dumping.

Version 0.073 22/5 2022 14.04 CEST
- Made so commands also works in command palette. Added keywords in package.json.  Changed command names, so it should be easier to find all shortcuts for the extension. 
Added check to see if braces are balanced when selected text and check to see if selection contains ;. Error messages will be shown. Changed LICENSE.md to MIT license. Small changes in README.md.

Version 0.072 21/5 2022 19.02 CEST
- Made something so keyboard shortcuts should have different names in shortcut settings.

Version 0.071 21/5 2022 16.32 CEST
- Made so it is possible to use keyboard shortcuts to print with call stack, var_dump Variable and use echo instead. Changed so variables that starts with $_ uses $__ instead, so it works with special chars. Updated readme to reflect change.

Version 0.070 21/5 2022 12.14 CEST
- Made so when so it works when var_dumping is used on functions. It creates variable based on function name and replaces e.g. parentheses wih special characters, whcih user can change if it doesn't work for them (e.g. if the characters isn't supported). In the varable name I have added a special space character befor var_dump. This is also user changeable. Updated README.md to reflect change.

Version 0.067 19/5 2022 17.35 CEST
- Made so it should be possible to edit defaultVariable in Settings UI and not possible to add other properties to object. Made so it only removes last line when var_dumping. Made indentation better when var_dumping.

Version 0.066 18/5 2022 18.33 CEST
- Added settings for default variable name, and changed setting for variable value to object instead of string. Made so it should be possible to change all settings in Settings UI. Made var_dump look better and uses a variable with variable name equal to variable + _var_dump and removes new lines from ob_get_clean(). Made so newlines work better in editor.

Version 0.065 17/5 2022 18.45 CEST
- Added repository to package.json and added a LICENSE.md file. Made so you can use error_log when no variable is selected, you can choose default value for the variable that will be created and logged. Moved \<br> inside parentheses when echoing. Added an icon for the extension. Changed readme to reflect change and better formatting.

Version 0.061 16/5 2022 21.42 CEST
- Uses \<br> for new line instead of \n when useEchoInstead is set to true.

Version 0.060 16/5 2022 20.07 CEST
- Fixed so it uses replaceAll instead of 2 times replace. Changed print call stack to one line. Added setting to also var_dump variable. Added another setting to echo instead of error_log. Changed the default error logs. Changed description to say that the extension is customisable.

Version 0.054, 7/5 2022 11.25 CEST
- Added changelogs for other versions and corrected mistake where it said version 0.052 instead of 0.053. Made line number in parantheses as default and changed description to reflect the change.

Version 0.053, 4/5 2022 16.50 CEST
- Added \ to new Exception when printing call stack. And added newline after printing call stack. Added changelog for version 0.053.

Version 0.052, 3/5 2022 19.38 CEST
- Made so it replaces all ${selectedVar} with the selected variable instead of only the first one.

Version 0.051, 3/5 2022 19.11 CEST
- Made so if you select an array with key, it will always use "" instead of '' for the key, so it works when printing out the variable name.

Version 0.05, 3/5 2022 18.55 CEST
- Added settings so you can choose how you error logs look like and choose to also print call stack, added explanation to description.

Version 0.02, 3/5 2022 16.44 CEST
- Removed space before printing line number in error log.

Version 0.01, 2/5 2022 18.02 CEST
- Initial release  