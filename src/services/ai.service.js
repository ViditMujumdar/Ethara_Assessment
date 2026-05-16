import OpenAI from 'openai';
import { config } from '../config/index.js';
import AIUsage from '../models/AIUsage.js';
import { ApiError } from '../utils/ApiError.js';

let openai = null;
const getOpenAI = () => {
  if (!openai && config.openaiApiKey) {
    openai = new OpenAI({ apiKey: config.openaiApiKey });
  }
  return openai;
};

const trackUsage = async (userId, workspaceId, feature, tokensUsed, provider = 'openai') => {
  await AIUsage.create({ user: userId, workspace: workspaceId, feature, tokensUsed, provider });
};

export const summarizeTask = async (userId, workspaceId, taskDescription) => {
  const client = getOpenAI();
  if (!client) throw ApiError.internal('AI service not configured');

  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'Summarize this task concisely for a project manager.' },
      { role: 'user', content: taskDescription },
    ],
    max_tokens: 200,
  });

  const summary = response.choices[0]?.message?.content;
  await trackUsage(userId, workspaceId, 'summarize', response.usage?.total_tokens || 0);
  return summary;
};

export const breakdownTask = async (userId, workspaceId, taskTitle) => {
  const client = getOpenAI();
  if (!client) throw ApiError.internal('AI service not configured');

  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'Break down this task into 3-7 actionable subtasks. Return JSON array of strings only.' },
      { role: 'user', content: taskTitle },
    ],
    max_tokens: 500,
  });

  const content = response.choices[0]?.message?.content || '[]';
  await trackUsage(userId, workspaceId, 'breakdown', response.usage?.total_tokens || 0);
  try {
    return JSON.parse(content);
  } catch {
    return content.split('\n').filter(Boolean);
  }
};

export const prioritizeTasks = async (userId, workspaceId, tasks) => {
  const client = getOpenAI();
  if (!client) throw ApiError.internal('AI service not configured');

  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'Prioritize these tasks. Return JSON with task ids ordered by priority and reasoning.' },
      { role: 'user', content: JSON.stringify(tasks) },
    ],
    max_tokens: 800,
  });

  await trackUsage(userId, workspaceId, 'prioritize', response.usage?.total_tokens || 0);
  return response.choices[0]?.message?.content;
};

export const chatAssistant = async (userId, workspaceId, messages) => {
  const client = getOpenAI();
  if (!client) throw ApiError.internal('AI service not configured');

  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'You are TaskFlow AI assistant. Help with productivity and task management.' },
      ...messages,
    ],
    max_tokens: 1000,
  });

  await trackUsage(userId, workspaceId, 'chat', response.usage?.total_tokens || 0);
  return response.choices[0]?.message?.content;
};

export const meetingNotesToTasks = async (userId, workspaceId, notes) => {
  const client = getOpenAI();
  if (!client) throw ApiError.internal('AI service not configured');

  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'Extract actionable tasks from meeting notes. Return JSON array of {title, description, priority}.' },
      { role: 'user', content: notes },
    ],
    max_tokens: 1000,
  });

  await trackUsage(userId, workspaceId, 'meeting_notes', response.usage?.total_tokens || 0);
  try {
    return JSON.parse(response.choices[0]?.message?.content || '[]');
  } catch {
    return [];
  }
};

export default { summarizeTask, breakdownTask, prioritizeTasks, chatAssistant, meetingNotesToTasks };
