# Storyfoge

**Storyfoge** is a decentralized AI-powered story builder built on **0G Network**. It allows users to create, continue, save, and reload interactive stories using decentralized compute and storage.

## Features

- **AI Story Generation** — Powered by 0G Compute for decentralized AI inference
- **Persistent Storage** — Stories are saved permanently on 0G Storage and can be reloaded using a Root Hash
- **Load Previous Stories** — Users can paste a Root Hash to reload any previously saved story
- **Clean & Immersive UI** — Modern dark-themed interface designed for creative storytelling

## How It Uses 0G

- **0G Compute**: Generates story continuations in a decentralized and verifiable way
- **0G Storage**: Stores full story history (title + messages) on the decentralized network
- Stories remain accessible via unique Root Hashes even after the session ends

## Tech Stack

- Next.js 15 (App Router) + TypeScript
- Tailwind CSS
- 0G Storage SDK + 0G Compute SDK
- Deployed on Vercel

## Live Demo

[https://storyfoge.vercel.app/](https://storyfoge.vercel.app/)

## Getting Started (Local Development)

```bash
git clone https://github.com/Cryptojigi/Storyfoge.git
cd Storyfoge
npm install
npm run dev
```

Open http://localhost:3000

Note: You need to set up your .env.local file with valid 0G testnet credentials to use Compute and Storage.
