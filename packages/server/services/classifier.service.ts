// packages/server/services/classifier.service.ts
import fs from 'fs';
import path from 'path';
import { llmClient } from '../llm/client';

export type IntentResult = {
   intent: 'weather' | 'math' | 'exchange' | 'general';
   city: string | null;
   expression: string | null;
   currencyCode: string | null;
};

const classifierPrompt = fs.readFileSync(
   path.join(__dirname, '../prompts/classifier.txt'),
   'utf-8'
);

function normalizeIntent(x: any): IntentResult['intent'] {
   return x === 'weather' || x === 'math' || x === 'exchange' || x === 'general'
      ? x
      : 'general';
}

function safeString(x: any): string | null {
   return typeof x === 'string' && x.trim().length > 0 ? x.trim() : null;
}

export async function classifyIntent(userInput: string): Promise<IntentResult> {
   const response = await llmClient.generateText({
      model: 'gpt-4.1',
      instructions: classifierPrompt,
      prompt: userInput,
      temperature: 0,
      maxTokens: 120,
      // ❗️IMPORTANT: no previousResponseId here (classifier must be stateless)
   });

   let parsed: any;
   try {
      parsed = JSON.parse(response.text);
   } catch {
      return {
         intent: 'general',
         city: null,
         expression: null,
         currencyCode: null,
      };
   }

   return {
      intent: normalizeIntent(parsed.intent),
      city: safeString(parsed.city),
      expression: safeString(parsed.expression),
      currencyCode: safeString(parsed.currencyCode)?.toUpperCase() ?? null,
   };
}
