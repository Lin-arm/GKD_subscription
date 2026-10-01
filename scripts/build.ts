import { updateDist } from '@gkd-kit/tools';
import subscription from './check';
import { updateReadMeMd } from './updateReadMeMd';

await updateDist(subscription);

await updateReadMeMd();
