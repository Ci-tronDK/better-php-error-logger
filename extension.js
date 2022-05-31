// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    const errorLog = vscode.commands.registerCommand("extension.betterPhpErrorLogger", (args) => {
        if (args === undefined) {
            args = "";
        }

        runTheFunctionBasedOnShortcut(args);
    });

    const printWithCallStack = vscode.commands.registerCommand("extension.betterPhpErrorLogger.printWithCallStack", (args) => {
        if (args === undefined) {
            args = "printWithCallStack";
        }

        runTheFunctionBasedOnShortcut(args);
    });

    const varDumpVariable = vscode.commands.registerCommand("extension.betterPhpErrorLogger.varDumpVariable", (args) => {
        if (args === undefined) {
            args = "varDumpVariable";
        }

        runTheFunctionBasedOnShortcut(args);
    });

    const useEchoInstead = vscode.commands.registerCommand("extension.betterPhpErrorLogger.useEchoInstead", (args) => {
        if (args === undefined) {
            args = "useEchoInstead";
        }

        runTheFunctionBasedOnShortcut(args);
    });

    const deleteErrorLogs = vscode.commands.registerCommand("extension.betterPhpErrorLogger.deleteErrorLogs", (args) => {
        if (args === undefined) {
            args = "deleteErrorLogs";
        }

        deleteError_logs(args);
    });

    const printCurrentOutputBuffer = vscode.commands.registerCommand("extension.betterPhpErrorLogger.printCurrentOutputBuffer", (args) => {
        if (args === undefined) {
            args = "printCurrentOutputBuffer";
        }

        runTheFunctionBasedOnShortcut(args);
    });

    context.subscriptions.push(errorLog);
    context.subscriptions.push(printWithCallStack);
    context.subscriptions.push(varDumpVariable);
    context.subscriptions.push(useEchoInstead);
    context.subscriptions.push(deleteErrorLogs);
    context.subscriptions.push(printCurrentOutputBuffer);

}

function runTheFunctionBasedOnShortcut(args) {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        return;
    }

    const document = editor.document;
    if (document.languageId !== "php") {
        return;
    }

    const configurations = vscode.workspace.getConfiguration('betterPhpErrorLogger');

    const selection = editor.selection;
    let selectedVar = document.getText(selection).replaceAll(`'`, `"`);

    if (args === "printCurrentOutputBuffer") {
        selectedVar = "ob_get_contents()";
    }

    //Check if the braces in the selected variable are balanced
    if (!isBalanced(selectedVar)) {
        vscode.window.showErrorMessage(`Braces in the selected value are not balanced`);
        return;
    }
    //Check if the selected variable not includes ;
    if (selectedVar.includes(';')) {
        vscode.window.showErrorMessage(`The selected value can not include ;`);
        return;
    }

    const selectedLine = selection.active.line;
    const indentation = getIndentation(editor, document, selectedLine);

    editor.edit(editBuilder => {

        let newLineIfOnLastLine = ``;
        //If selection is on last line, add new line
        if (selection.start.line === document.lineCount - 1) {
            editBuilder.insert(new vscode.Position(document.lineCount), '\n');
            newLineIfOnLastLine = '\n';
        }

        // Check if the selected variable is empty, if so, get the default selected variable
        if (selectedVar.trim().length === 0) {
            const defaultVariableName = configurations.defaultVariable.name;
            const defaultVariableValue = configurations.defaultVariable.value;
            let position = 0;
            //If selected line contains text
            if (document.lineAt(selectedLine).text.trim().length !== 0) {
                position = 1;
            }

            editBuilder.insert(
                new vscode.Position(selectedLine + position),
                `${indentation}${defaultVariableName} = ${defaultVariableValue};${newLineIfOnLastLine}`
            );
            selectedVar = defaultVariableName;
        }


        //Check if the keyboard args is set and use them if they are set else use settings from configuraiton
        const useEchoInstead = args === `useEchoInstead` ? true : configurations.useEchoInstead;
        const printWithCallStack = args === `printWithCallStack` ? true : configurations.printWithCallStack;
        const varDumpVariable = args === `varDumpVariable` ? true : configurations.varDumpVariable;

        let errorLogString = `error_log`;
        let newLine = ``;
        let varDumpString = `$var_dump_variable`;
        let startIndex = 0;
        let endIndex = 0;

        if (useEchoInstead) {
            errorLogString = `echo`;
            newLine = ` . "<br>"`;
        }

        if (varDumpVariable) {
            editBuilder.insert(
                new vscode.Position(selectedLine + 1, 0),
                `${indentation}ob_start();\n` +
                `${indentation}var_dump(${selectedVar});\n` +
                `${indentation}${varDumpString} = rtrim(ob_get_clean()); \n`
            );

        }
        configurations.errorLogs.forEach(errorLogObject => {
            let errorLog = errorLogObject.errorLog.replaceAll("${selectedVar}", selectedVar);

            if (varDumpVariable) {

                errorLog = errorLog.replaceAll(selectedVar, varDumpString);

                varDumpOccurencesToUseVariableName = errorLogObject.varDumpOccurencesToUseVariableName;

                if (varDumpOccurencesToUseVariableName !== undefined) {

                    //Sort number array ascending
                    varDumpOccurencesToUseVariableName.sort(function (a, b) { return a - b });

                    let counter = 0;
                    varDumpOccurencesToUseVariableName.forEach(occurence => {
                        startIndex = errorLog.split(varDumpString, occurence - counter).join(varDumpString).length;
                        endIndex = startIndex + varDumpString.length;
                        errorLog = errorLog.substring(0, startIndex) + selectedVar + errorLog.substring(endIndex);
                        counter++;
                    })

                }
            }

            editBuilder.insert(
                new vscode.Position(selectedLine + 1, 0),
                `${indentation}${errorLogString}(${errorLog}${newLine});\n`
            );
        });


        if (printWithCallStack) {
            editBuilder.insert(
                new vscode.Position(selectedLine + 1, 0),
                `${indentation}${errorLogString} ((new \\Exception()) -> getTraceAsString()${newLine}); \n`
            );
        }

    })
}

//Check if string braces are balanced
function isBalanced(string) {
    let stack = [];
    let openBraces = ["(", "[", "{"];
    let closeBraces = [")", "]", "}"];
    let braceMap = {
        "(": ")",
        "[": "]",
        "{": "}"
    };

    for (let i = 0; i < string.length; i++) {
        let char = string[i];
        if (openBraces.includes(char)) {
            stack.push(char);
        } else if (closeBraces.includes(char)) {
            let last = stack.pop();
            if (braceMap[last] !== char) {
                return false;
            }
        }
    }
    return stack.length === 0;
}

function getIndentation(editor, document, selectedLine) {
    const selectedLineChars = document.lineAt(selectedLine).text.split('');
    let indentLevel = 0;
    let tabs = false;
    let indentation = '';

    if (selectedLineChars[0] === '\t') {
        tabs = true;
    }

    if (tabs) {
        for (const [i, char] of selectedLineChars.entries()) {
            // exit loop if not first index and not the same as previous char
            if (i !== 0 && selectedLineChars[i] !== selectedLineChars[i - 1]) {
                break;
            }
            if (char === "\t") {
                indentLevel++;
            }
        }

        indentation = '\t'.repeat(indentLevel)
    } else {
        for (const [i, char] of selectedLineChars.entries()) {
            // exit loop if not first index and not the same as previous char
            if (i !== 0 && selectedLineChars[i] !== selectedLineChars[i - 1]) {
                break;
            }
            if (char === ' ') {
                indentLevel++;
            }
        }

        indentation = ' '.repeat(indentLevel);
    }

    return indentation;
}

function deleteError_logs(args) {

    const configurations = vscode.workspace.getConfiguration('betterPhpErrorLogger');
    // /\berror_log\b\s*\(.*?(?=;)\;/g To delete error_logs()
    // /\bob_start\b\s*\(\s*\)\s*\;\s*\bvar_dump\b\s*\(.*\s*\$\bvar_dump_variable\b\s*\=\s*\brtrim\b\s*\(\s*\bob_get_clean\b\(\s*\)\s*\)\s*\;/g To delete ob_start() and var_dump($var_dump_variable)
    const editor = vscode.window.activeTextEditor;
    const document = editor.document;

    //Get all text in editor.
    const text = document.getText();
    let newText = text;

    if (!text.includes("error_log") &&
        !text.includes("var_dump") &&
        !text.includes("echo") &&
        !text.includes(configurations.defaultVariable.name) &&
        !text.includes(configurations.defaultVariable.value)) {
        return;
    }

    if (text.includes("error_log")) {
        newText = newText.replace(/\berror_log\b\s*\(.*?(?=;)\;\r?\n?/g, ``);
    }

    if (text.includes("var_dump")) {
        newText = newText.replace(/\bob_start\b\s*\(\s*\)\s*\;\s*\bvar_dump\b\s*\(.*\s*\$\bvar_dump_variable\b\s*\=\s*\brtrim\b\s*\(\s*\bob_get_clean\b\(\s*\)\s*\)\s*\;\n?/g, ``);
        newText = newText.replace(/\bvar_dump\b\s*\(.*?(?=;)\;\r?\n?/g, ``);
    }

    if (text.includes("echo")) {
        newText = newText.replace(/\becho\b\s*\(.*\<\s*br\s*>\*?.*?(?=;);\r?\n?/g, ``);
    }

    if (text.includes(configurations.defaultVariable.name && configurations.defaultVariable.value)) {
        newText = newText.replace(new RegExp(`\\${configurations.defaultVariable.name}\\s*=\\s*${configurations.defaultVariable.value}\\s*\;\r?\n?`, 'g'), ``);
    }

    if (newText === text) {
        return;
    }


    //Get postion of last char on last line
    const lastLine = document.lineCount - 1;
    const lastLineLastChar = document.lineAt(lastLine).range.end.character;

    editor.edit(editBuilder => {
        editBuilder.replace(new vscode.Range(0, 0, lastLine, lastLineLastChar), newText);
    })

}

exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() { }

module.exports = {
    activate,
    deactivate
}

