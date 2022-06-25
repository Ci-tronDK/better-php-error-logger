// The module 'vscode' contains the VS Code extensibility API



// Import the module and reference it with the alias vscode in your code below
//const vscode = require('vscode');
import * as vscode from 'vscode';
import { Disposable, TextDocument, TextEditor, TextEditorEdit } from "vscode";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context: { subscriptions: Disposable[]; }): void {
    const errorLog: Disposable = vscode.commands.registerCommand("extension.betterPhpErrorLogger", (args: string): void => {
        if (args === undefined) {
            args = "";
        }

        runTheFunctionBasedOnShortcut(args);
    });

    const printWithCallStack: Disposable = vscode.commands.registerCommand("extension.betterPhpErrorLogger.printWithCallStack", (args: string): void => {
        if (args === undefined) {
            args = "printWithCallStack";
        }

        runTheFunctionBasedOnShortcut(args);
    });

    const varDumpVariable: Disposable = vscode.commands.registerCommand("extension.betterPhpErrorLogger.varDumpVariable", (args: string): void => {
        if (args === undefined) {
            args = "varDumpVariable";
        }

        runTheFunctionBasedOnShortcut(args);
    });

    const useEchoInstead: Disposable = vscode.commands.registerCommand("extension.betterPhpErrorLogger.useEchoInstead", (args: string): void => {
        if (args === undefined) {
            args = "useEchoInstead";
        }

        runTheFunctionBasedOnShortcut(args);
    });

    const deleteErrorLogs: Disposable = vscode.commands.registerCommand("extension.betterPhpErrorLogger.deleteErrorLogs", (args: string): void => {
        deleteError_logs();
    });

    const printCurrentOutputBuffer: Disposable = vscode.commands.registerCommand("extension.betterPhpErrorLogger.printCurrentOutputBuffer", (args: string): void => {
        if (args === undefined) {
            args = "printCurrentOutputBuffer";
        }

        runTheFunctionBasedOnShortcut(args);
    });

    const printCurrentOutputBufferAndCallStack: Disposable = vscode.commands.registerCommand("extension.betterPhpErrorLogger.printCurrentOutputBufferWithCallStack", (args: string): void => {
        if (args === undefined) {
            args = "printCurrentOutputBufferWithCallStack";
        }

        runTheFunctionBasedOnShortcut(args);
    });

    const printCurrentOutputBufferVarDump: Disposable = vscode.commands.registerCommand("extension.betterPhpErrorLogger.printCurrentOutputBufferVarDump", (args: string): void => {
        if (args === undefined) {
            args = "printCurrentOutputBufferVarDump";
        }

        runTheFunctionBasedOnShortcut(args);
    });

    const printCurrentOutputBufferUseEcho: Disposable = vscode.commands.registerCommand("extension.betterPhpErrorLogger.printCurrentOutputBufferUseEcho", (args: string): void => {

        if (args === undefined) {
            args = "printCurrentOutputBufferUseEcho";
        }

        runTheFunctionBasedOnShortcut(args);
    });

    context.subscriptions.push(errorLog);
    context.subscriptions.push(printWithCallStack);
    context.subscriptions.push(varDumpVariable);
    context.subscriptions.push(useEchoInstead);
    context.subscriptions.push(deleteErrorLogs);
    context.subscriptions.push(printCurrentOutputBuffer);
    context.subscriptions.push(printCurrentOutputBufferAndCallStack);
    context.subscriptions.push(printCurrentOutputBufferVarDump);
    context.subscriptions.push(printCurrentOutputBufferUseEcho);

}

function runTheFunctionBasedOnShortcut(args: string) {
    const editor: TextEditor | undefined = vscode.window.activeTextEditor;
    if (!editor) {
        return;
    }

    const document = editor.document;
    if (document.languageId !== "php") {
        return;
    }

    const configurations = vscode.workspace.getConfiguration('betterPhpErrorLogger');

    const selection = editor.selection;
    let selectedVar: string = document.getText(selection).replaceAll(`'`, `"`);
    let selectedLine = selection.active.line;
    const indentation = getIndentation(editor, document, selectedLine);
    const selectedLineText = document.lineAt(selectedLine).text;

    //Check if the keyboard args are set and and get the opposite of settings if they are set else use settings from configuration
    const useEchoInstead: string = (args === `useEchoInstead` || args === 'printCurrentOutputBufferUseEcho') ? !configurations.useEchoInstead : configurations.useEchoInstead;
    const printWithCallStack: string = (args === `printWithCallStack` || args === 'printCurrentOutputBufferWithCallStack') ? !configurations.printWithCallStack : configurations.printWithCallStack;
    const varDumpVariable: string = (args === `varDumpVariable` || args === 'printCurrentOutputBufferVarDump') ? !configurations.varDumpVariableSettings.varDumpVariable : configurations.varDumpVariableSettings.varDumpVariable;
    selectedVar = args === "printCurrentOutputBuffer" ||
        args === 'printCurrentOutputBufferUseEcho' ||
        args === 'printCurrentOutputBufferWithCallStack' ||
        args === 'printCurrentOutputBufferVarDump' ?
        "ob_get_contents()" : selectedVar;

    let errorLogString = `error_log`;
    let newLine = ``;
    let varDumpString = `$var_dump_variable`;
    let startIndex = 0;
    let endIndex = 0;

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

    //If { is not on same line as function call, then move to the line with the {

    if (selectedLineText.includes('function') || selectedLineText.includes('switch')) {
        //Find first occurence of { after function
        selectedLine = symbolFinderLoop(document, selectedLine - 1, '{');
    }

    if (selectedLineText.includes('switch')) {
        //Find the } after the switch

        //Function where you pass string and index of first bracket and returns index of the matching bracket

        // function matchBrackets(string, index) {
        //     let openBrackets = 0;
        //     let closeBrackets = 0;
        //     for (let i = index; i < string.length; i++) {
        //         if (string[i] === '{') {
        //             openBrackets++;
        //         } else if (string[i] === '}') {
        //             closeBrackets++;
        //         }
        //         if (openBrackets === closeBrackets) {
        //             return i;
        //         }
        //     }
        //     return -1;
        // }
        selectedLine = symbolFinderLoop(document, selectedLine + 2, '}');
    }

    //If selected line contains array and the next non-whitespace line is a (, then move to the first line with ;
    if (!selectedLineText.includes(';') && selectedVar.trim().length !== 0 && !selectedLineText.includes('function') && !selectedLineText.includes('switch')) {
        selectedLine = symbolFinderLoop(document, selectedLine, ';');
    }

    editor.edit((editBuilder: TextEditorEdit) => {

        let newLineIfOnLastLine = ``;
        let errorLogsToReplaceOccurences: object;
        let errorLogOccurencesReplaceCounter = 0;
        //If selection is on last line, add new line
        if (selection.start.line === document.lineCount - 1) {
            editBuilder.insert(new vscode.Position(document.lineCount, 0), '\n');
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
                new vscode.Position(selectedLine + position, 0),
                `${indentation}${defaultVariableName} = ${defaultVariableValue};${newLineIfOnLastLine}`
            );
            selectedVar = defaultVariableName;
        }

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

            errorLogsToReplaceOccurences = configurations.varDumpVariableSettings.errorLogsToReplaceOccurences;
        }
        let varDumpOccurencesToUseVariableName: number[] | undefined;
        configurations.errorLogs.forEach((errorLog: string): void => {
            errorLog = errorLog.replaceAll("${selectedVar}", selectedVar);
            if (varDumpVariable) {
                errorLog = errorLog.replaceAll(selectedVar, varDumpString);
                errorLogOccurencesReplaceCounter++;
                let key = `error_log_${errorLogOccurencesReplaceCounter}`;
                varDumpOccurencesToUseVariableName = [];

                if (errorLogsToReplaceOccurences[key as keyof typeof errorLogsToReplaceOccurences]) {
                    varDumpOccurencesToUseVariableName = errorLogsToReplaceOccurences[key as keyof typeof errorLogsToReplaceOccurences];
                }

                if (varDumpOccurencesToUseVariableName.length !== 0) {

                    //Sort number array ascending
                    varDumpOccurencesToUseVariableName.sort(function (a: number, b: number) { return a - b });

                    let counter = 0;
                    varDumpOccurencesToUseVariableName.forEach((occurence: number): void => {
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
                `${indentation}${errorLogString}((new \\Exception()) -> getTraceAsString()${newLine}); \n`
            );
        }

    })
}

//Check if string braces are balanced
function isBalanced(string: string): boolean {
    let stack: string[] = [];
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
            let last = stack.pop() as '(' | '[' | '{';
            if (braceMap[last] !== char) {
                return false;
            }
        }
    }
    return stack.length === 0;
}

function getIndentation(editor: TextEditor, document: TextDocument, selectedLine: number): string {
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

function deleteError_logs() {

    const configurations = vscode.workspace.getConfiguration('betterPhpErrorLogger');
    // /\berror_log\b\s*\(.*?(?=;)\;/g To delete error_logs()
    // /\bob_start\b\s*\(\s*\)\s*\;\s*\bvar_dump\b\s*\(.*\s*\$\bvar_dump_variable\b\s*\=\s*\brtrim\b\s*\(\s*\bob_get_clean\b\(\s*\)\s*\)\s*\;/g To delete ob_start() and var_dump($var_dump_variable)
    const editor: TextEditor | undefined = vscode.window.activeTextEditor;

    if (!editor) {
        return;
    }

    const document = editor.document;

    //Get all text in editor.
    const text = document.getText();
    let newText = text;

    if (!text.includes("error_log") &&
        !text.includes("var_dump") &&
        !text.includes("echo") &&
        !text.includes(configurations.defaultVariable.name) &&
        !text.includes(configurations.defaultVariable.value)) {
        vscode.window.showErrorMessage(`Nothing to delete.`);

        //MessageController.get(this.editor)?.showMessage(loc.rejectReason, position);


        return;
    }

    if (text.includes("error_log")) {
        newText = newText.replace(/\r?\n?\berror_log\b\s*\(.*?(?=;)\;\r?\n?/g, ``);
    }

    if (text.includes("var_dump")) {
        newText = newText.replace(/\r?\n?\bob_start\b\s*\(\s*\)\s*\;\s*\bvar_dump\b\s*\(.*\s*\$\bvar_dump_variable\b\s*\=\s*\brtrim\b\s*\(\s*\bob_get_clean\b\(\s*\)\s*\)\s*\;\n?/g, ``);
        newText = newText.replace(/\bvar_dump\b\s*\(.*?(?=;)\;\r?\n?/g, ``);
    }

    if (text.includes("echo")) {
        newText = newText.replace(/\r?\n?\becho\b\s*\(.*\<\s*br\s*>\*?.*?(?=;);\r?\n?/g, ``);
    }

    if (text.includes(configurations.defaultVariable.name && configurations.defaultVariable.value)) {
        newText = newText.replace(new RegExp(`\r?\n?\\${configurations.defaultVariable.name}\\s*=\\s*${configurations.defaultVariable.value}\\s*\;\r?\n?`, 'g'), ``);
    }

    if (newText === text) {
        vscode.window.showErrorMessage(`Nothing to delete.`);
        return;
    }


    //Get postion of last char on last line
    const lastLine = document.lineCount - 1;
    const lastLineLastChar = document.lineAt(lastLine).range.end.character;

    editor.edit((editBuilder): void => {
        editBuilder.replace(new vscode.Range(0, 0, lastLine, lastLineLastChar), newText);
    })
}

function symbolFinderLoop(document: TextDocument, selectedLine: number, symbol: string): number {
    let symbolPosition = selectedLine;
    for (let i = selectedLine + 1; i < document.lineCount; i++) {
        const lineText = document.lineAt(i).text;
        if (lineText.includes(symbol)) {
            symbolPosition = i;
            break;
        }
    }
    return symbolPosition;
}

exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() { }

module.exports = {
    activate,
    deactivate
}

