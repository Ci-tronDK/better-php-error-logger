# better-php-error-logger

This is a small modification to Easy PHP Error Logger by dhide, where there are some customisation options to e.g. also log filename and line number.  
Press Ctrl + Alt + D when a variable is selected to error log.
You can also use these keyboard shortcuts:  
                Ctrl + Alt + Shift + D to also print call stack,                 
                Ctrl + Alt + Shift + E to var_dump variable,  
                Ctrl + Alt + Shift + F to use Echo instead  

Change keyboard shortcuts in VS Code shortcut settings.

You can change settings in either settings.json or in the Settings UI for these things to always use them when pressing Ctrl + Alt + D.  
When you are using one of the other shortuts it will do it does and use your default setting for other things.  
E.g if you use the keyboard shortcut for var_dump variable and you have set use Echo instead to true in your settings, it will echo the var_dumped variable.  
(And varDumpVariable = false will have no effect)

Change what will be error logged by adding betterPhpErrorLogger.errorLogs and give it an array, where each value is an error log.  
Use ${selectedVar} for the selected variable.  
The default values are  
                    [  
                        "'${selectedVar}: ' . print_r(${selectedVar}, true)",  
                        "'in ' . __FILE__ . ' on line ' . __LINE__"  
                    ]  
Set betterPhpErrorLogger.printCallStack to true to also print call stack.  
Set betterPhpErrorLogger.varDumpVariable to true to var_dump variable.  
Set betterPhpErrorLogger.useEchoInstead to true to echo instead of error_log.  
Change betterPhpErrorLogger.defaultVariable to set which variable name and value will be used when no variable is selected. The default values are:  
                    {  
                        "name": "$here",  
                        "value": "__CLASS__ . '::' . __FUNCTION__"  
                    }  
If you are var_dumping e.g. functions then a variable will be created based on the function where characters like parentheses will be replaced by special characters.  
This is user changeable (e.g. if characters isn't supported). Space before var_dump in the variable will be replaced by a special space. This is also userr changeable.  
Use betterPhpErrorLogger.varDumpSpecialChars for this.  
The default values are:  
                    {  
                        "Space before var_dump": " ",  
                        "->": "➜",  
                        "(": "⟮",  
                        ")": "⟯",  
                        "[": "⦋",  
                        "]": "⦌",  
                        "'": "",  
                        "\"": ""  
                    }