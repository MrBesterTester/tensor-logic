# Tensor Logic Demo - Development Prompts

<!-- TOC -->

- [First Shot - with Opus 4.5 in Cursor](#first-shot-with-opus-45-in-cursor)
  - [Consolidated Prompt](#consolidated-prompt)
  - [Summary of Generated Features](#summary-of-generated-features)
- [Performance - with Auto mode in Cursor](#performance-with-auto-mode-in-cursor)
  - [Unified Performance Optimization Analysis Prompt](#unified-performance-optimization-analysis-prompt)
  - [Summary of Generated Analysis](#summary-of-generated-analysis)

<!-- /TOC -->
This document consolidates the prompts used to generate the Tensor Logic educational web application.

---

## First Shot - with Opus 4.5 in Cursor

### Consolidated Prompt

> Create an interactive educational demo of Prof. Emeritus Pedro Domingos' Tensor Logic, based on his paper [Tensor Logic: The Language of AI](https://arxiv.org/pdf/2510.12269).
>
> The demo should feature many of the wide range of Machine Learning algorithms that Tensor Logic is capable of expressing, including the Transformer architecture.
>
> For each example, provide:
> 1. The Tensor Logic code
> 2. A brief explanation of the machine learning algorithm that a professional software engineer with a Masters in Computer Science and an undergraduate degree in Philosophy with a minor in Mathematics (specializing in symbolic and mathematical logic) would understand—but who is quite unfamiliar with Machine Learning or Artificial Intelligence.
>
> **Technical Requirements:**
> - Implementation in TypeScript that compiles without any errors, warnings, or lint issues
> - If a backend is needed, create it in Rust (also free of errors, warnings, or lint)
> - Include clickable links to the paper titled "Tensor Logic: The Language of AI" at https://arxiv.org/pdf/2510.12269
> - Attribute the work to Prof. Emeritus Pedro Domingos (University of Washington)
>
> **Source Material:** Upload `docs/2510.12269v3.pdf` (the Tensor Logic paper)

### Summary of Generated Features

The prompt above resulted in:

1. **Core Tensor Logic Engine** (`src/tensor-logic/core.ts`)
   - Einstein summation (einsum) implementation
   - Tensor operations: threshold, sigmoid, relu, softmax
   - Matrix operations: add, multiply, scale, transpose

2. **7 Interactive Examples**
   - **Symbolic AI:** Logic Programming (Ancestor/Parent relationships)
   - **Neural Networks:** Multi-Layer Perceptron (XOR problem)
   - **Neural Networks:** Transformer Self-Attention
   - **Neural Networks:** Multi-Head Attention
   - **Probabilistic:** Bayesian Networks (Student network)
   - **Probabilistic:** Hidden Markov Models (Weather/Umbrella)
   - **Hybrid:** Kernel Machines / SVM (RBF kernel classification)

3. **Educational UI**
   - Dark-themed scholarly aesthetic
   - Step-by-step execution visualization
   - Tensor output displays
   - Explanations for CS/Math/Philosophy background

4. **Tech Stack**
   - TypeScript + Vite
   - No external ML dependencies
   - Pure tensor operations from scratch

---

## Performance - with Auto mode in Cursor

### Unified Performance Optimization Analysis Prompt

> Even assuming that the ML examples in the Tensor Logic project are correct, they are likely to perform slowly without using GPU technology since it uses TypeScript and doesn't import any GPU libraries. (Please confirm.) This is expected to happen in cases where the tensor matrices used are very dense (not sparse). 
>
> Please evaluate the feasibility of the following options to achieve a practical performance boost:
>
> - **Option 1:** Write a preprocessor of Tensor Logic using PyTorch or TensorFlow. (Domingos suggested this in the MLST interview.)
> - **Option 2:** Decide if a backend in this app is possible and write just the backend in CUDA or Mojo.
> - **Option 3:** Implement Tensor Logic in Mathematica and use its native, elegant ML objects.
>   - Please review this chat in Perplexity.ai about the specific suggestion.
> - **Option 4:** Implement Tensor Logic in Mojo. This is probably more like Option 1.
>
> **Additional Considerations:**
> - The app is in TypeScript and will be hosted on Shuttle.dev or similar static hosting
> - Does TensorFlow have a TypeScript counterpart?
> - How does WebGPU work with hosting? Does it assume the hosting service has GPUs available, or is GPU usage resolved by referring to some other server that has GPUs?
> - What would the expected performance be for:
>   - M1 iMac for WebGPU
>   - Linux machine with a standard NVIDIA card
>   - 15" 2018 Intel-based MacBook Pro with Radeon Pro Vega 20 4 GB and Intel UHD Graphics 630 1536 MB
>
> **Deliverables:**
> - Comprehensive feasibility analysis of all options
> - Performance comparison across different hardware configurations
> - Detailed explanation of how WebGPU works (client-side vs server-side)
> - Implementation guidance with code examples
> - Recommendations based on use case (educational demo vs production)
> - All analysis should be consolidated into a single document with proper cross-references

### Summary of Generated Analysis

The prompt above resulted in:

1. **Performance-Options.md** - Comprehensive 1,123-line analysis document including:
   - Initial request and confirmation of performance concerns
   - Quick reference summary with decision matrix
   - Detailed feasibility evaluation of all 5+ options:
     - PyTorch/TensorFlow backend (Option 1)
     - CUDA or Mojo backend (Option 2)
     - Mathematica implementation (Option 3)
     - Mojo direct implementation (Option 4)
     - WebGPU with TensorFlow.js (Additional Option)
   - Complete WebGPU implementation guide with:
     - Client-side GPU architecture explanation
     - Hardware performance comparisons (M1 iMac, NVIDIA RTX 3060/3070, 2018 MacBook Pro)
     - Integration examples and TypeScript code snippets
     - Browser support and limitations
     - Shuttle.dev deployment guidance

2. **Key Findings:**
   - **Confirmed:** TypeScript implementation will be slow for dense tensors without GPU acceleration
   - **Primary Recommendation:** TensorFlow.js with WebGPU backend for client-side GPU acceleration
   - **Alternative:** PyTorch/TensorFlow backend for server-side maximum performance
   - **WebGPU Architecture:** Uses user's browser/device GPU, not server GPU (perfect for static hosting)

3. **Hardware Performance Expectations:**
   - M1 iMac: ~900 GFLOPS, 10-50x speedup, excellent for educational demos
   - NVIDIA RTX 3060/3070: ~1,500-2,500 GFLOPS, 50-200x speedup, best for large-scale operations
   - 2018 MacBook Pro (Vega 20): ~500-800 GFLOPS, 5-30x speedup, good for medium-scale operations

4. **Documentation Organization:**
   - Created `docs/README.md` as documentation index
   - Created `README_dev.md` for development setup
   - Reorganized main `README.md` to focus on project overview
   - All documentation cross-referenced and properly linked
