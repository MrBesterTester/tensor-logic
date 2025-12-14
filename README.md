# Tensor Logic Demo

An interactive educational demo of **Pedro Domingos' Tensor Logic** — a programming paradigm that unifies neural and symbolic AI at a fundamental level.

Based on the paper: [Tensor Logic: The Language of AI](https://arxiv.org/abs/2510.12269) by Prof. Emeritus Pedro Domingos (University of Washington)

## The Core Insight

The key insight of Tensor Logic is that **logical rules and Einstein summation are essentially the same operation**:

| Logic Programming | Tensor Algebra |
|------------------|----------------|
| `Ancestor(x,z) ← Ancestor(x,y), Parent(y,z)` | `Ancestor[x,z] = Σ_y Ancestor[x,y] · Parent[y,z]` |
| JOIN on y | Contract over index y |
| PROJECT onto (x,z) | Keep indices x, z |

The only difference is the atomic data type:
- **Boolean (0/1)** → Symbolic logic
- **Real numbers** → Neural networks

This unification allows expressing both symbolic AI and neural networks in the same language.

## Demo Features

### 7 Interactive Examples

1. **Logic Programming (Symbolic AI)**: The classic Ancestor/Parent example showing how Datalog rules map to Einstein summation

2. **Multi-Layer Perceptron (Neural Networks)**: XOR problem demonstrating how MLP layers are tensor contractions

3. **Transformer Self-Attention (Neural Networks)**: Full attention mechanism with Query, Key, Value projections

4. **Multi-Head Attention (Neural Networks)**: Parallel attention heads attending to different aspects

5. **Kernel Machines/SVM (Hybrid)**: RBF kernel classification on XOR data

6. **Bayesian Networks (Probabilistic)**: Student network with probabilistic inference

7. **Hidden Markov Models (Probabilistic)**: Forward algorithm for sequence modeling

### Core Tensor Logic Engine

The engine implements Einstein summation (`einsum`) which is the fundamental operation unifying all AI paradigms:

```typescript
// The same einsum operation underlies:

// Logic: Ancestor[x,z] = threshold(Σ_y Ancestor[x,y] · Parent[y,z])
// Neural: Output[o] = W[o,h] · Hidden[h]  
// Attention: Scores[q,k] = Query[q,d] · Key[k,d]
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Then open http://localhost:3000 in your browser.

### Build

```bash
npm run build
```

### Type Checking & Linting

```bash
npm run typecheck
npm run lint
```

## Project Structure

```
tensor-logic/
├── src/
│   ├── index.html          # Main HTML entry point
│   ├── main.ts             # Application entry point & UI
│   ├── styles.css          # Styling
│   └── tensor-logic/
│       ├── core.ts         # Core tensor operations & einsum
│       └── examples/
│           ├── logic.ts      # Logic programming example
│           ├── mlp.ts        # Multi-layer perceptron
│           ├── transformer.ts # Transformer attention
│           ├── kernel.ts     # Kernel machines (SVM)
│           └── graphical.ts  # Bayesian networks & HMMs
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## What This Unifies

### Symbolic AI
- Logic Programming (Datalog, Prolog)
- Theorem Proving
- Knowledge Graphs
- Rule-based Systems

### Neural Networks
- Multi-Layer Perceptrons
- Convolutional Networks
- Transformers (GPT, BERT)
- Attention Mechanisms

### Probabilistic AI
- Bayesian Networks
- Markov Random Fields
- Hidden Markov Models
- Probabilistic Programs

### Hybrid Methods
- Kernel Machines (SVM)
- Graph Neural Networks
- Embedding-based Reasoning
- Markov Logic Networks

## Why Does This Matter?

- **Unified Language**: Express neural nets, logic programs, and probabilistic models in the same notation

- **Sound Reasoning**: At temperature T=0, embedding-based reasoning becomes exact deduction—no hallucinations

- **Learnable Logic**: Make logical programs differentiable and trainable with gradient descent

- **Transparent AI**: Extract interpretable rules from neural representations

## References

- Domingos, P. (2025). *Tensor Logic: The Language of AI*. [arXiv:2510.12269](https://arxiv.org/abs/2510.12269)
- [Tensor Logic website](https://tensor-logic.org)

## TO DO

- [ ] Validate these models against known ML examples from reputable sources (e.g., textbook examples, benchmark datasets, reference implementations)

## License

MIT

