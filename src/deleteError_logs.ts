import * as vscode from 'vscode';
import { TextEditor } from "vscode";

export function deleteError_logs() {

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
        newText = newText.replace(`echo $_ob; `, ``);
    }

    // if (text.includes("echo")) {
    //     newText = newText.replace(/\r?\n?\becho\b\s*\(.*\<\s*br\s*>\*?.*?(?=;);\r?\n?/g, ``);
    // }

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
    });
}
