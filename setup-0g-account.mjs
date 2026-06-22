import { ethers } from "ethers";
import { createZGComputeNetworkBroker } from "@0gfoundation/0g-compute-ts-sdk";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function main() {
  const rpcUrl = process.env.OG_RPC_URL || "https://evmrpc-testnet.0g.ai";
  const privateKey = process.env.OG_PRIVATE_KEY;
  const providerAddress = process.env.OG_COMPUTE_PROVIDER_ADDRESS; 

  if (!privateKey || privateKey.includes("your_private_key")) {
    throw new Error("Missing or invalid OG_PRIVATE_KEY in .env.local");
  }
  if (!providerAddress || providerAddress.includes("your_provider")) {
    throw new Error("Missing or invalid OG_COMPUTE_PROVIDER_ADDRESS in .env.local");
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);
  const broker = await createZGComputeNetworkBroker(wallet);

  console.log(`Connected to 0G Network with wallet: ${wallet.address}`);
  
  // 1. Deposit 3.0 OG into the main compute account (minimum required to open account)
  console.log("\n1. Depositing 3.0 OG into Compute Network main account...");
  try {
    // SDK expects a number for depositFund
    await broker.ledger.depositFund(3.0);
    console.log("   ✅ Deposit successful.");
  } catch (e) {
    console.log("   ⚠️ Deposit skipped or failed:", e.message);
  }

  // 2. Transfer 0.05 OG to the provider sub-account
  console.log(`\n2. Transferring 0.05 OG to provider sub-account (${providerAddress})...`);
  try {
    // SDK transferFund expects BigInt in Wei
    const amountWei = ethers.parseEther("0.05");
    await broker.ledger.transferFund(providerAddress, "inference", amountWei);
    console.log("   ✅ Transfer successful.");
  } catch (e) {
    console.log("   ⚠️ Transfer skipped or failed:", e.message);
  }

  // 3. Acknowledge provider
  console.log(`\n3. Acknowledging provider (${providerAddress}) to authorize inference...`);
  try {
    await broker.inference.acknowledgeProviderSigner(providerAddress);
    console.log("   ✅ Acknowledgment successful.");
  } catch (e) {
    console.log("   ⚠️ Acknowledge skipped or failed:", e.message);
  }

  console.log("\n🚀 Setup complete! You can now use the 'Continue' button in Storyfoge.");
}

main().catch(console.error);
