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

    const callStack = vscode.commands.registerCommand("extension.betterPhpErrorLogger.callStack", (args) => {
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

    context.subscriptions.push(errorLog);
    context.subscriptions.push(callStack);
    context.subscriptions.push(varDumpVariable);
    context.subscriptions.push(useEchoInstead);
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

        let errorLogString = `error_log`;
        let newLine = ``;

        if (configurations.useEchoInstead || args == `useEchoInstead`) {
            errorLogString = `echo`;
            newLine = ` . "<br>"`;
        }

        if (configurations.varDumpVariable || args == `varDumpVariable`) {

            selectedVarDump = selectedVar;

            if (!selectedVarDump.startsWith('$')) {
                selectedVarDump = `$${selectedVarDump}`;
            }

            if (selectedVarDump.startsWith('$_')) {
                selectedVarDump = selectedVarDump.replace('$_', '$__');
            }

            const {
                ['Space before var_dump']: spaceBeforeVarDump,
                ['$']: dollarSign,
                ...objectWithoutSpaceBeforeVarDumpAndDollarSign
            }
                = configurations.varDumpSpecialChars;

            //Replace all occurences of $ with i except first occurence
            selectedVarDump = selectedVarDump.slice(0, 1) + selectedVarDump.slice(1).replaceAll('$', dollarSign)

            const toBeReplaced = Object.keys(objectWithoutSpaceBeforeVarDumpAndDollarSign);
            const replaceWith = Object.values(objectWithoutSpaceBeforeVarDumpAndDollarSign);

            toBeReplaced.forEach((tag, i) => selectedVarDump = selectedVarDump.replace(new RegExp("\\" + tag, "g"), replaceWith[i]))

            selectedVarDump = `${selectedVarDump}${spaceBeforeVarDump}var_dump`;
            editBuilder.insert(
                new vscode.Position(selectedLine + 1, 0),
                `${indentation}ob_start(); var_dump(${selectedVar});\n${indentation}${selectedVarDump} = rtrim(ob_get_clean());\n`
            );
        }
        configurations.errorLogs.forEach(errorLog => {
            errorLog = errorLog.replaceAll("${selectedVar}", selectedVar);
            if (configurations.varDumpVariable || args == `varDumpVariable`) {
                errorLog = errorLog.replaceAll(selectedVar, selectedVarDump);
            }

            editBuilder.insert(
                new vscode.Position(selectedLine + 1, 0),
                `${indentation}${errorLogString}(${errorLog}${newLine});\n`
            );
        });

        if (configurations.printCallStack || args == `printWithCallStack`) {
            editBuilder.insert(
                new vscode.Position(selectedLine + 1, 0),
                `${indentation}${errorLogString}((new \\Exception())->getTraceAsString()${newLine});\n`
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

exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() { }

module.exports = {
    activate,
    deactivate
}
