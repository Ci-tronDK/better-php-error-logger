# better-php-error-logger

Download it [here](https://marketplace.visualstudio.com/items?itemName=martinvz.better-php-error-logger)!

With this extension you can use the error_log function in PHP with keyboard shortcuts. There are some customization options.
Here is a list of shotcuts you can use. 

| Shortcuts 	     | Description                               	                                                               |  Why                                    |
|------------------- |---------------------------------------------------------------------------------------------------------------- |---------------------------------------- |
| `Ctrl + Alt + D`   | To to error log when a variable is selected. 	                                                               | D for Default. 	                 |
| `Ctrl + Alt + C`   | To also print call stack. (No Call Stack, when it is true for default in settings)                              | C for Call Stack.                       | 
| `Ctrl + Alt + V`   | To var_dump variable. (No Var dump, when it is true for default in settings)                                    | V for var_dump.                         |
| `Ctrl + Alt + W`   | To var_dump variable. (Will always var_dump, but do the oppsite of useEcho in settings)                         | W also for var_dump. :)                 |
| `Ctrl + Alt + E`   | To use Echo instead.  (No Use Echo instead, when it is true for default in settings)                            | E for Echo.                             |
| `Ctrl + Alt + O D` | To print current output buffer with default settings.                                                           | O for Output buffer.                    |
| `Ctrl + Alt + O C` | To print current output buffer with call stack. (No Call Stack, when it is true for default in settings)        |                                         | 
| `Ctrl + Alt + O V` | To print current output buffer with var dumped variable. (No Var dump, when it is true for default in settings) |                                         |
| `Ctrl + Alt + O W` | To print current output buffer with var dumped variable. (Will always var_dump, but do the oppsite of useEcho in settings) |                              |
| `Ctrl + Alt + O E` | To echo current output buffer. (No Use Echo instead, when it is true for default in settings)                   |                                         |    
| `Ctrl + Alt + X`   | To delete all error_logs and var_dumps inside a file.                   * Deletion may not work correctly.      | X for when something is crossed over :) |
| `Ctrl + Alt + Q`   | If you can't remember all shortcuts, you can use this shortcut to quickpick one of the commands above.          | Q for quickpick.                        |



* Note: Sometimes I change how things work in settings, so the extension may not work correctly. But if you delete the settings for the extension it should work again. You can than read the readme for the new way to do the same.

You can change the keyboard shortcuts in VS Code shortcut settings. 

If you can't remember all the shortcuts, you can use the shortcut `Ctrl + Alt + Q` to quickpick one of the commands above.

In VS Code settings or `settings.json`, you can change some settings.

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
"betterPhpErrorLogger.printWithCallStack": {
    "printWithCallStack": false,
    "printCallStackAsArray": false
},
"betterPhpErrorLogger.varDumpExportVariable": {
    "varDumpExportVariable": false,
    "dumpOrExport": "var_export"
},
"betterPhpErrorLogger.useEchoInstead": {
    "useEchoInstead": false,
    "preOrBr": "pre"
},               
"betterPhpErrorLogger.usePHPParserForPositioning": true,
"betterPhpErrorLogger.laravelLog": {
    "useLaravelLog": false,
    "autoUse": true,
    "laravelLogLevel": "debug",
    "chooseLogLevel": false
},
"betterPhpErrorLogger.logOnlyFirstSelection": false

```

To change what will be error logged you can set `betterPhpErrorLogger.errorLogs` to an array of strings, where each value string will be error logged.  
You can use `${selectedVar}` for the selected variable.  Use `${selectedVarString}` for the name of the variable, by default the two values are the same.  
The exception is when var_dumping variable:  
- when echoing `${selectedVar}` will be changed to "var_dump(`${selectedVar}`)" 
- when error_logging `${selectedVar}` will be changed to "rtrim(ob_get_clean())", which gets the output buffer.

You can use a default name when no variable is selected, change `betterPhpErrorLogger.defaultVariable` to do that. `${selectedVarString}` will be changed to the name and `${selectedVar}` will be the value.

You can change some settings to always use them when using the default shotcut `Ctrl + Alt + D`.

Set `betterPhpErrorLogger.printWithCallStack` to an object with the property printWithCallStack set to true to also print call stack. You can also choose to print the call stack as an array, if you set the property printCallStackAsArray as array to true.  
Set `betterPhpErrorLogger.useEchoInstead` to an object with the property useEchoInstead set to true to use echo instead of error_log. You can also choose between using pre or br tags, by setting the property preOrBr to pre or br.
Set `betterPhpErrorLogger.varDumpExportVariable` to an object with the property varDumpExportVariable set to true to var_dump or export the variable. Set the property dumpOrExport to var_dump or var_export to choose what to use.

If you have any of these settings set to true for the default shortcut, it will do the opposite when you use the shortcut for them, like it says in the description for the shortcuts above.
For the other settings things it will use your defaults.
  
By default the extension uses PHP Parser to try to position the error_log correctly. PHP Parser requires valid code. If you have problems with this you can set `betterPhpErrorLogger.usePHPParserForPositioning` to false. This will always log on the next line.

If you want to use Laravel's log function instead of error_log, you can set `betterPhpErrorLogger.laravelLog` to an object with the property useLaravelLog set to true. autoUse is a setting that will write `use Illuminate\Support\Facades\Log;` after the last use statement, if it doesn't exist. The default is true. You can also set the log level with the property laravelLogLevel. The default log level is debug. You can also choose to choose the log level when logging, by setting the property chooseLogLevel to true.

Now when you have selected multiple things, all will be logged. If you want to log only the first selection you can set `betterPhpErrorLogger.logOnlyFirstSelection` to true.