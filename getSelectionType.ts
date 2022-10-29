import { Selection, TextDocument } from "vscode";
// initialize the php parser factory class
import fs from 'fs';
//import path from 'path';
import { Engine } from 'php-parser';

export const getSelectionType = (file: string, selection: Selection, selectedVarName: string, phpFile: string) => {
    // initialize a new parser instance
    const parser = new Engine({
        // some options :
        parser: {
            extractDoc: true,
            php7: true
        },
        ast: {
            withPositions: true
        }
    });

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

    //read currentfile with php-parser
    //const phpFile = fs.readFileSync(file, 'utf8');
    const parsedphpFile = parser.parseCode(phpFile, file);
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
        }
    });

    //Find if if parameter or foreach parameter, do the same as function parameter
    //Find if value is after return
    //Make positioning work on anonymous functions

    return selectionType;
};
