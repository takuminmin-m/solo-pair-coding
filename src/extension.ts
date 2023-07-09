// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { Range } from 'vscode';
import * as gptApi from './gpt_api';

let counter = 0;

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "solo-pair-coding" is now active!');

	const inlineProvider: vscode.InlineCompletionItemProvider = {
		async provideInlineCompletionItems(document, position, context, token) {
			console.log("inline completion triggered");

			const result: vscode.InlineCompletionList = {
				items: [],
			};

			await gptApi.fetchGptResponse("String").then((message) => {
				if (message && message.content) {

					result.items.push({
						insertText: message.content,
					});
				} else {
					const exceptionText = "No response from GPT-3.5";
					result.items.push({
						insertText: exceptionText
					});
				}
			});

			console.log(result);

			return result;
		},
	};

	vscode.languages.registerInlineCompletionItemProvider({ pattern: '**' }, inlineProvider);

}

// This method is called when your extension is deactivated
export function deactivate() {}
