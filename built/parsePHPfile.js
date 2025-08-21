"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parsePHPfile = void 0;
//import path from 'path';
const php_parser_1 = require("php-parser");
const vscode = __importStar(require("vscode"));
const parsePHPfile = (file, phpFile) => {
    // initialize a new parser instance
    const parser = new php_parser_1.Engine({
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
    let parsedphpFile;
    try {
        parsedphpFile = parser.parseCode(phpFile, file);
    }
    catch (error) {
        //Print error message to user
        vscode.window.showErrorMessage(error.message);
        return null;
    }
    return parsedphpFile;
};
exports.parsePHPfile = parsePHPfile;
//# sourceMappingURL=parsePHPfile.js.map