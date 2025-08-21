"use strict";
//Check if string braces are balanced
Object.defineProperty(exports, "__esModule", { value: true });
exports.isBalanced = void 0;
function isBalanced(string) {
    let stack = [];
    let openBraces = ["(", "[", "{"];
    let closeBraces = [")", "]", "}"];
    let braceMap = {
        "(": ")",
        "[": "]",
        "{": "}"
    };
    for (let i = 0; i < string.length; i++) {
        let char = string[i];
        if (openBraces.includes(char)) {
            stack.push(char);
        }
        else if (closeBraces.includes(char)) {
            let last = stack.pop();
            if (braceMap[last] !== char) {
                return false;
            }
        }
    }
    return stack.length === 0;
}
exports.isBalanced = isBalanced;
//# sourceMappingURL=isBalanced.js.map