// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { Range } from 'vscode';
import { Configuration, OpenAIApi } from "openai";

let counter = 0;

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
			fetchGptResponse("String").then((message) => {
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

			const result: vscode.InlineCompletionList = {
				items: [],
			};

			await fetchGptResponse("String").then((message) => {
				if (message && message.content) {
					result.items.push({
						insertText: message.content,
						range: new Range(position.line, position.character, position.line, position.character + String(message.content).length),
					});
				} else {
					const exceptionText = "No response from GPT-3.5";
					result.items.push({
						insertText: exceptionText,
						range: new Range(position.line, position.character, position.line, position.character + exceptionText.length),
					});
				}
			});

			result.items.push({
				insertText: "Hello world" + String(counter++),
				range: new Range(position.line, position.character, position.line, position.character + "Hello world".length + 1),
			});

			return result;
		},
	};

	vscode.languages.registerInlineCompletionItemProvider({ pattern: '**' }, inlineProvider);
}

// This method is called when your extension is deactivated
export function deactivate() {}

async function fetchGptResponse(code: string) {
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
			content: "Please give me a example of JavaScript code that will print 'Hello world' to the console. Your reply must be single line."
		}]
	});

	console.log(completion);

	return completion.data.choices[0].message;
}
