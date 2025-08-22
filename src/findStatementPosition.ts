import { TextDocument } from "vscode";

/**
 * Find the position before a statement, typically before the end of a statement
 * @param document The text document
 * @param startLine The line to start searching from
 * @param selectedVarLine The line where the selected variable is located
 * @returns The line number where the log should be placed
 */
export function findStatementPosition(document: TextDocument, startLine: number, selectedVarLine: number): number {
    // Look for the end of the current statement (semicolon, closing brace, etc.)
    for (let i = selectedVarLine; i < document.lineCount; i++) {
        const lineText = document.lineAt(i).text.trim();
        const originalLineText = document.lineAt(i).text;
        
        // If we encounter a return statement on this line or a later line, place log before it
        if (lineText.includes('return ') && i >= selectedVarLine) {
            return Math.max(0, i - 1);
        }
        
        // If we find a semicolon at the end of the line, place log after this line
        if (lineText.endsWith(';')) {
            return i;
        }
        
        // If we find a closing brace that ends a statement/block
        if (lineText.endsWith('}') || lineText === '}') {
            return i;
        }
        
        // If we encounter a new statement starting (like if, for, while, etc.), place log before it
        if (lineText.match(/^\s*(if|for|while|switch|foreach|do|function|class)\s*[\(\{]/) && i > selectedVarLine) {
            return i - 1;
        }
        
        // If we encounter HTML tags (for mixed PHP/HTML), place log before HTML
        if (originalLineText.includes('<') && originalLineText.includes('>') && i > selectedVarLine) {
            return i - 1;
        }
        
        // If we've gone too far (empty line or function end), place at current position
        if (lineText === '' && i > selectedVarLine + 2) {
            return selectedVarLine;
        }
        
        // Limit the search to avoid going too far
        if (i > selectedVarLine + 10) {
            return selectedVarLine;
        }
    }
    
    // Default: place on the same line as the selected variable
    return selectedVarLine;
}