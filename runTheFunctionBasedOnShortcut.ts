import * as vscode from 'vscode';
import { TextEditor, TextEditorEdit } from "vscode";
import { symbolFinderLoop } from "./symbolFinderLoop";
import { getIndentation } from "./getIndentation";
import { isBalanced } from "./isBalanced";

export function runTheFunctionBasedOnShortcut(args: string) {
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
    const selectedVarString = selectedVar;
    let selectedLine = selection.active.line;
    const indentation = getIndentation(editor, document, selectedLine);
    const selectedLineText = document.lineAt(selectedLine).text;

    //Check if the keyboard args are set and and get the opposite of settings if they are set else use settings from configuration
    const useEchoInstead: string = (args === `useEchoInstead` || args === 'printCurrentOutputBufferUseEcho') ? !configurations.useEchoInstead : configurations.useEchoInstead;
    const printWithCallStack: string = (args === `printWithCallStack` || args === 'printCurrentOutputBufferWithCallStack') ? !configurations.printWithCallStack : configurations.printWithCallStack;
    const varDumpVariable: string = (args === `varDumpVariable` || args === 'printCurrentOutputBufferVarDump') ? !configurations.varDumpVariable : configurations.varDumpVariable;
    selectedVar = args === "printCurrentOutputBuffer" ||
        args === 'printCurrentOutputBufferUseEcho' ||
        args === 'printCurrentOutputBufferWithCallStack' ||
        args === 'printCurrentOutputBufferVarDump' ?
        "ob_get_contents()" : selectedVar;

    let errorLogString = `error_log`;
    let newLine = ``;

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

        let parantheseLeft = `(`;
        let parantheseRight = `)`;

        if (useEchoInstead) {
            errorLogString = `echo`;
            newLine = ` . "<br>"`;
            parantheseLeft = ` `;
            parantheseRight = ``;
        }

        // let varDumpString = `\${"${selectedVar.replaceAll(`'`, ``).replaceAll(`"`, ``).replaceAll(`$`, `💲`)}"}`;


        if (varDumpVariable) {
            let varDumpSelectedVar = `var_dump(${selectedVar})`;

            if (!useEchoInstead) {
                let varDumpNewVar = `$var_dump_${selectedVar.replaceAll("$", "")}`;
                varDumpNewVar = `$var_dump`;
                editBuilder.insert(
                    new vscode.Position(selectedLine + 1, 0),
                    `${indentation}ob_start();\n` +
                    `${indentation}${varDumpSelectedVar};\n` +
                    `${indentation}${varDumpNewVar} = rtrim(ob_get_clean()); \n`
                );
                selectedVar = varDumpNewVar;
            } else {
                selectedVar = varDumpSelectedVar;
            }
        }

        configurations.errorLogs.forEach((errorLog: string): void => {
            //selectedVar = selectedVar.replaceAll('$$', '\$$$$$');

            errorLog = errorLog.replaceAll("${selectedVarString}", selectedVarString).replaceAll("${selectedVar}", selectedVar);

            if (varDumpVariable && useEchoInstead) {

                //Get index of all selecedVAr
                let selectedVarIndexes = [];
                let selectedVarIndex = errorLog.indexOf(selectedVar);
                while (selectedVarIndex !== -1) {
                    selectedVarIndexes.push(selectedVarIndex);
                    selectedVarIndex = errorLog.indexOf(selectedVar, selectedVarIndex + 1);
                }

                selectedVarIndexes.forEach(selectedVarIndex => {

                    //Get last period before selectedVar in errorLog
                    let lastPeriod = errorLog.lastIndexOf('.', selectedVarIndex);

                    // Replace it with a comma if found
                    if (lastPeriod !== -1) {
                        errorLog = `${errorLog.substring(0, lastPeriod)},${errorLog.substring(lastPeriod + 1)}`;
                    }
                })
            }

            editBuilder.insert(
                new vscode.Position(selectedLine + 1, 0),
                `${indentation}${errorLogString}${parantheseLeft}${errorLog}${newLine}${parantheseRight}; \n`
            );
        });


        if (printWithCallStack) {
            editBuilder.insert(
                new vscode.Position(selectedLine + 1, 0),
                `${indentation}${errorLogString}${parantheseLeft} (new \\Exception()) -> getTraceAsString()${newLine}${parantheseRight}; \n`
            );
        }

    });
}
