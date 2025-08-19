import express from 'express';
import groupsController from '../controller/groupsController.js';

const router = express.Router();

router.get('/', GroupsController.getAllGroups);
router.get('/:groupId', GroupsController.getGroupById);

export default router;
