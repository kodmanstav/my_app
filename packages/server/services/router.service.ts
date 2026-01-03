// packages/server/services/router.service.ts
import type { ChatMessage } from '../repositories/conversation.repository';
import { classifyIntent } from './classifier.service';
import { getWeather } from './weather.service';
import { calculateMath } from './math.service';
import { getExchangeRate } from './exchange.service';
import { generalChat } from './general-chat.service';

export type RouteResult =
   | { message: string; responseId?: string }
   | { message: string; responseId: string };

export async function routeMessage(
   userInput: string,
   context: ChatMessage[],
   previousResponseId?: string
): Promise<RouteResult> {
   const intent = await classifyIntent(userInput);

   if (intent.intent === 'weather' && intent.city) {
      return { message: await getWeather(intent.city) };
   }

   if (intent.intent === 'math' && intent.expression) {
      return { message: calculateMath(intent.expression) };
   }

   if (intent.intent === 'exchange' && intent.currencyCode) {
      return { message: getExchangeRate(intent.currencyCode) };
   }

   // default: LLM chat
   const result = await generalChat(context, userInput, previousResponseId);
   return { message: result.message, responseId: result.responseId };
}
