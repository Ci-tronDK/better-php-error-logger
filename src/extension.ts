// The module 'vscode' contains the VS Code extensibility API

// Import the module and reference it with the alias vscode in your code below
//const vscode = require('vscode');
import * as vscode from 'vscode';
import { Disposable } from "vscode";
import { deleteError_logs } from './deleteError_logs';
import { runTheFunctionBasedOnShortcut } from './runTheFunctionBasedOnShortcut';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context: { subscriptions: Disposable[]; }): void {

    const allCommands: Disposable[] = [];

    const runTheFunctionBasedOnShortcutCommands = [
        "errorLog",
        "printWithCallStack",
        "varDumpVariable",
        "varDumpVariableAlternative",
        "useEchoInstead",
        "printCurrentOutputBuffer",
        "printCurrentOutputBufferWithCallStack",
        "printCurrentOutputBufferVarDump",
        "printCurrentOutputBufferVarDumpAlternative",
        "printCurrentOutputBufferUseEcho"
    ];

    runTheFunctionBasedOnShortcutCommands.forEach((commandName: string) => {
        const command: Disposable = vscode.commands.registerCommand(`extension.betterPhpErrorLogger.${commandName}`, (args: string): void => {

            if (args === undefined) {
                args = commandName;
            }

            runTheFunctionBasedOnShortcut(args);
        });

        allCommands.push(command);

    });

    const deleteErrorLogs: Disposable = vscode.commands.registerCommand(`extension.betterPhpErrorLogger.deleteErrorLogs`, (): void => {
        deleteError_logs();
    });

    allCommands.push(deleteErrorLogs);

    const quickPick: Disposable = vscode.commands.registerCommand(`extension.betterPhpErrorLogger.quickPick`, async (): Promise<void> => {

        const items = [...runTheFunctionBasedOnShortcutCommands, "deleteErrorLogs"];

        const packagejson = require('../package.json');

        //Get title of all commands
        const quickPickItems = items.map((commandName: string) => {
            return {
                label: packagejson.contributes.commands.find((command: { command: string; title: string; }) => command.command === `extension.betterPhpErrorLogger.${commandName}`).title,
                description: `Default shortcut: ${packagejson.contributes.keybindings.find((keybinding: { command: string; key: string; }) => keybinding.command === `extension.betterPhpErrorLogger.${commandName}`).key}`,
                command: commandName
            };
        });

        //Sort by label alphabetically
        quickPickItems.sort((a, b) => (a.label < b.label) ? -1 : ((a.label > b.label) ? 1 : 0));

        const quickPickItem = await vscode.window.showQuickPick(quickPickItems, {
            placeHolder: "Select a command",
        });

        if (quickPickItem) {
            if (runTheFunctionBasedOnShortcutCommands.includes(quickPickItem.command)) {
                runTheFunctionBasedOnShortcut(quickPickItem.command);
            } else if (quickPickItem.command === "deleteErrorLogs") {
                deleteError_logs();
            }
        }
    });

    allCommands.push(quickPick);


    context.subscriptions.push(...allCommands);

}

exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() { }

module.exports = {
    activate,
    deactivate
}


