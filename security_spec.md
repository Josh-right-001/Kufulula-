# KUFULULA Firebase Security Specification

## 1. Data Invariants

1. **Test Collection**: Anyone can read `/test/connection` to assert backend reachability.
2. **Products Access**:
   - Anyone (guest or authenticated) can read published products.
   - Anyone can increment the `likesCount` or add a comment as long as no other administrative fields are touched (e.g. `price`, `title`).
   - Administrative modification (create, full update, delete) requires being an authenticated User.
3. **Transactions (Escrow/KYC Tickets)**:
   - Anyone can create a transaction ticket to complete an escrow deposit.
   - Only the creator (by matching email or authenticated uid) or an administrator can read/edit their transaction tickets.
   - Key attributes of identity and pricing must be structurally valid.

---

## 2. The "Dirty Dozen" Threat Payloads

Any request matching the following cases must be rejected:
1. **Product - Spurious Fields**: Non-existent properties injected during creation.
2. **Product - Shadow Price Cut**: Attempt to modify a product's price without administrative auth.
3. **Product - ID Poisoning**: Oversized document IDs (exceeding 128 characters or containing illegal characters).
4. **Product - Negative Price**: Setting product pricing fields below zero.
5. **Product - Invalid Type**: Providing a string value for `likesCount`.
6. **Product - Overwrite System Fields**: Forcing custom historical timestamps for `createdAt` during insert.
7. **Transaction - Missing Fields**: Sending transactions without critical KYC status and contact fields on creation.
8. **Transaction - PII Blanket Read**: Attempt by an unauthenticated user to read user transactional details.
9. **Transaction - Overwrite Status**: Skipping state flow or setting escrow arbitrary values without verification.
10. **Transaction - ID Injection**: Massive base64 string used as the document identifier.
11. **Transaction - Negative Price Verification**: Attempt to file a negative-priced cash voucher.
12. **System Safeguard**: Direct bypass of document validation checks using customized root-level client schemas.

---

## 3. Test Cases (TDD Verification Scaffold)

These tests define the validation expectations which `firestore.rules` satisfies:
- `test_products_public_read`: Succeeds for guests.
- `test_products_priveleged_writes`: Denies non-admin edits.
- `test_products_public_likes_increment`: Succeeds for guests when restricted only to `likesCount`.
- `test_transactions_ownership_boundary`: Restricts guest reads of arbitrary sensitive payment vouchers.
