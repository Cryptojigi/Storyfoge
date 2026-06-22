"use server";

import { ethers } from "ethers";
import { createZGComputeNetworkBroker } from "@0gfoundation/0g-compute-ts-sdk";

export type Message = {
  role: "user" | "ai";
  content: string;
};

export async function generateStoryContinuation(messages: Message[]) {
  try {
    const rpcUrl = process.env.OG_RPC_URL || "https://evmrpc-testnet.0g.ai";
    const privateKey = process.env.OG_PRIVATE_KEY;
    // You will need a specific provider address that hosts the model (e.g. Qwen)
    const providerAddress = process.env.OG_COMPUTE_PROVIDER_ADDRESS; 

    if (!privateKey || privateKey === "your_private_key_here") {
      throw new Error("OG_PRIVATE_KEY is not configured in .env.local.");
    }

    if (!providerAddress) {
      throw new Error("OG_COMPUTE_PROVIDER_ADDRESS is not configured in .env.local.");
    }

    // Initialize ethers wallet and 0G broker
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);
    const broker = await createZGComputeNetworkBroker(wallet);

    // Discover the service endpoint and model from the provider
    const { endpoint, model } = await broker.inference.getServiceMetadata(providerAddress);
    
    // Generate authenticated request headers
    const headers = await broker.inference.getRequestHeaders(providerAddress);

    // Format the prompt history for the OpenAI-compatible endpoint
    const apiMessages = [
      { 
        role: "system", 
        content: "You are a creative, engaging AI story builder. Continue the story in an immersive way based on the conversation history." 
      },
      ...messages.map((m) => ({
        role: m.role === "ai" ? "assistant" : "user",
        content: m.content,
      })),
    ];

    // Make the inference call
    const response = await fetch(`${endpoint}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify({
        model,
        messages: apiMessages,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`0G Compute API Error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;

  } catch (error: any) {
    console.error("Story generation error:", error);
    // Return a clear error message that the UI can display
    throw new Error(error.message || "Failed to connect to 0G Compute network.");
  }
}
