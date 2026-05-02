# Environment Variables Setup

A step-by-step guide to obtaining each value in `.env.example`.
All services offer free tiers or are free to generate, except OpenAI.

---

## RELAYER_PRIVATE_KEY

The private key for the wallet that deploys the contract and calls `setTokenURI` on Sepolia.

**Cost**: Free.

**Steps**:

1. **Generate a fresh wallet.** The easiest way is with Hardhat's built-in task:

   ```bash
   cd apps/contracts
   npx hardhat accounts
   ```

   Copy one of the generated `Private Key` values.

   Alternatively, export the private key from MetaMask: Account Details → Show Private Key.

2. **Fund it with Sepolia ETH.** Free testnet ETH from a faucet:

   - [alchemy.com/faucets/ethereum-sepolia](https://alchemy.com/faucets/ethereum-sepolia)
   - [sepolia-faucet.pk910.de](https://sepolia-faucet.pk910.de) (PoW faucet, no login)

   Faucets are rate-limited — grab ETH early, not on demo day.

3. **Deploy the contract from this wallet.** After funding:

    ```bash
    pnpm nx run contracts:deploy -- --network sepolia
    ```

   This wallet becomes the contract `owner`, authorized to call `setTokenURI`.

4. **Security.** Keep this key server-side. Add it to Vercel environment variables or `.env.local`.
   Never prefix it with `NEXT_PUBLIC_`.

---

## PINATA_JWT

A JSON Web Token (JWT) for authenticating with the Pinata IPFS pinning API.

**Cost**: Free tier (1 GB storage, 1,000 API requests/month).

**Steps**:

1. **Sign up** at [pinata.cloud](https://pinata.cloud) with email or GitHub.

2. **Create an API key** from the dashboard:
   - Navigate to **Developers** → **API Keys** in the left sidebar.
   - Click **New Key**.
   - Toggle **Admin** privileges on.
   - Name it (e.g., "mintaro-relayer") and click **Create**.

3. **Copy the JWT** from the popup. It starts with `eyJ...` (not an API key + secret pair).
   Store it — Pinata won't show it again.

4. **Add to `.env.local`:**

   ```
   PINATA_JWT=eyJhbGciOiJIUzI1NiIs...
   ```

The `@pinata/sdk` package will be installed when the reveal pipeline is implemented.

---

## OPENAI_API_KEY

Used by the relayer to generate NFT artwork with DALL·E 3.

**Cost**: Not free. Requires a pre-paid account (minimum $5 top-up). DALL·E 3 costs ~$0.04 per image. Set usage limits to avoid surprise bills.

**Steps**:

1. **Sign up** at [platform.openai.com](https://platform.openai.com).

2. **Add credits.** Go to **Settings** → **Billing** → **Add to credit balance**. The minimum is $5.

3. **Generate an API key** at [platform.openai.com/api-keys](https://platform.openai.com/api-keys).
   Click **Create new secret key**, name it, and copy the value.
   Format: `sk-proj-...` or `sk-...`.

4. **Add to `.env.local`:**

   ```
   OPENAI_API_KEY=sk-proj-...
   ```

---

## ETHERSCAN_API_KEY

A free API key from Etherscan used to verify the contract source code on Sepolia Etherscan.

**Cost**: Free.

**Steps**:

1. **Sign up** at [etherscan.io](https://etherscan.io/register).

2. **Generate an API key** at [etherscan.io/myapikey](https://etherscan.io/myapikey).
   Click **Add**, name it (e.g., "mintaro"), and copy the key.

3. **Add to `.env.local`:**

   ```
   ETHERSCAN_API_KEY=YourApiKeyToken
   ```

The deploy script uses this key to automatically verify the contract source on Etherscan after deployment.

---

## SEPOLIA_RPC_URL

A JSON-RPC endpoint for connecting to the Sepolia testnet.

**Cost**: Free (Alchemy and Infura both have generous free tiers).

**Steps**:

1. **Sign up** at [alchemy.com](https://alchemy.com) or [infura.io](https://infura.io).

2. **Create a new app** and select **Ethereum Sepolia** as the network.

3. **Copy the HTTPS endpoint.** Format:

   ```
   https://eth-sepolia.g.alchemy.com/v2/<YOUR_API_KEY>
   ```

4. **Add to `.env.local`:**

   ```
   SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/abc123...
   ```

---

## NEXT_PUBLIC_CONTRACT_ADDRESS

The deployed `AffixNFT` contract address on Sepolia.

**Cost**: Free (just an address string).

**Steps**:

1. **Deploy the contract** (after setting `RELAYER_PRIVATE_KEY` and `SEPOLIA_RPC_URL`):

   ```bash
    pnpm nx run contracts:deploy -- --network sepolia
   ```

2. **Copy the address** from the Hardhat output and add it to `.env.local`:

   ```
   NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
   ```

---

## NEXT_PUBLIC_CHAIN_ID

Defaults to `11155111` (Sepolia). No setup required unless switching networks.

---

## Quick Setup

```bash
# 1. Copy the template
cp .env.example .env.local

# 2. Fill in the values obtained above
# 3. Verify
cat .env.local
```
