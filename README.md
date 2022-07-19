# better-php-error-logger

With this extension you can use the error_log function in PHP with keyboard shortcuts. There are some customization options.
Here is a list of shotcuts you can use. 

| Shortcuts 	     | Description                               	                                                               |  Why                                    |
|------------------- |---------------------------------------------------------------------------------------------------------------- |---------------------------------------- |
| `Ctrl + Alt + D`   | To to error log when a variable is selected. 	                                                               | D for Default. 	                 |
| `Ctrl + Alt + C`   | To also print call stack. (No Call Stack, when it is true for default in settings)                              | C for Call Stack.                       | 
| `Ctrl + Alt + V`   | To var_dump variable. (No Var dump, when it is true for default in settings)                                    | V for var_dump.                         |
| `Ctrl + Alt + E`   | To use Echo instead.  (No Use Echo instead, when it is true for default in settings)                            | E for Echo.                             |
| `Ctrl + Alt + O D` | To print current output buffer with default settings.                                                           | O for Output buffer.                    |
| `Ctrl + Alt + O C` | To print current output buffer with call stack. (No Call Stack, when it is true for default in settings)        |                                         | 
| `Ctrl + Alt + O V` | To print current output buffer with var dumped variable. (No Var dump, when it is true for default in settings) |                                         |
| `Ctrl + Alt + O E` | To echo current output buffer. (No Use Echo instead, when it is true for default in settings)                   |                                         |    
| `Ctrl + Alt + X`   | To delete all error_logs, var_dumps, echos with () and \<br> inside a file                                      | X for when something is crossed over :) |

You can change the keyboard shortcuts in VS Code shortcut settings. 

In VS Code settings or `settings.json`, you can change some settings.

To change what will be error logged you can set `betterPhpErrorLogger.errorLogs` to an array of strings, where each value string will be error logged.  
You can use `${selectedVar}` for the selected variable.  
The default values are:  
```json
[
    "'${selectedVar}: ' . print_r(${selectedVar}, true)",
    "'in ' . __FILE__ . ' on line ' . __LINE__"
]
```
You can use a default variable when no variable is selected, change `betterPhpErrorLogger.defaultVariable` to do that. The default values are:  

```json
{  
    "name": "$here",  
    "value": "__CLASS__ . '::' . __FUNCTION__"  
}
```

You can change some settings to always use them when using the default shotcut `Ctrl + Alt + D`.

Set `betterPhpErrorLogger.printCallStack` to true to also print call stack.  
Set `betterPhpErrorLogger.useEchoInstead` to true to echo instead of error_log.
Set `betterPhpErrorLogger.varDumpSettings` to an object where varDumpVariable is true to var_dump variable.
If you have any of these settings set to true for the default shortcut, it will do the opposite when you use the shortcut for them, like it says in the description for the shortcuts above.
For the other settings things it will use your defaults. 

Because you can't error_log a var_dump I use a variable called $var_dump_variable, and get the contents from the output buffer.  
But then the if you print out a string with the variable name, it will be called $var_dump_variable.
To change that you can set `betterPhpErrorLogger.varDumpSettings` to an object where `errorLogsToReplaceOccurences` is an object where you can call each property `error_log_#number`, where number is the number of the errorlog. As a value for the properties, you can write an array of occurences, where each occurence of $var_dump_variable will be replaced with the selected value.

By default it is set as this:
```json
{
    "error_log_1": [
        1
    ]
}
```

That means that in the first error_log, which by default is:  
`"'${selectedVar}: ' . print_r(${selectedVar}, true)"`, when you var_dump it will be changed to: 

```php
ob_start();
var_dump($selected_var);
$var_dump_variable = rtrim(ob_get_clean()); 
error_log('$var_dump_variable: ' . print_r($var_dump_variable, true));
```
and then the first occurence in the first error_log will be changed to the selectedVar, so it will look like this:  

```php
ob_start();
var_dump($selected_var);
$var_dump_variable = rtrim(ob_get_clean()); 
error_log('$selected_var: ' . print_r($var_dump_variable, true));
```