//Check if string braces are balanced

export function isBalanced(string: string): boolean {
    let stack: string[] = [];
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
        } else if (closeBraces.includes(char)) {
            let last = stack.pop() as '(' | '[' | '{';
            if (braceMap[last] !== char) {
                return false;
            }
        }
    }
    return stack.length === 0;
}
