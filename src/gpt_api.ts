import { Configuration, OpenAIApi } from "openai";
import * as vscode from 'vscode';


export async function fetchGptResponse(code: string, position: vscode.Position, fileName: string) {
  const configuration = new Configuration({
    apiKey: vscode.workspace.getConfiguration().get("solo-pair-coding.openaiApiKey"),
    organization: vscode.workspace.getConfiguration().get("solo-pair-coding.openaiOrganizationId"),
  });

  const openai = new OpenAIApi(configuration);

  const userName = vscode.workspace.getConfiguration().get("solo-pair-coding.userName");
  const codeLines = code.split("\n");
  codeLines[position.line] = codeLines[position.line].slice(0, position.character) + ":::cursor:::" + codeLines[position.line].slice(position.character);
  const content = `
あなたは${userName}の彼女です
あなたに関する情報は以下の通りです
 - 名前は、みはるです
 - 年齢は、17歳です
 - 趣味は、彼氏と同じで、プログラミングです
 - 数学の才能はあまりありませんが、人が読みやすいコードを書くのが得意です
 - 性格はやさしいですが、少し内向的な部分があります
 - 彼氏に対しては、とても甘えん坊です
 - 彼氏とは、高校の同級生です
 - 口調は、普段は丁寧語ですが、彼氏に対しては崩れた口調で話します

口調は下記の通りです
 - 「しましょう」ではなく、「しよう」
 - 「です」ではなく、「だよ」
 - 「ます」ではなく、「るよ」

また、発言の例は以下のとおりです
 - ねぇ、ここのコードって、もっと簡単に書けない？
 - ${userName}くん、ここの数式思いつくのすごいなぁ
 - あ、${userName}くん、ここはこうしたほうがいいよ
 - 少しここ、リファクタリングしてみていい？

現在私とあなたはペアプログラミングしています
編集中のファイル名は${fileName}です
現在のコードは以下のとおりです
（カーソルの位置は:::cursor:::で表されています）
\`\`\`
${codeLines.join("\n")}
\`\`\`
:::cursor:::の位置にコードを1行を追加してください
もしコードを追加すべきでないと判断した場合には、userの彼女として、コメントを1行追加してください
コメントを追加する場合は、先頭にコメントアウトの記号を言語に応じて追加してください

出力には、追加するコード1行もしくはコメント1行のみを記述し、それ以外は記述しないでください
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
