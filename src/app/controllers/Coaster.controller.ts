import { injectable, inject } from 'inversify';
import type { Request, Response } from 'express';

@injectable()
class CoasterController {
  /**
   * Add new coaster action
   * @param {Request} req Request
   * @param {Response} res Response
   */
  public async addCoasterAction(req: Request, res: Response): Promise<void> {
    res.status(200).json({ msg: 'ok' });
  }

  /**
   * Update coaster action
   * @param {Request} req Request
   * @param {Response} res Response
   */
  public async updateCoasterAction(req: Request, res: Response): Promise<void> {
    res.status(200).json({ msg: 'ok' });
  }

  /**
   * Add new wagon action
   * @param {Request} req Request
   * @param {Response} res Response
   */
  public async addWagonAction(req: Request, res: Response): Promise<void> {
    res.status(200).json({ msg: 'ok' });
  }

  /**
   * Delete wagon action
   * @param {Request} req Request
   * @param {Response} res Response
   */
  public async deleteWagonAction(req: Request, res: Response): Promise<void> {
    res.status(200).json({ msg: 'ok' });
  }
}

export default CoasterController;
