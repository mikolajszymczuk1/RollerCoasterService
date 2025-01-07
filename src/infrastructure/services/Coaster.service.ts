import { injectable, inject } from 'inversify';
import type { ICoasterService } from '@/domain/services/ICoaster.service';

@injectable()
class CoasterService implements ICoasterService {}

export default CoasterService;
