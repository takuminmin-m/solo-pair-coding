import { Configuration, OpenAIApi } from "openai";
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';


export async function fetchGptResponse(code: string, position: vscode.Position, fileName: string) {
  const configuration = new Configuration({
    apiKey: vscode.workspace.getConfiguration().get("solo-pair-coding.openaiApiKey"),
    organization: vscode.workspace.getConfiguration().get("solo-pair-coding.openaiOrganizationId"),
  });

  const openai = new OpenAIApi(configuration);
  const content = await generatePrompt(code, position, fileName);

  console.log(content);

  const completion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [{
      role: "system",
      content: content
    }],
  });

  console.log(completion);

  return completion.data.choices[0].message;
}

async function generatePrompt(code: string, position: vscode.Position, fileName: string) {
  const characterName = vscode.workspace.getConfiguration().get("solo-pair-coding.characterName");
  const extensionRoot = vscode.extensions.getExtension("takuminmin0718.solo-pair-coding")?.extensionPath;
  const promptPath = path.join(
    String(extensionRoot),
    "character_prompts",
    `${characterName}.txt`
  );

  const userName = vscode.workspace.getConfiguration().get("solo-pair-coding.userName");
  const codeLines = code.split("\n");
  codeLines[position.line] = codeLines[position.line].slice(0, position.character) +
  ":::cursor:::" +
  codeLines[position.line].slice(position.character);

  const promptTemplete = await fs.promises.readFile(promptPath, "utf-8");
  console.log(promptTemplete);
  const promptParams = {
    userName: String(userName),
    fileName: fileName,
    code: codeLines.join("\n"),
  };


  return replacePlaceholders(promptTemplete, promptParams);
};

async function replacePlaceholders(templete: string, params: Record<string, string>): Promise<string> {
  console.log(params);
  try {
    const replacedContent = templete.replace(/\${(.*?)}/g, (_, placeholder) => {
      return params[placeholder] || '';
    });
    return replacedContent;
  } catch (error) {
    throw new Error(`Error reading or replacing placeholders in file: ${error}`);
  }
}
