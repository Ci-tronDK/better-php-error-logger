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
function activate(context: vscode.ExtensionContext): void {

    const packageJSON = context.extension.packageJSON;

    //Get extension version
    const betterPhpErrorLoggerVersion = packageJSON.version;

    // Previous version
    const previousBetterPhpErrorLoggerVersion = context.globalState.get("betterPhpErrorLoggerVersion");

    // If previous version is undefined or not equal to current version, then update the version in global state and show message
    if (previousBetterPhpErrorLoggerVersion === undefined || previousBetterPhpErrorLoggerVersion !== betterPhpErrorLoggerVersion) {
        // Update the version in global state
        context.globalState.update("betterPhpErrorLoggerVersion", betterPhpErrorLoggerVersion);

        // Show message
        vscode.window.showInformationMessage(`Better PHP Error Logger extension has been updated to version ${betterPhpErrorLoggerVersion}. I have changed how things work. Please read the README.md file.`);
    }

    const allCommands: Disposable[] = [];

    const toggleCommands = [
        {
            command: "logMultiple",
            title: "Set this to Normal, As compact array or Only first",
            options: [
                "Normal",
                "As compact array",
                "Only first"
            ]
        },
        {
            command: "printWithCallStack",
            title: "Print with call stack",
            options: [
                "No call stack",
                "With call stack as string",
                "With call stack as array"
            ]
        },
        {
            command: "varDumpExportVariable",
            title: "Var dump or export variable",
            options: [
                "No var dump or export",
                "var_dump",
                "var_export"
            ]
        },
        {
            command: "newLinesForEcho",
            title: "New lines for echo",
            options: [
                "none",
                "pre",
                "br",
                "PHP_EOL"
            ]
        },
    ];

    toggleCommands.forEach((toggleCommand) => {

        const toggleCommandDisposable: Disposable = vscode.commands.registerCommand(`extension.betterPhpErrorLogger.${toggleCommand.command}`, (): void => {

            const configuration = vscode.workspace.getConfiguration("betterPhpErrorLogger");

            //Get configuration
            const configurationValue = configuration[toggleCommand.command];

            //Get index of current value
            const currentIndex = toggleCommand.options.indexOf(configurationValue);

            //Get next index
            let nextIndex = currentIndex + 1;

            //If next index is out of range, then set it to 0
            if (nextIndex >= toggleCommand.options.length) {
                nextIndex = 0;
            }

            //Get next value
            const nextValue = toggleCommand.options[nextIndex];

            //Update configuration
            configuration.update(toggleCommand.command, nextValue, true);

            //Show message
            vscode.window.showInformationMessage(`${toggleCommand.title} is now ${nextValue}.`);

        });

        allCommands.push(toggleCommandDisposable);

    });

    const runTheFunctionBasedOnShortcutCommands = [
        "errorLog",
        "useEchoInstead",
        "printCurrentOutputBuffer",
        "printCurrentOutputBufferUseEcho",
    ];

    runTheFunctionBasedOnShortcutCommands.forEach((commandName: string) => {
        const command: Disposable = vscode.commands.registerCommand(`extension.betterPhpErrorLogger.${commandName}`, (args: string): void => {

            if (args === undefined) {
                args = commandName;
            }

            runTheFunctionBasedOnShortcut(args, packageJSON);
        });

        allCommands.push(command);

    });

    const deleteErrorLogs: Disposable = vscode.commands.registerCommand(`extension.betterPhpErrorLogger.deleteErrorLogs`, (): void => {
        deleteError_logs();
    });

    allCommands.push(deleteErrorLogs);

    const quickPick: Disposable = vscode.commands.registerCommand(`extension.betterPhpErrorLogger.quickPick`, async (): Promise<void> => {

        const items = [...runTheFunctionBasedOnShortcutCommands, "deleteErrorLogs"];



        //Get title of all commands
        const quickPickItems = items.map((commandName: string) => {
            return {
                label: packageJSON.contributes.commands.find((command: { command: string; title: string; }) => command.command === `extension.betterPhpErrorLogger.${commandName}`).title,
                description: `Default shortcut: ${packageJSON.contributes.keybindings.find((keybinding: { command: string; key: string; }) => keybinding.command === `extension.betterPhpErrorLogger.${commandName}`).key}`,
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
                runTheFunctionBasedOnShortcut(quickPickItem.command, packageJSON);
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


