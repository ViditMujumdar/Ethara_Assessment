import { Router } from 'express';
import * as workspaceController from '../../controllers/workspace.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { loadWorkspace, requireWorkspacePermission } from '../../middleware/workspace.js';

const router = Router();

router.use(authenticate);

router.post('/', workspaceController.create);
router.get('/', workspaceController.list);
router.get('/:workspaceId', workspaceController.getOne);
router.patch('/:workspaceId', loadWorkspace, requireWorkspacePermission('workspace:update'), workspaceController.update);
router.delete('/:workspaceId', loadWorkspace, requireWorkspacePermission('workspace:delete'), workspaceController.remove);
router.post('/:workspaceId/invite', loadWorkspace, requireWorkspacePermission('members:invite'), workspaceController.invite);
router.post('/:workspaceId/accept-invite', workspaceController.acceptInvitation);
router.delete('/:workspaceId/members/:memberId', loadWorkspace, requireWorkspacePermission('members:remove'), workspaceController.removeMember);
router.patch('/:workspaceId/members/:memberId', loadWorkspace, requireWorkspacePermission('members:update_role'), workspaceController.updateRole);

export default router;
