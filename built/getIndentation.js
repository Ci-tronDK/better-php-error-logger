"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIndentation = void 0;
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
        indentation = '\t'.repeat(indentLevel);
    }
    else {
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
exports.getIndentation = getIndentation;
//# sourceMappingURL=getIndentation.js.map