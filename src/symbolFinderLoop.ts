import { TextDocument } from "vscode";


export function symbolFinderLoop(document: TextDocument, selectedLine: number, symbol: string): number {
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
