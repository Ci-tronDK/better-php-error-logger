# better-php-error-logger

Download it [here](https://marketplace.visualstudio.com/items?itemName=martinvz.better-php-error-logger)!

With this extension you can use the error_log function in PHP with keyboard shortcuts. There are some customization options.
Here is a list of shortcuts you can use. 

| Shortcuts 	     | Description                               	                                                                          |  Why                                    |
|------------------- |----------------------------------------------------------------------------------------------------------------        |---------------------------------------- |
| **Output shoutcuts**                                                                                                                                                                  |
| `Ctrl + Alt + D`   | To error log when a variable is selected. 	                                                                          | D for Default. 	                        |
| `Ctrl + Alt + E`   | To echo when a variable is selected.                                                                                   | E for Echo.                             |
| `Ctrl + Alt + O`   | To error_log current output buffer with the selected settings.                                                         | O for Output buffer.                    |
| `Ctrl + Alt + P`   | To echo current output buffer with the selected settings.                                                              | P for print output buffer. :)           |
| **Settings shortcuts**                                                                                                                                                                |
| `Ctrl + Alt + C`   | To toggle between "No call stack", "With call stack as string" or "With call stack as array".                          | C for Call Stack.                       | 
| `Ctrl + Alt + V`   | To toggle between  "No var dump or export", "var_dump" or "var_export".                                                | V for var_dump.                         |
| `Ctrl + Alt + W`   | To toggle between "none", "pre", "br" or "PHP_EOL" when echoing.                                                       | W for writing new lines :)              |
| `Ctrl + Alt + A`   | To toggle between "Normal", "As compact array" or "Only first"                                                         | A for Array.                            |
| **Other shortcuts**                                                                                                                                                                   |
| `Ctrl + Alt + X`   | To delete all error_logs and var_dumps inside a file.                   * Deletion may not work correctly.             | X for when something is crossed over :) |
| `Ctrl + Alt + Q`   | If you can't remember output and other shortcuts, you can use this shortcut to quickpick one of the commands above.| Q for quickpick.                        |


* Note: Sometimes I change how things work in settings, so the extension may not work correctly. But if you delete the settings for the extension it should work again. You can than read the readme for the new way to do the same.

You can change the keyboard shortcuts in VS Code shortcut settings. 

If you can't remember the output and other shortcuts, you can use the shortcut `Ctrl + Alt + Q` to quickpick one of the shortcuts above.

In VS Code settings or `settings.json`, you can change some settings. The settings that can be changed by shortcut can only be changed in the user settings, not in the workspace settings.

The default values for all the settings for the extension are:

```json
"betterPhpErrorLogger.errorLogs": [
    "'${selectedVarString}: ' . print_r(${selectedVar}, true)",
    "'in ' . __FILE__ . ' on line ' . __LINE__"
],
"betterPhpErrorLogger.defaultVariable": {  
    "name": "here",  
    "value": "__CLASS__ . '::' . __FUNCTION__"  
},
              
"betterPhpErrorLogger.usePHPParserForPositioning": true,
"betterPhpErrorLogger.laravelLog": {
    "useLaravelLog": false,
    "autoUse": true,
    "laravelLogLevel": "debug",
    "chooseLogLevel": false
},
"betterPhpErrorLogger.printWithCallStack": "No call stack",
"betterPhpErrorLogger.logMultiple": "Normal",
"betterPhpErrorLogger.newLinesForEcho": "pre",
"betterPhpErrorLogger.varDumpExportVariable": "No var dump or export"
```

To change what will be error logged you can set `betterPhpErrorLogger.errorLogs` to an array of strings, where each value string will be error logged.  
You can use `${selectedVar}` for the selected variable.  Use `${selectedVarString}` for the name of the variable, by default the two values are the same.  
The exception is when var_dumping variable:  
- when echoing `${selectedVar}` will be changed to "var_dump(`${selectedVar}`)" 
- when error_logging `${selectedVar}` will be changed to "rtrim(ob_get_clean())", which gets the output buffer.

You can use a default name when no variable is selected, change `betterPhpErrorLogger.defaultVariable` to do that. `${selectedVarString}` will be changed to the name and `${selectedVar}` will be the value.

If you want to use Laravel's log function instead of error_log, you can set `betterPhpErrorLogger.laravelLog` to an object with the property useLaravelLog set to true. autoUse is a setting that will write `use Illuminate\Support\Facades\Log;` after the last use statement, if it doesn't exist. The default is true. You can also set the log level with the property laravelLogLevel. The default log level is debug. You can also choose to choose the log level when logging, by setting the property chooseLogLevel to true.

By default the extension uses PHP Parser to try to position the error_log correctly. PHP Parser requires valid code. If you have problems with this you can set `betterPhpErrorLogger.usePHPParserForPositioning` to false. This will always log on the next line.

Set `betterPhpErrorLogger.printWithCallStack` to a string with one of these values: "No call stack", "With call stack as string" or "With call stack as array" to change if you want to print the call stack.

Set `betterPhpErrorLogger.logMultiple` to a string with one of these values: "Normal", "As compact array" or "Only first" to change if you want to log multiple variables or not. and how you want to log them.

Set `betterPhpErrorLogger.newLinesForEcho` to a string with one of these values: "none", "pre", "br" or "PHP_EOL" to change how new lines are written when echoing. If pre is chosen, the echo statement will be wrapped in pre tags.

Set `betterPhpErrorLogger.varDumpExportVariable` to a string with one of these values: "No var dump or export", "var_dump" or "var_export" to change if you want to var_dump or var_export the variable or not.

## Intelligent Log Positioning

The extension now includes improved positioning logic for error log statements:

- **Return statements**: When logging variables in return statements, the log is placed before the return statement instead of after it
- **Statement endings**: Logs are positioned after statement closures (semicolons, closing braces)
- **Control structures**: Logs are placed before control structures (if, for, while, etc.) when appropriate
- **Mixed PHP/HTML**: In files with mixed PHP and HTML, logs are positioned before HTML content when possible

The extension uses PHP Parser when enabled (`betterPhpErrorLogger.usePHPParserForPositioning`) to understand code structure and provide optimal positioning. When disabled or when the parser cannot analyze the code, it falls back to intelligent text-based positioning.