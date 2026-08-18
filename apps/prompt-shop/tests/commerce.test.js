import test from "node:test";
import assert from "node:assert/strict";
import { PACKS, cartTotal, createCommerceState, toggleCommerceId, validateCheckout } from "../src/features/commerce/commerce.js";

test("commerce state de-duplicates persisted cart and wishlist ids", () => {
  assert.deepEqual(createCommerceState({ cartIds: ["a", "a"], wishlistIds: ["b", "b"] }), { version: 1, cartIds: ["a"], wishlistIds: ["b"] });
});

test("cart toggles inventory and totals selected seed products", () => {
  const first = toggleCommerceId(createCommerceState(), "cartIds", PACKS[0].id);
  const second = toggleCommerceId(first, "cartIds", PACKS[1].id);
  assert.equal(cartTotal(second), PACKS[0].price + PACKS[1].price);
  assert.deepEqual(toggleCommerceId(second, "cartIds", PACKS[0].id).cartIds, [PACKS[1].id]);
});

test("checkout requires inventory, delivery details, and license acceptance", () => {
  assert.equal(validateCheckout({}, createCommerceState()).errors.length, 4);
  const cart = toggleCommerceId(createCommerceState(), "cartIds", PACKS[0].id);
  assert.deepEqual(validateCheckout({ email: "builder@example.com", country: "US", licenseAccepted: true }, cart), { valid: true, errors: [] });
});
