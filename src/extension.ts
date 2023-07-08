// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { Range } from 'vscode';
import { Configuration, OpenAIApi } from "openai";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "solo-pair-coding" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('solo-pair-coding.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from solo-pair-coding!');
	});

	context.subscriptions.push(disposable);


	const gptProvider = vscode.languages.registerCompletionItemProvider('plaintext', {

		provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext) {

			const gptCompletion = new vscode.CompletionItem('ai coder');
			getGptResponse("String").then((message) => {
				if (message) {
					gptCompletion.insertText = message.content;
				} else {
					gptCompletion.insertText = "No response from GPT-3.5";
				}
			});

			return [gptCompletion];
		}
	});


	context.subscriptions.push(gptProvider);

	const inlineProvider: vscode.InlineCompletionItemProvider = {
		async provideInlineCompletionItems(document, position, context, token) {
			console.log("inline completion triggered");
			const regexp = /\/\/ \[(.+?),(.+?)\)(.*?):(.*)/;

			if (position.line <= 0) {
				return;
			}

			const result: vscode.InlineCompletionList = {
				items: [],
			};

			let offset = 1;
			while (offset > 0) {
				if (position.line - offset < 0) {
					break;
				}

				const lineBefore = document.lineAt(position.line - offset).text;
				const matches = lineBefore.match(regexp);
				if (!matches) {
					break;
				}
				offset++;

				const start = matches[1];
				const startInt = parseInt(start, 10);
				const end = matches[2];
				const endInt =
					end === '*'
						? document.lineAt(position.line).text.length
						: parseInt(end, 10);

				const flags = matches[3];
				const completeBracketPairs = flags.includes('b');
				const isSnippet = flags.includes('s');
				const text = matches[4].replace(/\\n/g, '\n');

				result.items.push({
					insertText: isSnippet ? new vscode.SnippetString(text) : text,
					range: new Range(position.line, startInt, position.line, endInt),
				});

			}

			return result;
		},
	};

	vscode.languages.registerInlineCompletionItemProvider({ pattern: '**' }, inlineProvider);
}

// This method is called when your extension is deactivated
export function deactivate() {}

async function getGptResponse(code: string) {
	const configuration = new Configuration({
		apiKey: "YOUR API KEY",
		organization: "YOUR ORGANIZATION ID",
	});

	console.log(configuration);

	const openai = new OpenAIApi(configuration);

	const completion = await openai.createChatCompletion({
		model: "gpt-3.5-turbo",
		messages: [{
			role: "user",
			content: "Hello world. Please give me a example of JavaScript code that will print 'Hello world' to the console."
		}]
	});

	console.log(completion);

	return completion.data.choices[0].message;
}
