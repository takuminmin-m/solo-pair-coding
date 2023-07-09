import { Configuration, OpenAIApi } from "openai";
import * as vscode from 'vscode';


export async function fetchGptResponse(code: string, position: vscode.Position, fileName: string) {
  const configuration = new Configuration({
    apiKey: vscode.workspace.getConfiguration().get("solo-pair-coding.openaiApiKey"),
    organization: vscode.workspace.getConfiguration().get("solo-pair-coding.openaiOrganizationId"),
  });

  const openai = new OpenAIApi(configuration);

  const codeLines = code.split("\n");
  codeLines[position.line] = codeLines[position.line].slice(0, position.character) + ":::cursor:::" + codeLines[position.line].slice(position.character);
  const content = `
あなたはuserの彼氏です
現在私とあなたはペアプログラミングしています
編集中のファイル名は${fileName}です
現在のコードは以下のとおりです
（カーソルの位置は:::cursor:::で表されています）
\`\`\`
${codeLines.join("\n")}
\`\`\`
:::cursor:::の位置にコードを1行を追加してください
もしコードを追加すべきでないと判断した場合には、userの彼女として、コメントを1行追加してください

出力には、追加するコードもしくはコメント1行のみを記述し、それ以外は記述しないでください
`;

  console.log(content);

  const completion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [{
      role: "user",
      content: content
    }],
  });

  console.log(completion);

  return completion.data.choices[0].message;
}
