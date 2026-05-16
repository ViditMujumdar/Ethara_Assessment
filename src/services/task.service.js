import Task from '../models/Task.js';
import { ApiError } from '../utils/ApiError.js';

const buildFilter = (workspaceId, query) => {
  const filter = { workspace: workspaceId };
  if (query.status) filter.status = query.status;
  if (query.priority) filter.priority = query.priority;
  if (query.assignee) filter.assignee = query.assignee;
  if (query.labels) filter.labels = { $in: query.labels.split(',') };
  if (query.search) {
    filter.$text = { $search: query.search };
  }
  if (query.dueFrom || query.dueTo) {
    filter.dueDate = {};
    if (query.dueFrom) filter.dueDate.$gte = new Date(query.dueFrom);
    if (query.dueTo) filter.dueDate.$lte = new Date(query.dueTo);
  }
  return filter;
};

export const createTask = async (workspaceId, userId, data) => {
  const maxPosition = await Task.findOne({ workspace: workspaceId, status: data.status || 'todo' })
    .sort({ position: -1 })
    .select('position');
  const task = await Task.create({
    ...data,
    workspace: workspaceId,
    createdBy: userId,
    position: (maxPosition?.position ?? -1) + 1,
    activityLogs: [{ action: 'created', user: userId }],
  });
  return task.populate('assignee createdBy', 'name email avatar');
};

export const getTasks = async (workspaceId, query) => {
  const page = parseInt(query.page) || 1;
  const limit = Math.min(parseInt(query.limit) || 50, 100);
  const skip = (page - 1) * limit;
  const filter = buildFilter(workspaceId, query);
  const sortField = query.sortBy || 'position';
  const sortOrder = query.sortOrder === 'desc' ? -1 : 1;

  const [tasks, total] = await Promise.all([
    Task.find(filter)
      .populate('assignee createdBy', 'name email avatar')
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(limit),
    Task.countDocuments(filter),
  ]);

  return { tasks, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
};

export const getTaskById = async (taskId, workspaceId) => {
  const task = await Task.findOne({ _id: taskId, workspace: workspaceId })
    .populate('assignee createdBy comments.user', 'name email avatar')
    .populate('dependencies', 'title status');
  if (!task) throw ApiError.notFound('Task not found');
  return task;
};

export const updateTask = async (taskId, workspaceId, userId, data) => {
  const task = await getTaskById(taskId, workspaceId);
  Object.assign(task, data);
  task.activityLogs.push({ action: 'updated', user: userId, details: data });
  await task.save();
  return task.populate('assignee createdBy', 'name email avatar');
};

export const deleteTask = async (taskId, workspaceId) => {
  const task = await Task.findOneAndDelete({ _id: taskId, workspace: workspaceId });
  if (!task) throw ApiError.notFound('Task not found');
  return task;
};

export const reorderTasks = async (workspaceId, updates) => {
  const bulkOps = updates.map(({ id, status, position }) => ({
    updateOne: {
      filter: { _id: id, workspace: workspaceId },
      update: { $set: { status, position } },
    },
  }));
  await Task.bulkWrite(bulkOps);
  return getTasks(workspaceId, { limit: 200 });
};

export const addComment = async (taskId, workspaceId, userId, content) => {
  const task = await getTaskById(taskId, workspaceId);
  task.comments.push({ user: userId, content });
  await task.save();
  return task.populate('comments.user', 'name email avatar');
};

export const getAnalytics = async (workspaceId) => {
  const stats = await Task.aggregate([
    { $match: { workspace: workspaceId } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);
  const priorityStats = await Task.aggregate([
    { $match: { workspace: workspaceId } },
    { $group: { _id: '$priority', count: { $sum: 1 } } },
  ]);
  const completionTrend = await Task.aggregate([
    { $match: { workspace: workspaceId, status: 'done' } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$updatedAt' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    { $limit: 30 },
  ]);
  return { statusStats: stats, priorityStats, completionTrend };
};

export default { createTask, getTasks, getTaskById, updateTask, deleteTask, reorderTasks, addComment, getAnalytics };
