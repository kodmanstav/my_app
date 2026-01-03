// packages/server/services/general-chat.service.ts
import fs from 'fs';
import path from 'path';
import type { ChatMessage } from '../repositories/conversation.repository';
import { llmClient } from '../llm/client';

const chatbotPrompt = fs.readFileSync(
   path.join(__dirname, '../prompts/chatbot.txt'),
   'utf-8'
);

type GeneralChatResult = {
   message: string;
   responseId: string;
};

function buildTranscript(messages: ChatMessage[]): string {
   return messages
      .map((m) =>
         m.role === 'user' ? `User: ${m.content}` : `Assistant: ${m.content}`
      )
      .join('\n');
}

export async function generalChat(
   context: ChatMessage[],
   userInput: string,
   previousResponseId?: string
): Promise<GeneralChatResult> {
   const transcript = buildTranscript(context);

   const prompt = transcript.length
      ? `${transcript}\nUser: ${userInput}\nAssistant:`
      : `User: ${userInput}\nAssistant:`;

   const response = await llmClient.generateText({
      model: 'gpt-4.1',
      instructions: chatbotPrompt,
      prompt,
      temperature: 0.7,
      maxTokens: 300,
      previousResponseId, // ✅ only here
   });

   return { message: response.text, responseId: response.id };
}
