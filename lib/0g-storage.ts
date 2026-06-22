"use server";

import { Indexer, ZgFile } from "@0gfoundation/0g-storage-ts-sdk";
import { ethers } from "ethers";
import { promises as fs } from "fs";
import path from "path";
import os from "os";

export async function saveStoryToStorage(title: string, messages: any[]) {
  const rpcUrl = process.env.OG_RPC_URL || "https://evmrpc-testnet.0g.ai";
  const privateKey = process.env.OG_PRIVATE_KEY;
  // Default to turbo testnet indexer if not specified
  const indexerUrl = process.env.OG_INDEXER_URL || "https://indexer-storage-testnet-turbo.0g.ai";

  if (!privateKey || privateKey.includes("your_private_key")) {
    throw new Error("Missing or invalid OG_PRIVATE_KEY in .env.local");
  }

  // 1. Serialize the entire story to JSON
  const storyData = {
    title,
    createdAt: new Date().toISOString(),
    messages,
  };
  const jsonContent = JSON.stringify(storyData, null, 2);

  // 2. Write to a temporary file because ZgFile in Node requires a file path
  const tempFilePath = path.join(os.tmpdir(), `story-${Date.now()}.json`);
  await fs.writeFile(tempFilePath, jsonContent, "utf-8");

  let file: any = null;
  
  try {
    // 3. Initialize ethers provider and signer
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const signer = new ethers.Wallet(privateKey, provider);

    // 4. Initialize ZgFile and Indexer
    file = await ZgFile.fromFilePath(tempFilePath);
    const indexer = new Indexer(indexerUrl);

    // 5. Upload to 0G Storage
    const [tx, err] = await indexer.upload(file, rpcUrl, signer);

    if (err !== null) {
      throw new Error(`0G Storage Upload Error: ${err}`);
    }

    // 6. Get the root hash for future retrieval
    const [tree, treeErr] = await file.merkleTree();
    if (treeErr !== null) {
      throw new Error(`Merkle Tree Generation Error: ${treeErr}`);
    }

    return {
      success: true,
      rootHash: tree.rootHash(),
      txHash: (tx as any)?.txHash || "",
      indexerUrl: indexerUrl,
    };
  } catch (error: any) {
    console.error("Storage saving error:", error);
    throw new Error(error.message || "Failed to upload story to 0G Storage.");
  } finally {
    // Make sure to close the file to release file descriptor
    if (file) {
      await file.close().catch(() => {});
    }
    // Clean up temporary file
    await fs.unlink(tempFilePath).catch(() => {});
  }
}

export async function loadStoryFromStorage(rootHash: string) {
  const indexerUrl = process.env.OG_INDEXER_URL || "https://indexer-storage-testnet-turbo.0g.ai";

  if (!rootHash || !rootHash.startsWith("0x") || rootHash.length !== 66) {
    throw new Error("Invalid Root Hash format. It must be a 66-character hex string starting with '0x'.");
  }

  const tempFilePath = path.join(os.tmpdir(), `load-story-${Date.now()}.json`);

  try {
    const indexer = new Indexer(indexerUrl);
    
    // The SDK's download method queries the indexer for storage node locations 
    // and fetches the file chunks directly from the decentralized network.
    const err = await indexer.download(rootHash, tempFilePath, false);

    if (err !== null) {
      throw new Error(`Failed to download from 0G Storage Nodes: ${err}`);
    }

    const fileContent = await fs.readFile(tempFilePath, "utf-8");
    const data = JSON.parse(fileContent);

    if (!data.title || !data.messages || !Array.isArray(data.messages)) {
      throw new Error("The downloaded file is not a valid Storyfoge format.");
    }

    return {
      success: true,
      story: {
        title: data.title,
        messages: data.messages,
        createdAt: data.createdAt,
      }
    };
  } catch (error: any) {
    console.error("Storage loading error:", error);
    throw new Error(error.message || "Failed to load story from 0G Storage. It might still be propagating or the hash is incorrect.");
  } finally {
    // Ensure cleanup of the temporary downloaded file
    await fs.unlink(tempFilePath).catch(() => {});
  }
}
