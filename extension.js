// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    const errorLog = vscode.commands.registerCommand("extension.errorLog", (args) => {


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

        const selectedLine = selection.active.line;
        const indentation = getIndentation(editor, document, selectedLine);


        editor.edit(editBuilder => {

            // Check if the selected variable is empty, if so, get the default selected variable
            if (selectedVar.trim().length === 0) {
                let defaultVariableName = configurations.defaultVariable.name;
                editBuilder.insert(
                    new vscode.Position(selectedLine, 0),
                    `${indentation}${defaultVariableName} = ${configurations.defaultVariable.value};`
                );
                selectedVar = `${defaultVariableName}`;
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

                const { ['Space before var_dump']: spaceBeforeVarDump, ...objectWithoutSpaceBeforeVarDump } = configurations.varDumpSpecialChars
                const toBeReplaced = Object.keys(objectWithoutSpaceBeforeVarDump);
                const replaceWith = Object.values(objectWithoutSpaceBeforeVarDump);

                toBeReplaced.forEach((tag, i) => selectedVarDump = selectedVarDump.replace(new RegExp("\\" + tag, "g"), replaceWith[i]))

                selectedVarDump = `${selectedVarDump}${spaceBeforeVarDump}var_dump`;
                editBuilder.insert(
                    new vscode.Position(selectedLine + 1, 0),
                    `${indentation}ob_start(); var_dump(${selectedVar});\n${indentation}${selectedVarDump} = rtrim(ob_get_clean());\n`
                );
            }
            configurations.errorLogs.forEach(errorLog => {
                errorLog = errorLog.replaceAll("${selectedVar}", selectedVar);
                if (configurations.varDumpVariable) {
                    errorLog = errorLog.replaceAll(selectedVar, `${selectedVarDump}`);
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

    });

    context.subscriptions.push(errorLog);
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
