"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.symbolFinderLoop = void 0;
function symbolFinderLoop(document, selectedLine, symbol) {
    let symbolPosition = selectedLine;
    for (let i = selectedLine; i < document.lineCount; i++) {
        const lineText = document.lineAt(i).text;
        if (lineText.includes(symbol)) {
            symbolPosition = i;
            break;
        }
    }
    return symbolPosition;
}
exports.symbolFinderLoop = symbolFinderLoop;
//# sourceMappingURL=symbolFinderLoop.js.map