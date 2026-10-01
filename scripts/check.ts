import { checkApiVersion, checkSubscription } from '@gkd-kit/tools';
import subscription from '../src/subscription';

await checkApiVersion();

checkSubscription(subscription);

export default subscription;
