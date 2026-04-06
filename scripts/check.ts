import subscription from '../src/subscription';
import { checkSubscription, checkApiVersion } from '@gkd-kit/tools';
import { syncIssueForms } from './updateIssueForms';

await checkApiVersion();

checkSubscription(subscription);
await syncIssueForms('check');

export default subscription;
