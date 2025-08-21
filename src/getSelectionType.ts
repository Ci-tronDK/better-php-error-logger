import { Program } from "php-parser";
import { Selection } from "vscode";


export const getSelectionType = (selection: Selection, selectedVarName: string, parsedphpFile: Program) => {

    //remove first dollar sign from selected variable name
    selectedVarName = selectedVarName.replace('$', '');

    //selectedVar position line start and end
    const selectionStartLine = selection.start.line + 1;
    const selectionStartCharacter = selection.start.character;
    const selectionEndLine = selection.end.line + 1;
    const selectionEndCharacter = selection.end.character;


    const correctPosition = (startLine: Number, startColumn: Number, endLine: Number, endColumn: Number) => {
        return (startLine === selectionStartLine && startColumn === selectionStartCharacter && endLine === selectionEndLine && endColumn === selectionEndCharacter);
    }


    let selectionType = ``;

    //loop through all the children of the parsed php file
    parsedphpFile.children.forEach((child: any) => {
        if (child.kind === `function`) {
            if (child.arguments.length > 0) {
                child.arguments.forEach((argument: any) => {
                    if (argument.name.name === selectedVarName && correctPosition(argument.loc.start.line, argument.loc.start.column, argument.loc.end.line, argument.loc.end.column)) {
                        selectionType = `function_parameter`;
                    }
                });
            }
        } else if (child.kind === `switch`) {
            if (child.test.name === selectedVarName && correctPosition(child.test.loc.start.line, child.test.loc.start.column, child.test.loc.end.line, child.test.loc.end.column)) {
                selectionType = `switch_variable`;
            }
        } else if (child.kind === `expressionstatement`) {
            if (child.expression.kind === `assign`) {
                if (child.expression.left.name === selectedVarName && correctPosition(child.expression.left.loc.start.line, child.expression.left.loc.start.column, child.expression.left.loc.end.line, child.expression.left.loc.end.column)) {
                    selectionType = `assigned_variable`;
                }
            }
        } else if (child.kind === `return`) {
            if (child.expr && child.expr.loc && correctPosition(child.expr.loc.start.line, child.expr.loc.start.column, child.expr.loc.end.line, child.expr.loc.end.column)) {
                selectionType = `return`;
            }
        }
        // } else if (child.kind === `foreach`) {
        //     if (correctPosition(child.source.loc.start.line, child.source.loc.start.column, child.source.loc.end.line, child.source.loc.end.column)
        //         || correctPosition(child.key.loc.start.line, child.key.loc.start.column, child.key.loc.end.line, child.key.loc.end.column)
        //         || correctPosition(child.value.loc.start.line, child.value.loc.start.column, child.value.loc.end.line, child.value.loc.end.column)) {
        //         selectionType = `foreach_variable`;
        //     }
        // } else if (child.kind === `if`) {
        //     if (child.test.kind !== `bin`) {
        //         if (correctPosition(child.test.loc.start.line, child.test.loc.start.column, child.test.loc.end.line, child.test.loc.end.column)) {
        //             selectionType = `if_variable`;
        //         }
        //     } else {
        //         //Test all variables in the if statement for correct position.
        //         //If inside test location is found, set selectionType to if_variable
        //         if (child.test.loc.start.line <= selectionStartLine && child.test.loc.end.line >= selectionEndLine) {
        //             selectionType = `if_variable`;
        //         }

        //     }

        // }
    });

    // parsedphpFile.children.forEach((child: any) => {
    //     if (child.loc.start.line <= selectionStartLine && child.loc.end.line >= selectionEndLine) {
    //         console.log(child.kind)
    //     }
    // });



    // //Find if if parameter or foreach parameter, do the same as function parameter
    // //Find if value is after return
    // //Make positioning work on anonymous functions

    // console.log(parsedphpFile);
    // console.log(selectionType);

    return selectionType;
};
