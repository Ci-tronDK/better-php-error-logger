// initialize the php parser factory class
import fs from 'fs';
//import path from 'path';
import { Engine, Program } from 'php-parser';
import * as vscode from 'vscode';

export const parsePHPfile = (file: string, phpFile: string) => {
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

    //read currentfile with php-parser
    //const phpFile = fs.readFileSync(file, 'utf8');
    let parsedphpFile: Program;
    try {
        parsedphpFile = parser.parseCode(phpFile, file);
    } catch (error: any) {
        //Print error message to user
        vscode.window.showErrorMessage(error.message);
        return null;
    }

    return parsedphpFile;
}