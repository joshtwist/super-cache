import { CachingInboundPolicy, CachingInboundPolicyOptions, HttpProblems, ZuploContext, ZuploRequest} from "@zuplo/runtime";
import { cacheKeyLoader } from "./cache-keys";

type MyPolicyOptionsType = {
  myOption: any;
};

export default async function policy(
  request: ZuploRequest,
  context: ZuploContext,
  noOptions: never,
  policyName: string
) {

  const customerId = request.user.data.customerId;
  const applicationId = request.headers.get('application-id');

  if (!customerId) {
    throw new Error(`No customerId found in user metadata`);
  }

  if (!applicationId) {
    return HttpProblems.badRequest(request, context, { detail: "No application-id header provided"});
  }

  const cacheKeys = await cacheKeyLoader.get("all");

  const cacheKey = cacheKeys.find(ck => ck.applicationId === applicationId && ck.customerId === customerId);

  if (!cacheKey) {
    throw new Error(`No cacheKey found for customer '${customerId}' and application '${applicationId}'`);
  }

  const options: CachingInboundPolicyOptions = {
    "cacheHttpMethods": [
      "GET"
    ],
    cacheId: cacheKey.cacheKey,
    expirationSecondsTtl: cacheKey.ttlSeconds ?? 60 // default to 60s
  }

  const result = await CachingInboundPolicy(request, context, options, policyName);
  const hit = (result instanceof Response) ? true : false;

  context.log.info({ cacheHit : hit, cacheKey });

  return result;
}
