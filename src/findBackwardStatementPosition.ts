import { TextDocument } from "vscode";

/**
 * Find the best position to place a log statement by looking backward from the current line
 * @param document The text document
 * @param selectedVarLine The line where the selected variable is located
 * @returns The line number where the log should be placed
 */
export function findBackwardStatementPosition(document: TextDocument, selectedVarLine: number): number {
    const currentLine = document.lineAt(selectedVarLine).text.trim();
    
    // If current line contains return, place log before this line
    if (currentLine.includes('return ')) {
        return selectedVarLine - 1 >= 0 ? selectedVarLine - 1 : selectedVarLine;
    }
    
    // Look backward to find the beginning of the current statement block
    for (let i = selectedVarLine; i >= 0; i--) {
        const lineText = document.lineAt(i).text.trim();
        
        // If we find a line that ends with opening brace, place log after it
        if (lineText.endsWith('{')) {
            return i;
        }
        
        // If we find a line that starts a control structure, place log after it
        if (lineText.match(/^\s*(if|for|while|switch|foreach|do|function|class)\s*[\(\{]/)) {
            return i;
        }
        
        // Don't go too far back
        if (i < selectedVarLine - 5) {
            break;
        }
    }
    
    return selectedVarLine;
}