import { Router } from 'express';
import * as taskController from '../../controllers/task.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { loadWorkspace, requireWorkspacePermission } from '../../middleware/workspace.js';

const router = Router({ mergeParams: true });

router.use(authenticate);
router.use('/:workspaceId', loadWorkspace);

router.get('/:workspaceId/analytics', requireWorkspacePermission('tasks:read'), taskController.analytics);
router.get('/:workspaceId/tasks', requireWorkspacePermission('tasks:read'), taskController.list);
router.post('/:workspaceId/tasks', requireWorkspacePermission('tasks:create'), taskController.create);
router.get('/:workspaceId/tasks/:taskId', requireWorkspacePermission('tasks:read'), taskController.getOne);
router.patch('/:workspaceId/tasks/:taskId', requireWorkspacePermission('tasks:update'), taskController.update);
router.delete('/:workspaceId/tasks/:taskId', requireWorkspacePermission('tasks:delete'), taskController.remove);
router.post('/:workspaceId/tasks/reorder', requireWorkspacePermission('tasks:update'), taskController.reorder);
router.post('/:workspaceId/tasks/:taskId/comments', requireWorkspacePermission('tasks:update'), taskController.addComment);

export default router;
