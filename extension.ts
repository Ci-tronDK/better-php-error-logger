// The module 'vscode' contains the VS Code extensibility API

// Import the module and reference it with the alias vscode in your code below
//const vscode = require('vscode');
import * as vscode from 'vscode';
import { Disposable } from "vscode";
import { deleteError_logs } from './deleteError_logs';
import { runTheFunctionBasedOnShortcut } from './runTheFunctionBasedOnShortcut';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

// multiple $ in variable name
// string, before, after, prefix, suffix for error_log, var_dump, echo
// defeault name when nothing selected, don't store in variable
// bette delete, maybe setting for what to delete, maybe use error_log array

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

    const deleteErrorLogs: Disposable = vscode.commands.registerCommand("extension.betterPhpErrorLogger.deleteErrorLogs", (): void => {
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

exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() { }

module.exports = {
    activate,
    deactivate
}

