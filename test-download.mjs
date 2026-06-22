import { Indexer } from "@0gfoundation/0g-storage-ts-sdk";
import fs from "fs/promises";
import os from "os";
import path from "path";

async function testDownload() {
  const indexerUrl = "https://indexer-storage-testnet-turbo.0g.ai";
  const rootHash = "0xf111b23d2fa24fa4f59a214ae68e2b4de5e82a819ae4033ac4755ecfc8a09b4a";
  const tempFilePath = path.join(os.tmpdir(), `test-dl-${Date.now()}.json`);

  try {
    const indexer = new Indexer(indexerUrl);
    console.log("Downloading via SDK...");
    const err = await indexer.download(rootHash, tempFilePath, false);
    
    if (err !== null) {
      console.error("SDK Download Error:", err);
      return;
    }

    const content = await fs.readFile(tempFilePath, "utf-8");
    console.log("Success! Content:");
    console.log(content);
  } catch (e) {
    console.error("Exception:", e);
  } finally {
    await fs.unlink(tempFilePath).catch(() => {});
  }
}

testDownload();
