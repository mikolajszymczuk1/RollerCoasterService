import { container } from '@/config/container';
import express, { type Router } from 'express';
import { ContainerTypes } from '@/types/common';
import CoasterController from '@/app/controllers/Coaster.controller';

const rollercoasterRouter = (): Router => {
  const coasterController = container.get<CoasterController>(ContainerTypes.CoasterController);

  const router: Router = express.Router();

  router.post('/', coasterController.addCoasterAction.bind(coasterController));

  router.put('/:coasterId', coasterController.updateCoasterAction.bind(coasterController));

  router.post('/:coasterId/wagons', coasterController.addWagonAction.bind(coasterController));

  router.delete('/:coasterId/wagons/:wagonId', coasterController.deleteWagonAction.bind(coasterController));

  return router;
};

export default rollercoasterRouter;
