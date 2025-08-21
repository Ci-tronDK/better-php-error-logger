"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteError_logs = void 0;
const vscode = __importStar(require("vscode"));
function deleteError_logs() {
    const configurations = vscode.workspace.getConfiguration('betterPhpErrorLogger');
    // /\berror_log\b\s*\(.*?(?=;)\;/g To delete error_logs()
    // /\bob_start\b\s*\(\s*\)\s*\;\s*\bvar_dump\b\s*\(.*\s*\$\bvar_dump_variable\b\s*\=\s*\brtrim\b\s*\(\s*\bob_get_clean\b\(\s*\)\s*\)\s*\;/g To delete ob_start() and var_dump($var_dump_variable)
    const editor = vscode.window.activeTextEditor;
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
    editor.edit((editBuilder) => {
        editBuilder.replace(new vscode.Range(0, 0, lastLine, lastLineLastChar), newText);
    });
}
exports.deleteError_logs = deleteError_logs;
//# sourceMappingURL=deleteError_logs.js.map