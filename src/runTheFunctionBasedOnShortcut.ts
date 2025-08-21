import * as vscode from 'vscode';
import { TextEditor, TextEditorEdit } from "vscode";
import { symbolFinderLoop } from "./symbolFinderLoop";
import { getIndentation } from "./getIndentation";
import { isBalanced } from "./isBalanced";
import { getSelectionType } from './getSelectionType';
import { parsePHPfile } from './parsePHPfile';
import { findStatementPosition } from './findStatementPosition';
import { findBackwardStatementPosition } from './findBackwardStatementPosition';
import { Program } from 'php-parser';

export async function runTheFunctionBasedOnShortcut(args: string, packageJSON: any): Promise<void> {
    const editor: TextEditor | undefined = vscode.window.activeTextEditor;
    if (!editor) {
        return;
    }

    const document = editor.document;
    if (document.languageId !== "php") {
        return;
    }

    const configurations = vscode.workspace.getConfiguration('betterPhpErrorLogger');

    //Check if the keyboard args are set and and get the opposite of settings if they are set else use settings from configuration
    const useEchoInstead: boolean = (args === `useEchoInstead` || args === 'printCurrentOutputBufferUseEcho') ? true : false;
    const printWithCallStack: string = configurations.printWithCallStack;
    const varDumpExportVariable: string = configurations.varDumpExportVariable;
    const newLinesForEcho: string = configurations.newLinesForEcho;

    const printCurrentOutputBufferArray = ["printCurrentOutputBuffer", 'printCurrentOutputBufferUseEcho'];
    const printCurrentOutputBuffer = printCurrentOutputBufferArray.includes(args);
    const usePHPParserForPositioning: boolean = configurations.usePHPParserForPositioning;
    const laravelLog = configurations.laravelLog;

    let parsedphpFile: Program | null = null;
    if (usePHPParserForPositioning) {
        parsedphpFile = parsePHPfile(document.fileName, document.getText());
        if (parsedphpFile === null) {
            return;
        }
    }

    let errorLogString = `error_log`;
    let selectedLogLevel = laravelLog.laravelLogLevel;

    let lastUseStatementLine: number;
    const useLogStatement = `use Illuminate\\Support\\Facades\\Log;`;

    if (laravelLog.useLaravelLog && !useEchoInstead) {

        if (laravelLog.chooseLogLevel) {

            //Get logLevelsEnum from package.json file using require.
            const logLevelsEnum: string[] = packageJSON.contributes.configuration.properties['betterPhpErrorLogger.laravelLog'].properties.laravelLogLevel.enum;

            // OnDidChangeActive
            // const timeoutTime = 10000;

            //User should be able to select the log level in quickpick, if user do not select anything within 10 seconds, the default log level will be used
            selectedLogLevel = await vscode.window.showQuickPick(logLevelsEnum, {
                placeHolder: `Select log level`
            });

            if (!selectedLogLevel) {
                return;
            }
        }

        if (laravelLog.autoUse) {
            //Add use in PHP file if it is not already added, insert use statement after the last use statement.
            if (!document.getText().includes(useLogStatement)) {

                const useRegex = /use\s+\S+;/g;
                lastUseStatementLine = 0;

                for (let i = 0; i < document.lineCount; i++) {
                    const lineText = document.lineAt(i).text;
                    if (lineText.match(useRegex)) {
                        lastUseStatementLine = i;
                    }
                }
            }
        }

        errorLogString = `Log::${selectedLogLevel}`;
    }

    editor.edit((editBuilder: TextEditorEdit) => {

        if (lastUseStatementLine !== undefined) {

            editBuilder.insert(new vscode.Position(lastUseStatementLine + 1, 0), useLogStatement);

            // Add a new line after the inserted use statement if line after the use statement is not empty.
            if (!document.lineAt(lastUseStatementLine + 2).text.match(/^\s*$/)) {
                editBuilder.insert(new vscode.Position(lastUseStatementLine + 2, 0), `\n`);
            }
        }

        const errorLogs = configurations.errorLogs;


        const defaultVariableName: string = configurations.defaultVariable.name;
        const defaultVariableValue: string = configurations.defaultVariable.value;
        const logMultiple: string = configurations.logMultiple;

        let selections = logMultiple === 'Only first' ? [editor.selection] : editor.selections;

        let selectedVarString: string;
        let selectedVar: string;
        let position = 1;

        if (logMultiple === 'As compact array') {

            // If no selection is made or all selections are empty, write info message and return.
            if (selections.length === 0 || selections.every(selection => document.getText(selection).trim().length === 0)) {
                vscode.window.showInformationMessage(`You have to select at least one variable to log when using "Log multiple as array"`);
                return;
            }

            //Get text for each selection and add it to an array.
            const seletedVariablesString = selections.map(selection => document.getText(selection));
            selectedVarString = `${selections.length} variables selected: ${seletedVariablesString.join(', ')}`;

            //Add quotes around each variable and join them with a comma.
            const seletedVariables = seletedVariablesString.map(selection => `'${selection.replace('$', '')}'`);
            selectedVar = `compact(${seletedVariables.join(', ')})`;

            // Set selections to only the last selection.
            selections = [selections[selections.length - 1]];
        }

        // Change selectedVarString and selectedVar if outputbuffer is being printed.
        if (printCurrentOutputBuffer) {
            selectedVarString = `Output buffer`;
            selectedVar = `ob_get_contents()`;
            position = 0;
        }

        let newLine = ``;

        let parantheseLeft = `(`;
        let parantheseRight = `)`;

        let beforeEchos = ``;
        let afterEchos = ``;

        if (useEchoInstead) {
            errorLogString = `echo`;
            parantheseLeft = ` `;
            parantheseRight = ``;

            switch (newLinesForEcho) {
                case `br`:
                    newLine = ` . "<br>"`;
                    break;
                case `PHP_EOL`:
                    newLine = ` . PHP_EOL`;
                    break;
                case `pre`:
                    beforeEchos = `echo '<pre>';\n`;
                    afterEchos = `echo '</pre>';\n`;
                    break;
            }
        }

        let outbutbufferVariable = `$_ob`;

        let getTrace = `getTrace`;
        let print_r_start = `print_r(`;
        let print_r_end = `, true)`;

        if (printWithCallStack !== 'With call stack as array') {
            getTrace += `AsString`;
            print_r_start = ``;
            print_r_end = ``;
        }


        selections.forEach(selection => {

            if (!printCurrentOutputBuffer && logMultiple !== 'As compact array') {
                selectedVar = document.getText(selection);
                selectedVarString = selectedVar.replaceAll(`'`, ``).replaceAll(`"`, ``);
            }

            let selectedLine = selection.active.line;


            //Only try to position if the use PHP Parser for positioning is true.
            if (usePHPParserForPositioning && parsedphpFile) {
                const selectionType = getSelectionType(selection, selectedVar, parsedphpFile);

                const selectionTypeToSelectedLine: {
                    [key: string]: number;
                } = {
                    //If { is not on same line as function call, then move to the line with the {
                    //Find first occurence of { after function parameter.
                    'function_parameter': symbolFinderLoop(document, selectedLine - 1, '{'),

                    //First occurence of { after the variable, then first occurence of } after.
                    'switch_variable': symbolFinderLoop(document, symbolFinderLoop(document, selectedLine - 1, '{') + 2, '}'),

                    //Find first occurence of ; after an assigned variable.
                    'assigned_variable': symbolFinderLoop(document, selectedLine, ';'),

                    //For return statements, place log before the return statement.
                    'return': Math.max(0, selectedLine - 1),
                }

                selectedLine = selectionTypeToSelectedLine[selectionType] || selectedLine;
                
                // If no specific type was detected, use smart positioning
                if (!selectionType) {
                    const currentLineText = document.lineAt(selectedLine).text.trim();
                    
                    // Use backward positioning for return statements and forward for others
                    if (currentLineText.includes('return ')) {
                        selectedLine = findBackwardStatementPosition(document, selectedLine);
                    } else {
                        selectedLine = findStatementPosition(document, selectedLine, selectedLine);
                    }
                }
            }

            const indentation = getIndentation(editor, document, selectedLine);

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

            // Check if the selected variable is empty, if so, get the default selected variable
            if (selectedVar.trim().length === 0) {
                selectedVarString = defaultVariableName;
                selectedVar = defaultVariableValue;
                position = 0;
            }

            // let varDumpExportString = `\${"${selectedVar.replaceAll(`'`, ``).replaceAll(`"`, ``).replaceAll(`$`, `💲`)}"}`;

            const dumpOrExport = varDumpExportVariable;
            if (varDumpExportVariable !== 'No var dump or export') {

                let varDumpExportSelectedVar = `${dumpOrExport}(${selectedVar})`;


                if (!useEchoInstead) {
                    if (dumpOrExport === 'var_export') {
                        // Remove the last paranthese from varDumpExportSelectedVar and add  `), true)`
                        selectedVar = varDumpExportSelectedVar.slice(0, -1) + `, true)`;

                    } else {

                        let ob_start = `${indentation}ob_start();\n`;

                        if (printCurrentOutputBuffer) {
                            varDumpExportSelectedVar = `${dumpOrExport}(${outbutbufferVariable}=${selectedVar})`;
                            ob_start = ``;
                        }
                        // let varDumpExportNewVar = `$var_dump`;
                        editBuilder.insert(
                            new vscode.Position(selectedLine + position, 0),
                            `${ob_start}${indentation}${varDumpExportSelectedVar};\n`
                            //+
                            // `${indentation}${varDumpExportNewVar} = rtrim(ob_get_clean()); \n`
                        );
                        selectedVar = 'rtrim(ob_get_clean())';
                    }
                } else {
                    selectedVar = varDumpExportSelectedVar;
                }
            }

            if (beforeEchos) {
                editBuilder.insert(
                    new vscode.Position(selectedLine + position, 0), `${indentation}${beforeEchos}`
                );
            }

            errorLogs.forEach((errorLog: string): void => {
                //selectedVar = selectedVar.replaceAll('$$', '\$$$$$');

                errorLog = errorLog.replaceAll("${selectedVarString}", selectedVarString).replaceAll("${selectedVar}", selectedVar);

                if (varDumpExportVariable !== "No var dump or export" && useEchoInstead) {

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
                    new vscode.Position(selectedLine + position, 0),
                    `${indentation}${errorLogString}${parantheseLeft}${errorLog}${newLine}${parantheseRight}; \n`
                );
            });

            if (printWithCallStack === 'With call stack as string' || printWithCallStack === 'With call stack as array') {
                editBuilder.insert(
                    new vscode.Position(selectedLine + position, 0),
                    `${indentation}${errorLogString}${parantheseLeft}${print_r_start} (new \\Exception()) -> ${getTrace}()${newLine}${print_r_end}${parantheseRight}; \n`
                );
            }

            if (afterEchos) {
                editBuilder.insert(
                    new vscode.Position(selectedLine + position, 0), `${indentation}${afterEchos}`
                );
            }

            if (printCurrentOutputBuffer && varDumpExportVariable !== 'No var dump or export' && dumpOrExport === 'var_dump') {
                editBuilder.insert(
                    new vscode.Position(selectedLine + position, 0),
                    `echo ${outbutbufferVariable}; \n`
                );
            }

        });
    });
}