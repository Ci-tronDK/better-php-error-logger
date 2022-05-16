# better-php-error-logger

This is a small modification to Easy PHP Error Logger by dhide, where there are some customisation options to e.g. also log filename and line number.
Press Ctrl + Alt + D when a variable is selected to error log.

You can change what will be error logged by adding betterPhpErrorLogger.errorLogs to settings.json and give it an array, where each value is an error log.
Use ${selectedVar} for the selected variable.
The default value is [
                        "'${selectedVar}: ' . print_r(${selectedVar}, true)",
                        "'in ' . __FILE__ . ' on line ' . __LINE__"
                    ]

Set betterPhpErrorLogger.printCallStack to true to also print call stack.
Set betterPhpErrorLogger.varDumpVariable to true to var_dump variable.
Set betterPhpErrorLogger.useEchoInstead to true to echo instead of error_log.
