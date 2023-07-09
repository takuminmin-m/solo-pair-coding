import { Configuration, OpenAIApi } from "openai";
import * as vscode from 'vscode';


export async function fetchGptResponse(code: string) {
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
