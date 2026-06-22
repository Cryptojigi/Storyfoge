import { Indexer, ZgFile } from "@0gfoundation/0g-storage-ts-sdk";
import { ethers } from "ethers";
import fs from "fs/promises";
import os from "os";
import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function testStorage() {
  const rpcUrl = process.env.OG_RPC_URL || "https://evmrpc-testnet.0g.ai";
  const privateKey = process.env.OG_PRIVATE_KEY;
  const indexerUrl = process.env.OG_INDEXER_URL || "https://indexer-storage-testnet-turbo.0g.ai";

  if (!privateKey) throw new Error("Missing private key");

  const tempFilePath = path.join(os.tmpdir(), `test-story-${Date.now()}.json`);
  const testData = { title: "Test Story", messages: [{role: "user", content: "Test"}], createdAt: new Date().toISOString() };
  await fs.writeFile(tempFilePath, JSON.stringify(testData), "utf-8");

  try {
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const signer = new ethers.Wallet(privateKey, provider);

    const file = await ZgFile.fromFilePath(tempFilePath);
    const indexer = new Indexer(indexerUrl);

    console.log("Uploading...");
    const [tx, err] = await indexer.upload(file, rpcUrl, signer);
    
    if (err !== null) {
      console.error("Upload Error:", err);
      return;
    }

    const [tree, treeErr] = await file.merkleTree();
    await file.close();

    if (treeErr !== null) {
      console.error("Tree Error:", treeErr);
      return;
    }

    const rootHash = tree.rootHash();
    console.log("Uploaded! Root Hash:", rootHash);
    console.log("Tx:", tx);

    console.log(`Polling download URL: ${indexerUrl}/download/${rootHash}`);
    
    for (let i = 0; i < 5; i++) {
      console.log(`Attempt ${i + 1}...`);
      const res = await fetch(`${indexerUrl}/download/${rootHash}`);
      if (res.ok) {
        const text = await res.text();
        console.log("Success! Data:", text);
        return;
      } else {
        console.log("Status:", res.status);
      }
      await new Promise(r => setTimeout(r, 5000));
    }
  } catch (e) {
    console.error("Error:", e);
  } finally {
    await fs.unlink(tempFilePath).catch(() => {});
  }
}

testStorage();
