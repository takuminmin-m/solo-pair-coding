// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { Range } from 'vscode';
import { Configuration, OpenAIApi } from "openai";

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
	 	apiKey: vscode.workspace.getConfiguration().get("solo-pair-coding.openaiApiKey"),
	 	organization: vscode.workspace.getConfiguration().get("solo-pair-coding.openaiOrganizationId"),
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
