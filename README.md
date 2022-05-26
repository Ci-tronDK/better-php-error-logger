# better-php-error-logger

This is a modification to Easy PHP Error Logger by dhide, where there are some customisation options to e.g. also log filename and line number.  


Use these keyboard shortcuts:  
                `Ctrl + Alt + D` when a variable is selected to error log.  
                `Ctrl + Alt + Shift + D` to also print call stack,                   
                `Ctrl + Alt + Shift + E` to var_dump variable,    
                `Ctrl + Alt + Shift + F` to use Echo instead,
                `Ctrl + Alt + Shift + X` to delete all error_logs in file

Change keyboard shortcuts in VS Code shortcut settings.

You can change some settings to always use when using `Ctrl + Alt + D` them in either `settings.json` or in the Settings UI.

Set `betterPhpErrorLogger.printCallStack` to true to also print call stack.  
Set `betterPhpErrorLogger.varDumpVariable` to true to var_dump variable.  
Set `betterPhpErrorLogger.useEchoInstead` to true to echo instead of error_log. 

When you are using one of the other shortuts it will do it does and use your default setting for other things.  
E.g if you use the keyboard shortcut for var_dump variable and you have set use Echo instead to true in your settings, it will echo the var_dumped variable.  
(And varDumpVariable = false will have no effect)

Change what will be error logged by adding `betterPhpErrorLogger.errorLogs` and give it an array of objects with an `errorLog` property, each value is an error log.  
Use ${selectedVar} for the selected variable.

When var_dumping a variable a temporary variable will be created, it will use this name instead of the selected variable, but you can change it by adding the property `varDumpOccurencesToUseVariableName` to the object and give it an array where each nth occurence will be replaced by variable name. The default is an array with the value 1.

The default values are  

                    ```json
                    [
                        {
                            "errorLog": "'${selectedVar}: ' . print_r(${selectedVar}, true)",
                            "varDumpOccurencesToUseVariableName": [
                                1
                            ]
                        },
                        {
                            "errorLog": "'in ' . __FILE__ . ' on line ' . __LINE__"
                        }
                    ]
                    ```   
                    
 
Change betterPhpErrorLogger.defaultVariable to set which variable name and value will be used when no variable is selected. The default values are:  

                    ```json
                    {  
                        "name": "$here",  
                        "value": "__CLASS__ . '::' . __FUNCTION__"  
                    }
                    ```  