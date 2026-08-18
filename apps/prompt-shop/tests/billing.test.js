import test from "node:test";
import assert from "node:assert/strict";
import { MemoryUserRepository } from "../server/auth/repositories.js";
import { StripeBillingService } from "../server/billing/StripeBillingService.js";

function fakeStripe() {
  const calls=[];
  return { calls, checkout:{ sessions:{ create:async(input)=>{calls.push(input);return {url:"https://checkout.stripe.test/session"};} } }, billingPortal:{ sessions:{ create:async()=>({url:"https://billing.stripe.test/portal"}) } }, webhooks:{ constructEvent:(body,signature)=>{ if(signature!=="valid") throw new Error("bad signature"); return JSON.parse(body.toString()); } } };
}

test("Stripe Checkout uses the server-configured Pro price and internal user id", async () => {
  const repository=new MemoryUserRepository(); const stripe=fakeStripe();
  const service=new StripeBillingService({repository,webhookSecret:"whsec",priceId:"price_server_owned",appUrl:"https://wise.test",stripeClient:stripe});
  const url=await service.createCheckout({id:"user-1",email:"wise@example.com"});
  assert.equal(url,"https://checkout.stripe.test/session");
  assert.equal(stripe.calls[0].mode,"subscription");
  assert.equal(stripe.calls[0].line_items[0].price,"price_server_owned");
  assert.equal(stripe.calls[0].client_reference_id,"user-1");
});

test("verified Stripe lifecycle events activate and revoke clean-download entitlement", async () => {
  const repository=new MemoryUserRepository(); const service=new StripeBillingService({repository,webhookSecret:"whsec",priceId:"price",appUrl:"https://wise.test",stripeClient:fakeStripe()});
  await service.handleEvent({type:"checkout.session.completed",data:{object:{mode:"subscription",client_reference_id:"user-1",customer:"cus_1",subscription:"sub_1"}}});
  assert.equal((await repository.getImageEntitlement("user-1")).active,true);
  assert.equal(await repository.findUserIdByStripeCustomer("cus_1"),"user-1");
  await service.handleEvent({type:"invoice.payment_failed",data:{object:{customer:"cus_1"}}});
  assert.equal((await repository.getImageEntitlement("user-1")).active,false);
  await service.handleEvent({type:"customer.subscription.updated",data:{object:{id:"sub_1",customer:"cus_1",status:"active",current_period_end:2_000_000_000,metadata:{}}}});
  assert.equal((await repository.getImageEntitlement("user-1")).active,true);
  await service.handleEvent({type:"customer.subscription.deleted",data:{object:{id:"sub_1",customer:"cus_1",status:"canceled",metadata:{}}}});
  assert.equal((await repository.getImageEntitlement("user-1")).active,false);
});

test("Stripe webhook construction rejects an invalid signature", () => {
  const service=new StripeBillingService({repository:new MemoryUserRepository(),webhookSecret:"whsec",priceId:"price",appUrl:"https://wise.test",stripeClient:fakeStripe()});
  assert.throws(()=>service.constructEvent(Buffer.from("{}"),"invalid"));
});
