"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/php-parser/src/lexer/attribute.js
var require_attribute = __commonJS({
  "node_modules/php-parser/src/lexer/attribute.js"(exports2, module2) {
    "use strict";
    module2.exports = {
      attributeIndex: 0,
      attributeListDepth: {},
      matchST_ATTRIBUTE: function() {
        let ch = this.input();
        if (this.is_WHITESPACE()) {
          do {
            ch = this.input();
          } while (this.is_WHITESPACE());
          this.unput(1);
          return null;
        }
        switch (ch) {
          case "]":
            if (this.attributeListDepth[this.attributeIndex] === 0) {
              delete this.attributeListDepth[this.attributeIndex];
              this.attributeIndex--;
              this.popState();
            } else {
              this.attributeListDepth[this.attributeIndex]--;
            }
            return "]";
          case "(":
          case ")":
          case ":":
          case "=":
          case "|":
          case "&":
          case "^":
          case "-":
          case "+":
          case "*":
          case "%":
          case "~":
          case "<":
          case ">":
          case "!":
            return this.consume_TOKEN();
          case "[":
            this.attributeListDepth[this.attributeIndex]++;
            return "[";
          case ",":
            return ",";
          case '"':
            return this.ST_DOUBLE_QUOTES();
          case "'":
            return this.T_CONSTANT_ENCAPSED_STRING();
          case "/":
            if (this._input[this.offset] === "/") {
              return this.T_COMMENT();
            } else if (this._input[this.offset] === "*") {
              this.input();
              return this.T_DOC_COMMENT();
            } else {
              return this.consume_TOKEN();
            }
        }
        if (this.is_LABEL_START() || ch === "\\") {
          while (this.offset < this.size) {
            const ch2 = this.input();
            if (!(this.is_LABEL() || ch2 === "\\")) {
              if (ch2)
                this.unput(1);
              break;
            }
          }
          return this.T_STRING();
        } else if (this.is_NUM()) {
          return this.consume_NUM();
        }
        throw new Error(
          `Bad terminal sequence "${ch}" at line ${this.yylineno} (offset ${this.offset})`
        );
      }
    };
  }
});

// node_modules/php-parser/src/lexer/comments.js
var require_comments = __commonJS({
  "node_modules/php-parser/src/lexer/comments.js"(exports2, module2) {
    "use strict";
    module2.exports = {
      T_COMMENT: function() {
        while (this.offset < this.size) {
          const ch = this.input();
          if (ch === "\n" || ch === "\r") {
            return this.tok.T_COMMENT;
          } else if (ch === "?" && !this.aspTagMode && this._input[this.offset] === ">") {
            this.unput(1);
            return this.tok.T_COMMENT;
          } else if (ch === "%" && this.aspTagMode && this._input[this.offset] === ">") {
            this.unput(1);
            return this.tok.T_COMMENT;
          }
        }
        return this.tok.T_COMMENT;
      },
      T_DOC_COMMENT: function() {
        let ch = this.input();
        let token = this.tok.T_COMMENT;
        if (ch === "*") {
          ch = this.input();
          if (this.is_WHITESPACE()) {
            token = this.tok.T_DOC_COMMENT;
          }
          if (ch === "/") {
            return token;
          } else {
            this.unput(1);
          }
        }
        while (this.offset < this.size) {
          ch = this.input();
          if (ch === "*" && this._input[this.offset] === "/") {
            this.input();
            break;
          }
        }
        return token;
      }
    };
  }
});

// node_modules/php-parser/src/lexer/initial.js
var require_initial = __commonJS({
  "node_modules/php-parser/src/lexer/initial.js"(exports2, module2) {
    "use strict";
    module2.exports = {
      nextINITIAL: function() {
        if (this.conditionStack.length > 1 && this.conditionStack[this.conditionStack.length - 1] === "INITIAL") {
          this.popState();
        } else {
          this.begin("ST_IN_SCRIPTING");
        }
        return this;
      },
      matchINITIAL: function() {
        while (this.offset < this.size) {
          let ch = this.input();
          if (ch == "<") {
            ch = this.ahead(1);
            if (ch == "?") {
              if (this.tryMatch("?=")) {
                this.unput(1).appendToken(this.tok.T_OPEN_TAG_WITH_ECHO, 3).nextINITIAL();
                break;
              } else if (this.tryMatchCaseless("?php")) {
                ch = this._input[this.offset + 4];
                if (ch === " " || ch === "	" || ch === "\n" || ch === "\r") {
                  this.unput(1).appendToken(this.tok.T_OPEN_TAG, 6).nextINITIAL();
                  break;
                }
              }
              if (this.short_tags) {
                this.unput(1).appendToken(this.tok.T_OPEN_TAG, 2).nextINITIAL();
                break;
              }
            } else if (this.asp_tags && ch == "%") {
              if (this.tryMatch("%=")) {
                this.aspTagMode = true;
                this.unput(1).appendToken(this.tok.T_OPEN_TAG_WITH_ECHO, 3).nextINITIAL();
                break;
              } else {
                this.aspTagMode = true;
                this.unput(1).appendToken(this.tok.T_OPEN_TAG, 2).nextINITIAL();
                break;
              }
            }
          }
        }
        if (this.yytext.length > 0) {
          return this.tok.T_INLINE_HTML;
        } else {
          return false;
        }
      }
    };
  }
});

// node_modules/php-parser/src/lexer/numbers.js
var require_numbers = __commonJS({
  "node_modules/php-parser/src/lexer/numbers.js"(exports2, module2) {
    "use strict";
    var MAX_LENGTH_OF_LONG = 10;
    var long_min_digits = "2147483648";
    if (process.arch == "x64") {
      MAX_LENGTH_OF_LONG = 19;
      long_min_digits = "9223372036854775808";
    }
    module2.exports = {
      consume_NUM: function() {
        let ch = this.yytext[0];
        let hasPoint = ch === ".";
        if (ch === "0") {
          ch = this.input();
          if (ch === "x" || ch === "X") {
            ch = this.input();
            if (ch !== "_" && this.is_HEX()) {
              return this.consume_HNUM();
            } else {
              this.unput(ch ? 2 : 1);
            }
          } else if (ch === "b" || ch === "B") {
            ch = this.input();
            if (ch !== "_" && ch === "0" || ch === "1") {
              return this.consume_BNUM();
            } else {
              this.unput(ch ? 2 : 1);
            }
          } else if (ch === "o" || ch === "O") {
            ch = this.input();
            if (ch !== "_" && this.is_OCTAL()) {
              return this.consume_ONUM();
            } else {
              this.unput(ch ? 2 : 1);
            }
          } else if (!this.is_NUM()) {
            if (ch)
              this.unput(1);
          }
        }
        while (this.offset < this.size) {
          const prev = ch;
          ch = this.input();
          if (ch === "_") {
            if (prev === "_") {
              this.unput(2);
              break;
            }
            if (prev === ".") {
              this.unput(1);
              break;
            }
            if (prev === "e" || prev === "E") {
              this.unput(2);
              break;
            }
          } else if (ch === ".") {
            if (hasPoint) {
              this.unput(1);
              break;
            }
            if (prev === "_") {
              this.unput(2);
              break;
            }
            hasPoint = true;
            continue;
          } else if (ch === "e" || ch === "E") {
            if (prev === "_") {
              this.unput(1);
              break;
            }
            let undo = 2;
            ch = this.input();
            if (ch === "+" || ch === "-") {
              undo = 3;
              ch = this.input();
            }
            if (this.is_NUM_START()) {
              this.consume_LNUM();
              return this.tok.T_DNUMBER;
            }
            this.unput(ch ? undo : undo - 1);
            break;
          }
          if (!this.is_NUM()) {
            if (ch)
              this.unput(1);
            break;
          }
        }
        if (hasPoint) {
          return this.tok.T_DNUMBER;
        } else if (this.yytext.length < MAX_LENGTH_OF_LONG - 1) {
          return this.tok.T_LNUMBER;
        } else {
          if (this.yytext.length < MAX_LENGTH_OF_LONG || this.yytext.length == MAX_LENGTH_OF_LONG && this.yytext < long_min_digits) {
            return this.tok.T_LNUMBER;
          }
          return this.tok.T_DNUMBER;
        }
      },
      consume_HNUM: function() {
        while (this.offset < this.size) {
          const ch = this.input();
          if (!this.is_HEX()) {
            if (ch)
              this.unput(1);
            break;
          }
        }
        return this.tok.T_LNUMBER;
      },
      consume_LNUM: function() {
        while (this.offset < this.size) {
          const ch = this.input();
          if (!this.is_NUM()) {
            if (ch)
              this.unput(1);
            break;
          }
        }
        return this.tok.T_LNUMBER;
      },
      consume_BNUM: function() {
        let ch;
        while (this.offset < this.size) {
          ch = this.input();
          if (ch !== "0" && ch !== "1" && ch !== "_") {
            if (ch)
              this.unput(1);
            break;
          }
        }
        return this.tok.T_LNUMBER;
      },
      consume_ONUM: function() {
        while (this.offset < this.size) {
          const ch = this.input();
          if (!this.is_OCTAL()) {
            if (ch)
              this.unput(1);
            break;
          }
        }
        return this.tok.T_LNUMBER;
      }
    };
  }
});

// node_modules/php-parser/src/lexer/property.js
var require_property = __commonJS({
  "node_modules/php-parser/src/lexer/property.js"(exports2, module2) {
    "use strict";
    module2.exports = {
      matchST_LOOKING_FOR_PROPERTY: function() {
        let ch = this.input();
        if (ch === "-") {
          ch = this.input();
          if (ch === ">") {
            return this.tok.T_OBJECT_OPERATOR;
          }
          if (ch)
            this.unput(1);
        } else if (this.is_WHITESPACE()) {
          return this.tok.T_WHITESPACE;
        } else if (this.is_LABEL_START()) {
          this.consume_LABEL();
          this.popState();
          return this.tok.T_STRING;
        }
        this.popState();
        if (ch)
          this.unput(1);
        return false;
      },
      matchST_LOOKING_FOR_VARNAME: function() {
        let ch = this.input();
        this.popState();
        this.begin("ST_IN_SCRIPTING");
        if (this.is_LABEL_START()) {
          this.consume_LABEL();
          ch = this.input();
          if (ch === "[" || ch === "}") {
            this.unput(1);
            return this.tok.T_STRING_VARNAME;
          } else {
            this.unput(this.yytext.length);
          }
        } else {
          if (ch)
            this.unput(1);
        }
        return false;
      },
      matchST_VAR_OFFSET: function() {
        const ch = this.input();
        if (this.is_NUM_START()) {
          this.consume_NUM();
          return this.tok.T_NUM_STRING;
        } else if (ch === "]") {
          this.popState();
          return "]";
        } else if (ch === "$") {
          this.input();
          if (this.is_LABEL_START()) {
            this.consume_LABEL();
            return this.tok.T_VARIABLE;
          } else {
            throw new Error("Unexpected terminal");
          }
        } else if (this.is_LABEL_START()) {
          this.consume_LABEL();
          return this.tok.T_STRING;
        } else if (this.is_WHITESPACE() || ch === "\\" || ch === "'" || ch === "#") {
          return this.tok.T_ENCAPSED_AND_WHITESPACE;
        } else if (ch === "[" || ch === "{" || ch === "}" || ch === '"' || ch === "`" || this.is_TOKEN()) {
          return ch;
        } else {
          throw new Error("Unexpected terminal");
        }
      }
    };
  }
});

// node_modules/php-parser/src/lexer/scripting.js
var require_scripting = __commonJS({
  "node_modules/php-parser/src/lexer/scripting.js"(exports2, module2) {
    "use strict";
    module2.exports = {
      matchST_IN_SCRIPTING: function() {
        let ch = this.input();
        switch (ch) {
          case " ":
          case "	":
          case "\n":
          case "\r":
          case "\r\n":
            return this.T_WHITESPACE();
          case "#":
            if (this.version >= 800 && this._input[this.offset] === "[") {
              this.input();
              this.attributeListDepth[++this.attributeIndex] = 0;
              this.begin("ST_ATTRIBUTE");
              return this.tok.T_ATTRIBUTE;
            }
            return this.T_COMMENT();
          case "/":
            if (this._input[this.offset] === "/") {
              return this.T_COMMENT();
            } else if (this._input[this.offset] === "*") {
              this.input();
              return this.T_DOC_COMMENT();
            }
            return this.consume_TOKEN();
          case "'":
            return this.T_CONSTANT_ENCAPSED_STRING();
          case '"':
            return this.ST_DOUBLE_QUOTES();
          case "`":
            this.begin("ST_BACKQUOTE");
            return "`";
          case "?":
            if (!this.aspTagMode && this.tryMatch(">")) {
              this.input();
              const nextCH = this._input[this.offset];
              if (nextCH === "\n" || nextCH === "\r")
                this.input();
              if (this.conditionStack.length > 1) {
                this.begin("INITIAL");
              }
              return this.tok.T_CLOSE_TAG;
            }
            return this.consume_TOKEN();
          case "%":
            if (this.aspTagMode && this._input[this.offset] === ">") {
              this.input();
              ch = this._input[this.offset];
              if (ch === "\n" || ch === "\r") {
                this.input();
              }
              this.aspTagMode = false;
              if (this.conditionStack.length > 1) {
                this.begin("INITIAL");
              }
              return this.tok.T_CLOSE_TAG;
            }
            return this.consume_TOKEN();
          case "{":
            this.begin("ST_IN_SCRIPTING");
            return "{";
          case "}":
            if (this.conditionStack.length > 2) {
              this.popState();
            }
            return "}";
          default:
            if (ch === ".") {
              ch = this.input();
              if (this.is_NUM_START()) {
                return this.consume_NUM();
              } else {
                if (ch)
                  this.unput(1);
              }
            }
            if (this.is_NUM_START()) {
              return this.consume_NUM();
            } else if (this.is_LABEL_START()) {
              return this.consume_LABEL().T_STRING();
            } else if (this.is_TOKEN()) {
              return this.consume_TOKEN();
            }
        }
        throw new Error(
          'Bad terminal sequence "' + ch + '" at line ' + this.yylineno + " (offset " + this.offset + ")"
        );
      },
      T_WHITESPACE: function() {
        while (this.offset < this.size) {
          const ch = this.input();
          if (ch === " " || ch === "	" || ch === "\n" || ch === "\r") {
            continue;
          }
          if (ch)
            this.unput(1);
          break;
        }
        return this.tok.T_WHITESPACE;
      }
    };
  }
});

// node_modules/php-parser/src/lexer/strings.js
var require_strings = __commonJS({
  "node_modules/php-parser/src/lexer/strings.js"(exports2, module2) {
    "use strict";
    var newline = ["\n", "\r"];
    var valid_after_heredoc = ["\n", "\r", ";"];
    var valid_after_heredoc_73 = valid_after_heredoc.concat([
      "	",
      " ",
      ",",
      "]",
      ")",
      "/",
      "=",
      "!"
    ]);
    module2.exports = {
      T_CONSTANT_ENCAPSED_STRING: function() {
        let ch;
        while (this.offset < this.size) {
          ch = this.input();
          if (ch == "\\") {
            this.input();
          } else if (ch == "'") {
            break;
          }
        }
        return this.tok.T_CONSTANT_ENCAPSED_STRING;
      },
      is_HEREDOC: function() {
        const revert = this.offset;
        if (this._input[this.offset - 1] === "<" && this._input[this.offset] === "<" && this._input[this.offset + 1] === "<") {
          this.offset += 3;
          if (this.is_TABSPACE()) {
            while (this.offset < this.size) {
              this.offset++;
              if (!this.is_TABSPACE()) {
                break;
              }
            }
          }
          let tChar = this._input[this.offset - 1];
          if (tChar === "'" || tChar === '"') {
            this.offset++;
          } else {
            tChar = null;
          }
          if (this.is_LABEL_START()) {
            let yyoffset = this.offset - 1;
            while (this.offset < this.size) {
              this.offset++;
              if (!this.is_LABEL()) {
                break;
              }
            }
            const yylabel = this._input.substring(yyoffset, this.offset - 1);
            if (!tChar || tChar === this._input[this.offset - 1]) {
              if (tChar)
                this.offset++;
              if (newline.includes(this._input[this.offset - 1])) {
                this.heredoc_label.label = yylabel;
                this.heredoc_label.length = yylabel.length;
                this.heredoc_label.finished = false;
                yyoffset = this.offset - revert;
                this.offset = revert;
                this.consume(yyoffset);
                if (tChar === "'") {
                  this.begin("ST_NOWDOC");
                } else {
                  this.begin("ST_HEREDOC");
                }
                this.prematch_ENDOFDOC();
                return this.tok.T_START_HEREDOC;
              }
            }
          }
        }
        this.offset = revert;
        return false;
      },
      ST_DOUBLE_QUOTES: function() {
        let ch;
        while (this.offset < this.size) {
          ch = this.input();
          if (ch == "\\") {
            this.input();
          } else if (ch == '"') {
            break;
          } else if (ch == "$") {
            ch = this.input();
            if (ch == "{" || this.is_LABEL_START()) {
              this.unput(2);
              break;
            }
            if (ch)
              this.unput(1);
          } else if (ch == "{") {
            ch = this.input();
            if (ch == "$") {
              this.unput(2);
              break;
            }
            if (ch)
              this.unput(1);
          }
        }
        if (ch == '"') {
          return this.tok.T_CONSTANT_ENCAPSED_STRING;
        } else {
          let prefix = 1;
          if (this.yytext[0] === "b" || this.yytext[0] === "B") {
            prefix = 2;
          }
          if (this.yytext.length > 2) {
            this.appendToken(
              this.tok.T_ENCAPSED_AND_WHITESPACE,
              this.yytext.length - prefix
            );
          }
          this.unput(this.yytext.length - prefix);
          this.begin("ST_DOUBLE_QUOTES");
          return this.yytext;
        }
      },
      isDOC_MATCH: function(offset, consumeLeadingSpaces) {
        const prev_ch = this._input[offset - 2];
        if (!newline.includes(prev_ch)) {
          return false;
        }
        let indentation_uses_spaces = false;
        let indentation_uses_tabs = false;
        let indentation = 0;
        let leading_ch = this._input[offset - 1];
        if (this.version >= 703) {
          while (leading_ch === "	" || leading_ch === " ") {
            if (leading_ch === " ") {
              indentation_uses_spaces = true;
            } else if (leading_ch === "	") {
              indentation_uses_tabs = true;
            }
            leading_ch = this._input[offset + indentation];
            indentation++;
          }
          offset = offset + indentation;
          if (newline.includes(this._input[offset - 1])) {
            return false;
          }
        }
        if (this._input.substring(
          offset - 1,
          offset - 1 + this.heredoc_label.length
        ) === this.heredoc_label.label) {
          const ch = this._input[offset - 1 + this.heredoc_label.length];
          if ((this.version >= 703 ? valid_after_heredoc_73 : valid_after_heredoc).includes(ch)) {
            if (consumeLeadingSpaces) {
              this.consume(indentation);
              if (indentation_uses_spaces && indentation_uses_tabs) {
                throw new Error(
                  "Parse error:  mixing spaces and tabs in ending marker at line " + this.yylineno + " (offset " + this.offset + ")"
                );
              }
            } else {
              this.heredoc_label.indentation = indentation;
              this.heredoc_label.indentation_uses_spaces = indentation_uses_spaces;
              this.heredoc_label.first_encaps_node = true;
            }
            return true;
          }
        }
        return false;
      },
      prematch_ENDOFDOC: function() {
        this.heredoc_label.indentation_uses_spaces = false;
        this.heredoc_label.indentation = 0;
        this.heredoc_label.first_encaps_node = true;
        let offset = this.offset + 1;
        while (offset < this._input.length) {
          if (this.isDOC_MATCH(offset, false)) {
            return;
          }
          if (!newline.includes(this._input[offset - 1])) {
            while (!newline.includes(this._input[offset++]) && offset < this._input.length) {
            }
          }
          offset++;
        }
      },
      matchST_NOWDOC: function() {
        if (this.isDOC_MATCH(this.offset, true)) {
          this.consume(this.heredoc_label.length);
          this.popState();
          return this.tok.T_END_HEREDOC;
        }
        let ch = this._input[this.offset - 1];
        while (this.offset < this.size) {
          if (newline.includes(ch)) {
            ch = this.input();
            if (this.isDOC_MATCH(this.offset, true)) {
              this.unput(1).popState();
              this.appendToken(this.tok.T_END_HEREDOC, this.heredoc_label.length);
              return this.tok.T_ENCAPSED_AND_WHITESPACE;
            }
          } else {
            ch = this.input();
          }
        }
        return this.tok.T_ENCAPSED_AND_WHITESPACE;
      },
      matchST_HEREDOC: function() {
        let ch = this.input();
        if (this.isDOC_MATCH(this.offset, true)) {
          this.consume(this.heredoc_label.length - 1);
          this.popState();
          return this.tok.T_END_HEREDOC;
        }
        while (this.offset < this.size) {
          if (ch === "\\") {
            ch = this.input();
            if (!newline.includes(ch)) {
              ch = this.input();
            }
          }
          if (newline.includes(ch)) {
            ch = this.input();
            if (this.isDOC_MATCH(this.offset, true)) {
              this.unput(1).popState();
              this.appendToken(this.tok.T_END_HEREDOC, this.heredoc_label.length);
              return this.tok.T_ENCAPSED_AND_WHITESPACE;
            }
          } else if (ch === "$") {
            ch = this.input();
            if (ch === "{") {
              this.begin("ST_LOOKING_FOR_VARNAME");
              if (this.yytext.length > 2) {
                this.appendToken(this.tok.T_DOLLAR_OPEN_CURLY_BRACES, 2);
                this.unput(2);
                return this.tok.T_ENCAPSED_AND_WHITESPACE;
              } else {
                return this.tok.T_DOLLAR_OPEN_CURLY_BRACES;
              }
            } else if (this.is_LABEL_START()) {
              const yyoffset = this.offset;
              const next = this.consume_VARIABLE();
              if (this.yytext.length > this.offset - yyoffset + 2) {
                this.appendToken(next, this.offset - yyoffset + 2);
                this.unput(this.offset - yyoffset + 2);
                return this.tok.T_ENCAPSED_AND_WHITESPACE;
              } else {
                return next;
              }
            }
          } else if (ch === "{") {
            ch = this.input();
            if (ch === "$") {
              this.begin("ST_IN_SCRIPTING");
              if (this.yytext.length > 2) {
                this.appendToken(this.tok.T_CURLY_OPEN, 1);
                this.unput(2);
                return this.tok.T_ENCAPSED_AND_WHITESPACE;
              } else {
                this.unput(1);
                return this.tok.T_CURLY_OPEN;
              }
            }
          } else {
            ch = this.input();
          }
        }
        return this.tok.T_ENCAPSED_AND_WHITESPACE;
      },
      consume_VARIABLE: function() {
        this.consume_LABEL();
        const ch = this.input();
        if (ch == "[") {
          this.unput(1);
          this.begin("ST_VAR_OFFSET");
          return this.tok.T_VARIABLE;
        } else if (ch === "-") {
          if (this.input() === ">") {
            this.input();
            if (this.is_LABEL_START()) {
              this.begin("ST_LOOKING_FOR_PROPERTY");
            }
            this.unput(3);
            return this.tok.T_VARIABLE;
          } else {
            this.unput(2);
          }
        } else {
          if (ch)
            this.unput(1);
        }
        return this.tok.T_VARIABLE;
      },
      matchST_BACKQUOTE: function() {
        let ch = this.input();
        if (ch === "$") {
          ch = this.input();
          if (ch === "{") {
            this.begin("ST_LOOKING_FOR_VARNAME");
            return this.tok.T_DOLLAR_OPEN_CURLY_BRACES;
          } else if (this.is_LABEL_START()) {
            const tok = this.consume_VARIABLE();
            return tok;
          }
        } else if (ch === "{") {
          if (this._input[this.offset] === "$") {
            this.begin("ST_IN_SCRIPTING");
            return this.tok.T_CURLY_OPEN;
          }
        } else if (ch === "`") {
          this.popState();
          return "`";
        }
        while (this.offset < this.size) {
          if (ch === "\\") {
            this.input();
          } else if (ch === "`") {
            this.unput(1);
            this.popState();
            this.appendToken("`", 1);
            break;
          } else if (ch === "$") {
            ch = this.input();
            if (ch === "{") {
              this.begin("ST_LOOKING_FOR_VARNAME");
              if (this.yytext.length > 2) {
                this.appendToken(this.tok.T_DOLLAR_OPEN_CURLY_BRACES, 2);
                this.unput(2);
                return this.tok.T_ENCAPSED_AND_WHITESPACE;
              } else {
                return this.tok.T_DOLLAR_OPEN_CURLY_BRACES;
              }
            } else if (this.is_LABEL_START()) {
              const yyoffset = this.offset;
              const next = this.consume_VARIABLE();
              if (this.yytext.length > this.offset - yyoffset + 2) {
                this.appendToken(next, this.offset - yyoffset + 2);
                this.unput(this.offset - yyoffset + 2);
                return this.tok.T_ENCAPSED_AND_WHITESPACE;
              } else {
                return next;
              }
            }
            continue;
          } else if (ch === "{") {
            ch = this.input();
            if (ch === "$") {
              this.begin("ST_IN_SCRIPTING");
              if (this.yytext.length > 2) {
                this.appendToken(this.tok.T_CURLY_OPEN, 1);
                this.unput(2);
                return this.tok.T_ENCAPSED_AND_WHITESPACE;
              } else {
                this.unput(1);
                return this.tok.T_CURLY_OPEN;
              }
            }
            continue;
          }
          ch = this.input();
        }
        return this.tok.T_ENCAPSED_AND_WHITESPACE;
      },
      matchST_DOUBLE_QUOTES: function() {
        let ch = this.input();
        if (ch === "$") {
          ch = this.input();
          if (ch === "{") {
            this.begin("ST_LOOKING_FOR_VARNAME");
            return this.tok.T_DOLLAR_OPEN_CURLY_BRACES;
          } else if (this.is_LABEL_START()) {
            const tok = this.consume_VARIABLE();
            return tok;
          }
        } else if (ch === "{") {
          if (this._input[this.offset] === "$") {
            this.begin("ST_IN_SCRIPTING");
            return this.tok.T_CURLY_OPEN;
          }
        } else if (ch === '"') {
          this.popState();
          return '"';
        }
        while (this.offset < this.size) {
          if (ch === "\\") {
            this.input();
          } else if (ch === '"') {
            this.unput(1);
            this.popState();
            this.appendToken('"', 1);
            break;
          } else if (ch === "$") {
            ch = this.input();
            if (ch === "{") {
              this.begin("ST_LOOKING_FOR_VARNAME");
              if (this.yytext.length > 2) {
                this.appendToken(this.tok.T_DOLLAR_OPEN_CURLY_BRACES, 2);
                this.unput(2);
                return this.tok.T_ENCAPSED_AND_WHITESPACE;
              } else {
                return this.tok.T_DOLLAR_OPEN_CURLY_BRACES;
              }
            } else if (this.is_LABEL_START()) {
              const yyoffset = this.offset;
              const next = this.consume_VARIABLE();
              if (this.yytext.length > this.offset - yyoffset + 2) {
                this.appendToken(next, this.offset - yyoffset + 2);
                this.unput(this.offset - yyoffset + 2);
                return this.tok.T_ENCAPSED_AND_WHITESPACE;
              } else {
                return next;
              }
            }
            if (ch)
              this.unput(1);
          } else if (ch === "{") {
            ch = this.input();
            if (ch === "$") {
              this.begin("ST_IN_SCRIPTING");
              if (this.yytext.length > 2) {
                this.appendToken(this.tok.T_CURLY_OPEN, 1);
                this.unput(2);
                return this.tok.T_ENCAPSED_AND_WHITESPACE;
              } else {
                this.unput(1);
                return this.tok.T_CURLY_OPEN;
              }
            }
            if (ch)
              this.unput(1);
          }
          ch = this.input();
        }
        return this.tok.T_ENCAPSED_AND_WHITESPACE;
      }
    };
  }
});

// node_modules/php-parser/src/lexer/tokens.js
var require_tokens = __commonJS({
  "node_modules/php-parser/src/lexer/tokens.js"(exports2, module2) {
    "use strict";
    module2.exports = {
      T_STRING: function() {
        const token = this.yytext.toLowerCase();
        let id = this.keywords[token];
        if (typeof id !== "number") {
          if (token === "yield") {
            if (this.version >= 700 && this.tryMatch(" from")) {
              this.consume(5);
              id = this.tok.T_YIELD_FROM;
            } else {
              id = this.tok.T_YIELD;
            }
          } else {
            id = this.tok.T_STRING;
            if (token === "b" || token === "B") {
              const ch = this.input();
              if (ch === '"') {
                return this.ST_DOUBLE_QUOTES();
              } else if (ch === "'") {
                return this.T_CONSTANT_ENCAPSED_STRING();
              } else if (ch) {
                this.unput(1);
              }
            }
          }
        }
        if (id === this.tok.T_ENUM) {
          if (this.version < 801) {
            return this.tok.T_STRING;
          }
          const initial = this.offset;
          let ch = this.input();
          while (ch == " ") {
            ch = this.input();
          }
          let isEnum = false;
          if (this.is_LABEL_START()) {
            while (this.is_LABEL()) {
              ch += this.input();
            }
            const label = ch.slice(0, -1).toLowerCase();
            isEnum = label !== "extends" && label !== "implements";
          }
          this.unput(this.offset - initial);
          return isEnum ? this.tok.T_ENUM : this.tok.T_STRING;
        }
        if (this.offset < this.size && id !== this.tok.T_YIELD_FROM) {
          let ch = this.input();
          if (ch === "\\") {
            id = token === "namespace" ? this.tok.T_NAME_RELATIVE : this.tok.T_NAME_QUALIFIED;
            do {
              if (this._input[this.offset] === "{") {
                this.input();
                break;
              }
              this.consume_LABEL();
              ch = this.input();
            } while (ch === "\\");
          }
          if (ch) {
            this.unput(1);
          }
        }
        return id;
      },
      consume_TOKEN: function() {
        const ch = this._input[this.offset - 1];
        const fn = this.tokenTerminals[ch];
        if (fn) {
          return fn.apply(this, []);
        } else {
          return this.yytext;
        }
      },
      tokenTerminals: {
        $: function() {
          this.offset++;
          if (this.is_LABEL_START()) {
            this.offset--;
            this.consume_LABEL();
            return this.tok.T_VARIABLE;
          } else {
            this.offset--;
            return "$";
          }
        },
        "-": function() {
          const nchar = this._input[this.offset];
          if (nchar === ">") {
            this.begin("ST_LOOKING_FOR_PROPERTY").input();
            return this.tok.T_OBJECT_OPERATOR;
          } else if (nchar === "-") {
            this.input();
            return this.tok.T_DEC;
          } else if (nchar === "=") {
            this.input();
            return this.tok.T_MINUS_EQUAL;
          }
          return "-";
        },
        "\\": function() {
          if (this.offset < this.size) {
            this.input();
            if (this.is_LABEL_START()) {
              let ch;
              do {
                if (this._input[this.offset] === "{") {
                  this.input();
                  break;
                }
                this.consume_LABEL();
                ch = this.input();
              } while (ch === "\\");
              this.unput(1);
              return this.tok.T_NAME_FULLY_QUALIFIED;
            } else {
              this.unput(1);
            }
          }
          return this.tok.T_NS_SEPARATOR;
        },
        "/": function() {
          if (this._input[this.offset] === "=") {
            this.input();
            return this.tok.T_DIV_EQUAL;
          }
          return "/";
        },
        ":": function() {
          if (this._input[this.offset] === ":") {
            this.input();
            return this.tok.T_DOUBLE_COLON;
          } else {
            return ":";
          }
        },
        "(": function() {
          const initial = this.offset;
          this.input();
          if (this.is_TABSPACE()) {
            this.consume_TABSPACE().input();
          }
          if (this.is_LABEL_START()) {
            const yylen = this.yytext.length;
            this.consume_LABEL();
            const castToken = this.yytext.substring(yylen - 1).toLowerCase();
            const castId = this.castKeywords[castToken];
            if (typeof castId === "number") {
              this.input();
              if (this.is_TABSPACE()) {
                this.consume_TABSPACE().input();
              }
              if (this._input[this.offset - 1] === ")") {
                return castId;
              }
            }
          }
          this.unput(this.offset - initial);
          return "(";
        },
        "=": function() {
          const nchar = this._input[this.offset];
          if (nchar === ">") {
            this.input();
            return this.tok.T_DOUBLE_ARROW;
          } else if (nchar === "=") {
            if (this._input[this.offset + 1] === "=") {
              this.consume(2);
              return this.tok.T_IS_IDENTICAL;
            } else {
              this.input();
              return this.tok.T_IS_EQUAL;
            }
          }
          return "=";
        },
        "+": function() {
          const nchar = this._input[this.offset];
          if (nchar === "+") {
            this.input();
            return this.tok.T_INC;
          } else if (nchar === "=") {
            this.input();
            return this.tok.T_PLUS_EQUAL;
          }
          return "+";
        },
        "!": function() {
          if (this._input[this.offset] === "=") {
            if (this._input[this.offset + 1] === "=") {
              this.consume(2);
              return this.tok.T_IS_NOT_IDENTICAL;
            } else {
              this.input();
              return this.tok.T_IS_NOT_EQUAL;
            }
          }
          return "!";
        },
        "?": function() {
          if (this.version >= 700 && this._input[this.offset] === "?") {
            if (this.version >= 704 && this._input[this.offset + 1] === "=") {
              this.consume(2);
              return this.tok.T_COALESCE_EQUAL;
            } else {
              this.input();
              return this.tok.T_COALESCE;
            }
          }
          if (this.version >= 800 && this._input[this.offset] === "-" && this._input[this.offset + 1] === ">") {
            this.consume(2);
            return this.tok.T_NULLSAFE_OBJECT_OPERATOR;
          }
          return "?";
        },
        "<": function() {
          let nchar = this._input[this.offset];
          if (nchar === "<") {
            nchar = this._input[this.offset + 1];
            if (nchar === "=") {
              this.consume(2);
              return this.tok.T_SL_EQUAL;
            } else if (nchar === "<") {
              if (this.is_HEREDOC()) {
                return this.tok.T_START_HEREDOC;
              }
            }
            this.input();
            return this.tok.T_SL;
          } else if (nchar === "=") {
            this.input();
            if (this.version >= 700 && this._input[this.offset] === ">") {
              this.input();
              return this.tok.T_SPACESHIP;
            } else {
              return this.tok.T_IS_SMALLER_OR_EQUAL;
            }
          } else if (nchar === ">") {
            this.input();
            return this.tok.T_IS_NOT_EQUAL;
          }
          return "<";
        },
        ">": function() {
          let nchar = this._input[this.offset];
          if (nchar === "=") {
            this.input();
            return this.tok.T_IS_GREATER_OR_EQUAL;
          } else if (nchar === ">") {
            nchar = this._input[this.offset + 1];
            if (nchar === "=") {
              this.consume(2);
              return this.tok.T_SR_EQUAL;
            } else {
              this.input();
              return this.tok.T_SR;
            }
          }
          return ">";
        },
        "*": function() {
          const nchar = this._input[this.offset];
          if (nchar === "=") {
            this.input();
            return this.tok.T_MUL_EQUAL;
          } else if (nchar === "*") {
            this.input();
            if (this._input[this.offset] === "=") {
              this.input();
              return this.tok.T_POW_EQUAL;
            } else {
              return this.tok.T_POW;
            }
          }
          return "*";
        },
        ".": function() {
          const nchar = this._input[this.offset];
          if (nchar === "=") {
            this.input();
            return this.tok.T_CONCAT_EQUAL;
          } else if (nchar === "." && this._input[this.offset + 1] === ".") {
            this.consume(2);
            return this.tok.T_ELLIPSIS;
          }
          return ".";
        },
        "%": function() {
          if (this._input[this.offset] === "=") {
            this.input();
            return this.tok.T_MOD_EQUAL;
          }
          return "%";
        },
        "&": function() {
          const nchar = this._input[this.offset];
          if (nchar === "=") {
            this.input();
            return this.tok.T_AND_EQUAL;
          } else if (nchar === "&") {
            this.input();
            return this.tok.T_BOOLEAN_AND;
          }
          return "&";
        },
        "|": function() {
          const nchar = this._input[this.offset];
          if (nchar === "=") {
            this.input();
            return this.tok.T_OR_EQUAL;
          } else if (nchar === "|") {
            this.input();
            return this.tok.T_BOOLEAN_OR;
          }
          return "|";
        },
        "^": function() {
          if (this._input[this.offset] === "=") {
            this.input();
            return this.tok.T_XOR_EQUAL;
          }
          return "^";
        }
      }
    };
  }
});

// node_modules/php-parser/src/lexer/utils.js
var require_utils = __commonJS({
  "node_modules/php-parser/src/lexer/utils.js"(exports2, module2) {
    "use strict";
    var tokens = ";:,.\\[]()|^&+-/*=%!~$<>?@";
    module2.exports = {
      is_NUM: function() {
        const ch = this._input.charCodeAt(this.offset - 1);
        return ch > 47 && ch < 58 || ch === 95;
      },
      is_NUM_START: function() {
        const ch = this._input.charCodeAt(this.offset - 1);
        return ch > 47 && ch < 58;
      },
      is_LABEL: function() {
        const ch = this._input.charCodeAt(this.offset - 1);
        return ch > 96 && ch < 123 || ch > 64 && ch < 91 || ch === 95 || ch > 47 && ch < 58 || ch > 126;
      },
      is_LABEL_START: function() {
        const ch = this._input.charCodeAt(this.offset - 1);
        if (ch > 64 && ch < 91)
          return true;
        if (ch > 96 && ch < 123)
          return true;
        if (ch === 95)
          return true;
        if (ch > 126)
          return true;
        return false;
      },
      consume_LABEL: function() {
        while (this.offset < this.size) {
          const ch = this.input();
          if (!this.is_LABEL()) {
            if (ch)
              this.unput(1);
            break;
          }
        }
        return this;
      },
      is_TOKEN: function() {
        const ch = this._input[this.offset - 1];
        return tokens.indexOf(ch) !== -1;
      },
      is_WHITESPACE: function() {
        const ch = this._input[this.offset - 1];
        return ch === " " || ch === "	" || ch === "\n" || ch === "\r";
      },
      is_TABSPACE: function() {
        const ch = this._input[this.offset - 1];
        return ch === " " || ch === "	";
      },
      consume_TABSPACE: function() {
        while (this.offset < this.size) {
          const ch = this.input();
          if (!this.is_TABSPACE()) {
            if (ch)
              this.unput(1);
            break;
          }
        }
        return this;
      },
      is_HEX: function() {
        const ch = this._input.charCodeAt(this.offset - 1);
        if (ch > 47 && ch < 58)
          return true;
        if (ch > 64 && ch < 71)
          return true;
        if (ch > 96 && ch < 103)
          return true;
        if (ch === 95)
          return true;
        return false;
      },
      is_OCTAL: function() {
        const ch = this._input.charCodeAt(this.offset - 1);
        if (ch > 47 && ch < 56)
          return true;
        if (ch === 95)
          return true;
        return false;
      }
    };
  }
});

// node_modules/php-parser/src/lexer.js
var require_lexer = __commonJS({
  "node_modules/php-parser/src/lexer.js"(exports2, module2) {
    "use strict";
    var Lexer = function(engine) {
      this.engine = engine;
      this.tok = this.engine.tokens.names;
      this.EOF = 1;
      this.debug = false;
      this.all_tokens = true;
      this.comment_tokens = false;
      this.mode_eval = false;
      this.asp_tags = false;
      this.short_tags = false;
      this.version = 801;
      this.yyprevcol = 0;
      this.keywords = {
        __class__: this.tok.T_CLASS_C,
        __trait__: this.tok.T_TRAIT_C,
        __function__: this.tok.T_FUNC_C,
        __method__: this.tok.T_METHOD_C,
        __line__: this.tok.T_LINE,
        __file__: this.tok.T_FILE,
        __dir__: this.tok.T_DIR,
        __namespace__: this.tok.T_NS_C,
        exit: this.tok.T_EXIT,
        die: this.tok.T_EXIT,
        function: this.tok.T_FUNCTION,
        const: this.tok.T_CONST,
        return: this.tok.T_RETURN,
        try: this.tok.T_TRY,
        catch: this.tok.T_CATCH,
        finally: this.tok.T_FINALLY,
        throw: this.tok.T_THROW,
        if: this.tok.T_IF,
        elseif: this.tok.T_ELSEIF,
        endif: this.tok.T_ENDIF,
        else: this.tok.T_ELSE,
        while: this.tok.T_WHILE,
        endwhile: this.tok.T_ENDWHILE,
        do: this.tok.T_DO,
        for: this.tok.T_FOR,
        endfor: this.tok.T_ENDFOR,
        foreach: this.tok.T_FOREACH,
        endforeach: this.tok.T_ENDFOREACH,
        declare: this.tok.T_DECLARE,
        enddeclare: this.tok.T_ENDDECLARE,
        instanceof: this.tok.T_INSTANCEOF,
        as: this.tok.T_AS,
        switch: this.tok.T_SWITCH,
        endswitch: this.tok.T_ENDSWITCH,
        case: this.tok.T_CASE,
        default: this.tok.T_DEFAULT,
        break: this.tok.T_BREAK,
        continue: this.tok.T_CONTINUE,
        goto: this.tok.T_GOTO,
        echo: this.tok.T_ECHO,
        print: this.tok.T_PRINT,
        class: this.tok.T_CLASS,
        interface: this.tok.T_INTERFACE,
        trait: this.tok.T_TRAIT,
        enum: this.tok.T_ENUM,
        extends: this.tok.T_EXTENDS,
        implements: this.tok.T_IMPLEMENTS,
        new: this.tok.T_NEW,
        clone: this.tok.T_CLONE,
        var: this.tok.T_VAR,
        eval: this.tok.T_EVAL,
        include: this.tok.T_INCLUDE,
        include_once: this.tok.T_INCLUDE_ONCE,
        require: this.tok.T_REQUIRE,
        require_once: this.tok.T_REQUIRE_ONCE,
        namespace: this.tok.T_NAMESPACE,
        use: this.tok.T_USE,
        insteadof: this.tok.T_INSTEADOF,
        global: this.tok.T_GLOBAL,
        isset: this.tok.T_ISSET,
        empty: this.tok.T_EMPTY,
        __halt_compiler: this.tok.T_HALT_COMPILER,
        static: this.tok.T_STATIC,
        abstract: this.tok.T_ABSTRACT,
        final: this.tok.T_FINAL,
        private: this.tok.T_PRIVATE,
        protected: this.tok.T_PROTECTED,
        public: this.tok.T_PUBLIC,
        unset: this.tok.T_UNSET,
        list: this.tok.T_LIST,
        array: this.tok.T_ARRAY,
        callable: this.tok.T_CALLABLE,
        or: this.tok.T_LOGICAL_OR,
        and: this.tok.T_LOGICAL_AND,
        xor: this.tok.T_LOGICAL_XOR,
        match: this.tok.T_MATCH,
        readonly: this.tok.T_READ_ONLY
      };
      this.castKeywords = {
        int: this.tok.T_INT_CAST,
        integer: this.tok.T_INT_CAST,
        real: this.tok.T_DOUBLE_CAST,
        double: this.tok.T_DOUBLE_CAST,
        float: this.tok.T_DOUBLE_CAST,
        string: this.tok.T_STRING_CAST,
        binary: this.tok.T_STRING_CAST,
        array: this.tok.T_ARRAY_CAST,
        object: this.tok.T_OBJECT_CAST,
        bool: this.tok.T_BOOL_CAST,
        boolean: this.tok.T_BOOL_CAST,
        unset: this.tok.T_UNSET_CAST
      };
    };
    Lexer.prototype.setInput = function(input) {
      this._input = input;
      this.size = input.length;
      this.yylineno = 1;
      this.offset = 0;
      this.yyprevcol = 0;
      this.yytext = "";
      this.yylloc = {
        first_offset: 0,
        first_line: 1,
        first_column: 0,
        prev_offset: 0,
        prev_line: 1,
        prev_column: 0,
        last_line: 1,
        last_column: 0
      };
      this.tokens = [];
      if (this.version > 703) {
        this.keywords.fn = this.tok.T_FN;
      } else {
        delete this.keywords.fn;
      }
      this.done = this.offset >= this.size;
      if (!this.all_tokens && this.mode_eval) {
        this.conditionStack = ["INITIAL"];
        this.begin("ST_IN_SCRIPTING");
      } else {
        this.conditionStack = [];
        this.begin("INITIAL");
      }
      this.heredoc_label = {
        label: "",
        length: 0,
        indentation: 0,
        indentation_uses_spaces: false,
        finished: false,
        first_encaps_node: false,
        toString: function() {
          this.label;
        }
      };
      return this;
    };
    Lexer.prototype.input = function() {
      const ch = this._input[this.offset];
      if (!ch)
        return "";
      this.yytext += ch;
      this.offset++;
      if (ch === "\r" && this._input[this.offset] === "\n") {
        this.yytext += "\n";
        this.offset++;
      }
      if (ch === "\n" || ch === "\r") {
        this.yylloc.last_line = ++this.yylineno;
        this.yyprevcol = this.yylloc.last_column;
        this.yylloc.last_column = 0;
      } else {
        this.yylloc.last_column++;
      }
      return ch;
    };
    Lexer.prototype.unput = function(size) {
      if (size === 1) {
        this.offset--;
        if (this._input[this.offset] === "\n" && this._input[this.offset - 1] === "\r") {
          this.offset--;
          size++;
        }
        if (this._input[this.offset] === "\r" || this._input[this.offset] === "\n") {
          this.yylloc.last_line--;
          this.yylineno--;
          this.yylloc.last_column = this.yyprevcol;
        } else {
          this.yylloc.last_column--;
        }
        this.yytext = this.yytext.substring(0, this.yytext.length - size);
      } else if (size > 0) {
        this.offset -= size;
        if (size < this.yytext.length) {
          this.yytext = this.yytext.substring(0, this.yytext.length - size);
          this.yylloc.last_line = this.yylloc.first_line;
          this.yylloc.last_column = this.yyprevcol = this.yylloc.first_column;
          for (let i = 0; i < this.yytext.length; i++) {
            let c = this.yytext[i];
            if (c === "\r") {
              c = this.yytext[++i];
              this.yyprevcol = this.yylloc.last_column;
              this.yylloc.last_line++;
              this.yylloc.last_column = 0;
              if (c !== "\n") {
                if (c === "\r") {
                  this.yylloc.last_line++;
                } else {
                  this.yylloc.last_column++;
                }
              }
            } else if (c === "\n") {
              this.yyprevcol = this.yylloc.last_column;
              this.yylloc.last_line++;
              this.yylloc.last_column = 0;
            } else {
              this.yylloc.last_column++;
            }
          }
          this.yylineno = this.yylloc.last_line;
        } else {
          this.yytext = "";
          this.yylloc.last_line = this.yylineno = this.yylloc.first_line;
          this.yylloc.last_column = this.yylloc.first_column;
        }
      }
      return this;
    };
    Lexer.prototype.tryMatch = function(text) {
      return text === this.ahead(text.length);
    };
    Lexer.prototype.tryMatchCaseless = function(text) {
      return text === this.ahead(text.length).toLowerCase();
    };
    Lexer.prototype.ahead = function(size) {
      let text = this._input.substring(this.offset, this.offset + size);
      if (text[text.length - 1] === "\r" && this._input[this.offset + size + 1] === "\n") {
        text += "\n";
      }
      return text;
    };
    Lexer.prototype.consume = function(size) {
      for (let i = 0; i < size; i++) {
        const ch = this._input[this.offset];
        if (!ch)
          break;
        this.yytext += ch;
        this.offset++;
        if (ch === "\r" && this._input[this.offset] === "\n") {
          this.yytext += "\n";
          this.offset++;
          i++;
        }
        if (ch === "\n" || ch === "\r") {
          this.yylloc.last_line = ++this.yylineno;
          this.yyprevcol = this.yylloc.last_column;
          this.yylloc.last_column = 0;
        } else {
          this.yylloc.last_column++;
        }
      }
      return this;
    };
    Lexer.prototype.getState = function() {
      return {
        yytext: this.yytext,
        offset: this.offset,
        yylineno: this.yylineno,
        yyprevcol: this.yyprevcol,
        yylloc: {
          first_offset: this.yylloc.first_offset,
          first_line: this.yylloc.first_line,
          first_column: this.yylloc.first_column,
          last_line: this.yylloc.last_line,
          last_column: this.yylloc.last_column
        },
        heredoc_label: this.heredoc_label
      };
    };
    Lexer.prototype.setState = function(state) {
      this.yytext = state.yytext;
      this.offset = state.offset;
      this.yylineno = state.yylineno;
      this.yyprevcol = state.yyprevcol;
      this.yylloc = state.yylloc;
      if (state.heredoc_label) {
        this.heredoc_label = state.heredoc_label;
      }
      return this;
    };
    Lexer.prototype.appendToken = function(value, ahead) {
      this.tokens.push([value, ahead]);
      return this;
    };
    Lexer.prototype.lex = function() {
      this.yylloc.prev_offset = this.offset;
      this.yylloc.prev_line = this.yylloc.last_line;
      this.yylloc.prev_column = this.yylloc.last_column;
      let token = this.next() || this.lex();
      if (!this.all_tokens) {
        while (token === this.tok.T_WHITESPACE || !this.comment_tokens && (token === this.tok.T_COMMENT || token === this.tok.T_DOC_COMMENT) || token === this.tok.T_OPEN_TAG) {
          token = this.next() || this.lex();
        }
        if (token == this.tok.T_OPEN_TAG_WITH_ECHO) {
          return this.tok.T_ECHO;
        } else if (token === this.tok.T_CLOSE_TAG) {
          return ";";
        }
      }
      if (!this.yylloc.prev_offset) {
        this.yylloc.prev_offset = this.yylloc.first_offset;
        this.yylloc.prev_line = this.yylloc.first_line;
        this.yylloc.prev_column = this.yylloc.first_column;
      }
      return token;
    };
    Lexer.prototype.begin = function(condition) {
      this.conditionStack.push(condition);
      this.curCondition = condition;
      this.stateCb = this["match" + condition];
      if (typeof this.stateCb !== "function") {
        throw new Error('Undefined condition state "' + condition + '"');
      }
      return this;
    };
    Lexer.prototype.popState = function() {
      const n = this.conditionStack.length - 1;
      const condition = n > 0 ? this.conditionStack.pop() : this.conditionStack[0];
      this.curCondition = this.conditionStack[this.conditionStack.length - 1];
      this.stateCb = this["match" + this.curCondition];
      if (typeof this.stateCb !== "function") {
        throw new Error('Undefined condition state "' + this.curCondition + '"');
      }
      return condition;
    };
    Lexer.prototype.next = function() {
      let token;
      if (!this._input) {
        this.done = true;
      }
      this.yylloc.first_offset = this.offset;
      this.yylloc.first_line = this.yylloc.last_line;
      this.yylloc.first_column = this.yylloc.last_column;
      this.yytext = "";
      if (this.done) {
        this.yylloc.prev_offset = this.yylloc.first_offset;
        this.yylloc.prev_line = this.yylloc.first_line;
        this.yylloc.prev_column = this.yylloc.first_column;
        return this.EOF;
      }
      if (this.tokens.length > 0) {
        token = this.tokens.shift();
        if (typeof token[1] === "object") {
          this.setState(token[1]);
        } else {
          this.consume(token[1]);
        }
        token = token[0];
      } else {
        token = this.stateCb.apply(this, []);
      }
      if (this.offset >= this.size && this.tokens.length === 0) {
        this.done = true;
      }
      if (this.debug) {
        let tName = token;
        if (typeof tName === "number") {
          tName = this.engine.tokens.values[tName];
        } else {
          tName = '"' + tName + '"';
        }
        const e = new Error(
          tName + "	from " + this.yylloc.first_line + "," + this.yylloc.first_column + "	 - to " + this.yylloc.last_line + "," + this.yylloc.last_column + '	"' + this.yytext + '"'
        );
        console.error(e.stack);
      }
      return token;
    };
    [
      require_attribute(),
      require_comments(),
      require_initial(),
      require_numbers(),
      require_property(),
      require_scripting(),
      require_strings(),
      require_tokens(),
      require_utils()
    ].forEach(function(ext) {
      for (const k in ext) {
        Lexer.prototype[k] = ext[k];
      }
    });
    module2.exports = Lexer;
  }
});

// node_modules/php-parser/src/ast/position.js
var require_position = __commonJS({
  "node_modules/php-parser/src/ast/position.js"(exports2, module2) {
    "use strict";
    var Position2 = function(line, column, offset) {
      this.line = line;
      this.column = column;
      this.offset = offset;
    };
    module2.exports = Position2;
  }
});

// node_modules/php-parser/src/parser/array.js
var require_array = __commonJS({
  "node_modules/php-parser/src/parser/array.js"(exports2, module2) {
    "use strict";
    module2.exports = {
      read_array: function() {
        let expect = null;
        let shortForm = false;
        const result = this.node("array");
        if (this.token === this.tok.T_ARRAY) {
          this.next().expect("(");
          expect = ")";
        } else {
          shortForm = true;
          expect = "]";
        }
        let items = [];
        if (this.next().token !== expect) {
          items = this.read_array_pair_list(shortForm);
        }
        this.expect(expect);
        this.next();
        return result(shortForm, items);
      },
      read_array_pair_list: function(shortForm) {
        const self = this;
        return this.read_list(
          function() {
            return self.read_array_pair(shortForm);
          },
          ",",
          true
        );
      },
      read_array_pair: function(shortForm) {
        if (!shortForm && this.token === ")" || shortForm && this.token === "]") {
          return;
        }
        if (this.token === ",") {
          return this.node("noop")();
        }
        const entry = this.node("entry");
        let key = null;
        let value = null;
        let byRef = false;
        let unpack = false;
        if (this.token === "&") {
          this.next();
          byRef = true;
          value = this.read_variable(true, false);
        } else if (this.token === this.tok.T_ELLIPSIS && this.version >= 704) {
          this.next();
          if (this.token === "&") {
            this.error();
          }
          unpack = true;
          value = this.read_expr();
        } else {
          const expr = this.read_expr();
          if (this.token === this.tok.T_DOUBLE_ARROW) {
            this.next();
            key = expr;
            if (this.token === "&") {
              this.next();
              byRef = true;
              value = this.read_variable(true, false);
            } else {
              value = this.read_expr();
            }
          } else {
            value = expr;
          }
        }
        return entry(key, value, byRef, unpack);
      }
    };
  }
});

// node_modules/php-parser/src/parser/class.js
var require_class = __commonJS({
  "node_modules/php-parser/src/parser/class.js"(exports2, module2) {
    "use strict";
    module2.exports = {
      read_class_declaration_statement: function(attrs) {
        const result = this.node("class");
        const flag = this.read_class_modifiers();
        if (this.token !== this.tok.T_CLASS) {
          this.error(this.tok.T_CLASS);
          this.next();
          return null;
        }
        this.next().expect(this.tok.T_STRING);
        let propName = this.node("identifier");
        const name = this.text();
        this.next();
        propName = propName(name);
        const propExtends = this.read_extends_from();
        const propImplements = this.read_implements_list();
        this.expect("{");
        const body = this.next().read_class_body(true, false);
        const node = result(propName, propExtends, propImplements, body, flag);
        if (attrs)
          node.attrGroups = attrs;
        return node;
      },
      read_class_modifiers: function() {
        const modifier = this.read_class_modifier({
          readonly: 0,
          final_or_abstract: 0
        });
        return [0, 0, modifier.final_or_abstract, modifier.readonly];
      },
      read_class_modifier: function(memo) {
        if (this.token === this.tok.T_READ_ONLY) {
          this.next();
          memo.readonly = 1;
          memo = this.read_class_modifier(memo);
        } else if (memo.final_or_abstract === 0 && this.token === this.tok.T_ABSTRACT) {
          this.next();
          memo.final_or_abstract = 1;
          memo = this.read_class_modifier(memo);
        } else if (memo.final_or_abstract === 0 && this.token === this.tok.T_FINAL) {
          this.next();
          memo.final_or_abstract = 2;
          memo = this.read_class_modifier(memo);
        }
        return memo;
      },
      read_class_body: function(allow_variables, allow_enum_cases) {
        let result = [];
        let attrs = [];
        while (this.token !== this.EOF && this.token !== "}") {
          if (this.token === this.tok.T_COMMENT) {
            result.push(this.read_comment());
            continue;
          }
          if (this.token === this.tok.T_DOC_COMMENT) {
            result.push(this.read_doc_comment());
            continue;
          }
          if (this.token === this.tok.T_USE) {
            result = result.concat(this.read_trait_use_statement());
            continue;
          }
          if (allow_enum_cases && this.token === this.tok.T_CASE) {
            const enumcase = this.read_enum_case();
            if (this.expect(";")) {
              this.next();
            }
            result = result.concat(enumcase);
            continue;
          }
          if (this.token === this.tok.T_ATTRIBUTE) {
            attrs = this.read_attr_list();
          }
          const locStart = this.position();
          const flags = this.read_member_flags(false);
          if (this.token === this.tok.T_CONST) {
            const constants = this.read_constant_list(flags, attrs);
            if (this.expect(";")) {
              this.next();
            }
            result = result.concat(constants);
            continue;
          }
          if (allow_variables && this.token === this.tok.T_VAR) {
            this.next().expect(this.tok.T_VARIABLE);
            flags[0] = null;
            flags[1] = 0;
          }
          if (this.token === this.tok.T_FUNCTION) {
            result.push(this.read_function(false, flags, attrs, locStart));
            attrs = [];
          } else if (allow_variables && (this.token === this.tok.T_VARIABLE || this.version >= 801 && this.token === this.tok.T_READ_ONLY || this.version >= 704 && (this.token === "?" || this.token === this.tok.T_ARRAY || this.token === this.tok.T_CALLABLE || this.token === this.tok.T_NAMESPACE || this.token === this.tok.T_NAME_FULLY_QUALIFIED || this.token === this.tok.T_NAME_QUALIFIED || this.token === this.tok.T_NAME_RELATIVE || this.token === this.tok.T_NS_SEPARATOR || this.token === this.tok.T_STRING))) {
            const variables = this.read_variable_list(flags, attrs);
            attrs = [];
            this.expect(";");
            this.next();
            result = result.concat(variables);
          } else {
            this.error([
              this.tok.T_CONST,
              ...allow_variables ? [this.tok.T_VARIABLE] : [],
              ...allow_enum_cases ? [this.tok.T_CASE] : [],
              this.tok.T_FUNCTION
            ]);
            this.next();
          }
        }
        this.expect("}");
        this.next();
        return result;
      },
      read_variable_list: function(flags, attrs) {
        const result = this.node("propertystatement");
        const properties = this.read_list(
          function read_variable_declaration() {
            const result2 = this.node("property");
            let readonly = false;
            if (this.token === this.tok.T_READ_ONLY) {
              readonly = true;
              this.next();
            }
            const [nullable, type] = this.read_optional_type();
            this.expect(this.tok.T_VARIABLE);
            let propName = this.node("identifier");
            const name = this.text().substring(1);
            this.next();
            propName = propName(name);
            if (this.token === ";" || this.token === ",") {
              return result2(propName, null, readonly, nullable, type, attrs || []);
            } else if (this.token === "=") {
              return result2(
                propName,
                this.next().read_expr(),
                readonly,
                nullable,
                type,
                attrs || []
              );
            } else {
              this.expect([",", ";", "="]);
              return result2(propName, null, nullable, type, attrs || []);
            }
          },
          ","
        );
        return result(null, properties, flags);
      },
      read_constant_list: function(flags, attrs) {
        if (this.expect(this.tok.T_CONST)) {
          this.next();
        }
        const result = this.node("classconstant");
        const items = this.read_list(
          function read_constant_declaration() {
            const result2 = this.node("constant");
            let constName = null;
            let value = null;
            if (this.token === this.tok.T_STRING || this.version >= 700 && this.is("IDENTIFIER")) {
              constName = this.node("identifier");
              const name = this.text();
              this.next();
              constName = constName(name);
            } else {
              this.expect("IDENTIFIER");
            }
            if (this.expect("=")) {
              value = this.next().read_expr();
            }
            return result2(constName, value);
          },
          ","
        );
        return result(null, items, flags, attrs || []);
      },
      read_member_flags: function(asInterface) {
        const result = [-1, -1, -1];
        if (this.is("T_MEMBER_FLAGS")) {
          let idx = 0, val = 0;
          do {
            switch (this.token) {
              case this.tok.T_PUBLIC:
                idx = 0;
                val = 0;
                break;
              case this.tok.T_PROTECTED:
                idx = 0;
                val = 1;
                break;
              case this.tok.T_PRIVATE:
                idx = 0;
                val = 2;
                break;
              case this.tok.T_STATIC:
                idx = 1;
                val = 1;
                break;
              case this.tok.T_ABSTRACT:
                idx = 2;
                val = 1;
                break;
              case this.tok.T_FINAL:
                idx = 2;
                val = 2;
                break;
            }
            if (asInterface) {
              if (idx == 0 && val == 2) {
                this.expect([this.tok.T_PUBLIC, this.tok.T_PROTECTED]);
                val = -1;
              } else if (idx == 2 && val == 1) {
                this.error();
                val = -1;
              }
            }
            if (result[idx] !== -1) {
              this.error();
            } else if (val !== -1) {
              result[idx] = val;
            }
          } while (this.next().is("T_MEMBER_FLAGS"));
        }
        if (result[1] == -1)
          result[1] = 0;
        if (result[2] == -1)
          result[2] = 0;
        return result;
      },
      read_optional_type: function() {
        let nullable = false;
        if (this.token === "?") {
          nullable = true;
          this.next();
        }
        let type = this.read_types();
        if (nullable && !type) {
          this.raiseError(
            "Expecting a type definition combined with nullable operator"
          );
        }
        if (!nullable && !type) {
          return [false, null];
        }
        if (this.token === "|") {
          type = [type];
          do {
            this.next();
            const variant = this.read_type();
            if (!variant) {
              this.raiseError("Expecting a type definition");
              break;
            }
            type.push(variant);
          } while (this.token === "|");
        }
        return [nullable, type];
      },
      read_interface_declaration_statement: function(attrs) {
        const result = this.node("interface");
        if (this.token !== this.tok.T_INTERFACE) {
          this.error(this.tok.T_INTERFACE);
          this.next();
          return null;
        }
        this.next().expect(this.tok.T_STRING);
        let propName = this.node("identifier");
        const name = this.text();
        this.next();
        propName = propName(name);
        const propExtends = this.read_interface_extends_list();
        this.expect("{");
        const body = this.next().read_interface_body();
        return result(propName, propExtends, body, attrs || []);
      },
      read_interface_body: function() {
        let result = [], attrs = [];
        while (this.token !== this.EOF && this.token !== "}") {
          if (this.token === this.tok.T_COMMENT) {
            result.push(this.read_comment());
            continue;
          }
          if (this.token === this.tok.T_DOC_COMMENT) {
            result.push(this.read_doc_comment());
            continue;
          }
          const locStart = this.position();
          attrs = this.read_attr_list();
          const flags = this.read_member_flags(true);
          if (this.token == this.tok.T_CONST) {
            const constants = this.read_constant_list(flags, attrs);
            if (this.expect(";")) {
              this.next();
            }
            result = result.concat(constants);
            attrs = [];
          } else if (this.token === this.tok.T_FUNCTION) {
            const method = this.read_function_declaration(
              2,
              flags,
              attrs,
              locStart
            );
            method.parseFlags(flags);
            result.push(method);
            if (this.expect(";")) {
              this.next();
            }
            attrs = [];
          } else {
            this.error([this.tok.T_CONST, this.tok.T_FUNCTION]);
            this.next();
          }
        }
        if (this.expect("}")) {
          this.next();
        }
        return result;
      },
      read_trait_declaration_statement: function() {
        const result = this.node("trait");
        if (this.token !== this.tok.T_TRAIT) {
          this.error(this.tok.T_TRAIT);
          this.next();
          return null;
        }
        this.next().expect(this.tok.T_STRING);
        let propName = this.node("identifier");
        const name = this.text();
        this.next();
        propName = propName(name);
        this.expect("{");
        const body = this.next().read_class_body(true, false);
        return result(propName, body);
      },
      read_trait_use_statement: function() {
        const node = this.node("traituse");
        this.expect(this.tok.T_USE) && this.next();
        const traits = [this.read_namespace_name()];
        let adaptations = null;
        while (this.token === ",") {
          traits.push(this.next().read_namespace_name());
        }
        if (this.token === "{") {
          adaptations = [];
          while (this.next().token !== this.EOF) {
            if (this.token === "}")
              break;
            adaptations.push(this.read_trait_use_alias());
            this.expect(";");
          }
          if (this.expect("}")) {
            this.next();
          }
        } else {
          if (this.expect(";")) {
            this.next();
          }
        }
        return node(traits, adaptations);
      },
      read_trait_use_alias: function() {
        const node = this.node();
        let trait = null;
        let method;
        if (this.is("IDENTIFIER")) {
          method = this.node("identifier");
          const methodName = this.text();
          this.next();
          method = method(methodName);
        } else {
          method = this.read_namespace_name();
          if (this.token === this.tok.T_DOUBLE_COLON) {
            this.next();
            if (this.token === this.tok.T_STRING || this.version >= 700 && this.is("IDENTIFIER")) {
              trait = method;
              method = this.node("identifier");
              const methodName = this.text();
              this.next();
              method = method(methodName);
            } else {
              this.expect(this.tok.T_STRING);
            }
          } else {
            method = method.name;
          }
        }
        if (this.token === this.tok.T_INSTEADOF) {
          return node(
            "traitprecedence",
            trait,
            method,
            this.next().read_name_list()
          );
        } else if (this.token === this.tok.T_AS) {
          let flags = null;
          let alias = null;
          if (this.next().is("T_MEMBER_FLAGS")) {
            flags = this.read_member_flags();
          }
          if (this.token === this.tok.T_STRING || this.version >= 700 && this.is("IDENTIFIER")) {
            alias = this.node("identifier");
            const name = this.text();
            this.next();
            alias = alias(name);
          } else if (flags === false) {
            this.expect(this.tok.T_STRING);
          }
          return node("traitalias", trait, method, alias, flags);
        }
        this.expect([this.tok.T_AS, this.tok.T_INSTEADOF]);
        return node("traitalias", trait, method, null, null);
      }
    };
  }
});

// node_modules/php-parser/src/parser/comment.js
var require_comment = __commonJS({
  "node_modules/php-parser/src/parser/comment.js"(exports2, module2) {
    "use strict";
    module2.exports = {
      read_comment: function() {
        const text = this.text();
        let result = this.ast.prepare(
          text.substring(0, 2) === "/*" ? "commentblock" : "commentline",
          null,
          this
        );
        const offset = this.lexer.yylloc.first_offset;
        const prev = this.prev;
        this.prev = [
          this.lexer.yylloc.last_line,
          this.lexer.yylloc.last_column,
          this.lexer.offset
        ];
        this.lex();
        result = result(text);
        result.offset = offset;
        this.prev = prev;
        return result;
      },
      read_doc_comment: function() {
        let result = this.ast.prepare("commentblock", null, this);
        const offset = this.lexer.yylloc.first_offset;
        const text = this.text();
        const prev = this.prev;
        this.prev = [
          this.lexer.yylloc.last_line,
          this.lexer.yylloc.last_column,
          this.lexer.offset
        ];
        this.lex();
        result = result(text);
        result.offset = offset;
        this.prev = prev;
        return result;
      }
    };
  }
});

// node_modules/php-parser/src/parser/expr.js
var require_expr = __commonJS({
  "node_modules/php-parser/src/parser/expr.js"(exports2, module2) {
    "use strict";
    module2.exports = {
      read_expr: function(expr) {
        const result = this.node();
        if (this.token === "@") {
          if (!expr) {
            expr = this.next().read_expr();
          }
          return result("silent", expr);
        }
        if (!expr) {
          expr = this.read_expr_item();
        }
        if (this.token === "|") {
          return result("bin", "|", expr, this.next().read_expr());
        }
        if (this.token === "&") {
          return result("bin", "&", expr, this.next().read_expr());
        }
        if (this.token === "^") {
          return result("bin", "^", expr, this.next().read_expr());
        }
        if (this.token === ".") {
          return result("bin", ".", expr, this.next().read_expr());
        }
        if (this.token === "+") {
          return result("bin", "+", expr, this.next().read_expr());
        }
        if (this.token === "-") {
          return result("bin", "-", expr, this.next().read_expr());
        }
        if (this.token === "*") {
          return result("bin", "*", expr, this.next().read_expr());
        }
        if (this.token === "/") {
          return result("bin", "/", expr, this.next().read_expr());
        }
        if (this.token === "%") {
          return result("bin", "%", expr, this.next().read_expr());
        }
        if (this.token === this.tok.T_POW) {
          return result("bin", "**", expr, this.next().read_expr());
        }
        if (this.token === this.tok.T_SL) {
          return result("bin", "<<", expr, this.next().read_expr());
        }
        if (this.token === this.tok.T_SR) {
          return result("bin", ">>", expr, this.next().read_expr());
        }
        if (this.token === this.tok.T_BOOLEAN_OR) {
          return result("bin", "||", expr, this.next().read_expr());
        }
        if (this.token === this.tok.T_LOGICAL_OR) {
          return result("bin", "or", expr, this.next().read_expr());
        }
        if (this.token === this.tok.T_BOOLEAN_AND) {
          return result("bin", "&&", expr, this.next().read_expr());
        }
        if (this.token === this.tok.T_LOGICAL_AND) {
          return result("bin", "and", expr, this.next().read_expr());
        }
        if (this.token === this.tok.T_LOGICAL_XOR) {
          return result("bin", "xor", expr, this.next().read_expr());
        }
        if (this.token === this.tok.T_IS_IDENTICAL) {
          return result("bin", "===", expr, this.next().read_expr());
        }
        if (this.token === this.tok.T_IS_NOT_IDENTICAL) {
          return result("bin", "!==", expr, this.next().read_expr());
        }
        if (this.token === this.tok.T_IS_EQUAL) {
          return result("bin", "==", expr, this.next().read_expr());
        }
        if (this.token === this.tok.T_IS_NOT_EQUAL) {
          return result("bin", "!=", expr, this.next().read_expr());
        }
        if (this.token === "<") {
          return result("bin", "<", expr, this.next().read_expr());
        }
        if (this.token === ">") {
          return result("bin", ">", expr, this.next().read_expr());
        }
        if (this.token === this.tok.T_IS_SMALLER_OR_EQUAL) {
          return result("bin", "<=", expr, this.next().read_expr());
        }
        if (this.token === this.tok.T_IS_GREATER_OR_EQUAL) {
          return result("bin", ">=", expr, this.next().read_expr());
        }
        if (this.token === this.tok.T_SPACESHIP) {
          return result("bin", "<=>", expr, this.next().read_expr());
        }
        if (this.token === this.tok.T_INSTANCEOF) {
          expr = result(
            "bin",
            "instanceof",
            expr,
            this.next().read_class_name_reference()
          );
          if (this.token !== ";" && this.token !== this.tok.T_INLINE_HTML && this.token !== this.EOF) {
            expr = this.read_expr(expr);
          }
        }
        if (this.token === this.tok.T_COALESCE) {
          return result("bin", "??", expr, this.next().read_expr());
        }
        if (this.token === "?") {
          let trueArg = null;
          if (this.next().token !== ":") {
            trueArg = this.read_expr();
          }
          this.expect(":") && this.next();
          return result("retif", expr, trueArg, this.read_expr());
        } else {
          result.destroy(expr);
        }
        return expr;
      },
      read_expr_cast: function(type) {
        return this.node("cast")(type, this.text(), this.next().read_expr());
      },
      read_isset_variable: function() {
        return this.read_expr();
      },
      read_isset_variables: function() {
        return this.read_function_list(this.read_isset_variable, ",");
      },
      read_internal_functions_in_yacc: function() {
        let result = null;
        switch (this.token) {
          case this.tok.T_ISSET:
            {
              result = this.node("isset");
              if (this.next().expect("(")) {
                this.next();
              }
              const variables = this.read_isset_variables();
              if (this.expect(")")) {
                this.next();
              }
              result = result(variables);
            }
            break;
          case this.tok.T_EMPTY:
            {
              result = this.node("empty");
              if (this.next().expect("(")) {
                this.next();
              }
              const expression = this.read_expr();
              if (this.expect(")")) {
                this.next();
              }
              result = result(expression);
            }
            break;
          case this.tok.T_INCLUDE:
            result = this.node("include")(false, false, this.next().read_expr());
            break;
          case this.tok.T_INCLUDE_ONCE:
            result = this.node("include")(true, false, this.next().read_expr());
            break;
          case this.tok.T_EVAL:
            {
              result = this.node("eval");
              if (this.next().expect("(")) {
                this.next();
              }
              const expr = this.read_expr();
              if (this.expect(")")) {
                this.next();
              }
              result = result(expr);
            }
            break;
          case this.tok.T_REQUIRE:
            result = this.node("include")(false, true, this.next().read_expr());
            break;
          case this.tok.T_REQUIRE_ONCE:
            result = this.node("include")(true, true, this.next().read_expr());
            break;
        }
        return result;
      },
      read_optional_expr: function(stopToken) {
        if (this.token !== stopToken) {
          return this.read_expr();
        }
        return null;
      },
      read_exit_expr: function() {
        let expression = null;
        if (this.token === "(") {
          this.next();
          expression = this.read_optional_expr(")");
          this.expect(")") && this.next();
        }
        return expression;
      },
      read_expr_item: function() {
        let result, expr, attrs = [];
        if (this.token === "+") {
          return this.node("unary")("+", this.next().read_expr());
        }
        if (this.token === "-") {
          return this.node("unary")("-", this.next().read_expr());
        }
        if (this.token === "!") {
          return this.node("unary")("!", this.next().read_expr());
        }
        if (this.token === "~") {
          return this.node("unary")("~", this.next().read_expr());
        }
        if (this.token === "(") {
          expr = this.next().read_expr();
          expr.parenthesizedExpression = true;
          this.expect(")") && this.next();
          return this.handleDereferencable(expr);
        }
        if (this.token === "`") {
          return this.read_encapsed_string("`");
        }
        if (this.token === this.tok.T_LIST) {
          let assign = null;
          const isInner = this.innerList;
          result = this.node("list");
          if (!isInner) {
            assign = this.node("assign");
          }
          if (this.next().expect("(")) {
            this.next();
          }
          if (!this.innerList)
            this.innerList = true;
          const assignList = this.read_array_pair_list(false);
          if (this.expect(")")) {
            this.next();
          }
          let hasItem = false;
          for (let i = 0; i < assignList.length; i++) {
            if (assignList[i] !== null && assignList[i].kind !== "noop") {
              hasItem = true;
              break;
            }
          }
          if (!hasItem) {
            this.raiseError(
              "Fatal Error :  Cannot use empty list on line " + this.lexer.yylloc.first_line
            );
          }
          if (!isInner) {
            this.innerList = false;
            if (this.expect("=")) {
              return assign(
                result(assignList, false),
                this.next().read_expr(),
                "="
              );
            } else {
              return result(assignList, false);
            }
          } else {
            return result(assignList, false);
          }
        }
        if (this.token === this.tok.T_ATTRIBUTE) {
          attrs = this.read_attr_list();
        }
        if (this.token === this.tok.T_CLONE) {
          return this.node("clone")(this.next().read_expr());
        }
        switch (this.token) {
          case this.tok.T_INC:
            return this.node("pre")("+", this.next().read_variable(false, false));
          case this.tok.T_DEC:
            return this.node("pre")("-", this.next().read_variable(false, false));
          case this.tok.T_NEW:
            return this.read_new_expr();
          case this.tok.T_ISSET:
          case this.tok.T_EMPTY:
          case this.tok.T_INCLUDE:
          case this.tok.T_INCLUDE_ONCE:
          case this.tok.T_EVAL:
          case this.tok.T_REQUIRE:
          case this.tok.T_REQUIRE_ONCE:
            return this.read_internal_functions_in_yacc();
          case this.tok.T_MATCH:
            return this.read_match_expression();
          case this.tok.T_INT_CAST:
            return this.read_expr_cast("int");
          case this.tok.T_DOUBLE_CAST:
            return this.read_expr_cast("float");
          case this.tok.T_STRING_CAST:
            return this.read_expr_cast(
              this.text().indexOf("binary") !== -1 ? "binary" : "string"
            );
          case this.tok.T_ARRAY_CAST:
            return this.read_expr_cast("array");
          case this.tok.T_OBJECT_CAST:
            return this.read_expr_cast("object");
          case this.tok.T_BOOL_CAST:
            return this.read_expr_cast("bool");
          case this.tok.T_UNSET_CAST:
            return this.read_expr_cast("unset");
          case this.tok.T_THROW: {
            if (this.version < 800) {
              this.raiseError("PHP 8+ is required to use throw as an expression");
            }
            const result2 = this.node("throw");
            const expr2 = this.next().read_expr();
            return result2(expr2);
          }
          case this.tok.T_EXIT: {
            const useDie = this.lexer.yytext.toLowerCase() === "die";
            result = this.node("exit");
            this.next();
            const expression = this.read_exit_expr();
            return result(expression, useDie);
          }
          case this.tok.T_PRINT:
            return this.node("print")(this.next().read_expr());
          case this.tok.T_YIELD: {
            let value = null;
            let key = null;
            result = this.node("yield");
            if (this.next().is("EXPR")) {
              value = this.read_expr();
              if (this.token === this.tok.T_DOUBLE_ARROW) {
                key = value;
                value = this.next().read_expr();
              }
            }
            return result(value, key);
          }
          case this.tok.T_YIELD_FROM:
            result = this.node("yieldfrom");
            expr = this.next().read_expr();
            return result(expr);
          case this.tok.T_FN:
          case this.tok.T_FUNCTION:
            return this.read_inline_function(void 0, attrs);
          case this.tok.T_STATIC: {
            const backup = [this.token, this.lexer.getState()];
            this.next();
            if (this.token === this.tok.T_FUNCTION || this.version >= 704 && this.token === this.tok.T_FN) {
              return this.read_inline_function([0, 1, 0], attrs);
            } else {
              this.lexer.tokens.push(backup);
              this.next();
            }
          }
        }
        if (this.is("VARIABLE")) {
          result = this.node();
          expr = this.read_variable(false, false);
          const isConst = expr.kind === "identifier" || expr.kind === "staticlookup" && expr.offset.kind === "identifier";
          switch (this.token) {
            case "=": {
              if (isConst)
                this.error("VARIABLE");
              if (this.next().token == "&") {
                return this.read_assignref(result, expr);
              }
              return result("assign", expr, this.read_expr(), "=");
            }
            case this.tok.T_PLUS_EQUAL:
              if (isConst)
                this.error("VARIABLE");
              return result("assign", expr, this.next().read_expr(), "+=");
            case this.tok.T_MINUS_EQUAL:
              if (isConst)
                this.error("VARIABLE");
              return result("assign", expr, this.next().read_expr(), "-=");
            case this.tok.T_MUL_EQUAL:
              if (isConst)
                this.error("VARIABLE");
              return result("assign", expr, this.next().read_expr(), "*=");
            case this.tok.T_POW_EQUAL:
              if (isConst)
                this.error("VARIABLE");
              return result("assign", expr, this.next().read_expr(), "**=");
            case this.tok.T_DIV_EQUAL:
              if (isConst)
                this.error("VARIABLE");
              return result("assign", expr, this.next().read_expr(), "/=");
            case this.tok.T_CONCAT_EQUAL:
              if (isConst)
                this.error("VARIABLE");
              return result("assign", expr, this.next().read_expr(), ".=");
            case this.tok.T_MOD_EQUAL:
              if (isConst)
                this.error("VARIABLE");
              return result("assign", expr, this.next().read_expr(), "%=");
            case this.tok.T_AND_EQUAL:
              if (isConst)
                this.error("VARIABLE");
              return result("assign", expr, this.next().read_expr(), "&=");
            case this.tok.T_OR_EQUAL:
              if (isConst)
                this.error("VARIABLE");
              return result("assign", expr, this.next().read_expr(), "|=");
            case this.tok.T_XOR_EQUAL:
              if (isConst)
                this.error("VARIABLE");
              return result("assign", expr, this.next().read_expr(), "^=");
            case this.tok.T_SL_EQUAL:
              if (isConst)
                this.error("VARIABLE");
              return result("assign", expr, this.next().read_expr(), "<<=");
            case this.tok.T_SR_EQUAL:
              if (isConst)
                this.error("VARIABLE");
              return result("assign", expr, this.next().read_expr(), ">>=");
            case this.tok.T_COALESCE_EQUAL:
              if (isConst)
                this.error("VARIABLE");
              return result("assign", expr, this.next().read_expr(), "??=");
            case this.tok.T_INC:
              if (isConst)
                this.error("VARIABLE");
              this.next();
              return result("post", "+", expr);
            case this.tok.T_DEC:
              if (isConst)
                this.error("VARIABLE");
              this.next();
              return result("post", "-", expr);
            default:
              result.destroy(expr);
          }
        } else if (this.is("SCALAR")) {
          result = this.node();
          expr = this.read_scalar();
          if (expr.kind === "array" && expr.shortForm && this.token === "=") {
            const list = this.convertToList(expr);
            if (expr.loc)
              list.loc = expr.loc;
            const right = this.next().read_expr();
            return result("assign", list, right, "=");
          } else {
            result.destroy(expr);
          }
          return this.handleDereferencable(expr);
        } else {
          this.error("EXPR");
          this.next();
        }
        return expr;
      },
      convertToList: function(array) {
        const convertedItems = array.items.map((entry) => {
          if (entry.value && entry.value.kind === "array" && entry.value.shortForm) {
            entry.value = this.convertToList(entry.value);
          }
          return entry;
        });
        const node = this.node("list")(convertedItems, true);
        if (array.loc)
          node.loc = array.loc;
        if (array.leadingComments)
          node.leadingComments = array.leadingComments;
        if (array.trailingComments)
          node.trailingComments = array.trailingComments;
        return node;
      },
      read_assignref: function(result, left) {
        this.next();
        let right;
        if (this.token === this.tok.T_NEW) {
          if (this.version >= 700) {
            this.error();
          }
          right = this.read_new_expr();
        } else {
          right = this.read_variable(false, false);
        }
        return result("assignref", left, right);
      },
      read_inline_function: function(flags, attrs) {
        if (this.token === this.tok.T_FUNCTION) {
          const result2 = this.read_function(true, flags, attrs);
          result2.attrGroups = attrs;
          return result2;
        }
        if (!this.version >= 704) {
          this.raiseError("Arrow Functions are not allowed");
        }
        const node = this.node("arrowfunc");
        if (this.expect(this.tok.T_FN))
          this.next();
        const isRef = this.is_reference();
        if (this.expect("("))
          this.next();
        const params = this.read_parameter_list();
        if (this.expect(")"))
          this.next();
        let nullable = false;
        let returnType = null;
        if (this.token === ":") {
          if (this.next().token === "?") {
            nullable = true;
            this.next();
          }
          returnType = this.read_types();
        }
        if (this.expect(this.tok.T_DOUBLE_ARROW))
          this.next();
        const body = this.read_expr();
        const result = node(
          params,
          isRef,
          body,
          returnType,
          nullable,
          flags ? true : false
        );
        result.attrGroups = attrs;
        return result;
      },
      read_match_expression: function() {
        const node = this.node("match");
        this.expect(this.tok.T_MATCH) && this.next();
        if (this.version < 800) {
          this.raiseError("Match statements are not allowed before PHP 8");
        }
        let cond = null;
        let arms = [];
        if (this.expect("("))
          this.next();
        cond = this.read_expr();
        if (this.expect(")"))
          this.next();
        if (this.expect("{"))
          this.next();
        arms = this.read_match_arms();
        if (this.expect("}"))
          this.next();
        return node(cond, arms);
      },
      read_match_arms: function() {
        return this.read_list(() => this.read_match_arm(), ",", true);
      },
      read_match_arm: function() {
        if (this.token === "}") {
          return;
        }
        return this.node("matcharm")(this.read_match_arm_conds(), this.read_expr());
      },
      read_match_arm_conds: function() {
        let conds = [];
        if (this.token === this.tok.T_DEFAULT) {
          conds = null;
          this.next();
        } else {
          conds.push(this.read_expr());
          while (this.token === ",") {
            this.next();
            if (this.token === this.tok.T_DOUBLE_ARROW) {
              this.next();
              return conds;
            }
            conds.push(this.read_expr());
          }
        }
        if (this.expect(this.tok.T_DOUBLE_ARROW)) {
          this.next();
        }
        return conds;
      },
      read_attribute() {
        const name = this.text();
        let args = [];
        this.next();
        if (this.token === "(") {
          args = this.read_argument_list();
        }
        return this.node("attribute")(name, args);
      },
      read_attr_list() {
        const list = [];
        if (this.token === this.tok.T_ATTRIBUTE) {
          do {
            const attrGr = this.node("attrgroup")([]);
            this.next();
            attrGr.attrs.push(this.read_attribute());
            while (this.token === ",") {
              this.next();
              if (this.token !== "]")
                attrGr.attrs.push(this.read_attribute());
            }
            list.push(attrGr);
            this.expect("]");
            this.next();
          } while (this.token === this.tok.T_ATTRIBUTE);
        }
        return list;
      },
      read_new_expr: function() {
        const result = this.node("new");
        this.expect(this.tok.T_NEW) && this.next();
        let args = [];
        if (this.token === "(") {
          this.next();
          const newExp = this.read_expr();
          this.expect(")");
          this.next();
          if (this.token === "(") {
            args = this.read_argument_list();
          }
          return result(newExp, args);
        }
        const attrs = this.read_attr_list();
        if (this.token === this.tok.T_CLASS) {
          const what = this.node("class");
          if (this.next().token === "(") {
            args = this.read_argument_list();
          }
          const propExtends = this.read_extends_from();
          const propImplements = this.read_implements_list();
          let body = null;
          if (this.expect("{")) {
            body = this.next().read_class_body(true, false);
          }
          const whatNode = what(null, propExtends, propImplements, body, [0, 0, 0]);
          whatNode.attrGroups = attrs;
          return result(whatNode, args);
        }
        let name = this.read_new_class_name();
        while (this.token === "[") {
          const offsetNode = this.node("offsetlookup");
          const offset = this.next().read_encaps_var_offset();
          this.expect("]") && this.next();
          name = offsetNode(name, offset);
        }
        if (this.token === "(") {
          args = this.read_argument_list();
        }
        return result(name, args);
      },
      read_new_class_name: function() {
        if (this.token === this.tok.T_NS_SEPARATOR || this.token === this.tok.T_NAME_RELATIVE || this.token === this.tok.T_NAME_QUALIFIED || this.token === this.tok.T_NAME_FULLY_QUALIFIED || this.token === this.tok.T_STRING || this.token === this.tok.T_NAMESPACE) {
          let result = this.read_namespace_name(true);
          if (this.token === this.tok.T_DOUBLE_COLON) {
            result = this.read_static_getter(result);
          }
          return result;
        } else if (this.is("VARIABLE")) {
          return this.read_variable(true, false);
        } else {
          this.expect([this.tok.T_STRING, "VARIABLE"]);
        }
      },
      handleDereferencable: function(expr) {
        while (this.token !== this.EOF) {
          if (this.token === this.tok.T_OBJECT_OPERATOR || this.token === this.tok.T_DOUBLE_COLON) {
            expr = this.recursive_variable_chain_scan(expr, false, false, true);
          } else if (this.token === this.tok.T_CURLY_OPEN || this.token === "[") {
            expr = this.read_dereferencable(expr);
          } else if (this.token === "(") {
            expr = this.node("call")(expr, this.read_argument_list());
          } else {
            return expr;
          }
        }
        return expr;
      }
    };
  }
});

// node_modules/php-parser/src/parser/enum.js
var require_enum = __commonJS({
  "node_modules/php-parser/src/parser/enum.js"(exports2, module2) {
    "use strict";
    module2.exports = {
      read_enum_declaration_statement: function(attrs) {
        const result = this.node("enum");
        if (!this.expect(this.tok.T_ENUM)) {
          return null;
        }
        this.next().expect(this.tok.T_STRING);
        let propName = this.node("identifier");
        const name = this.text();
        this.next();
        propName = propName(name);
        const valueType = this.read_enum_value_type();
        const propImplements = this.read_implements_list();
        this.expect("{");
        const body = this.next().read_class_body(false, true);
        const node = result(propName, valueType, propImplements, body);
        if (attrs)
          node.attrGroups = attrs;
        return node;
      },
      read_enum_value_type: function() {
        if (this.token === ":") {
          return this.next().read_namespace_name();
        }
        return null;
      },
      read_enum_case: function() {
        this.expect(this.tok.T_CASE);
        const result = this.node("enumcase");
        let caseName = this.node("identifier");
        const name = this.next().text();
        this.next();
        caseName = caseName(name);
        const value = this.token === "=" ? this.next().read_expr() : null;
        this.expect(";");
        return result(caseName, value);
      }
    };
  }
});

// node_modules/php-parser/src/parser/function.js
var require_function = __commonJS({
  "node_modules/php-parser/src/parser/function.js"(exports2, module2) {
    "use strict";
    module2.exports = {
      is_reference: function() {
        if (this.token === "&") {
          this.next();
          return true;
        }
        return false;
      },
      is_variadic: function() {
        if (this.token === this.tok.T_ELLIPSIS) {
          this.next();
          return true;
        }
        return false;
      },
      read_function: function(closure, flag, attrs, locStart) {
        const result = this.read_function_declaration(
          closure ? 1 : flag ? 2 : 0,
          flag && flag[1] === 1,
          attrs || [],
          locStart
        );
        if (flag && flag[2] == 1) {
          result.parseFlags(flag);
          if (this.expect(";")) {
            this.next();
          }
        } else {
          if (this.expect("{")) {
            result.body = this.read_code_block(false);
            if (result.loc && result.body.loc) {
              result.loc.end = result.body.loc.end;
            }
          }
          if (!closure && flag) {
            result.parseFlags(flag);
          }
        }
        return result;
      },
      read_function_declaration: function(type, isStatic, attrs, locStart) {
        let nodeName = "function";
        if (type === 1) {
          nodeName = "closure";
        } else if (type === 2) {
          nodeName = "method";
        }
        const result = this.node(nodeName);
        if (this.expect(this.tok.T_FUNCTION)) {
          this.next();
        }
        const isRef = this.is_reference();
        let name = false, use = [], returnType = null, nullable = false;
        if (type !== 1) {
          const nameNode = this.node("identifier");
          if (type === 2) {
            if (this.version >= 700) {
              if (this.token === this.tok.T_STRING || this.is("IDENTIFIER")) {
                name = this.text();
                this.next();
              } else if (this.version < 704) {
                this.error("IDENTIFIER");
              }
            } else if (this.token === this.tok.T_STRING) {
              name = this.text();
              this.next();
            } else {
              this.error("IDENTIFIER");
            }
          } else {
            if (this.version >= 700) {
              if (this.token === this.tok.T_STRING) {
                name = this.text();
                this.next();
              } else if (this.version >= 704) {
                if (!this.expect("(")) {
                  this.next();
                }
              } else {
                this.error(this.tok.T_STRING);
                this.next();
              }
            } else {
              if (this.expect(this.tok.T_STRING)) {
                name = this.text();
              }
              this.next();
            }
          }
          name = nameNode(name);
        }
        if (this.expect("("))
          this.next();
        const params = this.read_parameter_list(name.name === "__construct");
        if (this.expect(")"))
          this.next();
        if (type === 1) {
          use = this.read_lexical_vars();
        }
        if (this.token === ":") {
          if (this.next().token === "?") {
            nullable = true;
            this.next();
          }
          returnType = this.read_types();
        }
        const apply_attrgroup_location = (node) => {
          node.attrGroups = attrs || [];
          if (locStart && node.loc) {
            node.loc.start = locStart;
            if (node.loc.source) {
              node.loc.source = this.lexer._input.substr(
                node.loc.start.offset,
                node.loc.end.offset - node.loc.start.offset
              );
            }
          }
          return node;
        };
        if (type === 1) {
          return apply_attrgroup_location(
            result(params, isRef, use, returnType, nullable, isStatic)
          );
        }
        return apply_attrgroup_location(
          result(name, params, isRef, returnType, nullable)
        );
      },
      read_lexical_vars: function() {
        let result = [];
        if (this.token === this.tok.T_USE) {
          this.next();
          this.expect("(") && this.next();
          result = this.read_lexical_var_list();
          this.expect(")") && this.next();
        }
        return result;
      },
      read_list_with_dangling_comma: function(item) {
        const result = [];
        while (this.token != this.EOF) {
          result.push(item());
          if (this.token == ",") {
            this.next();
            if (this.version >= 800 && this.token === ")") {
              return result;
            }
          } else if (this.token == ")") {
            break;
          } else {
            this.error([",", ")"]);
            break;
          }
        }
        return result;
      },
      read_lexical_var_list: function() {
        return this.read_list_with_dangling_comma(this.read_lexical_var.bind(this));
      },
      read_lexical_var: function() {
        if (this.token === "&") {
          return this.read_byref(this.read_lexical_var.bind(this));
        }
        const result = this.node("variable");
        this.expect(this.tok.T_VARIABLE);
        const name = this.text().substring(1);
        this.next();
        return result(name, false);
      },
      read_parameter_list: function(is_class_constructor) {
        if (this.token !== ")") {
          let wasVariadic = false;
          return this.read_list_with_dangling_comma(
            function() {
              const parameter = this.read_parameter(is_class_constructor);
              if (parameter) {
                if (wasVariadic) {
                  this.raiseError(
                    "Unexpected parameter after a variadic parameter"
                  );
                }
                if (parameter.variadic) {
                  wasVariadic = true;
                }
              }
              return parameter;
            }.bind(this),
            ","
          );
        }
        return [];
      },
      read_parameter: function(is_class_constructor) {
        const node = this.node("parameter");
        let parameterName = null;
        let value = null;
        let types = null;
        let nullable = false;
        let readonly = false;
        let attrs = [];
        if (this.token === this.tok.T_ATTRIBUTE)
          attrs = this.read_attr_list();
        if (this.version >= 801 && this.token === this.tok.T_READ_ONLY) {
          if (is_class_constructor) {
            this.next();
            readonly = true;
          } else {
            this.raiseError(
              "readonly properties can be used only on class constructor"
            );
          }
        }
        const flags = this.read_promoted();
        if (!readonly && this.version >= 801 && this.token === this.tok.T_READ_ONLY) {
          if (is_class_constructor) {
            this.next();
            readonly = true;
          } else {
            this.raiseError(
              "readonly properties can be used only on class constructor"
            );
          }
        }
        if (this.token === "?") {
          this.next();
          nullable = true;
        }
        types = this.read_types();
        if (nullable && !types) {
          this.raiseError(
            "Expecting a type definition combined with nullable operator"
          );
        }
        const isRef = this.is_reference();
        const isVariadic = this.is_variadic();
        if (this.expect(this.tok.T_VARIABLE)) {
          parameterName = this.node("identifier");
          const name = this.text().substring(1);
          this.next();
          parameterName = parameterName(name);
        }
        if (this.token == "=") {
          value = this.next().read_expr();
        }
        const result = node(
          parameterName,
          types,
          value,
          isRef,
          isVariadic,
          readonly,
          nullable,
          flags
        );
        if (attrs)
          result.attrGroups = attrs;
        return result;
      },
      read_types() {
        const MODE_UNSET = "unset";
        const MODE_UNION = "union";
        const MODE_INTERSECTION = "intersection";
        const types = [];
        let mode = MODE_UNSET;
        const type = this.read_type();
        if (!type)
          return null;
        types.push(type);
        while (this.token === "|" || this.version >= 801 && this.token === "&") {
          const nextToken = this.peek();
          if (nextToken === this.tok.T_ELLIPSIS || nextToken === this.tok.T_VARIABLE) {
            break;
          }
          if (mode === MODE_UNSET) {
            mode = this.token === "|" ? MODE_UNION : MODE_INTERSECTION;
          } else {
            if (mode === MODE_UNION && this.token !== "|" || mode === MODE_INTERSECTION && this.token !== "&") {
              this.raiseError(
                'Unexpect token "' + this.token + '", "|" and "&" can not be mixed'
              );
            }
          }
          this.next();
          types.push(this.read_type());
        }
        if (types.length === 1) {
          return types[0];
        } else {
          return mode === MODE_INTERSECTION ? this.node("intersectiontype")(types) : this.node("uniontype")(types);
        }
      },
      read_promoted() {
        const MODIFIER_PUBLIC = 1;
        const MODIFIER_PROTECTED = 2;
        const MODIFIER_PRIVATE = 4;
        if (this.token === this.tok.T_PUBLIC) {
          this.next();
          return MODIFIER_PUBLIC;
        } else if (this.token === this.tok.T_PROTECTED) {
          this.next();
          return MODIFIER_PROTECTED;
        } else if (this.token === this.tok.T_PRIVATE) {
          this.next();
          return MODIFIER_PRIVATE;
        }
        return 0;
      },
      read_argument_list: function() {
        let result = [];
        this.expect("(") && this.next();
        if (this.version >= 801 && this.token === this.tok.T_ELLIPSIS && this.peek() === ")") {
          result.push(this.node("variadicplaceholder")());
          this.next();
        } else if (this.token !== ")") {
          result = this.read_non_empty_argument_list();
        }
        this.expect(")") && this.next();
        return result;
      },
      read_non_empty_argument_list: function() {
        let wasVariadic = false;
        return this.read_function_list(
          function() {
            const argument = this.read_argument();
            if (argument) {
              const isVariadic = argument.kind === "variadic";
              if (wasVariadic && !isVariadic) {
                this.raiseError(
                  "Unexpected non-variadic argument after a variadic argument"
                );
              }
              if (isVariadic) {
                wasVariadic = true;
              }
            }
            return argument;
          }.bind(this),
          ","
        );
      },
      read_argument: function() {
        if (this.token === this.tok.T_ELLIPSIS) {
          return this.node("variadic")(this.next().read_expr());
        }
        if (this.token === this.tok.T_STRING || Object.values(this.lexer.keywords).includes(this.token)) {
          const nextToken = this.peek();
          if (nextToken === ":") {
            if (this.version < 800) {
              this.raiseError("PHP 8+ is required to use named arguments");
            }
            return this.node("namedargument")(
              this.text(),
              this.next().next().read_expr()
            );
          }
        }
        return this.read_expr();
      },
      read_type: function() {
        const result = this.node();
        if (this.token === this.tok.T_ARRAY || this.token === this.tok.T_CALLABLE) {
          const type = this.text();
          this.next();
          return result("typereference", type.toLowerCase(), type);
        } else if (this.token === this.tok.T_NAME_RELATIVE || this.token === this.tok.T_NAME_QUALIFIED || this.token === this.tok.T_NAME_FULLY_QUALIFIED || this.token === this.tok.T_STRING || this.token === this.tok.T_STATIC) {
          const type = this.text();
          const backup = [this.token, this.lexer.getState()];
          this.next();
          if (this.token !== this.tok.T_NS_SEPARATOR && this.ast.typereference.types.indexOf(type.toLowerCase()) > -1) {
            return result("typereference", type.toLowerCase(), type);
          } else {
            this.lexer.tokens.push(backup);
            this.next();
            result.destroy();
            return this.read_namespace_name();
          }
        }
        result.destroy();
        return null;
      }
    };
  }
});

// node_modules/php-parser/src/parser/if.js
var require_if = __commonJS({
  "node_modules/php-parser/src/parser/if.js"(exports2, module2) {
    "use strict";
    module2.exports = {
      read_if: function() {
        const result = this.node("if");
        const test = this.next().read_if_expr();
        let body = null;
        let alternate = null;
        let shortForm = false;
        if (this.token === ":") {
          shortForm = true;
          this.next();
          body = this.node("block");
          const items = [];
          while (this.token !== this.EOF && this.token !== this.tok.T_ENDIF) {
            if (this.token === this.tok.T_ELSEIF) {
              alternate = this.read_elseif_short();
              break;
            } else if (this.token === this.tok.T_ELSE) {
              alternate = this.read_else_short();
              break;
            }
            items.push(this.read_inner_statement());
          }
          body = body(null, items);
          this.expect(this.tok.T_ENDIF) && this.next();
          this.expectEndOfStatement();
        } else {
          body = this.read_statement();
          if (this.token === this.tok.T_ELSEIF) {
            alternate = this.read_if();
          } else if (this.token === this.tok.T_ELSE) {
            alternate = this.next().read_statement();
          }
        }
        return result(test, body, alternate, shortForm);
      },
      read_if_expr: function() {
        this.expect("(") && this.next();
        const result = this.read_expr();
        this.expect(")") && this.next();
        return result;
      },
      read_elseif_short: function() {
        let alternate = null;
        const result = this.node("if");
        const test = this.next().read_if_expr();
        if (this.expect(":"))
          this.next();
        const body = this.node("block");
        const items = [];
        while (this.token != this.EOF && this.token !== this.tok.T_ENDIF) {
          if (this.token === this.tok.T_ELSEIF) {
            alternate = this.read_elseif_short();
            break;
          } else if (this.token === this.tok.T_ELSE) {
            alternate = this.read_else_short();
            break;
          }
          items.push(this.read_inner_statement());
        }
        return result(test, body(null, items), alternate, true);
      },
      read_else_short: function() {
        if (this.next().expect(":"))
          this.next();
        const body = this.node("block");
        const items = [];
        while (this.token != this.EOF && this.token !== this.tok.T_ENDIF) {
          items.push(this.read_inner_statement());
        }
        return body(null, items);
      }
    };
  }
});

// node_modules/php-parser/src/parser/loops.js
var require_loops = __commonJS({
  "node_modules/php-parser/src/parser/loops.js"(exports2, module2) {
    "use strict";
    module2.exports = {
      read_while: function() {
        const result = this.node("while");
        this.expect(this.tok.T_WHILE) && this.next();
        let test = null;
        let body = null;
        let shortForm = false;
        if (this.expect("("))
          this.next();
        test = this.read_expr();
        if (this.expect(")"))
          this.next();
        if (this.token === ":") {
          shortForm = true;
          body = this.read_short_form(this.tok.T_ENDWHILE);
        } else {
          body = this.read_statement();
        }
        return result(test, body, shortForm);
      },
      read_do: function() {
        const result = this.node("do");
        this.expect(this.tok.T_DO) && this.next();
        let test = null;
        let body = null;
        body = this.read_statement();
        if (this.expect(this.tok.T_WHILE)) {
          if (this.next().expect("("))
            this.next();
          test = this.read_expr();
          if (this.expect(")"))
            this.next();
          if (this.expect(";"))
            this.next();
        }
        return result(test, body);
      },
      read_for: function() {
        const result = this.node("for");
        this.expect(this.tok.T_FOR) && this.next();
        let init = [];
        let test = [];
        let increment = [];
        let body = null;
        let shortForm = false;
        if (this.expect("("))
          this.next();
        if (this.token !== ";") {
          init = this.read_list(this.read_expr, ",");
          if (this.expect(";"))
            this.next();
        } else {
          this.next();
        }
        if (this.token !== ";") {
          test = this.read_list(this.read_expr, ",");
          if (this.expect(";"))
            this.next();
        } else {
          this.next();
        }
        if (this.token !== ")") {
          increment = this.read_list(this.read_expr, ",");
          if (this.expect(")"))
            this.next();
        } else {
          this.next();
        }
        if (this.token === ":") {
          shortForm = true;
          body = this.read_short_form(this.tok.T_ENDFOR);
        } else {
          body = this.read_statement();
        }
        return result(init, test, increment, body, shortForm);
      },
      read_foreach: function() {
        const result = this.node("foreach");
        this.expect(this.tok.T_FOREACH) && this.next();
        let source = null;
        let key = null;
        let value = null;
        let body = null;
        let shortForm = false;
        if (this.expect("("))
          this.next();
        source = this.read_expr();
        if (this.expect(this.tok.T_AS)) {
          this.next();
          value = this.read_foreach_variable();
          if (this.token === this.tok.T_DOUBLE_ARROW) {
            key = value;
            value = this.next().read_foreach_variable();
          }
        }
        if (key && key.kind === "list") {
          this.raiseError("Fatal Error : Cannot use list as key element");
        }
        if (this.expect(")"))
          this.next();
        if (this.token === ":") {
          shortForm = true;
          body = this.read_short_form(this.tok.T_ENDFOREACH);
        } else {
          body = this.read_statement();
        }
        return result(source, key, value, body, shortForm);
      },
      read_foreach_variable: function() {
        if (this.token === this.tok.T_LIST || this.token === "[") {
          const isShort = this.token === "[";
          const result = this.node("list");
          this.next();
          if (!isShort && this.expect("("))
            this.next();
          const assignList = this.read_array_pair_list(isShort);
          if (this.expect(isShort ? "]" : ")"))
            this.next();
          return result(assignList, isShort);
        } else {
          return this.read_variable(false, false);
        }
      }
    };
  }
});

// node_modules/php-parser/src/parser/main.js
var require_main = __commonJS({
  "node_modules/php-parser/src/parser/main.js"(exports2, module2) {
    "use strict";
    module2.exports = {
      read_start: function() {
        if (this.token == this.tok.T_NAMESPACE) {
          return this.read_namespace();
        } else {
          return this.read_top_statement();
        }
      }
    };
  }
});

// node_modules/php-parser/src/parser/namespace.js
var require_namespace = __commonJS({
  "node_modules/php-parser/src/parser/namespace.js"(exports2, module2) {
    "use strict";
    module2.exports = {
      read_namespace: function() {
        const result = this.node("namespace");
        let body;
        this.expect(this.tok.T_NAMESPACE) && this.next();
        let name;
        if (this.token === "{") {
          name = {
            name: [""]
          };
        } else {
          name = this.read_namespace_name();
        }
        this.currentNamespace = name;
        if (this.token === ";") {
          this.currentNamespace = name;
          body = this.next().read_top_statements();
          this.expect(this.EOF);
          return result(name.name, body, false);
        } else if (this.token === "{") {
          this.currentNamespace = name;
          body = this.next().read_top_statements();
          this.expect("}") && this.next();
          if (body.length === 0 && this.extractDoc && this._docs.length > this._docIndex) {
            body.push(this.node("noop")());
          }
          return result(name.name, body, true);
        } else {
          this.error(["{", ";"]);
          this.currentNamespace = name;
          body = this.read_top_statements();
          this.expect(this.EOF);
          return result(name, body, false);
        }
      },
      read_namespace_name: function(resolveReference) {
        const result = this.node();
        let resolution;
        let name = this.text();
        switch (this.token) {
          case this.tok.T_NAME_RELATIVE:
            resolution = this.ast.name.RELATIVE_NAME;
            name = name.replace(/^namespace\\/, "");
            break;
          case this.tok.T_NAME_QUALIFIED:
            resolution = this.ast.name.QUALIFIED_NAME;
            break;
          case this.tok.T_NAME_FULLY_QUALIFIED:
            resolution = this.ast.name.FULL_QUALIFIED_NAME;
            break;
          default:
            resolution = this.ast.name.UNQUALIFIED_NAME;
            if (!this.expect(this.tok.T_STRING)) {
              return result("name", "", this.ast.name.FULL_QUALIFIED_NAME);
            }
        }
        this.next();
        if (resolveReference || this.token !== "(") {
          if (name.toLowerCase() === "parent") {
            return result("parentreference", name);
          } else if (name.toLowerCase() === "self") {
            return result("selfreference", name);
          }
        }
        return result("name", name, resolution);
      },
      read_use_statement: function() {
        let result = this.node("usegroup");
        let items = [];
        let name = null;
        this.expect(this.tok.T_USE) && this.next();
        const type = this.read_use_type();
        items.push(this.read_use_declaration(false));
        if (this.token === ",") {
          items = items.concat(this.next().read_use_declarations(false));
        } else if (this.token === "{") {
          name = items[0].name;
          items = this.next().read_use_declarations(type === null);
          this.expect("}") && this.next();
        }
        result = result(name, type, items);
        this.expect(";") && this.next();
        return result;
      },
      read_class_name_reference: function() {
        return this.read_variable(true, false);
      },
      read_use_declaration: function(typed) {
        const result = this.node("useitem");
        let type = null;
        if (typed)
          type = this.read_use_type();
        const name = this.read_namespace_name();
        const alias = this.read_use_alias();
        return result(name.name, alias, type);
      },
      read_use_declarations: function(typed) {
        const result = [this.read_use_declaration(typed)];
        while (this.token === ",") {
          this.next();
          if (typed) {
            if (this.token !== this.tok.T_NAME_RELATIVE && this.token !== this.tok.T_NAME_QUALIFIED && this.token !== this.tok.T_NAME_FULLY_QUALIFIED && this.token !== this.tok.T_FUNCTION && this.token !== this.tok.T_CONST && this.token !== this.tok.T_STRING) {
              break;
            }
          } else if (this.token !== this.tok.T_NAME_RELATIVE && this.token !== this.tok.T_NAME_QUALIFIED && this.token !== this.tok.T_NAME_FULLY_QUALIFIED && this.token !== this.tok.T_STRING && this.token !== this.tok.T_NS_SEPARATOR) {
            break;
          }
          result.push(this.read_use_declaration(typed));
        }
        return result;
      },
      read_use_alias: function() {
        let result = null;
        if (this.token === this.tok.T_AS) {
          if (this.next().expect(this.tok.T_STRING)) {
            const aliasName = this.node("identifier");
            const name = this.text();
            this.next();
            result = aliasName(name);
          }
        }
        return result;
      },
      read_use_type: function() {
        if (this.token === this.tok.T_FUNCTION) {
          this.next();
          return this.ast.useitem.TYPE_FUNCTION;
        } else if (this.token === this.tok.T_CONST) {
          this.next();
          return this.ast.useitem.TYPE_CONST;
        }
        return null;
      }
    };
  }
});

// node_modules/php-parser/src/parser/scalar.js
var require_scalar = __commonJS({
  "node_modules/php-parser/src/parser/scalar.js"(exports2, module2) {
    "use strict";
    var specialChar = {
      "\\": "\\",
      $: "$",
      n: "\n",
      r: "\r",
      t: "	",
      f: String.fromCharCode(12),
      v: String.fromCharCode(11),
      e: String.fromCharCode(27)
    };
    module2.exports = {
      resolve_special_chars: function(text, doubleQuote) {
        if (!doubleQuote) {
          return text.replace(/\\\\/g, "\\").replace(/\\'/g, "'");
        }
        return text.replace(/\\"/, '"').replace(
          /\\([\\$nrtfve]|[xX][0-9a-fA-F]{1,2}|[0-7]{1,3}|u{([0-9a-fA-F]+)})/g,
          ($match, p1, p2) => {
            if (specialChar[p1]) {
              return specialChar[p1];
            } else if ("x" === p1[0] || "X" === p1[0]) {
              return String.fromCodePoint(parseInt(p1.substr(1), 16));
            } else if ("u" === p1[0]) {
              return String.fromCodePoint(parseInt(p2, 16));
            } else {
              return String.fromCodePoint(parseInt(p1, 8));
            }
          }
        );
      },
      remove_heredoc_leading_whitespace_chars: function(text, indentation, indentation_uses_spaces, first_encaps_node) {
        if (indentation === 0) {
          return text;
        }
        this.check_heredoc_indentation_level(
          text,
          indentation,
          indentation_uses_spaces,
          first_encaps_node
        );
        const matchedChar = indentation_uses_spaces ? " " : "	";
        const removementRegExp = new RegExp(
          `\\n${matchedChar}{${indentation}}`,
          "g"
        );
        const removementFirstEncapsNodeRegExp = new RegExp(
          `^${matchedChar}{${indentation}}`
        );
        if (first_encaps_node) {
          text = text.replace(removementFirstEncapsNodeRegExp, "");
        }
        return text.replace(removementRegExp, "\n");
      },
      check_heredoc_indentation_level: function(text, indentation, indentation_uses_spaces, first_encaps_node) {
        const textSize = text.length;
        let offset = 0;
        let leadingWhitespaceCharCount = 0;
        let inCoutingState = true;
        const chToCheck = indentation_uses_spaces ? " " : "	";
        let inCheckState = false;
        if (!first_encaps_node) {
          offset = text.indexOf("\n");
          if (offset === -1) {
            return;
          }
          offset++;
        }
        while (offset < textSize) {
          if (inCoutingState) {
            if (text[offset] === chToCheck) {
              leadingWhitespaceCharCount++;
            } else {
              inCheckState = true;
            }
          } else {
            inCoutingState = false;
          }
          if (text[offset] !== "\n" && inCheckState && leadingWhitespaceCharCount < indentation) {
            this.raiseError(
              `Invalid body indentation level (expecting an indentation at least ${indentation})`
            );
          } else {
            inCheckState = false;
          }
          if (text[offset] === "\n") {
            inCoutingState = true;
            leadingWhitespaceCharCount = 0;
          }
          offset++;
        }
      },
      read_dereferencable_scalar: function() {
        let result = null;
        switch (this.token) {
          case this.tok.T_CONSTANT_ENCAPSED_STRING:
            {
              let value = this.node("string");
              const text = this.text();
              let offset = 0;
              if (text[0] === "b" || text[0] === "B") {
                offset = 1;
              }
              const isDoubleQuote = text[offset] === '"';
              this.next();
              const textValue = this.resolve_special_chars(
                text.substring(offset + 1, text.length - 1),
                isDoubleQuote
              );
              value = value(
                isDoubleQuote,
                textValue,
                offset === 1,
                text
              );
              if (this.token === this.tok.T_DOUBLE_COLON) {
                result = this.read_static_getter(value);
              } else {
                result = value;
              }
            }
            break;
          case this.tok.T_ARRAY:
            result = this.read_array();
            break;
          case "[":
            result = this.read_array();
            break;
        }
        return result;
      },
      read_scalar: function() {
        if (this.is("T_MAGIC_CONST")) {
          return this.get_magic_constant();
        } else {
          let value, node;
          switch (this.token) {
            case this.tok.T_LNUMBER:
            case this.tok.T_DNUMBER: {
              const result = this.node("number");
              value = this.text();
              this.next();
              return result(value, null);
            }
            case this.tok.T_START_HEREDOC:
              if (this.lexer.curCondition === "ST_NOWDOC") {
                const start = this.lexer.yylloc.first_offset;
                node = this.node("nowdoc");
                value = this.next().text();
                if (this.lexer.heredoc_label.indentation > 0) {
                  value = value.substring(
                    0,
                    value.length - this.lexer.heredoc_label.indentation
                  );
                }
                const lastCh = value[value.length - 1];
                if (lastCh === "\n") {
                  if (value[value.length - 2] === "\r") {
                    value = value.substring(0, value.length - 2);
                  } else {
                    value = value.substring(0, value.length - 1);
                  }
                } else if (lastCh === "\r") {
                  value = value.substring(0, value.length - 1);
                }
                this.expect(this.tok.T_ENCAPSED_AND_WHITESPACE) && this.next();
                this.expect(this.tok.T_END_HEREDOC) && this.next();
                const raw = this.lexer._input.substring(
                  start,
                  this.lexer.yylloc.first_offset
                );
                node = node(
                  this.remove_heredoc_leading_whitespace_chars(
                    value,
                    this.lexer.heredoc_label.indentation,
                    this.lexer.heredoc_label.indentation_uses_spaces,
                    this.lexer.heredoc_label.first_encaps_node
                  ),
                  raw,
                  this.lexer.heredoc_label.label
                );
                this.lexer.heredoc_label.finished = true;
                return node;
              } else {
                return this.read_encapsed_string(this.tok.T_END_HEREDOC);
              }
            case '"':
              return this.read_encapsed_string('"');
            case 'b"':
            case 'B"': {
              return this.read_encapsed_string('"', true);
            }
            case this.tok.T_CONSTANT_ENCAPSED_STRING:
            case this.tok.T_ARRAY:
            case "[":
              return this.read_dereferencable_scalar();
            default: {
              const err = this.error("SCALAR");
              this.next();
              return err;
            }
          }
        }
      },
      read_dereferencable: function(expr) {
        let result, offset;
        const node = this.node("offsetlookup");
        if (this.token === "[") {
          offset = this.next().read_expr();
          if (this.expect("]"))
            this.next();
          result = node(expr, offset);
        } else if (this.token === this.tok.T_DOLLAR_OPEN_CURLY_BRACES) {
          offset = this.read_encapsed_string_item(false);
          result = node(expr, offset);
        }
        return result;
      },
      read_encapsed_string_item: function(isDoubleQuote) {
        const encapsedPart = this.node("encapsedpart");
        let syntax = null;
        let curly = false;
        let result = this.node(), offset, node, name;
        if (this.token === this.tok.T_ENCAPSED_AND_WHITESPACE) {
          const text = this.text();
          this.next();
          result = result(
            "string",
            false,
            this.version >= 703 && !this.lexer.heredoc_label.finished ? this.remove_heredoc_leading_whitespace_chars(
              this.resolve_special_chars(text, isDoubleQuote),
              this.lexer.heredoc_label.indentation,
              this.lexer.heredoc_label.indentation_uses_spaces,
              this.lexer.heredoc_label.first_encaps_node
            ) : text,
            false,
            text
          );
        } else if (this.token === this.tok.T_DOLLAR_OPEN_CURLY_BRACES) {
          syntax = "simple";
          curly = true;
          name = null;
          if (this.next().token === this.tok.T_STRING_VARNAME) {
            name = this.node("variable");
            const varName = this.text();
            this.next();
            result.destroy();
            if (this.token === "[") {
              name = name(varName, false);
              node = this.node("offsetlookup");
              offset = this.next().read_expr();
              this.expect("]") && this.next();
              result = node(name, offset);
            } else {
              result = name(varName, false);
            }
          } else {
            result = result("variable", this.read_expr(), false);
          }
          this.expect("}") && this.next();
        } else if (this.token === this.tok.T_CURLY_OPEN) {
          syntax = "complex";
          result.destroy();
          result = this.next().read_variable(false, false);
          this.expect("}") && this.next();
        } else if (this.token === this.tok.T_VARIABLE) {
          syntax = "simple";
          result.destroy();
          result = this.read_simple_variable();
          if (this.token === "[") {
            node = this.node("offsetlookup");
            offset = this.next().read_encaps_var_offset();
            this.expect("]") && this.next();
            result = node(result, offset);
          }
          if (this.token === this.tok.T_OBJECT_OPERATOR) {
            node = this.node("propertylookup");
            this.next().expect(this.tok.T_STRING);
            const what = this.node("identifier");
            name = this.text();
            this.next();
            result = node(result, what(name));
          }
        } else {
          this.expect(this.tok.T_ENCAPSED_AND_WHITESPACE);
          const value = this.text();
          this.next();
          result.destroy();
          result = result("string", false, value, false, value);
        }
        this.lexer.heredoc_label.first_encaps_node = false;
        return encapsedPart(result, syntax, curly);
      },
      read_encapsed_string: function(expect, isBinary = false) {
        const labelStart = this.lexer.yylloc.first_offset;
        let node = this.node("encapsed");
        this.next();
        const start = this.lexer.yylloc.prev_offset - (isBinary ? 1 : 0);
        const value = [];
        let type = null;
        if (expect === "`") {
          type = this.ast.encapsed.TYPE_SHELL;
        } else if (expect === '"') {
          type = this.ast.encapsed.TYPE_STRING;
        } else {
          type = this.ast.encapsed.TYPE_HEREDOC;
        }
        while (this.token !== expect && this.token !== this.EOF) {
          value.push(this.read_encapsed_string_item(true));
        }
        if (value.length > 0 && value[value.length - 1].kind === "encapsedpart" && value[value.length - 1].expression.kind === "string") {
          const node2 = value[value.length - 1].expression;
          const lastCh = node2.value[node2.value.length - 1];
          if (lastCh === "\n") {
            if (node2.value[node2.value.length - 2] === "\r") {
              node2.value = node2.value.substring(0, node2.value.length - 2);
            } else {
              node2.value = node2.value.substring(0, node2.value.length - 1);
            }
          } else if (lastCh === "\r") {
            node2.value = node2.value.substring(0, node2.value.length - 1);
          }
        }
        this.expect(expect) && this.next();
        const raw = this.lexer._input.substring(
          type === "heredoc" ? labelStart : start - 1,
          this.lexer.yylloc.first_offset
        );
        node = node(value, raw, type);
        if (expect === this.tok.T_END_HEREDOC) {
          node.label = this.lexer.heredoc_label.label;
          this.lexer.heredoc_label.finished = true;
        }
        return node;
      },
      get_magic_constant: function() {
        const result = this.node("magic");
        const name = this.text();
        this.next();
        return result(name.toUpperCase(), name);
      }
    };
  }
});

// node_modules/php-parser/src/parser/statement.js
var require_statement = __commonJS({
  "node_modules/php-parser/src/parser/statement.js"(exports2, module2) {
    "use strict";
    module2.exports = {
      read_top_statements: function() {
        let result = [];
        while (this.token !== this.EOF && this.token !== "}") {
          const statement = this.read_top_statement();
          if (statement) {
            if (Array.isArray(statement)) {
              result = result.concat(statement);
            } else {
              result.push(statement);
            }
          }
        }
        return result;
      },
      read_top_statement: function() {
        let attrs = [];
        if (this.token === this.tok.T_ATTRIBUTE) {
          attrs = this.read_attr_list();
        }
        switch (this.token) {
          case this.tok.T_FUNCTION:
            return this.read_function(false, false, attrs);
          case this.tok.T_ABSTRACT:
          case this.tok.T_FINAL:
          case this.tok.T_READ_ONLY:
          case this.tok.T_CLASS:
            return this.read_class_declaration_statement(attrs);
          case this.tok.T_INTERFACE:
            return this.read_interface_declaration_statement(attrs);
          case this.tok.T_TRAIT:
            return this.read_trait_declaration_statement();
          case this.tok.T_ENUM:
            return this.read_enum_declaration_statement(attrs);
          case this.tok.T_USE:
            return this.read_use_statement();
          case this.tok.T_CONST: {
            const result = this.node("constantstatement");
            const items = this.next().read_const_list();
            this.expectEndOfStatement();
            return result(null, items);
          }
          case this.tok.T_NAMESPACE:
            return this.read_namespace();
          case this.tok.T_HALT_COMPILER: {
            const result = this.node("halt");
            if (this.next().expect("("))
              this.next();
            if (this.expect(")"))
              this.next();
            this.expect(";");
            this.lexer.done = true;
            return result(this.lexer._input.substring(this.lexer.offset));
          }
          default:
            return this.read_statement();
        }
      },
      read_inner_statements: function() {
        let result = [];
        while (this.token != this.EOF && this.token !== "}") {
          const statement = this.read_inner_statement();
          if (statement) {
            if (Array.isArray(statement)) {
              result = result.concat(statement);
            } else {
              result.push(statement);
            }
          }
        }
        return result;
      },
      read_const_list: function() {
        return this.read_list(
          function() {
            this.expect(this.tok.T_STRING);
            const result = this.node("constant");
            let constName = this.node("identifier");
            const name = this.text();
            this.next();
            constName = constName(name);
            if (this.expect("=")) {
              return result(constName, this.next().read_expr());
            } else {
              return result(constName, null);
            }
          },
          ",",
          false
        );
      },
      read_declare_list: function() {
        const result = [];
        while (this.token != this.EOF && this.token !== ")") {
          this.expect(this.tok.T_STRING);
          const directive = this.node("declaredirective");
          let key = this.node("identifier");
          const name = this.text();
          this.next();
          key = key(name);
          let value = null;
          if (this.expect("=")) {
            value = this.next().read_expr();
          }
          result.push(directive(key, value));
          if (this.token !== ",")
            break;
          this.next();
        }
        return result;
      },
      read_inner_statement: function() {
        let attrs = [];
        if (this.token === this.tok.T_ATTRIBUTE) {
          attrs = this.read_attr_list();
        }
        switch (this.token) {
          case this.tok.T_FUNCTION: {
            const result = this.read_function(false, false);
            result.attrGroups = attrs;
            return result;
          }
          case this.tok.T_ABSTRACT:
          case this.tok.T_FINAL:
          case this.tok.T_CLASS:
            return this.read_class_declaration_statement();
          case this.tok.T_INTERFACE:
            return this.read_interface_declaration_statement();
          case this.tok.T_TRAIT:
            return this.read_trait_declaration_statement();
          case this.tok.T_ENUM:
            return this.read_enum_declaration_statement();
          case this.tok.T_HALT_COMPILER: {
            this.raiseError(
              "__HALT_COMPILER() can only be used from the outermost scope"
            );
            let node = this.node("halt");
            this.next().expect("(") && this.next();
            this.expect(")") && this.next();
            node = node(this.lexer._input.substring(this.lexer.offset));
            this.expect(";") && this.next();
            return node;
          }
          default:
            return this.read_statement();
        }
      },
      read_statement: function() {
        switch (this.token) {
          case "{":
            return this.read_code_block(false);
          case this.tok.T_IF:
            return this.read_if();
          case this.tok.T_SWITCH:
            return this.read_switch();
          case this.tok.T_FOR:
            return this.read_for();
          case this.tok.T_FOREACH:
            return this.read_foreach();
          case this.tok.T_WHILE:
            return this.read_while();
          case this.tok.T_DO:
            return this.read_do();
          case this.tok.T_COMMENT:
            return this.read_comment();
          case this.tok.T_DOC_COMMENT:
            return this.read_doc_comment();
          case this.tok.T_RETURN: {
            const result = this.node("return");
            this.next();
            const expr = this.read_optional_expr(";");
            this.expectEndOfStatement();
            return result(expr);
          }
          case this.tok.T_BREAK:
          case this.tok.T_CONTINUE: {
            const result = this.node(
              this.token === this.tok.T_CONTINUE ? "continue" : "break"
            );
            this.next();
            const level = this.read_optional_expr(";");
            this.expectEndOfStatement();
            return result(level);
          }
          case this.tok.T_GLOBAL: {
            const result = this.node("global");
            const items = this.next().read_list(this.read_simple_variable, ",");
            this.expectEndOfStatement();
            return result(items);
          }
          case this.tok.T_STATIC: {
            const current = [this.token, this.lexer.getState()];
            const result = this.node();
            if (this.next().token === this.tok.T_DOUBLE_COLON) {
              this.lexer.tokens.push(current);
              const expr = this.next().read_expr();
              this.expectEndOfStatement(expr);
              return result("expressionstatement", expr);
            }
            if (this.token === this.tok.T_FUNCTION) {
              return this.read_function(true, [0, 1, 0]);
            }
            const items = this.read_variable_declarations();
            this.expectEndOfStatement();
            return result("static", items);
          }
          case this.tok.T_ECHO: {
            const result = this.node("echo");
            const text = this.text();
            const shortForm = text === "<?=" || text === "<%=";
            const expressions = this.next().read_function_list(this.read_expr, ",");
            this.expectEndOfStatement();
            return result(expressions, shortForm);
          }
          case this.tok.T_INLINE_HTML: {
            const value = this.text();
            let prevChar = this.lexer.yylloc.first_offset > 0 ? this.lexer._input[this.lexer.yylloc.first_offset - 1] : null;
            const fixFirstLine = prevChar === "\r" || prevChar === "\n";
            if (fixFirstLine) {
              if (prevChar === "\n" && this.lexer.yylloc.first_offset > 1 && this.lexer._input[this.lexer.yylloc.first_offset - 2] === "\r") {
                prevChar = "\r\n";
              }
            }
            const result = this.node("inline");
            this.next();
            return result(value, fixFirstLine ? prevChar + value : value);
          }
          case this.tok.T_UNSET: {
            const result = this.node("unset");
            this.next().expect("(") && this.next();
            const variables = this.read_function_list(this.read_variable, ",");
            this.expect(")") && this.next();
            this.expect(";") && this.next();
            return result(variables);
          }
          case this.tok.T_DECLARE: {
            const result = this.node("declare");
            const body = [];
            let mode;
            this.next().expect("(") && this.next();
            const directives = this.read_declare_list();
            this.expect(")") && this.next();
            if (this.token === ":") {
              this.next();
              while (this.token != this.EOF && this.token !== this.tok.T_ENDDECLARE) {
                body.push(this.read_top_statement());
              }
              if (body.length === 0 && this.extractDoc && this._docs.length > this._docIndex) {
                body.push(this.node("noop")());
              }
              this.expect(this.tok.T_ENDDECLARE) && this.next();
              this.expectEndOfStatement();
              mode = this.ast.declare.MODE_SHORT;
            } else if (this.token === "{") {
              this.next();
              while (this.token != this.EOF && this.token !== "}") {
                body.push(this.read_top_statement());
              }
              if (body.length === 0 && this.extractDoc && this._docs.length > this._docIndex) {
                body.push(this.node("noop")());
              }
              this.expect("}") && this.next();
              mode = this.ast.declare.MODE_BLOCK;
            } else {
              this.expect(";") && this.next();
              mode = this.ast.declare.MODE_NONE;
            }
            return result(directives, body, mode);
          }
          case this.tok.T_TRY:
            return this.read_try();
          case this.tok.T_THROW: {
            const result = this.node("throw");
            const expr = this.next().read_expr();
            this.expectEndOfStatement();
            return result(expr);
          }
          case ";": {
            this.next();
            return null;
          }
          case this.tok.T_STRING: {
            const result = this.node();
            const current = [this.token, this.lexer.getState()];
            const labelNameText = this.text();
            let labelName = this.node("identifier");
            if (this.next().token === ":") {
              labelName = labelName(labelNameText);
              this.next();
              return result("label", labelName);
            } else {
              labelName.destroy();
            }
            result.destroy();
            this.lexer.tokens.push(current);
            const statement = this.node("expressionstatement");
            const expr = this.next().read_expr();
            this.expectEndOfStatement(expr);
            return statement(expr);
          }
          case this.tok.T_GOTO: {
            const result = this.node("goto");
            let labelName = null;
            if (this.next().expect(this.tok.T_STRING)) {
              labelName = this.node("identifier");
              const name = this.text();
              this.next();
              labelName = labelName(name);
              this.expectEndOfStatement();
            }
            return result(labelName);
          }
          default: {
            const statement = this.node("expressionstatement");
            const expr = this.read_expr();
            this.expectEndOfStatement(expr);
            return statement(expr);
          }
        }
      },
      read_code_block: function(top) {
        const result = this.node("block");
        this.expect("{") && this.next();
        const body = top ? this.read_top_statements() : this.read_inner_statements();
        if (body.length === 0 && this.extractDoc && this._docs.length > this._docIndex) {
          body.push(this.node("noop")());
        }
        this.expect("}") && this.next();
        return result(null, body);
      }
    };
  }
});

// node_modules/php-parser/src/parser/switch.js
var require_switch = __commonJS({
  "node_modules/php-parser/src/parser/switch.js"(exports2, module2) {
    "use strict";
    module2.exports = {
      read_switch: function() {
        const result = this.node("switch");
        this.expect(this.tok.T_SWITCH) && this.next();
        this.expect("(") && this.next();
        const test = this.read_expr();
        this.expect(")") && this.next();
        const shortForm = this.token === ":";
        const body = this.read_switch_case_list();
        return result(test, body, shortForm);
      },
      read_switch_case_list: function() {
        let expect = null;
        const result = this.node("block");
        const items = [];
        if (this.token === "{") {
          expect = "}";
        } else if (this.token === ":") {
          expect = this.tok.T_ENDSWITCH;
        } else {
          this.expect(["{", ":"]);
        }
        this.next();
        if (this.token === ";") {
          this.next();
        }
        while (this.token !== this.EOF && this.token !== expect) {
          items.push(this.read_case_list(expect));
        }
        if (items.length === 0 && this.extractDoc && this._docs.length > this._docIndex) {
          items.push(this.node("noop")());
        }
        this.expect(expect) && this.next();
        if (expect === this.tok.T_ENDSWITCH) {
          this.expectEndOfStatement();
        }
        return result(null, items);
      },
      read_case_list: function(stopToken) {
        const result = this.node("case");
        let test = null;
        if (this.token === this.tok.T_CASE) {
          test = this.next().read_expr();
        } else if (this.token === this.tok.T_DEFAULT) {
          this.next();
        } else {
          this.expect([this.tok.T_CASE, this.tok.T_DEFAULT]);
        }
        this.expect([":", ";"]) && this.next();
        const body = this.node("block");
        const items = [];
        while (this.token !== this.EOF && this.token !== stopToken && this.token !== this.tok.T_CASE && this.token !== this.tok.T_DEFAULT) {
          items.push(this.read_inner_statement());
        }
        return result(test, body(null, items));
      }
    };
  }
});

// node_modules/php-parser/src/parser/try.js
var require_try = __commonJS({
  "node_modules/php-parser/src/parser/try.js"(exports2, module2) {
    "use strict";
    module2.exports = {
      read_try: function() {
        this.expect(this.tok.T_TRY);
        const result = this.node("try");
        let always = null;
        const catches = [];
        const body = this.next().read_statement();
        while (this.token === this.tok.T_CATCH) {
          const item = this.node("catch");
          this.next().expect("(") && this.next();
          const what = this.read_list(this.read_namespace_name, "|", false);
          let variable = null;
          if (this.version < 800 || this.token === this.tok.T_VARIABLE) {
            variable = this.read_variable(true, false);
          }
          this.expect(")");
          catches.push(item(this.next().read_statement(), what, variable));
        }
        if (this.token === this.tok.T_FINALLY) {
          always = this.next().read_statement();
        }
        return result(body, catches, always);
      }
    };
  }
});

// node_modules/php-parser/src/parser/utils.js
var require_utils2 = __commonJS({
  "node_modules/php-parser/src/parser/utils.js"(exports2, module2) {
    "use strict";
    module2.exports = {
      read_short_form: function(token) {
        const body = this.node("block");
        const items = [];
        if (this.expect(":"))
          this.next();
        while (this.token != this.EOF && this.token !== token) {
          items.push(this.read_inner_statement());
        }
        if (items.length === 0 && this.extractDoc && this._docs.length > this._docIndex) {
          items.push(this.node("noop")());
        }
        if (this.expect(token))
          this.next();
        this.expectEndOfStatement();
        return body(null, items);
      },
      read_function_list: function(item, separator) {
        const result = [];
        do {
          if (this.token == separator && this.version >= 703 && result.length > 0) {
            result.push(this.node("noop")());
            break;
          }
          result.push(item.apply(this, []));
          if (this.token != separator) {
            break;
          }
          if (this.next().token == ")" && this.version >= 703) {
            break;
          }
        } while (this.token != this.EOF);
        return result;
      },
      read_list: function(item, separator, preserveFirstSeparator) {
        const result = [];
        if (this.token == separator) {
          if (preserveFirstSeparator) {
            result.push(typeof item === "function" ? this.node("noop")() : null);
          }
          this.next();
        }
        if (typeof item === "function") {
          do {
            const itemResult = item.apply(this, []);
            if (itemResult) {
              result.push(itemResult);
            }
            if (this.token != separator) {
              break;
            }
          } while (this.next().token != this.EOF);
        } else {
          if (this.expect(item)) {
            result.push(this.text());
          } else {
            return [];
          }
          while (this.next().token != this.EOF) {
            if (this.token != separator)
              break;
            if (this.next().token != item)
              break;
            result.push(this.text());
          }
        }
        return result;
      },
      read_name_list: function() {
        return this.read_list(this.read_namespace_name, ",", false);
      },
      read_byref: function(cb) {
        let byref = this.node("byref");
        this.next();
        byref = byref(null);
        const result = cb();
        if (result) {
          this.ast.swapLocations(result, byref, result, this);
          result.byref = true;
        }
        return result;
      },
      read_variable_declarations: function() {
        return this.read_list(function() {
          const node = this.node("staticvariable");
          let variable = this.node("variable");
          if (this.expect(this.tok.T_VARIABLE)) {
            const name = this.text().substring(1);
            this.next();
            variable = variable(name, false);
          } else {
            variable = variable("#ERR", false);
          }
          if (this.token === "=") {
            return node(variable, this.next().read_expr());
          } else {
            return variable;
          }
        }, ",");
      },
      read_extends_from: function() {
        if (this.token === this.tok.T_EXTENDS) {
          return this.next().read_namespace_name();
        }
        return null;
      },
      read_interface_extends_list: function() {
        if (this.token === this.tok.T_EXTENDS) {
          return this.next().read_name_list();
        }
        return null;
      },
      read_implements_list: function() {
        if (this.token === this.tok.T_IMPLEMENTS) {
          return this.next().read_name_list();
        }
        return null;
      }
    };
  }
});

// node_modules/php-parser/src/parser/variable.js
var require_variable = __commonJS({
  "node_modules/php-parser/src/parser/variable.js"(exports2, module2) {
    "use strict";
    module2.exports = {
      read_variable: function(read_only, encapsed) {
        let result;
        if (this.token === "&") {
          return this.read_byref(
            this.read_variable.bind(this, read_only, encapsed)
          );
        }
        if (this.is([this.tok.T_VARIABLE, "$"])) {
          result = this.read_reference_variable(encapsed);
        } else if (this.is([
          this.tok.T_NS_SEPARATOR,
          this.tok.T_STRING,
          this.tok.T_NAME_RELATIVE,
          this.tok.T_NAME_QUALIFIED,
          this.tok.T_NAME_FULLY_QUALIFIED,
          this.tok.T_NAMESPACE
        ])) {
          result = this.node();
          const name = this.read_namespace_name();
          if (this.token != this.tok.T_DOUBLE_COLON && this.token != "(" && ["parentreference", "selfreference"].indexOf(name.kind) === -1) {
            const literal = name.name.toLowerCase();
            if (literal === "true") {
              result = name.destroy(result("boolean", true, name.name));
            } else if (literal === "false") {
              result = name.destroy(result("boolean", false, name.name));
            } else if (literal === "null") {
              result = name.destroy(result("nullkeyword", name.name));
            } else {
              result.destroy(name);
              result = name;
            }
          } else {
            result.destroy(name);
            result = name;
          }
        } else if (this.token === this.tok.T_STATIC) {
          result = this.node("staticreference");
          const raw = this.text();
          this.next();
          result = result(raw);
        } else {
          this.expect("VARIABLE");
        }
        if (this.token === this.tok.T_DOUBLE_COLON) {
          result = this.read_static_getter(result, encapsed);
        }
        return this.recursive_variable_chain_scan(result, read_only, encapsed);
      },
      read_static_getter: function(what, encapsed) {
        const result = this.node("staticlookup");
        let offset, name;
        if (this.next().is([this.tok.T_VARIABLE, "$"])) {
          offset = this.read_reference_variable(encapsed);
        } else if (this.token === this.tok.T_STRING || this.token === this.tok.T_CLASS || this.version >= 700 && this.is("IDENTIFIER")) {
          offset = this.node("identifier");
          name = this.text();
          this.next();
          offset = offset(name);
        } else if (this.token === "{") {
          offset = this.node("literal");
          name = this.next().read_expr();
          this.expect("}") && this.next();
          offset = offset("literal", name, null);
          this.expect("(");
        } else {
          this.error([this.tok.T_VARIABLE, this.tok.T_STRING]);
          offset = this.node("identifier");
          name = this.text();
          this.next();
          offset = offset(name);
        }
        return result(what, offset);
      },
      read_what: function(is_static_lookup = false) {
        let what = null;
        let name = null;
        switch (this.next().token) {
          case this.tok.T_STRING:
            what = this.node("identifier");
            name = this.text();
            this.next();
            what = what(name);
            if (is_static_lookup && this.token === this.tok.T_OBJECT_OPERATOR) {
              this.error();
            }
            break;
          case this.tok.T_VARIABLE:
            what = this.node("variable");
            name = this.text().substring(1);
            this.next();
            what = what(name, false);
            break;
          case "$":
            what = this.node();
            this.next().expect(["$", "{", this.tok.T_VARIABLE]);
            if (this.token === "{") {
              name = this.next().read_expr();
              this.expect("}") && this.next();
              what = what("variable", name, true);
            } else {
              name = this.read_expr();
              what = what("variable", name, false);
            }
            break;
          case "{":
            what = this.node("encapsedpart");
            name = this.next().read_expr();
            this.expect("}") && this.next();
            what = what(name, "complex", false);
            break;
          default:
            this.error([this.tok.T_STRING, this.tok.T_VARIABLE, "$", "{"]);
            what = this.node("identifier");
            name = this.text();
            this.next();
            what = what(name);
            break;
        }
        return what;
      },
      recursive_variable_chain_scan: function(result, read_only, encapsed) {
        let node, offset;
        recursive_scan_loop:
          while (this.token != this.EOF) {
            switch (this.token) {
              case "(":
                if (read_only) {
                  return result;
                } else {
                  result = this.node("call")(result, this.read_argument_list());
                }
                break;
              case "[":
              case "{": {
                const backet = this.token;
                const isSquareBracket = backet === "[";
                node = this.node("offsetlookup");
                this.next();
                offset = false;
                if (encapsed) {
                  offset = this.read_encaps_var_offset();
                  this.expect(isSquareBracket ? "]" : "}") && this.next();
                } else {
                  const isCallableVariable = isSquareBracket ? this.token !== "]" : this.token !== "}";
                  if (isCallableVariable) {
                    offset = this.read_expr();
                    this.expect(isSquareBracket ? "]" : "}") && this.next();
                  } else {
                    this.next();
                  }
                }
                result = node(result, offset);
                break;
              }
              case this.tok.T_DOUBLE_COLON:
                if (result.kind === "staticlookup" && result.offset.kind === "identifier") {
                  this.error();
                }
                node = this.node("staticlookup");
                result = node(result, this.read_what(true));
                break;
              case this.tok.T_OBJECT_OPERATOR: {
                node = this.node("propertylookup");
                result = node(result, this.read_what());
                break;
              }
              case this.tok.T_NULLSAFE_OBJECT_OPERATOR: {
                node = this.node("nullsafepropertylookup");
                result = node(result, this.read_what());
                break;
              }
              default:
                break recursive_scan_loop;
            }
          }
        return result;
      },
      read_encaps_var_offset: function() {
        let offset = this.node();
        if (this.token === this.tok.T_STRING) {
          const text = this.text();
          this.next();
          offset = offset("identifier", text);
        } else if (this.token === this.tok.T_NUM_STRING) {
          const num = this.text();
          this.next();
          offset = offset("number", num, null);
        } else if (this.token === "-") {
          this.next();
          const num = -1 * this.text();
          this.expect(this.tok.T_NUM_STRING) && this.next();
          offset = offset("number", num, null);
        } else if (this.token === this.tok.T_VARIABLE) {
          const name = this.text().substring(1);
          this.next();
          offset = offset("variable", name, false);
        } else {
          this.expect([
            this.tok.T_STRING,
            this.tok.T_NUM_STRING,
            "-",
            this.tok.T_VARIABLE
          ]);
          const text = this.text();
          this.next();
          offset = offset("identifier", text);
        }
        return offset;
      },
      read_reference_variable: function(encapsed) {
        let result = this.read_simple_variable();
        let offset;
        while (this.token != this.EOF) {
          const node = this.node();
          if (this.token == "{" && !encapsed) {
            offset = this.next().read_expr();
            this.expect("}") && this.next();
            result = node("offsetlookup", result, offset);
          } else {
            node.destroy();
            break;
          }
        }
        return result;
      },
      read_simple_variable: function() {
        let result = this.node("variable");
        let name;
        if (this.expect([this.tok.T_VARIABLE, "$"]) && this.token === this.tok.T_VARIABLE) {
          name = this.text().substring(1);
          this.next();
          result = result(name, false);
        } else {
          if (this.token === "$")
            this.next();
          switch (this.token) {
            case "{": {
              const expr = this.next().read_expr();
              this.expect("}") && this.next();
              result = result(expr, true);
              break;
            }
            case "$":
              result = result(this.read_simple_variable(), false);
              break;
            case this.tok.T_VARIABLE: {
              name = this.text().substring(1);
              const node = this.node("variable");
              this.next();
              result = result(node(name, false), false);
              break;
            }
            default:
              this.error(["{", "$", this.tok.T_VARIABLE]);
              name = this.text();
              this.next();
              result = result(name, false);
          }
        }
        return result;
      }
    };
  }
});

// node_modules/php-parser/src/parser.js
var require_parser = __commonJS({
  "node_modules/php-parser/src/parser.js"(exports2, module2) {
    "use strict";
    var Position2 = require_position();
    function isNumber(n) {
      return n != "." && n != "," && !isNaN(parseFloat(n)) && isFinite(n);
    }
    var Parser = function(lexer, ast) {
      this.lexer = lexer;
      this.ast = ast;
      this.tok = lexer.tok;
      this.EOF = lexer.EOF;
      this.token = null;
      this.prev = null;
      this.debug = false;
      this.version = 801;
      this.extractDoc = false;
      this.extractTokens = false;
      this.suppressErrors = false;
      const mapIt = function(item) {
        return [item, null];
      };
      this.entries = {
        IDENTIFIER: new Map(
          [
            this.tok.T_ABSTRACT,
            this.tok.T_ARRAY,
            this.tok.T_AS,
            this.tok.T_BREAK,
            this.tok.T_CALLABLE,
            this.tok.T_CASE,
            this.tok.T_CATCH,
            this.tok.T_CLASS,
            this.tok.T_CLASS_C,
            this.tok.T_CLONE,
            this.tok.T_CONST,
            this.tok.T_CONTINUE,
            this.tok.T_DECLARE,
            this.tok.T_DEFAULT,
            this.tok.T_DIR,
            this.tok.T_DO,
            this.tok.T_ECHO,
            this.tok.T_ELSE,
            this.tok.T_ELSEIF,
            this.tok.T_EMPTY,
            this.tok.T_ENDDECLARE,
            this.tok.T_ENDFOR,
            this.tok.T_ENDFOREACH,
            this.tok.T_ENDIF,
            this.tok.T_ENDSWITCH,
            this.tok.T_ENDWHILE,
            this.tok.T_ENUM,
            this.tok.T_EVAL,
            this.tok.T_EXIT,
            this.tok.T_EXTENDS,
            this.tok.T_FILE,
            this.tok.T_FINAL,
            this.tok.T_FINALLY,
            this.tok.T_FN,
            this.tok.T_FOR,
            this.tok.T_FOREACH,
            this.tok.T_FUNC_C,
            this.tok.T_FUNCTION,
            this.tok.T_GLOBAL,
            this.tok.T_GOTO,
            this.tok.T_IF,
            this.tok.T_IMPLEMENTS,
            this.tok.T_INCLUDE,
            this.tok.T_INCLUDE_ONCE,
            this.tok.T_INSTANCEOF,
            this.tok.T_INSTEADOF,
            this.tok.T_INTERFACE,
            this.tok.T_ISSET,
            this.tok.T_LINE,
            this.tok.T_LIST,
            this.tok.T_LOGICAL_AND,
            this.tok.T_LOGICAL_OR,
            this.tok.T_LOGICAL_XOR,
            this.tok.T_MATCH,
            this.tok.T_METHOD_C,
            this.tok.T_NAMESPACE,
            this.tok.T_NEW,
            this.tok.T_NS_C,
            this.tok.T_PRINT,
            this.tok.T_PRIVATE,
            this.tok.T_PROTECTED,
            this.tok.T_PUBLIC,
            this.tok.T_READ_ONLY,
            this.tok.T_REQUIRE,
            this.tok.T_REQUIRE_ONCE,
            this.tok.T_RETURN,
            this.tok.T_STATIC,
            this.tok.T_SWITCH,
            this.tok.T_THROW,
            this.tok.T_TRAIT,
            this.tok.T_TRY,
            this.tok.T_UNSET,
            this.tok.T_USE,
            this.tok.T_VAR,
            this.tok.T_WHILE,
            this.tok.T_YIELD
          ].map(mapIt)
        ),
        VARIABLE: new Map(
          [
            this.tok.T_VARIABLE,
            "$",
            "&",
            this.tok.T_STRING,
            this.tok.T_NAME_RELATIVE,
            this.tok.T_NAME_QUALIFIED,
            this.tok.T_NAME_FULLY_QUALIFIED,
            this.tok.T_NAMESPACE,
            this.tok.T_STATIC
          ].map(mapIt)
        ),
        SCALAR: new Map(
          [
            this.tok.T_CONSTANT_ENCAPSED_STRING,
            this.tok.T_START_HEREDOC,
            this.tok.T_LNUMBER,
            this.tok.T_DNUMBER,
            this.tok.T_ARRAY,
            "[",
            this.tok.T_CLASS_C,
            this.tok.T_TRAIT_C,
            this.tok.T_FUNC_C,
            this.tok.T_METHOD_C,
            this.tok.T_LINE,
            this.tok.T_FILE,
            this.tok.T_DIR,
            this.tok.T_NS_C,
            '"',
            'b"',
            'B"',
            "-",
            this.tok.T_NS_SEPARATOR
          ].map(mapIt)
        ),
        T_MAGIC_CONST: new Map(
          [
            this.tok.T_CLASS_C,
            this.tok.T_TRAIT_C,
            this.tok.T_FUNC_C,
            this.tok.T_METHOD_C,
            this.tok.T_LINE,
            this.tok.T_FILE,
            this.tok.T_DIR,
            this.tok.T_NS_C
          ].map(mapIt)
        ),
        T_MEMBER_FLAGS: new Map(
          [
            this.tok.T_PUBLIC,
            this.tok.T_PRIVATE,
            this.tok.T_PROTECTED,
            this.tok.T_STATIC,
            this.tok.T_ABSTRACT,
            this.tok.T_FINAL
          ].map(mapIt)
        ),
        EOS: new Map([";", this.EOF, this.tok.T_INLINE_HTML].map(mapIt)),
        EXPR: new Map(
          [
            "@",
            "-",
            "+",
            "!",
            "~",
            "(",
            "`",
            this.tok.T_LIST,
            this.tok.T_CLONE,
            this.tok.T_INC,
            this.tok.T_DEC,
            this.tok.T_NEW,
            this.tok.T_ISSET,
            this.tok.T_EMPTY,
            this.tok.T_MATCH,
            this.tok.T_INCLUDE,
            this.tok.T_INCLUDE_ONCE,
            this.tok.T_REQUIRE,
            this.tok.T_REQUIRE_ONCE,
            this.tok.T_EVAL,
            this.tok.T_INT_CAST,
            this.tok.T_DOUBLE_CAST,
            this.tok.T_STRING_CAST,
            this.tok.T_ARRAY_CAST,
            this.tok.T_OBJECT_CAST,
            this.tok.T_BOOL_CAST,
            this.tok.T_UNSET_CAST,
            this.tok.T_EXIT,
            this.tok.T_PRINT,
            this.tok.T_YIELD,
            this.tok.T_STATIC,
            this.tok.T_FUNCTION,
            this.tok.T_FN,
            this.tok.T_VARIABLE,
            "$",
            this.tok.T_NS_SEPARATOR,
            this.tok.T_STRING,
            this.tok.T_NAME_RELATIVE,
            this.tok.T_NAME_QUALIFIED,
            this.tok.T_NAME_FULLY_QUALIFIED,
            this.tok.T_STRING,
            this.tok.T_CONSTANT_ENCAPSED_STRING,
            this.tok.T_START_HEREDOC,
            this.tok.T_LNUMBER,
            this.tok.T_DNUMBER,
            this.tok.T_ARRAY,
            "[",
            this.tok.T_CLASS_C,
            this.tok.T_TRAIT_C,
            this.tok.T_FUNC_C,
            this.tok.T_METHOD_C,
            this.tok.T_LINE,
            this.tok.T_FILE,
            this.tok.T_DIR,
            this.tok.T_NS_C,
            '"',
            'b"',
            'B"',
            "-",
            this.tok.T_NS_SEPARATOR
          ].map(mapIt)
        )
      };
    };
    Parser.prototype.getTokenName = function(token) {
      if (!isNumber(token)) {
        return "'" + token + "'";
      } else {
        if (token == this.EOF)
          return "the end of file (EOF)";
        return this.lexer.engine.tokens.values[token];
      }
    };
    Parser.prototype.parse = function(code, filename) {
      this._errors = [];
      this.filename = filename || "eval";
      this.currentNamespace = [""];
      if (this.extractDoc) {
        this._docs = [];
      } else {
        this._docs = null;
      }
      if (this.extractTokens) {
        this._tokens = [];
      } else {
        this._tokens = null;
      }
      this._docIndex = 0;
      this._lastNode = null;
      this.lexer.setInput(code);
      this.lexer.all_tokens = this.extractTokens;
      this.lexer.comment_tokens = this.extractDoc;
      this.length = this.lexer._input.length;
      this.innerList = false;
      this.innerListForm = false;
      const program = this.node("program");
      const childs = [];
      this.next();
      while (this.token != this.EOF) {
        childs.push(this.read_start());
      }
      if (childs.length === 0 && this.extractDoc && this._docs.length > this._docIndex) {
        childs.push(this.node("noop")());
      }
      this.prev = [
        this.lexer.yylloc.last_line,
        this.lexer.yylloc.last_column,
        this.lexer.offset
      ];
      const result = program(childs, this._errors, this._docs, this._tokens);
      if (this.debug) {
        const errors = this.ast.checkNodes();
        if (errors.length > 0) {
          errors.forEach(function(error) {
            if (error.position) {
              console.log(
                "Node at line " + error.position.line + ", column " + error.position.column
              );
            }
            console.log(error.stack.join("\n"));
          });
          throw new Error("Some nodes are not closed");
        }
      }
      return result;
    };
    Parser.prototype.raiseError = function(message, msgExpect, expect, token) {
      message += " on line " + this.lexer.yylloc.first_line;
      if (!this.suppressErrors) {
        const err = new SyntaxError(
          message,
          this.filename,
          this.lexer.yylloc.first_line
        );
        err.lineNumber = this.lexer.yylloc.first_line;
        err.fileName = this.filename;
        err.columnNumber = this.lexer.yylloc.first_column;
        throw err;
      }
      const node = this.ast.prepare("error", null, this)(
        message,
        token,
        this.lexer.yylloc.first_line,
        expect
      );
      this._errors.push(node);
      return node;
    };
    Parser.prototype.error = function(expect) {
      let msg = "Parse Error : syntax error";
      let token = this.getTokenName(this.token);
      let msgExpect = "";
      if (this.token !== this.EOF) {
        if (isNumber(this.token)) {
          let symbol = this.text();
          if (symbol.length > 10) {
            symbol = symbol.substring(0, 7) + "...";
          }
          token = "'" + symbol + "' (" + token + ")";
        }
        msg += ", unexpected " + token;
      }
      if (expect && !Array.isArray(expect)) {
        if (isNumber(expect) || expect.length === 1) {
          msgExpect = ", expecting " + this.getTokenName(expect);
        }
        msg += msgExpect;
      }
      return this.raiseError(msg, msgExpect, expect, token);
    };
    Parser.prototype.position = function() {
      return new Position2(
        this.lexer.yylloc.first_line,
        this.lexer.yylloc.first_column,
        this.lexer.yylloc.first_offset
      );
    };
    Parser.prototype.node = function(name) {
      if (this.extractDoc) {
        let docs = null;
        if (this._docIndex < this._docs.length) {
          docs = this._docs.slice(this._docIndex);
          this._docIndex = this._docs.length;
          if (this.debug) {
            console.log(new Error("Append docs on " + name));
            console.log(docs);
          }
        }
        const node = this.ast.prepare(name, docs, this);
        node.postBuild = function(self) {
          if (this._docIndex < this._docs.length) {
            if (this._lastNode) {
              const offset = this.prev[2];
              let max = this._docIndex;
              for (; max < this._docs.length; max++) {
                if (this._docs[max].offset > offset) {
                  break;
                }
              }
              if (max > this._docIndex) {
                this._lastNode.setTrailingComments(
                  this._docs.slice(this._docIndex, max)
                );
                this._docIndex = max;
              }
            } else if (this.token === this.EOF) {
              self.setTrailingComments(this._docs.slice(this._docIndex));
              this._docIndex = this._docs.length;
            }
          }
          this._lastNode = self;
        }.bind(this);
        return node;
      }
      return this.ast.prepare(name, null, this);
    };
    Parser.prototype.expectEndOfStatement = function(node) {
      if (this.token === ";") {
        if (node && this.lexer.yytext === ";") {
          node.includeToken(this);
        }
      } else if (this.token !== this.tok.T_INLINE_HTML && this.token !== this.EOF) {
        this.error(";");
        return false;
      }
      this.next();
      return true;
    };
    var ignoreStack = ["parser.next", "parser.node", "parser.showlog"];
    Parser.prototype.showlog = function() {
      const stack = new Error().stack.split("\n");
      let line;
      for (let offset = 2; offset < stack.length; offset++) {
        line = stack[offset].trim();
        let found = false;
        for (let i = 0; i < ignoreStack.length; i++) {
          if (line.substring(3, 3 + ignoreStack[i].length) === ignoreStack[i]) {
            found = true;
            break;
          }
        }
        if (!found) {
          break;
        }
      }
      console.log(
        "Line " + this.lexer.yylloc.first_line + " : " + this.getTokenName(this.token) + ">" + this.lexer.yytext + "< @-->" + line
      );
      return this;
    };
    Parser.prototype.expect = function(token) {
      if (Array.isArray(token)) {
        if (token.indexOf(this.token) === -1) {
          this.error(token);
          return false;
        }
      } else if (this.token != token) {
        this.error(token);
        return false;
      }
      return true;
    };
    Parser.prototype.text = function() {
      return this.lexer.yytext;
    };
    Parser.prototype.next = function() {
      if (this.token !== ";" || this.lexer.yytext === ";") {
        this.prev = [
          this.lexer.yylloc.last_line,
          this.lexer.yylloc.last_column,
          this.lexer.offset
        ];
      }
      this.lex();
      if (this.debug) {
        this.showlog();
      }
      if (this.extractDoc) {
        while (this.token === this.tok.T_COMMENT || this.token === this.tok.T_DOC_COMMENT) {
          if (this.token === this.tok.T_COMMENT) {
            this._docs.push(this.read_comment());
          } else {
            this._docs.push(this.read_doc_comment());
          }
        }
      }
      return this;
    };
    Parser.prototype.peek = function() {
      const lexerState = this.lexer.getState();
      const nextToken = this.lexer.lex();
      this.lexer.setState(lexerState);
      return nextToken;
    };
    Parser.prototype.lex = function() {
      if (this.extractTokens) {
        do {
          this.token = this.lexer.lex() || this.EOF;
          if (this.token === this.EOF)
            return this;
          let entry = this.lexer.yytext;
          if (Object.prototype.hasOwnProperty.call(
            this.lexer.engine.tokens.values,
            this.token
          )) {
            entry = [
              this.lexer.engine.tokens.values[this.token],
              entry,
              this.lexer.yylloc.first_line,
              this.lexer.yylloc.first_offset,
              this.lexer.offset
            ];
          } else {
            entry = [
              null,
              entry,
              this.lexer.yylloc.first_line,
              this.lexer.yylloc.first_offset,
              this.lexer.offset
            ];
          }
          this._tokens.push(entry);
          if (this.token === this.tok.T_CLOSE_TAG) {
            this.token = ";";
            return this;
          } else if (this.token === this.tok.T_OPEN_TAG_WITH_ECHO) {
            this.token = this.tok.T_ECHO;
            return this;
          }
        } while (this.token === this.tok.T_WHITESPACE || !this.extractDoc && (this.token === this.tok.T_COMMENT || this.token === this.tok.T_DOC_COMMENT) || this.token === this.tok.T_OPEN_TAG);
      } else {
        this.token = this.lexer.lex() || this.EOF;
      }
      return this;
    };
    Parser.prototype.is = function(type) {
      if (Array.isArray(type)) {
        return type.indexOf(this.token) !== -1;
      }
      return this.entries[type].has(this.token);
    };
    [
      require_array(),
      require_class(),
      require_comment(),
      require_expr(),
      require_enum(),
      require_function(),
      require_if(),
      require_loops(),
      require_main(),
      require_namespace(),
      require_scalar(),
      require_statement(),
      require_switch(),
      require_try(),
      require_utils2(),
      require_variable()
    ].forEach(function(ext) {
      for (const k in ext) {
        if (Object.prototype.hasOwnProperty.call(Parser.prototype, k)) {
          throw new Error("Function " + k + " is already defined - collision");
        }
        Parser.prototype[k] = ext[k];
      }
    });
    module2.exports = Parser;
  }
});

// node_modules/php-parser/src/tokens.js
var require_tokens2 = __commonJS({
  "node_modules/php-parser/src/tokens.js"(exports2, module2) {
    "use strict";
    var TokenNames = {
      T_HALT_COMPILER: 101,
      T_USE: 102,
      T_ENCAPSED_AND_WHITESPACE: 103,
      T_OBJECT_OPERATOR: 104,
      T_STRING: 105,
      T_DOLLAR_OPEN_CURLY_BRACES: 106,
      T_STRING_VARNAME: 107,
      T_CURLY_OPEN: 108,
      T_NUM_STRING: 109,
      T_ISSET: 110,
      T_EMPTY: 111,
      T_INCLUDE: 112,
      T_INCLUDE_ONCE: 113,
      T_EVAL: 114,
      T_REQUIRE: 115,
      T_REQUIRE_ONCE: 116,
      T_NAMESPACE: 117,
      T_NS_SEPARATOR: 118,
      T_AS: 119,
      T_IF: 120,
      T_ENDIF: 121,
      T_WHILE: 122,
      T_DO: 123,
      T_FOR: 124,
      T_SWITCH: 125,
      T_BREAK: 126,
      T_CONTINUE: 127,
      T_RETURN: 128,
      T_GLOBAL: 129,
      T_STATIC: 130,
      T_ECHO: 131,
      T_INLINE_HTML: 132,
      T_UNSET: 133,
      T_FOREACH: 134,
      T_DECLARE: 135,
      T_TRY: 136,
      T_THROW: 137,
      T_GOTO: 138,
      T_FINALLY: 139,
      T_CATCH: 140,
      T_ENDDECLARE: 141,
      T_LIST: 142,
      T_CLONE: 143,
      T_PLUS_EQUAL: 144,
      T_MINUS_EQUAL: 145,
      T_MUL_EQUAL: 146,
      T_DIV_EQUAL: 147,
      T_CONCAT_EQUAL: 148,
      T_MOD_EQUAL: 149,
      T_AND_EQUAL: 150,
      T_OR_EQUAL: 151,
      T_XOR_EQUAL: 152,
      T_SL_EQUAL: 153,
      T_SR_EQUAL: 154,
      T_INC: 155,
      T_DEC: 156,
      T_BOOLEAN_OR: 157,
      T_BOOLEAN_AND: 158,
      T_LOGICAL_OR: 159,
      T_LOGICAL_AND: 160,
      T_LOGICAL_XOR: 161,
      T_SL: 162,
      T_SR: 163,
      T_IS_IDENTICAL: 164,
      T_IS_NOT_IDENTICAL: 165,
      T_IS_EQUAL: 166,
      T_IS_NOT_EQUAL: 167,
      T_IS_SMALLER_OR_EQUAL: 168,
      T_IS_GREATER_OR_EQUAL: 169,
      T_INSTANCEOF: 170,
      T_INT_CAST: 171,
      T_DOUBLE_CAST: 172,
      T_STRING_CAST: 173,
      T_ARRAY_CAST: 174,
      T_OBJECT_CAST: 175,
      T_BOOL_CAST: 176,
      T_UNSET_CAST: 177,
      T_EXIT: 178,
      T_PRINT: 179,
      T_YIELD: 180,
      T_YIELD_FROM: 181,
      T_FUNCTION: 182,
      T_DOUBLE_ARROW: 183,
      T_DOUBLE_COLON: 184,
      T_ARRAY: 185,
      T_CALLABLE: 186,
      T_CLASS: 187,
      T_ABSTRACT: 188,
      T_TRAIT: 189,
      T_FINAL: 190,
      T_EXTENDS: 191,
      T_INTERFACE: 192,
      T_IMPLEMENTS: 193,
      T_VAR: 194,
      T_PUBLIC: 195,
      T_PROTECTED: 196,
      T_PRIVATE: 197,
      T_CONST: 198,
      T_NEW: 199,
      T_INSTEADOF: 200,
      T_ELSEIF: 201,
      T_ELSE: 202,
      T_ENDSWITCH: 203,
      T_CASE: 204,
      T_DEFAULT: 205,
      T_ENDFOR: 206,
      T_ENDFOREACH: 207,
      T_ENDWHILE: 208,
      T_CONSTANT_ENCAPSED_STRING: 209,
      T_LNUMBER: 210,
      T_DNUMBER: 211,
      T_LINE: 212,
      T_FILE: 213,
      T_DIR: 214,
      T_TRAIT_C: 215,
      T_METHOD_C: 216,
      T_FUNC_C: 217,
      T_NS_C: 218,
      T_START_HEREDOC: 219,
      T_END_HEREDOC: 220,
      T_CLASS_C: 221,
      T_VARIABLE: 222,
      T_OPEN_TAG: 223,
      T_OPEN_TAG_WITH_ECHO: 224,
      T_CLOSE_TAG: 225,
      T_WHITESPACE: 226,
      T_COMMENT: 227,
      T_DOC_COMMENT: 228,
      T_ELLIPSIS: 229,
      T_COALESCE: 230,
      T_POW: 231,
      T_POW_EQUAL: 232,
      T_SPACESHIP: 233,
      T_COALESCE_EQUAL: 234,
      T_FN: 235,
      T_NULLSAFE_OBJECT_OPERATOR: 236,
      T_MATCH: 237,
      T_ATTRIBUTE: 238,
      T_ENUM: 239,
      T_READ_ONLY: 240,
      T_NAME_RELATIVE: 241,
      T_NAME_QUALIFIED: 242,
      T_NAME_FULLY_QUALIFIED: 243
    };
    var tokens = {
      values: Object.entries(TokenNames).reduce(
        (result, [key, value]) => ({ ...result, [value]: key }),
        {}
      ),
      names: TokenNames
    };
    module2.exports = Object.freeze(tokens);
  }
});

// node_modules/php-parser/src/ast/location.js
var require_location = __commonJS({
  "node_modules/php-parser/src/ast/location.js"(exports2, module2) {
    "use strict";
    var Location = function(source, start, end) {
      this.source = source;
      this.start = start;
      this.end = end;
    };
    module2.exports = Location;
  }
});

// node_modules/php-parser/src/ast/node.js
var require_node = __commonJS({
  "node_modules/php-parser/src/ast/node.js"(exports2, module2) {
    "use strict";
    var Node = function Node2(kind, docs, location) {
      this.kind = kind;
      if (docs) {
        this.leadingComments = docs;
      }
      if (location) {
        this.loc = location;
      }
    };
    Node.prototype.setTrailingComments = function(docs) {
      this.trailingComments = docs;
    };
    Node.prototype.destroy = function(node) {
      if (!node) {
        throw new Error(
          "Node already initialized, you must swap with another node"
        );
      }
      if (this.leadingComments) {
        if (node.leadingComments) {
          node.leadingComments = Array.concat(
            this.leadingComments,
            node.leadingComments
          );
        } else {
          node.leadingComments = this.leadingComments;
        }
      }
      if (this.trailingComments) {
        if (node.trailingComments) {
          node.trailingComments = Array.concat(
            this.trailingComments,
            node.trailingComments
          );
        } else {
          node.trailingComments = this.trailingComments;
        }
      }
      return node;
    };
    Node.prototype.includeToken = function(parser) {
      if (this.loc) {
        if (this.loc.end) {
          this.loc.end.line = parser.lexer.yylloc.last_line;
          this.loc.end.column = parser.lexer.yylloc.last_column;
          this.loc.end.offset = parser.lexer.offset;
        }
        if (parser.ast.withSource) {
          this.loc.source = parser.lexer._input.substring(
            this.loc.start.offset,
            parser.lexer.offset
          );
        }
      }
      return this;
    };
    Node.extends = function(type, constructor) {
      constructor.prototype = Object.create(this.prototype);
      constructor.extends = this.extends;
      constructor.prototype.constructor = constructor;
      constructor.kind = type;
      return constructor;
    };
    module2.exports = Node;
  }
});

// node_modules/php-parser/src/ast/expression.js
var require_expression = __commonJS({
  "node_modules/php-parser/src/ast/expression.js"(exports2, module2) {
    "use strict";
    var Node = require_node();
    var KIND = "expression";
    module2.exports = Node.extends(KIND, function Expression(kind, docs, location) {
      Node.apply(this, [kind || KIND, docs, location]);
    });
  }
});

// node_modules/php-parser/src/ast/array.js
var require_array2 = __commonJS({
  "node_modules/php-parser/src/ast/array.js"(exports2, module2) {
    "use strict";
    var Expr = require_expression();
    var KIND = "array";
    module2.exports = Expr.extends(
      KIND,
      function Array2(shortForm, items, docs, location) {
        Expr.apply(this, [KIND, docs, location]);
        this.items = items;
        this.shortForm = shortForm;
      }
    );
  }
});

// node_modules/php-parser/src/ast/arrowfunc.js
var require_arrowfunc = __commonJS({
  "node_modules/php-parser/src/ast/arrowfunc.js"(exports2, module2) {
    "use strict";
    var Expression = require_expression();
    var KIND = "arrowfunc";
    module2.exports = Expression.extends(
      KIND,
      function Closure(args, byref, body, type, nullable, isStatic, docs, location) {
        Expression.apply(this, [KIND, docs, location]);
        this.arguments = args;
        this.byref = byref;
        this.body = body;
        this.type = type;
        this.nullable = nullable;
        this.isStatic = isStatic || false;
      }
    );
  }
});

// node_modules/php-parser/src/ast/assign.js
var require_assign = __commonJS({
  "node_modules/php-parser/src/ast/assign.js"(exports2, module2) {
    "use strict";
    var Expression = require_expression();
    var KIND = "assign";
    module2.exports = Expression.extends(
      KIND,
      function Assign(left, right, operator, docs, location) {
        Expression.apply(this, [KIND, docs, location]);
        this.left = left;
        this.right = right;
        this.operator = operator;
      }
    );
  }
});

// node_modules/php-parser/src/ast/assignref.js
var require_assignref = __commonJS({
  "node_modules/php-parser/src/ast/assignref.js"(exports2, module2) {
    "use strict";
    var Expression = require_expression();
    var KIND = "assignref";
    module2.exports = Expression.extends(
      KIND,
      function AssignRef(left, right, docs, location) {
        Expression.apply(this, [KIND, docs, location]);
        this.left = left;
        this.right = right;
      }
    );
  }
});

// node_modules/php-parser/src/ast/attribute.js
var require_attribute2 = __commonJS({
  "node_modules/php-parser/src/ast/attribute.js"(exports2, module2) {
    "use strict";
    var Node = require_node();
    var KIND = "attribute";
    module2.exports = Node.extends(
      KIND,
      function Attribute(name, args, docs, location) {
        Node.apply(this, [KIND, docs, location]);
        this.name = name;
        this.args = args;
      }
    );
  }
});

// node_modules/php-parser/src/ast/attrgroup.js
var require_attrgroup = __commonJS({
  "node_modules/php-parser/src/ast/attrgroup.js"(exports2, module2) {
    "use strict";
    var Node = require_node();
    var KIND = "attrgroup";
    module2.exports = Node.extends(KIND, function AttrGroup(attrs, docs, location) {
      Node.apply(this, [KIND, docs, location]);
      this.attrs = attrs || [];
    });
  }
});

// node_modules/php-parser/src/ast/operation.js
var require_operation = __commonJS({
  "node_modules/php-parser/src/ast/operation.js"(exports2, module2) {
    "use strict";
    var Expr = require_expression();
    var KIND = "operation";
    module2.exports = Expr.extends(KIND, function Operation(kind, docs, location) {
      Expr.apply(this, [kind || KIND, docs, location]);
    });
  }
});

// node_modules/php-parser/src/ast/bin.js
var require_bin = __commonJS({
  "node_modules/php-parser/src/ast/bin.js"(exports2, module2) {
    "use strict";
    var Operation = require_operation();
    var KIND = "bin";
    module2.exports = Operation.extends(
      KIND,
      function Bin(type, left, right, docs, location) {
        Operation.apply(this, [KIND, docs, location]);
        this.type = type;
        this.left = left;
        this.right = right;
      }
    );
  }
});

// node_modules/php-parser/src/ast/statement.js
var require_statement2 = __commonJS({
  "node_modules/php-parser/src/ast/statement.js"(exports2, module2) {
    "use strict";
    var Node = require_node();
    var KIND = "statement";
    module2.exports = Node.extends(KIND, function Statement(kind, docs, location) {
      Node.apply(this, [kind || KIND, docs, location]);
    });
  }
});

// node_modules/php-parser/src/ast/block.js
var require_block = __commonJS({
  "node_modules/php-parser/src/ast/block.js"(exports2, module2) {
    "use strict";
    var Statement = require_statement2();
    var KIND = "block";
    module2.exports = Statement.extends(
      KIND,
      function Block(kind, children, docs, location) {
        Statement.apply(this, [kind || KIND, docs, location]);
        this.children = children.filter(Boolean);
      }
    );
  }
});

// node_modules/php-parser/src/ast/literal.js
var require_literal = __commonJS({
  "node_modules/php-parser/src/ast/literal.js"(exports2, module2) {
    "use strict";
    var Expression = require_expression();
    var KIND = "literal";
    module2.exports = Expression.extends(
      KIND,
      function Literal(kind, value, raw, docs, location) {
        Expression.apply(this, [kind || KIND, docs, location]);
        this.value = value;
        if (raw) {
          this.raw = raw;
        }
      }
    );
  }
});

// node_modules/php-parser/src/ast/boolean.js
var require_boolean = __commonJS({
  "node_modules/php-parser/src/ast/boolean.js"(exports2, module2) {
    "use strict";
    var Literal = require_literal();
    var KIND = "boolean";
    module2.exports = Literal.extends(
      KIND,
      function Boolean2(value, raw, docs, location) {
        Literal.apply(this, [KIND, value, raw, docs, location]);
      }
    );
  }
});

// node_modules/php-parser/src/ast/break.js
var require_break = __commonJS({
  "node_modules/php-parser/src/ast/break.js"(exports2, module2) {
    "use strict";
    var Statement = require_statement2();
    var KIND = "break";
    module2.exports = Statement.extends(KIND, function Break(level, docs, location) {
      Statement.apply(this, [KIND, docs, location]);
      this.level = level;
    });
  }
});

// node_modules/php-parser/src/ast/byref.js
var require_byref = __commonJS({
  "node_modules/php-parser/src/ast/byref.js"(exports2, module2) {
    "use strict";
    var Expression = require_expression();
    var KIND = "byref";
    module2.exports = Expression.extends(KIND, function ByRef(what, docs, location) {
      Expression.apply(this, [KIND, docs, location]);
      this.what = what;
    });
  }
});

// node_modules/php-parser/src/ast/call.js
var require_call = __commonJS({
  "node_modules/php-parser/src/ast/call.js"(exports2, module2) {
    "use strict";
    var Expression = require_expression();
    var KIND = "call";
    module2.exports = Expression.extends(
      KIND,
      function Call(what, args, docs, location) {
        Expression.apply(this, [KIND, docs, location]);
        this.what = what;
        this.arguments = args;
      }
    );
  }
});

// node_modules/php-parser/src/ast/case.js
var require_case = __commonJS({
  "node_modules/php-parser/src/ast/case.js"(exports2, module2) {
    "use strict";
    var Statement = require_statement2();
    var KIND = "case";
    module2.exports = Statement.extends(
      KIND,
      function Case(test, body, docs, location) {
        Statement.apply(this, [KIND, docs, location]);
        this.test = test;
        this.body = body;
      }
    );
  }
});

// node_modules/php-parser/src/ast/cast.js
var require_cast = __commonJS({
  "node_modules/php-parser/src/ast/cast.js"(exports2, module2) {
    "use strict";
    var Operation = require_operation();
    var KIND = "cast";
    module2.exports = Operation.extends(
      KIND,
      function Cast(type, raw, expr, docs, location) {
        Operation.apply(this, [KIND, docs, location]);
        this.type = type;
        this.raw = raw;
        this.expr = expr;
      }
    );
  }
});

// node_modules/php-parser/src/ast/catch.js
var require_catch = __commonJS({
  "node_modules/php-parser/src/ast/catch.js"(exports2, module2) {
    "use strict";
    var Statement = require_statement2();
    var KIND = "catch";
    module2.exports = Statement.extends(
      KIND,
      function Catch(body, what, variable, docs, location) {
        Statement.apply(this, [KIND, docs, location]);
        this.body = body;
        this.what = what;
        this.variable = variable;
      }
    );
  }
});

// node_modules/php-parser/src/ast/declaration.js
var require_declaration = __commonJS({
  "node_modules/php-parser/src/ast/declaration.js"(exports2, module2) {
    "use strict";
    var Statement = require_statement2();
    var KIND = "declaration";
    var IS_UNDEFINED = "";
    var IS_PUBLIC = "public";
    var IS_PROTECTED = "protected";
    var IS_PRIVATE = "private";
    var Declaration = Statement.extends(
      KIND,
      function Declaration2(kind, name, docs, location) {
        Statement.apply(this, [kind || KIND, docs, location]);
        this.name = name;
      }
    );
    Declaration.prototype.parseFlags = function(flags) {
      this.isAbstract = flags[2] === 1;
      this.isFinal = flags[2] === 2;
      this.isReadonly = flags[3] === 1;
      if (this.kind !== "class") {
        if (flags[0] === -1) {
          this.visibility = IS_UNDEFINED;
        } else if (flags[0] === null) {
          this.visibility = null;
        } else if (flags[0] === 0) {
          this.visibility = IS_PUBLIC;
        } else if (flags[0] === 1) {
          this.visibility = IS_PROTECTED;
        } else if (flags[0] === 2) {
          this.visibility = IS_PRIVATE;
        }
        this.isStatic = flags[1] === 1;
      }
    };
    module2.exports = Declaration;
  }
});

// node_modules/php-parser/src/ast/class.js
var require_class2 = __commonJS({
  "node_modules/php-parser/src/ast/class.js"(exports2, module2) {
    "use strict";
    var Declaration = require_declaration();
    var KIND = "class";
    module2.exports = Declaration.extends(
      KIND,
      function Class(name, ext, impl, body, flags, docs, location) {
        Declaration.apply(this, [KIND, name, docs, location]);
        this.isAnonymous = name ? false : true;
        this.extends = ext;
        this.implements = impl;
        this.body = body;
        this.attrGroups = [];
        this.parseFlags(flags);
      }
    );
  }
});

// node_modules/php-parser/src/ast/constantstatement.js
var require_constantstatement = __commonJS({
  "node_modules/php-parser/src/ast/constantstatement.js"(exports2, module2) {
    "use strict";
    var Statement = require_statement2();
    var KIND = "constantstatement";
    module2.exports = Statement.extends(
      KIND,
      function ConstantStatement(kind, constants, docs, location) {
        Statement.apply(this, [kind || KIND, docs, location]);
        this.constants = constants;
      }
    );
  }
});

// node_modules/php-parser/src/ast/classconstant.js
var require_classconstant = __commonJS({
  "node_modules/php-parser/src/ast/classconstant.js"(exports2, module2) {
    "use strict";
    var ConstantStatement = require_constantstatement();
    var KIND = "classconstant";
    var IS_UNDEFINED = "";
    var IS_PUBLIC = "public";
    var IS_PROTECTED = "protected";
    var IS_PRIVATE = "private";
    var ClassConstant = ConstantStatement.extends(
      KIND,
      function ClassConstant2(kind, constants, flags, attrGroups, docs, location) {
        ConstantStatement.apply(this, [kind || KIND, constants, docs, location]);
        this.parseFlags(flags);
        this.attrGroups = attrGroups;
      }
    );
    ClassConstant.prototype.parseFlags = function(flags) {
      if (flags[0] === -1) {
        this.visibility = IS_UNDEFINED;
      } else if (flags[0] === null) {
        this.visibility = null;
      } else if (flags[0] === 0) {
        this.visibility = IS_PUBLIC;
      } else if (flags[0] === 1) {
        this.visibility = IS_PROTECTED;
      } else if (flags[0] === 2) {
        this.visibility = IS_PRIVATE;
      }
    };
    module2.exports = ClassConstant;
  }
});

// node_modules/php-parser/src/ast/clone.js
var require_clone = __commonJS({
  "node_modules/php-parser/src/ast/clone.js"(exports2, module2) {
    "use strict";
    var Expression = require_expression();
    var KIND = "clone";
    module2.exports = Expression.extends(KIND, function Clone(what, docs, location) {
      Expression.apply(this, [KIND, docs, location]);
      this.what = what;
    });
  }
});

// node_modules/php-parser/src/ast/closure.js
var require_closure = __commonJS({
  "node_modules/php-parser/src/ast/closure.js"(exports2, module2) {
    "use strict";
    var Expression = require_expression();
    var KIND = "closure";
    module2.exports = Expression.extends(
      KIND,
      function Closure(args, byref, uses, type, nullable, isStatic, docs, location) {
        Expression.apply(this, [KIND, docs, location]);
        this.uses = uses;
        this.arguments = args;
        this.byref = byref;
        this.type = type;
        this.nullable = nullable;
        this.isStatic = isStatic || false;
        this.body = null;
        this.attrGroups = [];
      }
    );
  }
});

// node_modules/php-parser/src/ast/comment.js
var require_comment2 = __commonJS({
  "node_modules/php-parser/src/ast/comment.js"(exports2, module2) {
    "use strict";
    var Node = require_node();
    module2.exports = Node.extends(
      "comment",
      function Comment(kind, value, docs, location) {
        Node.apply(this, [kind, docs, location]);
        this.value = value;
      }
    );
  }
});

// node_modules/php-parser/src/ast/commentblock.js
var require_commentblock = __commonJS({
  "node_modules/php-parser/src/ast/commentblock.js"(exports2, module2) {
    "use strict";
    var Comment = require_comment2();
    var KIND = "commentblock";
    module2.exports = Comment.extends(
      KIND,
      function CommentBlock(value, docs, location) {
        Comment.apply(this, [KIND, value, docs, location]);
      }
    );
  }
});

// node_modules/php-parser/src/ast/commentline.js
var require_commentline = __commonJS({
  "node_modules/php-parser/src/ast/commentline.js"(exports2, module2) {
    "use strict";
    var Comment = require_comment2();
    var KIND = "commentline";
    module2.exports = Comment.extends(
      KIND,
      function CommentLine(value, docs, location) {
        Comment.apply(this, [KIND, value, docs, location]);
      }
    );
  }
});

// node_modules/php-parser/src/ast/constant.js
var require_constant = __commonJS({
  "node_modules/php-parser/src/ast/constant.js"(exports2, module2) {
    "use strict";
    var Node = require_node();
    var KIND = "constant";
    module2.exports = Node.extends(
      KIND,
      function Constant(name, value, docs, location) {
        Node.apply(this, [KIND, docs, location]);
        this.name = name;
        this.value = value;
      }
    );
  }
});

// node_modules/php-parser/src/ast/continue.js
var require_continue = __commonJS({
  "node_modules/php-parser/src/ast/continue.js"(exports2, module2) {
    "use strict";
    var Statement = require_statement2();
    var KIND = "continue";
    module2.exports = Statement.extends(
      KIND,
      function Continue(level, docs, location) {
        Statement.apply(this, [KIND, docs, location]);
        this.level = level;
      }
    );
  }
});

// node_modules/php-parser/src/ast/declare.js
var require_declare = __commonJS({
  "node_modules/php-parser/src/ast/declare.js"(exports2, module2) {
    "use strict";
    var Block = require_block();
    var KIND = "declare";
    var Declare = Block.extends(
      KIND,
      function Declare2(directives, body, mode, docs, location) {
        Block.apply(this, [KIND, body, docs, location]);
        this.directives = directives;
        this.mode = mode;
      }
    );
    Declare.MODE_SHORT = "short";
    Declare.MODE_BLOCK = "block";
    Declare.MODE_NONE = "none";
    module2.exports = Declare;
  }
});

// node_modules/php-parser/src/ast/declaredirective.js
var require_declaredirective = __commonJS({
  "node_modules/php-parser/src/ast/declaredirective.js"(exports2, module2) {
    "use strict";
    var Node = require_node();
    var KIND = "declaredirective";
    module2.exports = Node.extends(
      KIND,
      function DeclareDirective(key, value, docs, location) {
        Node.apply(this, [KIND, docs, location]);
        this.key = key;
        this.value = value;
      }
    );
  }
});

// node_modules/php-parser/src/ast/do.js
var require_do = __commonJS({
  "node_modules/php-parser/src/ast/do.js"(exports2, module2) {
    "use strict";
    var Statement = require_statement2();
    var KIND = "do";
    module2.exports = Statement.extends(
      KIND,
      function Do(test, body, docs, location) {
        Statement.apply(this, [KIND, docs, location]);
        this.test = test;
        this.body = body;
      }
    );
  }
});

// node_modules/php-parser/src/ast/echo.js
var require_echo = __commonJS({
  "node_modules/php-parser/src/ast/echo.js"(exports2, module2) {
    "use strict";
    var Statement = require_statement2();
    var KIND = "echo";
    module2.exports = Statement.extends(
      KIND,
      function Echo(expressions, shortForm, docs, location) {
        Statement.apply(this, [KIND, docs, location]);
        this.shortForm = shortForm;
        this.expressions = expressions;
      }
    );
  }
});

// node_modules/php-parser/src/ast/empty.js
var require_empty = __commonJS({
  "node_modules/php-parser/src/ast/empty.js"(exports2, module2) {
    "use strict";
    var Expression = require_expression();
    var KIND = "empty";
    module2.exports = Expression.extends(
      KIND,
      function Empty(expression, docs, location) {
        Expression.apply(this, [KIND, docs, location]);
        this.expression = expression;
      }
    );
  }
});

// node_modules/php-parser/src/ast/encapsed.js
var require_encapsed = __commonJS({
  "node_modules/php-parser/src/ast/encapsed.js"(exports2, module2) {
    "use strict";
    var Literal = require_literal();
    var KIND = "encapsed";
    var Encapsed = Literal.extends(
      KIND,
      function Encapsed2(value, raw, type, docs, location) {
        Literal.apply(this, [KIND, value, raw, docs, location]);
        this.type = type;
      }
    );
    Encapsed.TYPE_STRING = "string";
    Encapsed.TYPE_SHELL = "shell";
    Encapsed.TYPE_HEREDOC = "heredoc";
    Encapsed.TYPE_OFFSET = "offset";
    module2.exports = Encapsed;
  }
});

// node_modules/php-parser/src/ast/encapsedpart.js
var require_encapsedpart = __commonJS({
  "node_modules/php-parser/src/ast/encapsedpart.js"(exports2, module2) {
    "use strict";
    var Expression = require_expression();
    var KIND = "encapsedpart";
    module2.exports = Expression.extends(
      KIND,
      function EncapsedPart(expression, syntax, curly, docs, location) {
        Expression.apply(this, [KIND, docs, location]);
        this.expression = expression;
        this.syntax = syntax;
        this.curly = curly;
      }
    );
  }
});

// node_modules/php-parser/src/ast/entry.js
var require_entry = __commonJS({
  "node_modules/php-parser/src/ast/entry.js"(exports2, module2) {
    "use strict";
    var Expression = require_expression();
    var KIND = "entry";
    module2.exports = Expression.extends(
      KIND,
      function Entry(key, value, byRef, unpack, docs, location) {
        Expression.apply(this, [KIND, docs, location]);
        this.key = key;
        this.value = value;
        this.byRef = byRef;
        this.unpack = unpack;
      }
    );
  }
});

// node_modules/php-parser/src/ast/enum.js
var require_enum2 = __commonJS({
  "node_modules/php-parser/src/ast/enum.js"(exports2, module2) {
    "use strict";
    var Declaration = require_declaration();
    var KIND = "enum";
    module2.exports = Declaration.extends(
      KIND,
      function Enum(name, valueType, impl, body, docs, location) {
        Declaration.apply(this, [KIND, name, docs, location]);
        this.valueType = valueType;
        this.implements = impl;
        this.body = body;
        this.attrGroups = [];
      }
    );
  }
});

// node_modules/php-parser/src/ast/enumcase.js
var require_enumcase = __commonJS({
  "node_modules/php-parser/src/ast/enumcase.js"(exports2, module2) {
    "use strict";
    var Node = require_node();
    var KIND = "enumcase";
    module2.exports = Node.extends(
      KIND,
      function EnumCase(name, value, docs, location) {
        Node.apply(this, [KIND, docs, location]);
        this.name = name;
        this.value = value;
      }
    );
  }
});

// node_modules/php-parser/src/ast/error.js
var require_error = __commonJS({
  "node_modules/php-parser/src/ast/error.js"(exports2, module2) {
    "use strict";
    var Node = require_node();
    var KIND = "error";
    module2.exports = Node.extends(
      KIND,
      function Error2(message, token, line, expected, docs, location) {
        Node.apply(this, [KIND, docs, location]);
        this.message = message;
        this.token = token;
        this.line = line;
        this.expected = expected;
      }
    );
  }
});

// node_modules/php-parser/src/ast/eval.js
var require_eval = __commonJS({
  "node_modules/php-parser/src/ast/eval.js"(exports2, module2) {
    "use strict";
    var Expression = require_expression();
    var KIND = "eval";
    module2.exports = Expression.extends(
      KIND,
      function Eval(source, docs, location) {
        Expression.apply(this, [KIND, docs, location]);
        this.source = source;
      }
    );
  }
});

// node_modules/php-parser/src/ast/exit.js
var require_exit = __commonJS({
  "node_modules/php-parser/src/ast/exit.js"(exports2, module2) {
    "use strict";
    var Expression = require_expression();
    var KIND = "exit";
    module2.exports = Expression.extends(
      KIND,
      function Exit(expression, useDie, docs, location) {
        Expression.apply(this, [KIND, docs, location]);
        this.expression = expression;
        this.useDie = useDie;
      }
    );
  }
});

// node_modules/php-parser/src/ast/expressionstatement.js
var require_expressionstatement = __commonJS({
  "node_modules/php-parser/src/ast/expressionstatement.js"(exports2, module2) {
    "use strict";
    var Statement = require_statement2();
    var KIND = "expressionstatement";
    module2.exports = Statement.extends(
      KIND,
      function ExpressionStatement(expr, docs, location) {
        Statement.apply(this, [KIND, docs, location]);
        this.expression = expr;
      }
    );
  }
});

// node_modules/php-parser/src/ast/for.js
var require_for = __commonJS({
  "node_modules/php-parser/src/ast/for.js"(exports2, module2) {
    "use strict";
    var Statement = require_statement2();
    var KIND = "for";
    module2.exports = Statement.extends(
      KIND,
      function For(init, test, increment, body, shortForm, docs, location) {
        Statement.apply(this, [KIND, docs, location]);
        this.init = init;
        this.test = test;
        this.increment = increment;
        this.shortForm = shortForm;
        this.body = body;
      }
    );
  }
});

// node_modules/php-parser/src/ast/foreach.js
var require_foreach = __commonJS({
  "node_modules/php-parser/src/ast/foreach.js"(exports2, module2) {
    "use strict";
    var Statement = require_statement2();
    var KIND = "foreach";
    module2.exports = Statement.extends(
      KIND,
      function Foreach(source, key, value, body, shortForm, docs, location) {
        Statement.apply(this, [KIND, docs, location]);
        this.source = source;
        this.key = key;
        this.value = value;
        this.shortForm = shortForm;
        this.body = body;
      }
    );
  }
});

// node_modules/php-parser/src/ast/function.js
var require_function2 = __commonJS({
  "node_modules/php-parser/src/ast/function.js"(exports2, module2) {
    "use strict";
    var Declaration = require_declaration();
    var KIND = "function";
    module2.exports = Declaration.extends(
      KIND,
      function _Function(name, args, byref, type, nullable, docs, location) {
        Declaration.apply(this, [KIND, name, docs, location]);
        this.arguments = args;
        this.byref = byref;
        this.type = type;
        this.nullable = nullable;
        this.body = null;
        this.attrGroups = [];
      }
    );
  }
});

// node_modules/php-parser/src/ast/global.js
var require_global = __commonJS({
  "node_modules/php-parser/src/ast/global.js"(exports2, module2) {
    "use strict";
    var Statement = require_statement2();
    var KIND = "global";
    module2.exports = Statement.extends(
      KIND,
      function Global(items, docs, location) {
        Statement.apply(this, [KIND, docs, location]);
        this.items = items;
      }
    );
  }
});

// node_modules/php-parser/src/ast/goto.js
var require_goto = __commonJS({
  "node_modules/php-parser/src/ast/goto.js"(exports2, module2) {
    "use strict";
    var Statement = require_statement2();
    var KIND = "goto";
    module2.exports = Statement.extends(KIND, function Goto(label, docs, location) {
      Statement.apply(this, [KIND, docs, location]);
      this.label = label;
    });
  }
});

// node_modules/php-parser/src/ast/halt.js
var require_halt = __commonJS({
  "node_modules/php-parser/src/ast/halt.js"(exports2, module2) {
    "use strict";
    var Statement = require_statement2();
    var KIND = "halt";
    module2.exports = Statement.extends(KIND, function Halt(after, docs, location) {
      Statement.apply(this, [KIND, docs, location]);
      this.after = after;
    });
  }
});

// node_modules/php-parser/src/ast/identifier.js
var require_identifier = __commonJS({
  "node_modules/php-parser/src/ast/identifier.js"(exports2, module2) {
    "use strict";
    var Node = require_node();
    var KIND = "identifier";
    var Identifier = Node.extends(
      KIND,
      function Identifier2(name, docs, location) {
        Node.apply(this, [KIND, docs, location]);
        this.name = name;
      }
    );
    module2.exports = Identifier;
  }
});

// node_modules/php-parser/src/ast/if.js
var require_if2 = __commonJS({
  "node_modules/php-parser/src/ast/if.js"(exports2, module2) {
    "use strict";
    var Statement = require_statement2();
    var KIND = "if";
    module2.exports = Statement.extends(
      KIND,
      function If(test, body, alternate, shortForm, docs, location) {
        Statement.apply(this, [KIND, docs, location]);
        this.test = test;
        this.body = body;
        this.alternate = alternate;
        this.shortForm = shortForm;
      }
    );
  }
});

// node_modules/php-parser/src/ast/include.js
var require_include = __commonJS({
  "node_modules/php-parser/src/ast/include.js"(exports2, module2) {
    "use strict";
    var Expression = require_expression();
    var KIND = "include";
    module2.exports = Expression.extends(
      KIND,
      function Include(once, require2, target, docs, location) {
        Expression.apply(this, [KIND, docs, location]);
        this.once = once;
        this.require = require2;
        this.target = target;
      }
    );
  }
});

// node_modules/php-parser/src/ast/inline.js
var require_inline = __commonJS({
  "node_modules/php-parser/src/ast/inline.js"(exports2, module2) {
    "use strict";
    var Literal = require_literal();
    var KIND = "inline";
    module2.exports = Literal.extends(
      KIND,
      function Inline(value, raw, docs, location) {
        Literal.apply(this, [KIND, value, raw, docs, location]);
      }
    );
  }
});

// node_modules/php-parser/src/ast/interface.js
var require_interface = __commonJS({
  "node_modules/php-parser/src/ast/interface.js"(exports2, module2) {
    "use strict";
    var Declaration = require_declaration();
    var KIND = "interface";
    module2.exports = Declaration.extends(
      KIND,
      function Interface(name, ext, body, attrGroups, docs, location) {
        Declaration.apply(this, [KIND, name, docs, location]);
        this.extends = ext;
        this.body = body;
        this.attrGroups = attrGroups;
      }
    );
  }
});

// node_modules/php-parser/src/ast/intersectiontype.js
var require_intersectiontype = __commonJS({
  "node_modules/php-parser/src/ast/intersectiontype.js"(exports2, module2) {
    "use strict";
    var Declaration = require_declaration();
    var KIND = "intersectiontype";
    module2.exports = Declaration.extends(
      KIND,
      function IntersectionType(types, docs, location) {
        Declaration.apply(this, [KIND, null, docs, location]);
        this.types = types;
      }
    );
  }
});

// node_modules/php-parser/src/ast/isset.js
var require_isset = __commonJS({
  "node_modules/php-parser/src/ast/isset.js"(exports2, module2) {
    "use strict";
    var Expression = require_expression();
    var KIND = "isset";
    module2.exports = Expression.extends(
      KIND,
      function Isset(variables, docs, location) {
        Expression.apply(this, [KIND, docs, location]);
        this.variables = variables;
      }
    );
  }
});

// node_modules/php-parser/src/ast/label.js
var require_label = __commonJS({
  "node_modules/php-parser/src/ast/label.js"(exports2, module2) {
    "use strict";
    var Statement = require_statement2();
    var KIND = "label";
    module2.exports = Statement.extends(KIND, function Label(name, docs, location) {
      Statement.apply(this, [KIND, docs, location]);
      this.name = name;
    });
  }
});

// node_modules/php-parser/src/ast/list.js
var require_list = __commonJS({
  "node_modules/php-parser/src/ast/list.js"(exports2, module2) {
    "use strict";
    var Expression = require_expression();
    var KIND = "list";
    module2.exports = Expression.extends(
      KIND,
      function List(items, shortForm, docs, location) {
        Expression.apply(this, [KIND, docs, location]);
        this.items = items;
        this.shortForm = shortForm;
      }
    );
  }
});

// node_modules/php-parser/src/ast/lookup.js
var require_lookup = __commonJS({
  "node_modules/php-parser/src/ast/lookup.js"(exports2, module2) {
    "use strict";
    var Expr = require_expression();
    var KIND = "lookup";
    module2.exports = Expr.extends(
      KIND,
      function Lookup(kind, what, offset, docs, location) {
        Expr.apply(this, [kind || KIND, docs, location]);
        this.what = what;
        this.offset = offset;
      }
    );
  }
});

// node_modules/php-parser/src/ast/magic.js
var require_magic = __commonJS({
  "node_modules/php-parser/src/ast/magic.js"(exports2, module2) {
    "use strict";
    var Literal = require_literal();
    var KIND = "magic";
    module2.exports = Literal.extends(
      KIND,
      function Magic(value, raw, docs, location) {
        Literal.apply(this, [KIND, value, raw, docs, location]);
      }
    );
  }
});

// node_modules/php-parser/src/ast/match.js
var require_match = __commonJS({
  "node_modules/php-parser/src/ast/match.js"(exports2, module2) {
    "use strict";
    var Expression = require_expression();
    var KIND = "match";
    module2.exports = Expression.extends(
      KIND,
      function Match(cond, arms, docs, location) {
        Expression.apply(this, [KIND, docs, location]);
        this.cond = cond;
        this.arms = arms;
      }
    );
  }
});

// node_modules/php-parser/src/ast/matcharm.js
var require_matcharm = __commonJS({
  "node_modules/php-parser/src/ast/matcharm.js"(exports2, module2) {
    "use strict";
    var Expression = require_expression();
    var KIND = "matcharm";
    module2.exports = Expression.extends(
      KIND,
      function MatchArm(conds, body, docs, location) {
        Expression.apply(this, [KIND, docs, location]);
        this.conds = conds;
        this.body = body;
      }
    );
  }
});

// node_modules/php-parser/src/ast/method.js
var require_method = __commonJS({
  "node_modules/php-parser/src/ast/method.js"(exports2, module2) {
    "use strict";
    var Function_ = require_function2();
    var KIND = "method";
    module2.exports = Function_.extends(KIND, function Method() {
      Function_.apply(this, arguments);
      this.kind = KIND;
    });
  }
});

// node_modules/php-parser/src/ast/reference.js
var require_reference = __commonJS({
  "node_modules/php-parser/src/ast/reference.js"(exports2, module2) {
    "use strict";
    var Node = require_node();
    var KIND = "reference";
    var Reference = Node.extends(KIND, function Reference2(kind, docs, location) {
      Node.apply(this, [kind || KIND, docs, location]);
    });
    module2.exports = Reference;
  }
});

// node_modules/php-parser/src/ast/name.js
var require_name = __commonJS({
  "node_modules/php-parser/src/ast/name.js"(exports2, module2) {
    "use strict";
    var Reference = require_reference();
    var KIND = "name";
    var Name = Reference.extends(
      KIND,
      function Name2(name, resolution, docs, location) {
        Reference.apply(this, [KIND, docs, location]);
        this.name = name.replace(/\\$/, "");
        this.resolution = resolution;
      }
    );
    Name.UNQUALIFIED_NAME = "uqn";
    Name.QUALIFIED_NAME = "qn";
    Name.FULL_QUALIFIED_NAME = "fqn";
    Name.RELATIVE_NAME = "rn";
    module2.exports = Name;
  }
});

// node_modules/php-parser/src/ast/namespace.js
var require_namespace2 = __commonJS({
  "node_modules/php-parser/src/ast/namespace.js"(exports2, module2) {
    "use strict";
    var Block = require_block();
    var KIND = "namespace";
    module2.exports = Block.extends(
      KIND,
      function Namespace(name, children, withBrackets, docs, location) {
        Block.apply(this, [KIND, children, docs, location]);
        this.name = name;
        this.withBrackets = withBrackets || false;
      }
    );
  }
});

// node_modules/php-parser/src/ast/namedargument.js
var require_namedargument = __commonJS({
  "node_modules/php-parser/src/ast/namedargument.js"(exports2, module2) {
    "use strict";
    var Expression = require_expression();
    var KIND = "namedargument";
    module2.exports = Expression.extends(
      KIND,
      function namedargument(name, value, docs, location) {
        Expression.apply(this, [KIND, docs, location]);
        this.name = name;
        this.value = value;
      }
    );
  }
});

// node_modules/php-parser/src/ast/new.js
var require_new = __commonJS({
  "node_modules/php-parser/src/ast/new.js"(exports2, module2) {
    "use strict";
    var Expression = require_expression();
    var KIND = "new";
    module2.exports = Expression.extends(
      KIND,
      function New(what, args, docs, location) {
        Expression.apply(this, [KIND, docs, location]);
        this.what = what;
        this.arguments = args;
      }
    );
  }
});

// node_modules/php-parser/src/ast/noop.js
var require_noop = __commonJS({
  "node_modules/php-parser/src/ast/noop.js"(exports2, module2) {
    "use strict";
    var Node = require_node();
    var KIND = "noop";
    module2.exports = Node.extends(KIND, function Noop(docs, location) {
      Node.apply(this, [KIND, docs, location]);
    });
  }
});

// node_modules/php-parser/src/ast/nowdoc.js
var require_nowdoc = __commonJS({
  "node_modules/php-parser/src/ast/nowdoc.js"(exports2, module2) {
    "use strict";
    var Literal = require_literal();
    var KIND = "nowdoc";
    module2.exports = Literal.extends(
      KIND,
      function Nowdoc(value, raw, label, docs, location) {
        Literal.apply(this, [KIND, value, raw, docs, location]);
        this.label = label;
      }
    );
  }
});

// node_modules/php-parser/src/ast/nullkeyword.js
var require_nullkeyword = __commonJS({
  "node_modules/php-parser/src/ast/nullkeyword.js"(exports2, module2) {
    "use strict";
    var Node = require_node();
    var KIND = "nullkeyword";
    module2.exports = Node.extends(KIND, function NullKeyword(raw, docs, location) {
      Node.apply(this, [KIND, docs, location]);
      this.raw = raw;
    });
  }
});

// node_modules/php-parser/src/ast/nullsafepropertylookup.js
var require_nullsafepropertylookup = __commonJS({
  "node_modules/php-parser/src/ast/nullsafepropertylookup.js"(exports2, module2) {
    "use strict";
    var Lookup = require_lookup();
    var KIND = "nullsafepropertylookup";
    module2.exports = Lookup.extends(
      KIND,
      function NullSafePropertyLookup(what, offset, docs, location) {
        Lookup.apply(this, [KIND, what, offset, docs, location]);
      }
    );
  }
});

// node_modules/php-parser/src/ast/number.js
var require_number = __commonJS({
  "node_modules/php-parser/src/ast/number.js"(exports2, module2) {
    "use strict";
    var Literal = require_literal();
    var KIND = "number";
    module2.exports = Literal.extends(
      KIND,
      function Number(value, raw, docs, location) {
        Literal.apply(this, [KIND, value, raw, docs, location]);
      }
    );
  }
});

// node_modules/php-parser/src/ast/offsetlookup.js
var require_offsetlookup = __commonJS({
  "node_modules/php-parser/src/ast/offsetlookup.js"(exports2, module2) {
    "use strict";
    var Lookup = require_lookup();
    var KIND = "offsetlookup";
    module2.exports = Lookup.extends(
      KIND,
      function OffsetLookup(what, offset, docs, location) {
        Lookup.apply(this, [KIND, what, offset, docs, location]);
      }
    );
  }
});

// node_modules/php-parser/src/ast/parameter.js
var require_parameter = __commonJS({
  "node_modules/php-parser/src/ast/parameter.js"(exports2, module2) {
    "use strict";
    var Declaration = require_declaration();
    var KIND = "parameter";
    module2.exports = Declaration.extends(
      KIND,
      function Parameter(name, type, value, isRef, isVariadic, readonly, nullable, flags, docs, location) {
        Declaration.apply(this, [KIND, name, docs, location]);
        this.value = value;
        this.type = type;
        this.byref = isRef;
        this.variadic = isVariadic;
        this.readonly = readonly;
        this.nullable = nullable;
        this.flags = flags || 0;
        this.attrGroups = [];
      }
    );
  }
});

// node_modules/php-parser/src/ast/parentreference.js
var require_parentreference = __commonJS({
  "node_modules/php-parser/src/ast/parentreference.js"(exports2, module2) {
    "use strict";
    var Reference = require_reference();
    var KIND = "parentreference";
    var ParentReference = Reference.extends(
      KIND,
      function ParentReference2(raw, docs, location) {
        Reference.apply(this, [KIND, docs, location]);
        this.raw = raw;
      }
    );
    module2.exports = ParentReference;
  }
});

// node_modules/php-parser/src/ast/post.js
var require_post = __commonJS({
  "node_modules/php-parser/src/ast/post.js"(exports2, module2) {
    "use strict";
    var Operation = require_operation();
    var KIND = "post";
    module2.exports = Operation.extends(
      KIND,
      function Post(type, what, docs, location) {
        Operation.apply(this, [KIND, docs, location]);
        this.type = type;
        this.what = what;
      }
    );
  }
});

// node_modules/php-parser/src/ast/pre.js
var require_pre = __commonJS({
  "node_modules/php-parser/src/ast/pre.js"(exports2, module2) {
    "use strict";
    var Operation = require_operation();
    var KIND = "pre";
    module2.exports = Operation.extends(
      KIND,
      function Pre(type, what, docs, location) {
        Operation.apply(this, [KIND, docs, location]);
        this.type = type;
        this.what = what;
      }
    );
  }
});

// node_modules/php-parser/src/ast/print.js
var require_print = __commonJS({
  "node_modules/php-parser/src/ast/print.js"(exports2, module2) {
    "use strict";
    var Expression = require_expression();
    var KIND = "print";
    module2.exports = Expression.extends(
      KIND,
      function Print(expression, docs, location) {
        Expression.apply(this, [KIND, docs, location]);
        this.expression = expression;
      }
    );
  }
});

// node_modules/php-parser/src/ast/program.js
var require_program = __commonJS({
  "node_modules/php-parser/src/ast/program.js"(exports2, module2) {
    "use strict";
    var Block = require_block();
    var KIND = "program";
    module2.exports = Block.extends(
      KIND,
      function Program2(children, errors, comments, tokens, docs, location) {
        Block.apply(this, [KIND, children, docs, location]);
        this.errors = errors;
        if (comments) {
          this.comments = comments;
        }
        if (tokens) {
          this.tokens = tokens;
        }
      }
    );
  }
});

// node_modules/php-parser/src/ast/property.js
var require_property2 = __commonJS({
  "node_modules/php-parser/src/ast/property.js"(exports2, module2) {
    "use strict";
    var Statement = require_statement2();
    var KIND = "property";
    module2.exports = Statement.extends(
      KIND,
      function Property(name, value, readonly, nullable, type, attrGroups, docs, location) {
        Statement.apply(this, [KIND, docs, location]);
        this.name = name;
        this.value = value;
        this.readonly = readonly;
        this.nullable = nullable;
        this.type = type;
        this.attrGroups = attrGroups;
      }
    );
  }
});

// node_modules/php-parser/src/ast/propertylookup.js
var require_propertylookup = __commonJS({
  "node_modules/php-parser/src/ast/propertylookup.js"(exports2, module2) {
    "use strict";
    var Lookup = require_lookup();
    var KIND = "propertylookup";
    module2.exports = Lookup.extends(
      KIND,
      function PropertyLookup(what, offset, docs, location) {
        Lookup.apply(this, [KIND, what, offset, docs, location]);
      }
    );
  }
});

// node_modules/php-parser/src/ast/propertystatement.js
var require_propertystatement = __commonJS({
  "node_modules/php-parser/src/ast/propertystatement.js"(exports2, module2) {
    "use strict";
    var Statement = require_statement2();
    var KIND = "propertystatement";
    var IS_UNDEFINED = "";
    var IS_PUBLIC = "public";
    var IS_PROTECTED = "protected";
    var IS_PRIVATE = "private";
    var PropertyStatement = Statement.extends(
      KIND,
      function PropertyStatement2(kind, properties, flags, docs, location) {
        Statement.apply(this, [KIND, docs, location]);
        this.properties = properties;
        this.parseFlags(flags);
      }
    );
    PropertyStatement.prototype.parseFlags = function(flags) {
      if (flags[0] === -1) {
        this.visibility = IS_UNDEFINED;
      } else if (flags[0] === null) {
        this.visibility = null;
      } else if (flags[0] === 0) {
        this.visibility = IS_PUBLIC;
      } else if (flags[0] === 1) {
        this.visibility = IS_PROTECTED;
      } else if (flags[0] === 2) {
        this.visibility = IS_PRIVATE;
      }
      this.isStatic = flags[1] === 1;
    };
    module2.exports = PropertyStatement;
  }
});

// node_modules/php-parser/src/ast/retif.js
var require_retif = __commonJS({
  "node_modules/php-parser/src/ast/retif.js"(exports2, module2) {
    "use strict";
    var Expression = require_expression();
    var KIND = "retif";
    module2.exports = Expression.extends(
      KIND,
      function RetIf(test, trueExpr, falseExpr, docs, location) {
        Expression.apply(this, [KIND, docs, location]);
        this.test = test;
        this.trueExpr = trueExpr;
        this.falseExpr = falseExpr;
      }
    );
  }
});

// node_modules/php-parser/src/ast/return.js
var require_return = __commonJS({
  "node_modules/php-parser/src/ast/return.js"(exports2, module2) {
    "use strict";
    var Statement = require_statement2();
    var KIND = "return";
    module2.exports = Statement.extends(KIND, function Return(expr, docs, location) {
      Statement.apply(this, [KIND, docs, location]);
      this.expr = expr;
    });
  }
});

// node_modules/php-parser/src/ast/selfreference.js
var require_selfreference = __commonJS({
  "node_modules/php-parser/src/ast/selfreference.js"(exports2, module2) {
    "use strict";
    var Reference = require_reference();
    var KIND = "selfreference";
    var SelfReference = Reference.extends(
      KIND,
      function SelfReference2(raw, docs, location) {
        Reference.apply(this, [KIND, docs, location]);
        this.raw = raw;
      }
    );
    module2.exports = SelfReference;
  }
});

// node_modules/php-parser/src/ast/silent.js
var require_silent = __commonJS({
  "node_modules/php-parser/src/ast/silent.js"(exports2, module2) {
    "use strict";
    var Expression = require_expression();
    var KIND = "silent";
    module2.exports = Expression.extends(
      KIND,
      function Silent(expr, docs, location) {
        Expression.apply(this, [KIND, docs, location]);
        this.expr = expr;
      }
    );
  }
});

// node_modules/php-parser/src/ast/static.js
var require_static = __commonJS({
  "node_modules/php-parser/src/ast/static.js"(exports2, module2) {
    "use strict";
    var Statement = require_statement2();
    var KIND = "static";
    module2.exports = Statement.extends(
      KIND,
      function Static(variables, docs, location) {
        Statement.apply(this, [KIND, docs, location]);
        this.variables = variables;
      }
    );
  }
});

// node_modules/php-parser/src/ast/staticvariable.js
var require_staticvariable = __commonJS({
  "node_modules/php-parser/src/ast/staticvariable.js"(exports2, module2) {
    "use strict";
    var Node = require_node();
    var KIND = "staticvariable";
    module2.exports = Node.extends(
      KIND,
      function StaticVariable(variable, defaultValue, docs, location) {
        Node.apply(this, [KIND, docs, location]);
        this.variable = variable;
        this.defaultValue = defaultValue;
      }
    );
  }
});

// node_modules/php-parser/src/ast/staticlookup.js
var require_staticlookup = __commonJS({
  "node_modules/php-parser/src/ast/staticlookup.js"(exports2, module2) {
    "use strict";
    var Lookup = require_lookup();
    var KIND = "staticlookup";
    module2.exports = Lookup.extends(
      KIND,
      function StaticLookup(what, offset, docs, location) {
        Lookup.apply(this, [KIND, what, offset, docs, location]);
      }
    );
  }
});

// node_modules/php-parser/src/ast/staticreference.js
var require_staticreference = __commonJS({
  "node_modules/php-parser/src/ast/staticreference.js"(exports2, module2) {
    "use strict";
    var Reference = require_reference();
    var KIND = "staticreference";
    var StaticReference = Reference.extends(
      KIND,
      function StaticReference2(raw, docs, location) {
        Reference.apply(this, [KIND, docs, location]);
        this.raw = raw;
      }
    );
    module2.exports = StaticReference;
  }
});

// node_modules/php-parser/src/ast/string.js
var require_string = __commonJS({
  "node_modules/php-parser/src/ast/string.js"(exports2, module2) {
    "use strict";
    var Literal = require_literal();
    var KIND = "string";
    module2.exports = Literal.extends(
      KIND,
      function String2(isDoubleQuote, value, unicode, raw, docs, location) {
        Literal.apply(this, [KIND, value, raw, docs, location]);
        this.unicode = unicode;
        this.isDoubleQuote = isDoubleQuote;
      }
    );
  }
});

// node_modules/php-parser/src/ast/switch.js
var require_switch2 = __commonJS({
  "node_modules/php-parser/src/ast/switch.js"(exports2, module2) {
    "use strict";
    var Statement = require_statement2();
    var KIND = "switch";
    module2.exports = Statement.extends(
      KIND,
      function Switch(test, body, shortForm, docs, location) {
        Statement.apply(this, [KIND, docs, location]);
        this.test = test;
        this.body = body;
        this.shortForm = shortForm;
      }
    );
  }
});

// node_modules/php-parser/src/ast/throw.js
var require_throw = __commonJS({
  "node_modules/php-parser/src/ast/throw.js"(exports2, module2) {
    "use strict";
    var Statement = require_statement2();
    var KIND = "throw";
    module2.exports = Statement.extends(KIND, function Throw(what, docs, location) {
      Statement.apply(this, [KIND, docs, location]);
      this.what = what;
    });
  }
});

// node_modules/php-parser/src/ast/trait.js
var require_trait = __commonJS({
  "node_modules/php-parser/src/ast/trait.js"(exports2, module2) {
    "use strict";
    var Declaration = require_declaration();
    var KIND = "trait";
    module2.exports = Declaration.extends(
      KIND,
      function Trait(name, body, docs, location) {
        Declaration.apply(this, [KIND, name, docs, location]);
        this.body = body;
      }
    );
  }
});

// node_modules/php-parser/src/ast/traitalias.js
var require_traitalias = __commonJS({
  "node_modules/php-parser/src/ast/traitalias.js"(exports2, module2) {
    "use strict";
    var Node = require_node();
    var KIND = "traitalias";
    var IS_UNDEFINED = "";
    var IS_PUBLIC = "public";
    var IS_PROTECTED = "protected";
    var IS_PRIVATE = "private";
    module2.exports = Node.extends(
      KIND,
      function TraitAlias(trait, method, as, flags, docs, location) {
        Node.apply(this, [KIND, docs, location]);
        this.trait = trait;
        this.method = method;
        this.as = as;
        this.visibility = IS_UNDEFINED;
        if (flags) {
          if (flags[0] === 0) {
            this.visibility = IS_PUBLIC;
          } else if (flags[0] === 1) {
            this.visibility = IS_PROTECTED;
          } else if (flags[0] === 2) {
            this.visibility = IS_PRIVATE;
          }
        }
      }
    );
  }
});

// node_modules/php-parser/src/ast/traitprecedence.js
var require_traitprecedence = __commonJS({
  "node_modules/php-parser/src/ast/traitprecedence.js"(exports2, module2) {
    "use strict";
    var Node = require_node();
    var KIND = "traitprecedence";
    module2.exports = Node.extends(
      KIND,
      function TraitPrecedence(trait, method, instead, docs, location) {
        Node.apply(this, [KIND, docs, location]);
        this.trait = trait;
        this.method = method;
        this.instead = instead;
      }
    );
  }
});

// node_modules/php-parser/src/ast/traituse.js
var require_traituse = __commonJS({
  "node_modules/php-parser/src/ast/traituse.js"(exports2, module2) {
    "use strict";
    var Node = require_node();
    var KIND = "traituse";
    module2.exports = Node.extends(
      KIND,
      function TraitUse(traits, adaptations, docs, location) {
        Node.apply(this, [KIND, docs, location]);
        this.traits = traits;
        this.adaptations = adaptations;
      }
    );
  }
});

// node_modules/php-parser/src/ast/try.js
var require_try2 = __commonJS({
  "node_modules/php-parser/src/ast/try.js"(exports2, module2) {
    "use strict";
    var Statement = require_statement2();
    var KIND = "try";
    module2.exports = Statement.extends(
      KIND,
      function Try(body, catches, always, docs, location) {
        Statement.apply(this, [KIND, docs, location]);
        this.body = body;
        this.catches = catches;
        this.always = always;
      }
    );
  }
});

// node_modules/php-parser/src/ast/typereference.js
var require_typereference = __commonJS({
  "node_modules/php-parser/src/ast/typereference.js"(exports2, module2) {
    "use strict";
    var Reference = require_reference();
    var KIND = "typereference";
    var TypeReference = Reference.extends(
      KIND,
      function TypeReference2(name, raw, docs, location) {
        Reference.apply(this, [KIND, docs, location]);
        this.name = name;
        this.raw = raw;
      }
    );
    TypeReference.types = [
      "int",
      "float",
      "string",
      "bool",
      "object",
      "array",
      "callable",
      "iterable",
      "void",
      "static"
    ];
    module2.exports = TypeReference;
  }
});

// node_modules/php-parser/src/ast/unary.js
var require_unary = __commonJS({
  "node_modules/php-parser/src/ast/unary.js"(exports2, module2) {
    "use strict";
    var Operation = require_operation();
    var KIND = "unary";
    module2.exports = Operation.extends(
      KIND,
      function Unary(type, what, docs, location) {
        Operation.apply(this, [KIND, docs, location]);
        this.type = type;
        this.what = what;
      }
    );
  }
});

// node_modules/php-parser/src/ast/uniontype.js
var require_uniontype = __commonJS({
  "node_modules/php-parser/src/ast/uniontype.js"(exports2, module2) {
    "use strict";
    var Declaration = require_declaration();
    var KIND = "uniontype";
    module2.exports = Declaration.extends(
      KIND,
      function UnionType(types, docs, location) {
        Declaration.apply(this, [KIND, null, docs, location]);
        this.types = types;
      }
    );
  }
});

// node_modules/php-parser/src/ast/unset.js
var require_unset = __commonJS({
  "node_modules/php-parser/src/ast/unset.js"(exports2, module2) {
    "use strict";
    var Statement = require_statement2();
    var KIND = "unset";
    module2.exports = Statement.extends(
      KIND,
      function Unset(variables, docs, location) {
        Statement.apply(this, [KIND, docs, location]);
        this.variables = variables;
      }
    );
  }
});

// node_modules/php-parser/src/ast/usegroup.js
var require_usegroup = __commonJS({
  "node_modules/php-parser/src/ast/usegroup.js"(exports2, module2) {
    "use strict";
    var Statement = require_statement2();
    var KIND = "usegroup";
    module2.exports = Statement.extends(
      KIND,
      function UseGroup(name, type, items, docs, location) {
        Statement.apply(this, [KIND, docs, location]);
        this.name = name;
        this.type = type;
        this.items = items;
      }
    );
  }
});

// node_modules/php-parser/src/ast/useitem.js
var require_useitem = __commonJS({
  "node_modules/php-parser/src/ast/useitem.js"(exports2, module2) {
    "use strict";
    var Statement = require_statement2();
    var KIND = "useitem";
    var UseItem = Statement.extends(
      KIND,
      function UseItem2(name, alias, type, docs, location) {
        Statement.apply(this, [KIND, docs, location]);
        this.name = name;
        this.alias = alias;
        this.type = type;
      }
    );
    UseItem.TYPE_CONST = "const";
    UseItem.TYPE_FUNCTION = "function";
    module2.exports = UseItem;
  }
});

// node_modules/php-parser/src/ast/variable.js
var require_variable2 = __commonJS({
  "node_modules/php-parser/src/ast/variable.js"(exports2, module2) {
    "use strict";
    var Expression = require_expression();
    var KIND = "variable";
    module2.exports = Expression.extends(
      KIND,
      function Variable(name, curly, docs, location) {
        Expression.apply(this, [KIND, docs, location]);
        this.name = name;
        this.curly = curly || false;
      }
    );
  }
});

// node_modules/php-parser/src/ast/variadic.js
var require_variadic = __commonJS({
  "node_modules/php-parser/src/ast/variadic.js"(exports2, module2) {
    "use strict";
    var Expression = require_expression();
    var KIND = "variadic";
    module2.exports = Expression.extends(
      KIND,
      function variadic(what, docs, location) {
        Expression.apply(this, [KIND, docs, location]);
        this.what = what;
      }
    );
  }
});

// node_modules/php-parser/src/ast/variadicplaceholder.js
var require_variadicplaceholder = __commonJS({
  "node_modules/php-parser/src/ast/variadicplaceholder.js"(exports2, module2) {
    "use strict";
    var Node = require_node();
    var KIND = "variadicplaceholder";
    module2.exports = Node.extends(
      KIND,
      function VariadicPlaceholder(docs, location) {
        Node.apply(this, [KIND, docs, location]);
      }
    );
  }
});

// node_modules/php-parser/src/ast/while.js
var require_while = __commonJS({
  "node_modules/php-parser/src/ast/while.js"(exports2, module2) {
    "use strict";
    var Statement = require_statement2();
    var KIND = "while";
    module2.exports = Statement.extends(
      KIND,
      function While(test, body, shortForm, docs, location) {
        Statement.apply(this, [KIND, docs, location]);
        this.test = test;
        this.body = body;
        this.shortForm = shortForm;
      }
    );
  }
});

// node_modules/php-parser/src/ast/yield.js
var require_yield = __commonJS({
  "node_modules/php-parser/src/ast/yield.js"(exports2, module2) {
    "use strict";
    var Expression = require_expression();
    var KIND = "yield";
    module2.exports = Expression.extends(
      KIND,
      function Yield(value, key, docs, location) {
        Expression.apply(this, [KIND, docs, location]);
        this.value = value;
        this.key = key;
      }
    );
  }
});

// node_modules/php-parser/src/ast/yieldfrom.js
var require_yieldfrom = __commonJS({
  "node_modules/php-parser/src/ast/yieldfrom.js"(exports2, module2) {
    "use strict";
    var Expression = require_expression();
    var KIND = "yieldfrom";
    module2.exports = Expression.extends(
      KIND,
      function YieldFrom(value, docs, location) {
        Expression.apply(this, [KIND, docs, location]);
        this.value = value;
      }
    );
  }
});

// node_modules/php-parser/src/ast.js
var require_ast = __commonJS({
  "node_modules/php-parser/src/ast.js"(exports2, module2) {
    "use strict";
    var Location = require_location();
    var Position2 = require_position();
    var AST = function(withPositions, withSource) {
      this.withPositions = withPositions;
      this.withSource = withSource;
    };
    AST.precedence = {};
    [
      ["or"],
      ["xor"],
      ["and"],
      ["="],
      ["?"],
      ["??"],
      ["||"],
      ["&&"],
      ["|"],
      ["^"],
      ["&"],
      ["==", "!=", "===", "!==", "<=>"],
      ["<", "<=", ">", ">="],
      ["<<", ">>"],
      ["+", "-", "."],
      ["*", "/", "%"],
      ["!"],
      ["instanceof"],
      ["cast", "silent"],
      ["**"]
    ].forEach(function(list, index) {
      list.forEach(function(operator) {
        AST.precedence[operator] = index + 1;
      });
    });
    AST.prototype.isRightAssociative = function(operator) {
      return operator === "**" || operator === "??";
    };
    AST.prototype.swapLocations = function(target, first, last, parser) {
      if (this.withPositions) {
        target.loc.start = first.loc.start;
        target.loc.end = last.loc.end;
        if (this.withSource) {
          target.loc.source = parser.lexer._input.substring(
            target.loc.start.offset,
            target.loc.end.offset
          );
        }
      }
    };
    AST.prototype.resolveLocations = function(target, first, last, parser) {
      if (this.withPositions) {
        if (target.loc.start.offset > first.loc.start.offset) {
          target.loc.start = first.loc.start;
        }
        if (target.loc.end.offset < last.loc.end.offset) {
          target.loc.end = last.loc.end;
        }
        if (this.withSource) {
          target.loc.source = parser.lexer._input.substring(
            target.loc.start.offset,
            target.loc.end.offset
          );
        }
      }
    };
    AST.prototype.resolvePrecedence = function(result, parser) {
      let buffer, lLevel, rLevel;
      if (result.kind === "call") {
        this.resolveLocations(result, result.what, result, parser);
      } else if (result.kind === "propertylookup" || result.kind === "staticlookup" || result.kind === "offsetlookup" && result.offset) {
        this.resolveLocations(result, result.what, result.offset, parser);
      } else if (result.kind === "bin") {
        if (result.right && !result.right.parenthesizedExpression) {
          if (result.right.kind === "bin") {
            lLevel = AST.precedence[result.type];
            rLevel = AST.precedence[result.right.type];
            if (lLevel && rLevel && rLevel <= lLevel && (result.type !== result.right.type || !this.isRightAssociative(result.type))) {
              buffer = result.right;
              result.right = result.right.left;
              this.swapLocations(result, result.left, result.right, parser);
              buffer.left = this.resolvePrecedence(result, parser);
              this.swapLocations(buffer, buffer.left, buffer.right, parser);
              result = buffer;
            }
          } else if (result.right.kind === "retif") {
            lLevel = AST.precedence[result.type];
            rLevel = AST.precedence["?"];
            if (lLevel && rLevel && rLevel <= lLevel) {
              buffer = result.right;
              result.right = result.right.test;
              this.swapLocations(result, result.left, result.right, parser);
              buffer.test = this.resolvePrecedence(result, parser);
              this.swapLocations(buffer, buffer.test, buffer.falseExpr, parser);
              result = buffer;
            }
          }
        }
      } else if ((result.kind === "silent" || result.kind === "cast") && result.expr && !result.expr.parenthesizedExpression) {
        if (result.expr.kind === "bin") {
          buffer = result.expr;
          result.expr = result.expr.left;
          this.swapLocations(result, result, result.expr, parser);
          buffer.left = this.resolvePrecedence(result, parser);
          this.swapLocations(buffer, buffer.left, buffer.right, parser);
          result = buffer;
        } else if (result.expr.kind === "retif") {
          buffer = result.expr;
          result.expr = result.expr.test;
          this.swapLocations(result, result, result.expr, parser);
          buffer.test = this.resolvePrecedence(result, parser);
          this.swapLocations(buffer, buffer.test, buffer.falseExpr, parser);
          result = buffer;
        }
      } else if (result.kind === "unary") {
        if (result.what && !result.what.parenthesizedExpression) {
          if (result.what.kind === "bin") {
            buffer = result.what;
            result.what = result.what.left;
            this.swapLocations(result, result, result.what, parser);
            buffer.left = this.resolvePrecedence(result, parser);
            this.swapLocations(buffer, buffer.left, buffer.right, parser);
            result = buffer;
          } else if (result.what.kind === "retif") {
            buffer = result.what;
            result.what = result.what.test;
            this.swapLocations(result, result, result.what, parser);
            buffer.test = this.resolvePrecedence(result, parser);
            this.swapLocations(buffer, buffer.test, buffer.falseExpr, parser);
            result = buffer;
          }
        }
      } else if (result.kind === "retif") {
        if (result.falseExpr && result.falseExpr.kind === "retif" && !result.falseExpr.parenthesizedExpression) {
          buffer = result.falseExpr;
          result.falseExpr = buffer.test;
          this.swapLocations(result, result.test, result.falseExpr, parser);
          buffer.test = this.resolvePrecedence(result, parser);
          this.swapLocations(buffer, buffer.test, buffer.falseExpr, parser);
          result = buffer;
        }
      } else if (result.kind === "assign") {
        if (result.right && result.right.kind === "bin" && !result.right.parenthesizedExpression) {
          lLevel = AST.precedence["="];
          rLevel = AST.precedence[result.right.type];
          if (lLevel && rLevel && rLevel < lLevel) {
            buffer = result.right;
            result.right = result.right.left;
            buffer.left = result;
            this.swapLocations(buffer, buffer.left, result.right, parser);
            result = buffer;
          }
        }
      } else if (result.kind === "expressionstatement") {
        this.swapLocations(result, result.expression, result, parser);
      }
      return result;
    };
    AST.prototype.prepare = function(kind, docs, parser) {
      let start = null;
      if (this.withPositions || this.withSource) {
        start = parser.position();
      }
      const self = this;
      const result = function() {
        let location = null;
        const args = Array.prototype.slice.call(arguments);
        args.push(docs);
        if (self.withPositions || self.withSource) {
          let src = null;
          if (self.withSource) {
            src = parser.lexer._input.substring(start.offset, parser.prev[2]);
          }
          location = new Location(
            src,
            start,
            new Position2(parser.prev[0], parser.prev[1], parser.prev[2])
          );
          args.push(location);
        }
        if (!kind) {
          kind = args.shift();
        }
        const node = self[kind];
        if (typeof node !== "function") {
          throw new Error('Undefined node "' + kind + '"');
        }
        const astNode = Object.create(node.prototype);
        node.apply(astNode, args);
        result.instance = astNode;
        if (result.trailingComments) {
          astNode.trailingComments = result.trailingComments;
        }
        if (typeof result.postBuild === "function") {
          result.postBuild(astNode);
        }
        if (parser.debug) {
          delete self.stack[result.stackUid];
        }
        return self.resolvePrecedence(astNode, parser);
      };
      if (parser.debug) {
        if (!this.stack) {
          this.stack = {};
          this.stackUid = 1;
        }
        this.stack[++this.stackUid] = {
          position: start,
          stack: new Error().stack.split("\n").slice(3, 5)
        };
        result.stackUid = this.stackUid;
      }
      result.setTrailingComments = function(docs2) {
        if (result.instance) {
          result.instance.setTrailingComments(docs2);
        } else {
          result.trailingComments = docs2;
        }
      };
      result.destroy = function(target) {
        if (docs) {
          if (target) {
            if (!target.leadingComments) {
              target.leadingComments = docs;
            } else {
              target.leadingComments = docs.concat(target.leadingComments);
            }
          } else {
            parser._docIndex = parser._docs.length - docs.length;
          }
        }
        if (parser.debug) {
          delete self.stack[result.stackUid];
        }
      };
      return result;
    };
    AST.prototype.checkNodes = function() {
      const errors = [];
      for (const k in this.stack) {
        if (Object.prototype.hasOwnProperty.call(this.stack, k)) {
          this.stack[k].key = k;
          errors.push(this.stack[k]);
        }
      }
      this.stack = {};
      return errors;
    };
    [
      require_array2(),
      require_arrowfunc(),
      require_assign(),
      require_assignref(),
      require_attribute2(),
      require_attrgroup(),
      require_bin(),
      require_block(),
      require_boolean(),
      require_break(),
      require_byref(),
      require_call(),
      require_case(),
      require_cast(),
      require_catch(),
      require_class2(),
      require_classconstant(),
      require_clone(),
      require_closure(),
      require_comment2(),
      require_commentblock(),
      require_commentline(),
      require_constant(),
      require_constantstatement(),
      require_continue(),
      require_declaration(),
      require_declare(),
      require_declaredirective(),
      require_do(),
      require_echo(),
      require_empty(),
      require_encapsed(),
      require_encapsedpart(),
      require_entry(),
      require_enum2(),
      require_enumcase(),
      require_error(),
      require_eval(),
      require_exit(),
      require_expression(),
      require_expressionstatement(),
      require_for(),
      require_foreach(),
      require_function2(),
      require_global(),
      require_goto(),
      require_halt(),
      require_identifier(),
      require_if2(),
      require_include(),
      require_inline(),
      require_interface(),
      require_intersectiontype(),
      require_isset(),
      require_label(),
      require_list(),
      require_literal(),
      require_lookup(),
      require_magic(),
      require_match(),
      require_matcharm(),
      require_method(),
      require_name(),
      require_namespace2(),
      require_namedargument(),
      require_new(),
      require_node(),
      require_noop(),
      require_nowdoc(),
      require_nullkeyword(),
      require_nullsafepropertylookup(),
      require_number(),
      require_offsetlookup(),
      require_operation(),
      require_parameter(),
      require_parentreference(),
      require_post(),
      require_pre(),
      require_print(),
      require_program(),
      require_property2(),
      require_propertylookup(),
      require_propertystatement(),
      require_reference(),
      require_retif(),
      require_return(),
      require_selfreference(),
      require_silent(),
      require_statement2(),
      require_static(),
      require_staticvariable(),
      require_staticlookup(),
      require_staticreference(),
      require_string(),
      require_switch2(),
      require_throw(),
      require_trait(),
      require_traitalias(),
      require_traitprecedence(),
      require_traituse(),
      require_try2(),
      require_typereference(),
      require_unary(),
      require_uniontype(),
      require_unset(),
      require_usegroup(),
      require_useitem(),
      require_variable2(),
      require_variadic(),
      require_variadicplaceholder(),
      require_while(),
      require_yield(),
      require_yieldfrom()
    ].forEach(function(ctor) {
      AST.prototype[ctor.kind] = ctor;
    });
    module2.exports = AST;
  }
});

// node_modules/php-parser/src/index.js
var require_src = __commonJS({
  "node_modules/php-parser/src/index.js"(exports2, module2) {
    "use strict";
    var lexer = require_lexer();
    var parser = require_parser();
    var tokens = require_tokens2();
    var AST = require_ast();
    function combine(src, to) {
      const keys = Object.keys(src);
      let i = keys.length;
      while (i--) {
        const k = keys[i];
        const val = src[k];
        if (val === null) {
          delete to[k];
        } else if (typeof val === "function") {
          to[k] = val.bind(to);
        } else if (Array.isArray(val)) {
          to[k] = Array.isArray(to[k]) ? to[k].concat(val) : val;
        } else if (typeof val === "object") {
          to[k] = typeof to[k] === "object" ? combine(val, to[k]) : val;
        } else {
          to[k] = val;
        }
      }
      return to;
    }
    var Engine2 = function(options) {
      if (typeof this === "function") {
        return new this(options);
      }
      this.tokens = tokens;
      this.lexer = new lexer(this);
      this.ast = new AST();
      this.parser = new parser(this.lexer, this.ast);
      if (options && typeof options === "object") {
        if (options.parser) {
          if (!options.lexer) {
            options.lexer = {};
          }
          if (options.parser.version) {
            if (typeof options.parser.version === "string") {
              let version = options.parser.version.split(".");
              version = parseInt(version[0]) * 100 + parseInt(version[1]);
              if (isNaN(version)) {
                throw new Error("Bad version number : " + options.parser.version);
              } else {
                options.parser.version = version;
              }
            } else if (typeof options.parser.version !== "number") {
              throw new Error("Expecting a number for version");
            }
            if (options.parser.version < 500 || options.parser.version > 900) {
              throw new Error("Can only handle versions between 5.x to 8.x");
            }
          }
        }
        combine(options, this);
        this.lexer.version = this.parser.version;
      }
    };
    var getStringBuffer = function(buffer) {
      return typeof buffer.write === "function" ? buffer.toString() : buffer;
    };
    Engine2.create = function(options) {
      return new Engine2(options);
    };
    Engine2.parseEval = function(buffer, options) {
      const self = new Engine2(options);
      return self.parseEval(buffer);
    };
    Engine2.prototype.parseEval = function(buffer) {
      this.lexer.mode_eval = true;
      this.lexer.all_tokens = false;
      buffer = getStringBuffer(buffer);
      return this.parser.parse(buffer, "eval");
    };
    Engine2.parseCode = function(buffer, filename, options) {
      if (typeof filename === "object" && !options) {
        options = filename;
        filename = "unknown";
      }
      const self = new Engine2(options);
      return self.parseCode(buffer, filename);
    };
    Engine2.prototype.parseCode = function(buffer, filename) {
      this.lexer.mode_eval = false;
      this.lexer.all_tokens = false;
      buffer = getStringBuffer(buffer);
      return this.parser.parse(buffer, filename);
    };
    Engine2.tokenGetAll = function(buffer, options) {
      const self = new Engine2(options);
      return self.tokenGetAll(buffer);
    };
    Engine2.prototype.tokenGetAll = function(buffer) {
      this.lexer.mode_eval = false;
      this.lexer.all_tokens = true;
      buffer = getStringBuffer(buffer);
      const EOF = this.lexer.EOF;
      const names = this.tokens.values;
      this.lexer.setInput(buffer);
      let token = this.lexer.lex() || EOF;
      const result = [];
      while (token != EOF) {
        let entry = this.lexer.yytext;
        if (Object.prototype.hasOwnProperty.call(names, token)) {
          entry = [names[token], entry, this.lexer.yylloc.first_line];
        }
        result.push(entry);
        token = this.lexer.lex() || EOF;
      }
      return result;
    };
    module2.exports = Engine2;
    module2.exports.tokens = tokens;
    module2.exports.lexer = lexer;
    module2.exports.AST = AST;
    module2.exports.parser = parser;
    module2.exports.combine = combine;
    module2.exports.Engine = Engine2;
    module2.exports.default = Engine2;
  }
});

// src/extension.ts
var vscode4 = __toESM(require("vscode"));

// src/deleteError_logs.ts
var vscode = __toESM(require("vscode"));
function deleteError_logs() {
  const configurations = vscode.workspace.getConfiguration("betterPhpErrorLogger");
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return;
  }
  const document = editor.document;
  const text = document.getText();
  let newText = text;
  if (!text.includes("error_log") && !text.includes("var_dump") && !text.includes("echo") && !text.includes(configurations.defaultVariable.name) && !text.includes(configurations.defaultVariable.value)) {
    vscode.window.showErrorMessage(`Nothing to delete.`);
    return;
  }
  if (text.includes("error_log")) {
    newText = newText.replace(/\r?\n?\berror_log\b\s*\(.*?(?=;)\;\r?\n?/g, ``);
  }
  if (text.includes("var_dump")) {
    newText = newText.replace(/\r?\n?\bob_start\b\s*\(\s*\)\s*\;\s*\bvar_dump\b\s*\(.*\s*\$\bvar_dump_variable\b\s*\=\s*\brtrim\b\s*\(\s*\bob_get_clean\b\(\s*\)\s*\)\s*\;\n?/g, ``);
    newText = newText.replace(/\bvar_dump\b\s*\(.*?(?=;)\;\r?\n?/g, ``);
    newText = newText.replace(`echo $_ob; `, ``);
  }
  if (text.includes(configurations.defaultVariable.name && configurations.defaultVariable.value)) {
    newText = newText.replace(new RegExp(`\r?
?\\${configurations.defaultVariable.name}\\s*=\\s*${configurations.defaultVariable.value}\\s*;\r?
?`, "g"), ``);
  }
  if (newText === text) {
    vscode.window.showErrorMessage(`Nothing to delete.`);
    return;
  }
  const lastLine = document.lineCount - 1;
  const lastLineLastChar = document.lineAt(lastLine).range.end.character;
  editor.edit((editBuilder) => {
    editBuilder.replace(new vscode.Range(0, 0, lastLine, lastLineLastChar), newText);
  });
}

// src/runTheFunctionBasedOnShortcut.ts
var vscode3 = __toESM(require("vscode"));

// src/symbolFinderLoop.ts
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

// src/getIndentation.ts
function getIndentation(editor, document, selectedLine) {
  const selectedLineChars = document.lineAt(selectedLine).text.split("");
  let indentLevel = 0;
  let tabs = false;
  let indentation = "";
  if (selectedLineChars[0] === "	") {
    tabs = true;
  }
  if (tabs) {
    for (const [i, char] of selectedLineChars.entries()) {
      if (i !== 0 && selectedLineChars[i] !== selectedLineChars[i - 1]) {
        break;
      }
      if (char === "	") {
        indentLevel++;
      }
    }
    indentation = "	".repeat(indentLevel);
  } else {
    for (const [i, char] of selectedLineChars.entries()) {
      if (i !== 0 && selectedLineChars[i] !== selectedLineChars[i - 1]) {
        break;
      }
      if (char === " ") {
        indentLevel++;
      }
    }
    indentation = " ".repeat(indentLevel);
  }
  return indentation;
}

// src/isBalanced.ts
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
    } else if (closeBraces.includes(char)) {
      let last = stack.pop();
      if (braceMap[last] !== char) {
        return false;
      }
    }
  }
  return stack.length === 0;
}

// src/getSelectionType.ts
var getSelectionType = (selection, selectedVarName, parsedphpFile) => {
  selectedVarName = selectedVarName.replace("$", "");
  const selectionStartLine = selection.start.line + 1;
  const selectionStartCharacter = selection.start.character;
  const selectionEndLine = selection.end.line + 1;
  const selectionEndCharacter = selection.end.character;
  const correctPosition = (startLine, startColumn, endLine, endColumn) => {
    return startLine === selectionStartLine && startColumn === selectionStartCharacter && endLine === selectionEndLine && endColumn === selectionEndCharacter;
  };
  let selectionType = ``;
  parsedphpFile.children.forEach((child) => {
    if (child.kind === `function`) {
      if (child.arguments.length > 0) {
        child.arguments.forEach((argument) => {
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
  return selectionType;
};

// src/parsePHPfile.ts
var import_php_parser = __toESM(require_src());
var vscode2 = __toESM(require("vscode"));
var parsePHPfile = (file, phpFile) => {
  const parser = new import_php_parser.Engine({
    parser: {
      extractDoc: true,
      php7: true
    },
    ast: {
      withPositions: true
    }
  });
  let parsedphpFile;
  try {
    parsedphpFile = parser.parseCode(phpFile, file);
  } catch (error) {
    vscode2.window.showErrorMessage(error.message);
    return null;
  }
  return parsedphpFile;
};

// src/runTheFunctionBasedOnShortcut.ts
async function runTheFunctionBasedOnShortcut(args, packageJSON) {
  const editor = vscode3.window.activeTextEditor;
  if (!editor) {
    return;
  }
  const document = editor.document;
  if (document.languageId !== "php") {
    return;
  }
  const configurations = vscode3.workspace.getConfiguration("betterPhpErrorLogger");
  const useEchoInstead = args === `useEchoInstead` || args === "printCurrentOutputBufferUseEcho" ? true : false;
  const printWithCallStack = configurations.printWithCallStack;
  const varDumpExportVariable = configurations.varDumpExportVariable;
  const newLinesForEcho = configurations.newLinesForEcho;
  const printCurrentOutputBufferArray = ["printCurrentOutputBuffer", "printCurrentOutputBufferUseEcho"];
  const printCurrentOutputBuffer = printCurrentOutputBufferArray.includes(args);
  const usePHPParserForPositioning = configurations.usePHPParserForPositioning;
  const laravelLog = configurations.laravelLog;
  let parsedphpFile = null;
  if (usePHPParserForPositioning) {
    parsedphpFile = parsePHPfile(document.fileName, document.getText());
    if (parsedphpFile === null) {
      return;
    }
  }
  let errorLogString = `error_log`;
  let selectedLogLevel = laravelLog.laravelLogLevel;
  let lastUseStatementLine;
  const useLogStatement = `use Illuminate\\Support\\Facades\\Log;`;
  if (laravelLog.useLaravelLog && !useEchoInstead) {
    if (laravelLog.chooseLogLevel) {
      const logLevelsEnum = packageJSON.contributes.configuration.properties["betterPhpErrorLogger.laravelLog"].properties.laravelLogLevel.enum;
      selectedLogLevel = await vscode3.window.showQuickPick(logLevelsEnum, {
        placeHolder: `Select log level`
      });
      if (!selectedLogLevel) {
        return;
      }
    }
    if (laravelLog.autoUse) {
      if (!document.getText().includes(useLogStatement)) {
        const useRegex = /use\s+\S+;/g;
        lastUseStatementLine = 0;
        for (let i = 0; i < document.lineCount; i++) {
          const lineText = document.lineAt(i).text;
          if (lineText.match(useRegex)) {
            lastUseStatementLine = i;
          }
        }
      }
    }
    errorLogString = `Log::${selectedLogLevel}`;
  }
  editor.edit((editBuilder) => {
    if (lastUseStatementLine !== void 0) {
      editBuilder.insert(new vscode3.Position(lastUseStatementLine + 1, 0), useLogStatement);
      if (!document.lineAt(lastUseStatementLine + 2).text.match(/^\s*$/)) {
        editBuilder.insert(new vscode3.Position(lastUseStatementLine + 2, 0), `
`);
      }
    }
    const errorLogs = configurations.errorLogs;
    const defaultVariableName = configurations.defaultVariable.name;
    const defaultVariableValue = configurations.defaultVariable.value;
    const logMultiple = configurations.logMultiple;
    let selections = logMultiple === "Only first" ? [editor.selection] : editor.selections;
    let selectedVarString;
    let selectedVar;
    let position = 1;
    if (logMultiple === "As compact array") {
      if (selections.length === 0 || selections.every((selection) => document.getText(selection).trim().length === 0)) {
        vscode3.window.showInformationMessage(`You have to select at least one variable to log when using "Log multiple as array"`);
        return;
      }
      const seletedVariablesString = selections.map((selection) => document.getText(selection));
      selectedVarString = `${selections.length} variables selected: ${seletedVariablesString.join(", ")}`;
      const seletedVariables = seletedVariablesString.map((selection) => `'${selection.replace("$", "")}'`);
      selectedVar = `compact(${seletedVariables.join(", ")})`;
      selections = [selections[selections.length - 1]];
    }
    if (printCurrentOutputBuffer) {
      selectedVarString = `Output buffer`;
      selectedVar = `ob_get_contents()`;
      position = 0;
    }
    let newLine = ``;
    let parantheseLeft = `(`;
    let parantheseRight = `)`;
    let beforeEchos = ``;
    let afterEchos = ``;
    if (useEchoInstead) {
      errorLogString = `echo`;
      parantheseLeft = ` `;
      parantheseRight = ``;
      switch (newLinesForEcho) {
        case `br`:
          newLine = ` . "<br>"`;
          break;
        case `PHP_EOL`:
          newLine = ` . PHP_EOL`;
          break;
        case `pre`:
          beforeEchos = `echo '<pre>';
`;
          afterEchos = `echo '</pre>';
`;
          break;
      }
    }
    let outbutbufferVariable = `$_ob`;
    let getTrace = `getTrace`;
    let print_r_start = `print_r(`;
    let print_r_end = `, true)`;
    if (printWithCallStack !== "With call stack as array") {
      getTrace += `AsString`;
      print_r_start = ``;
      print_r_end = ``;
    }
    selections.forEach((selection) => {
      if (!printCurrentOutputBuffer && logMultiple !== "As compact array") {
        selectedVar = document.getText(selection);
        selectedVarString = selectedVar.replaceAll(`'`, ``).replaceAll(`"`, ``);
      }
      let selectedLine = selection.active.line;
      if (usePHPParserForPositioning && parsedphpFile) {
        const selectionType = getSelectionType(selection, selectedVar, parsedphpFile);
        const selectionTypeToSelectedLine = {
          "function_parameter": symbolFinderLoop(document, selectedLine - 1, "{"),
          "switch_variable": symbolFinderLoop(document, symbolFinderLoop(document, selectedLine - 1, "{") + 2, "}"),
          "assigned_variable": symbolFinderLoop(document, selectedLine, ";")
        };
        selectedLine = selectionTypeToSelectedLine[selectionType] || selectedLine;
      }
      const indentation = getIndentation(editor, document, selectedLine);
      if (!isBalanced(selectedVar)) {
        vscode3.window.showErrorMessage(`Braces in the selected value are not balanced`);
        return;
      }
      if (selectedVar.includes(";")) {
        vscode3.window.showErrorMessage(`The selected value can not include ;`);
        return;
      }
      if (selectedVar.trim().length === 0) {
        selectedVarString = defaultVariableName;
        selectedVar = defaultVariableValue;
        position = 0;
      }
      const dumpOrExport = varDumpExportVariable;
      if (varDumpExportVariable !== "No var dump or export") {
        let varDumpExportSelectedVar = `${dumpOrExport}(${selectedVar})`;
        if (!useEchoInstead) {
          if (dumpOrExport === "var_export") {
            selectedVar = varDumpExportSelectedVar.slice(0, -1) + `, true)`;
          } else {
            let ob_start = `${indentation}ob_start();
`;
            if (printCurrentOutputBuffer) {
              varDumpExportSelectedVar = `${dumpOrExport}(${outbutbufferVariable}=${selectedVar})`;
              ob_start = ``;
            }
            editBuilder.insert(
              new vscode3.Position(selectedLine + position, 0),
              `${ob_start}${indentation}${varDumpExportSelectedVar};
`
            );
            selectedVar = "rtrim(ob_get_clean())";
          }
        } else {
          selectedVar = varDumpExportSelectedVar;
        }
      }
      if (beforeEchos) {
        editBuilder.insert(
          new vscode3.Position(selectedLine + position, 0),
          `${indentation}${beforeEchos}`
        );
      }
      errorLogs.forEach((errorLog) => {
        errorLog = errorLog.replaceAll("${selectedVarString}", selectedVarString).replaceAll("${selectedVar}", selectedVar);
        if (varDumpExportVariable !== "No var dump or export" && useEchoInstead) {
          let selectedVarIndexes = [];
          let selectedVarIndex = errorLog.indexOf(selectedVar);
          while (selectedVarIndex !== -1) {
            selectedVarIndexes.push(selectedVarIndex);
            selectedVarIndex = errorLog.indexOf(selectedVar, selectedVarIndex + 1);
          }
          selectedVarIndexes.forEach((selectedVarIndex2) => {
            let lastPeriod = errorLog.lastIndexOf(".", selectedVarIndex2);
            if (lastPeriod !== -1) {
              errorLog = `${errorLog.substring(0, lastPeriod)},${errorLog.substring(lastPeriod + 1)}`;
            }
          });
        }
        editBuilder.insert(
          new vscode3.Position(selectedLine + position, 0),
          `${indentation}${errorLogString}${parantheseLeft}${errorLog}${newLine}${parantheseRight}; 
`
        );
      });
      if (printWithCallStack === "With call stack as string" || printWithCallStack === "With call stack as array") {
        editBuilder.insert(
          new vscode3.Position(selectedLine + position, 0),
          `${indentation}${errorLogString}${parantheseLeft}${print_r_start} (new \\Exception()) -> ${getTrace}()${newLine}${print_r_end}${parantheseRight}; 
`
        );
      }
      if (afterEchos) {
        editBuilder.insert(
          new vscode3.Position(selectedLine + position, 0),
          `${indentation}${afterEchos}`
        );
      }
      if (printCurrentOutputBuffer && varDumpExportVariable !== "No var dump or export" && dumpOrExport === "var_dump") {
        editBuilder.insert(
          new vscode3.Position(selectedLine + position, 0),
          `echo ${outbutbufferVariable}; 
`
        );
      }
    });
  });
}

// src/extension.ts
function activate(context) {
  const packageJSON = context.extension.packageJSON;
  const betterPhpErrorLoggerVersion = packageJSON.version;
  const previousBetterPhpErrorLoggerVersion = context.globalState.get("betterPhpErrorLoggerVersion");
  if (previousBetterPhpErrorLoggerVersion === void 0 || previousBetterPhpErrorLoggerVersion !== betterPhpErrorLoggerVersion) {
    context.globalState.update("betterPhpErrorLoggerVersion", betterPhpErrorLoggerVersion);
    vscode4.window.showInformationMessage(`Better PHP Error Logger extension has been updated to version ${betterPhpErrorLoggerVersion}. I have changed how things work. Please read the README.md file.`);
  }
  const allCommands = [];
  const toggleCommands = [
    {
      command: "logMultiple",
      title: "Set this to Normal, As compact array or Only first",
      options: [
        "Normal",
        "As compact array",
        "Only first"
      ]
    },
    {
      command: "printWithCallStack",
      title: "Print with call stack",
      options: [
        "No call stack",
        "With call stack as string",
        "With call stack as array"
      ]
    },
    {
      command: "varDumpExportVariable",
      title: "Var dump or export variable",
      options: [
        "No var dump or export",
        "var_dump",
        "var_export"
      ]
    },
    {
      command: "newLinesForEcho",
      title: "New lines for echo",
      options: [
        "none",
        "pre",
        "br",
        "PHP_EOL"
      ]
    }
  ];
  toggleCommands.forEach((toggleCommand) => {
    const toggleCommandDisposable = vscode4.commands.registerCommand(`extension.betterPhpErrorLogger.${toggleCommand.command}`, () => {
      const configuration = vscode4.workspace.getConfiguration("betterPhpErrorLogger");
      const configurationValue = configuration[toggleCommand.command];
      const currentIndex = toggleCommand.options.indexOf(configurationValue);
      let nextIndex = currentIndex + 1;
      if (nextIndex >= toggleCommand.options.length) {
        nextIndex = 0;
      }
      const nextValue = toggleCommand.options[nextIndex];
      configuration.update(toggleCommand.command, nextValue, true);
      vscode4.window.showInformationMessage(`${toggleCommand.title} is now ${nextValue}.`);
    });
    allCommands.push(toggleCommandDisposable);
  });
  const runTheFunctionBasedOnShortcutCommands = [
    "errorLog",
    "useEchoInstead",
    "printCurrentOutputBuffer",
    "printCurrentOutputBufferUseEcho"
  ];
  runTheFunctionBasedOnShortcutCommands.forEach((commandName) => {
    const command = vscode4.commands.registerCommand(`extension.betterPhpErrorLogger.${commandName}`, (args) => {
      if (args === void 0) {
        args = commandName;
      }
      runTheFunctionBasedOnShortcut(args, packageJSON);
    });
    allCommands.push(command);
  });
  const deleteErrorLogs = vscode4.commands.registerCommand(`extension.betterPhpErrorLogger.deleteErrorLogs`, () => {
    deleteError_logs();
  });
  allCommands.push(deleteErrorLogs);
  const quickPick = vscode4.commands.registerCommand(`extension.betterPhpErrorLogger.quickPick`, async () => {
    const items = [...runTheFunctionBasedOnShortcutCommands, "deleteErrorLogs"];
    const quickPickItems = items.map((commandName) => {
      return {
        label: packageJSON.contributes.commands.find((command) => command.command === `extension.betterPhpErrorLogger.${commandName}`).title,
        description: `Default shortcut: ${packageJSON.contributes.keybindings.find((keybinding) => keybinding.command === `extension.betterPhpErrorLogger.${commandName}`).key}`,
        command: commandName
      };
    });
    quickPickItems.sort((a, b) => a.label < b.label ? -1 : a.label > b.label ? 1 : 0);
    const quickPickItem = await vscode4.window.showQuickPick(quickPickItems, {
      placeHolder: "Select a command"
    });
    if (quickPickItem) {
      if (runTheFunctionBasedOnShortcutCommands.includes(quickPickItem.command)) {
        runTheFunctionBasedOnShortcut(quickPickItem.command, packageJSON);
      } else if (quickPickItem.command === "deleteErrorLogs") {
        deleteError_logs();
      }
    }
  });
  allCommands.push(quickPick);
  context.subscriptions.push(...allCommands);
}
exports.activate = activate;
function deactivate() {
}
module.exports = {
  activate,
  deactivate
};
//# sourceMappingURL=main.js.map
