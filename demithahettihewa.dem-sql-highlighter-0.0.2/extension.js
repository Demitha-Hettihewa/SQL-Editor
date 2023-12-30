"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
const decorationType = vscode.window.createTextEditorDecorationType({
    backgroundColor: "green",
    border: "1px solid #D2FA22",
    color: "#fff",
    fontWeight: "bold",
    fontStyle: "italic",
});
const handler = (editor) => {
    const document = editor.document;
    let decorationsArray = [];
    // get the text in that selected range
    let text = document.getText();
    const selection = editor.selection;
    const lineCount = editor.document.lineCount; 
    const position = editor.selection.active;
    let currentLine = position.line;
    const startLine = selection.start.line;
    const startColumn = selection.start.character;
    let si = document.offsetAt(new vscode.Position(startLine, startColumn));
    const selectedRange = editor.selection;
    
    let cl = currentLine;
    let text1 = '';
    
    const selectedText = editor.document.getText(selectedRange);
    let testStart = 0;
    let testend = 0;
    if (selectedText) {
        while(cl>=0){
            let line1 = document.lineAt(cl).text;
            if (line1.includes("insert into") || line1.includes("Insert into") || line1.includes("INSERT INTO")) {
                testStart = text.indexOf(line1);
                break;
              }
            else{
                cl--;
                text1=document.lineAt(cl).text + text1;
              }
        }

        while (currentLine < lineCount) {
            
            const line = document.lineAt(currentLine).text;
           // vscode.window.showInformationMessage(cl.toString()+"->"+line1.slice(0,10));

            text1 +=line;
            if (line.includes(';')) {
              testend = text.indexOf(line)+line.length;
              break;
            }
            currentLine++;
        
          }
          //vscode.window.showInformationMessage(typeof text+ "   "+ testStart.toString()+ "   "+ testend.toString());
          let co = 0;
          for (let j = 0; j < text1.length; j++) {
              if(text1[j] == '('){
                  if(co >= 1){
                  text1 = text1.substring(0, j) + '@' + text1.substring(j + 1); 
                  }
                  co+=1;
              }
              if(text1[j] == ')'){
                  co-=1;
                  if(co >= 1){
                  text1 = text1.substring(0, j) + '@' + text1.substring(j + 1); 
                  }
                  console.log("foun )", co.toString());
              }
          }
          co = 0;
          for (let j = testStart; j < testend; j++) {
              if(text[j] == '('){
                  if(co >= 1){
                  text = text.substring(0, j) + '@' + text.substring(j + 1); 
                  }
                  co+=1;
              }
              if(text[j] == ')'){
                  co-=1;
                  if(co >= 1){
                  text = text.substring(0, j) + '@' + text.substring(j + 1); 
                  }
                  console.log("foun )", co.toString());
              }
          }
    let columns = [];
    let tempcol = cl;
    let indexOfSelectedColumn;
    let start, end;
    // RegEx pattern to select the column names
    let insertIntoPattern = /\([^\(\)]*\)/g;
    // get the RegExMatching Array
    let insertInto = text1.match(insertIntoPattern);
    // if Array exists
    if (insertInto) {
        let temparr = [];
        let splittedArr = [];
        insertInto.forEach((arr) => {
            temparr = arr.slice(1, arr.indexOf(')'));
            splittedArr.push(temparr.match(/(?:[^,'"\\]|"(?:\\.|[^"])*"|'(?:\\.|[^'])*')+/g)); // regex pattern to split using commas ignoring onse inside quotes.
        });
        splittedArr[0].forEach((col) => { columns.push(col.trim()); });
        indexOfSelectedColumn = columns.indexOf(selectedText);
        // if column is not there we want to exit
        if (indexOfSelectedColumn === -1) {  // we have selected a value
            let temp = si;
            while(text[si] !== ')'){     // find the correct value set
                if(text[si] === ','){
                }
                si++;
            }
            let stemp = temp; 
            while(text[stemp] !== '('){
                if(text[stemp] === ','){
                }
                stemp--;
            }
            let str = text.slice(stemp+1, si-1);
            let x = 0;
            temp = temp - stemp ;
            let dum = "";
            temparr = str.match(/(?:[^,'"\\]|"(?:\\.|[^"])*"|'(?:\\.|[^'])*')+/g);
            for (let j = 0; j < temparr.length; j++) {
                dum = temparr[x];
                if(str.indexOf(dum) +dum.length >= temp){
                    indexOfSelectedColumn = x;  // find the index of the selected value
                    break
                }
                str= str.replace(dum, "@".repeat(dum.length));
                x++;
                
            }
            if(indexOfSelectedColumn === -1){
                indexOfSelectedColumn = temparr.length;
            }
            
            let testLength = indexOfSelectedColumn;
            
                for (let i = 0; i < indexOfSelectedColumn; i++) {
                    testLength = testLength + splittedArr[0].at(i).length;
                }
            let startIndex = text1.indexOf(insertInto[0]) + "(".length + testLength;
                text1 = text1.replace(insertInto[0], "@".repeat(insertInto[0].length));
                start = startIndex; end = startIndex + splittedArr[0].at(indexOfSelectedColumn).length;
                cl = tempcol;
                while(1){
                    let len = document.lineAt(cl).text.length;
                    if(end > len){
                        start-=len;
                        end-=len;
                        cl++;
                    }
                    else{
                        break;
                    }
            }
            let range = new vscode.Range(new vscode.Position(cl, start), new vscode.Position(cl, end)); // found the position of the collumn
            let decoration = { range };
            decorationsArray.push(decoration);

        }
        else {

            for (let j = 1; j < splittedArr.length; j++) {
                let row = splittedArr[j];
                let testLength = indexOfSelectedColumn;
                for (let i = 0; i < indexOfSelectedColumn; i++) {
                    testLength = testLength + row.at(i).length;
                }
                let startIndex = text1.indexOf(insertInto[j]) + "(".length + testLength;
                text1 = text1.replace(insertInto[j], "@".repeat(insertInto[j].length));
                start = startIndex; end = startIndex + row.at(indexOfSelectedColumn).length;
                cl = tempcol;
                while(1){
                    let len = document.lineAt(cl).text.length;
                    if(end > len){
                        start-=len;
                        end-=len;
                        cl++;
                    }
                    else{
                        break;
                    }
            }
            let range = new vscode.Range(new vscode.Position(cl, start), new vscode.Position(cl, end));
            let decoration = { range };
            decorationsArray.push(decoration);
            
        }
    }
    }
    else{
        vscode.window.showInformationMessage("There might be a error with your selection");
    }
}
editor.setDecorations(decorationType, decorationsArray);
};

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand("dem-sql-highlighter.highlightValue", () => {
        // The code you place here will be executed every time your command is executed
        // Display a message box to the user
        const editor = vscode.window.activeTextEditor;
        //if there is no editor open curently, exit the function
        if (!editor) {
            console.log('editor is not open');
            return;
        }
        else {
            // get the text inside the document
            // Display a message box to the user
            const openEditor = vscode.window.visibleTextEditors.filter(editor => editor.document.uri === editor.document.uri)[0];
            handler(openEditor);
        }
    });
    context.subscriptions.push(disposable);
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map