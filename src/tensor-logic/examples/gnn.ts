/**
 * GRAPH NEURAL NETWORKS (GNN) IN TENSOR LOGIC
 * 
 * Graph Neural Networks operate on graph-structured data, where nodes have
 * features and edges represent relationships. GNNs learn node representations
 * by aggregating information from neighboring nodes.
 * 
 * THE KEY INSIGHT:
 * Message passing in GNNs is exactly Einstein summation over the graph structure!
 * 
 * Basic GNN layer:
 *   H'[v,d'] = Σ_u A[v,u] · H[u,d] · W[d,d']
 * 
 * Where:
 * - H[v,d] are node features (node v, feature dimension d)
 * - A[v,u] is the adjacency matrix (1 if edge exists, 0 otherwise)
 * - W[d,d'] are learnable weights
 * 
 * This is:
 * 1. For each node v, sum over all neighbors u (where A[v,u] = 1)
 * 2. Multiply neighbor features H[u,d] by weights W[d,d']
 * 3. Aggregate to get new features H'[v,d']
 * 
 * FOR THE MATHEMATICIAN:
 * This is matrix multiplication with the adjacency matrix:
 *   H' = A · H · W
 * 
 * The adjacency matrix A acts as a "selector" - it determines which nodes
 * contribute to each node's representation. This is exactly the same pattern
 * as logical rules: the adjacency matrix is like a relation, and we're
 * aggregating over it.
 * 
 * Graph Attention Networks (GAT) extend this with learned attention weights:
 *   Attention[v,u] = softmax(Query[v,d] · Key[u,d])
 *   H'[v,d'] = Σ_u Attention[v,u] · H[u,d] · W[d,d']
 * 
 * This makes the aggregation adaptive - nodes can learn to focus on
 * more important neighbors, similar to how Transformers use attention.
 */

import {
  Tensor,
  createTensor,
  fromMatrix,
  einsum,
  add,
  relu,
  tensorToString,
} from '../core';

export interface GNNResult {
  title: string;
  description: string;
  code: string;
  steps: {
    name: string;
    explanation: string;
    tensor: Tensor;
    tensorString: string;
  }[];
}

/**
 * Example: Simple Graph Neural Network
 * 
 * We'll work with a small graph of 4 nodes representing a social network:
 * - Node 0: Alice
 * - Node 1: Bob
 * - Node 2: Charlie
 * - Node 3: Diana
 * 
 * Edges represent friendships:
 * - Alice ↔ Bob
 * - Bob ↔ Charlie
 * - Bob ↔ Diana
 * 
 * Each node has initial features (e.g., interests, age, etc.)
 * The GNN will update these features by aggregating information from friends.
 */
export function runGNNExample(): GNNResult {
  const steps: GNNResult['steps'] = [];

  // Adjacency matrix: A[v,u] = 1 if there's an edge between v and u
  // Undirected graph, so A is symmetric
  const Adjacency = fromMatrix('Adjacency', ['v', 'u'], [
    [0, 1, 0, 0], // Alice connected to Bob
    [1, 0, 1, 1], // Bob connected to Alice, Charlie, Diana
    [0, 1, 0, 0], // Charlie connected to Bob
    [0, 1, 0, 0], // Diana connected to Bob
  ]);

  steps.push({
    name: 'Graph Structure (Adjacency Matrix)',
    explanation: `The adjacency matrix A[v,u] encodes the graph structure.

A[v,u] = 1 means there's an edge from node v to node u.

Our social network:
- Node 0 (Alice) ↔ Node 1 (Bob)
- Node 1 (Bob) ↔ Node 2 (Charlie)
- Node 1 (Bob) ↔ Node 3 (Diana)

Bob is the central node, connected to everyone else.

In Tensor Logic, the adjacency matrix acts as a "selector" in the
Einstein summation - it determines which nodes contribute to each
node's updated representation.`,
    tensor: Adjacency,
    tensorString: tensorToString(Adjacency, 0),
  });

  // Initial node features: H[v,d] where v is node, d is feature dimension
  // Let's use 3 features per node (e.g., interests, activity level, age group)
  const NodeFeatures = createTensor(
    'NodeFeatures',
    ['v', 'd'],
    [4, 3],
    new Float64Array([
      // Alice: [interest_score, activity, age_group]
      0.8, 0.6, 0.3,
      // Bob: central node, high activity
      0.9, 1.0, 0.5,
      // Charlie: lower activity
      0.5, 0.3, 0.4,
      // Diana: similar to Alice
      0.7, 0.5, 0.3,
    ])
  );

  steps.push({
    name: 'Initial Node Features',
    explanation: `Each node has initial features H[v,d] representing its properties.

Node 0 (Alice): [0.8, 0.6, 0.3] - high interest, moderate activity
Node 1 (Bob):   [0.9, 1.0, 0.5] - very active, central in network
Node 2 (Charlie): [0.5, 0.3, 0.4] - lower activity
Node 3 (Diana): [0.7, 0.5, 0.3] - similar to Alice

These features will be updated by aggregating information from
neighboring nodes through message passing.`,
    tensor: NodeFeatures,
    tensorString: tensorToString(NodeFeatures, 2),
  });

  // Weight matrix: W[d,d'] transforms features from dimension d to d'
  // For simplicity, we'll keep the same dimension (3 → 3)
  const Weights = createTensor(
    'Weights',
    ['d', 'd_out'],
    [3, 3],
    new Float64Array([
      // Transform features: emphasize activity, blend interests
      0.5, 0.3, 0.2, // Output feature 0: blend of all inputs
      0.2, 0.6, 0.2, // Output feature 1: emphasize input feature 1 (activity)
      0.3, 0.1, 0.6, // Output feature 2: emphasize input feature 2 (age)
    ])
  );

  steps.push({
    name: 'Weight Matrix',
    explanation: `Learnable weight matrix W[d,d_out] transforms node features.

This matrix learns how to combine and transform features during
message passing. Each output dimension is a learned combination
of input dimensions.

The weights shown here are example values - in practice, these
would be learned through gradient descent on a task (e.g., node
classification, link prediction).`,
    tensor: Weights,
    tensorString: tensorToString(Weights, 2),
  });

  // Message passing: H'[v,d'] = Σ_u A[v,u] · H[u,d] · W[d,d']
  // Step 1: Aggregate neighbor features (without weights)
  // Messages[v,d] = Σ_u A[v,u] · H[u,d]
  const Messages = einsum('vu,ud->vd', Adjacency, NodeFeatures);

  steps.push({
    name: 'Message Aggregation',
    explanation: `First step: Aggregate features from neighbors.

Messages[v,d] = Σ_u A[v,u] · H[u,d]

For each node v, sum the features of all its neighbors u.

Example for Node 1 (Bob):
- Neighbors: Alice (0), Charlie (2), Diana (3)
- Messages[1] = H[0] + H[2] + H[3]
  = [0.8, 0.6, 0.3] + [0.5, 0.3, 0.4] + [0.7, 0.5, 0.3]
  = [2.0, 1.4, 1.0]

This aggregates information from all connected nodes. The adjacency
matrix A acts as a selector - only nodes with A[v,u] = 1 contribute.`,
    tensor: Messages,
    tensorString: tensorToString(Messages, 2),
  });

  // Step 2: Transform aggregated messages
  // H'[v,d'] = Messages[v,d] · W[d,d']
  const UpdatedFeatures = einsum('vd,dd_out->vd_out', Messages, Weights);

  steps.push({
    name: 'Feature Transformation',
    explanation: `Second step: Transform aggregated messages through weights.

H'[v,d'] = Σ_d Messages[v,d] · W[d,d']

Apply the weight matrix to transform the aggregated neighbor features.

This is standard matrix multiplication - the aggregated features
are transformed to create new node representations.

For Bob (Node 1), who has the most neighbors, his representation
will be most influenced by the network structure.`,
    tensor: UpdatedFeatures,
    tensorString: tensorToString(UpdatedFeatures, 2),
  });

  // Step 3: Apply activation (ReLU) and add residual connection
  // H_final[v,d] = ReLU(H'[v,d]) + H[v,d]
  const Activated = relu(UpdatedFeatures);
  const FinalFeatures = add(Activated, NodeFeatures);

  steps.push({
    name: 'Activation and Residual Connection',
    explanation: `Final step: Apply non-linearity and add residual connection.

H_final[v,d] = ReLU(H'[v,d]) + H[v,d]

1. ReLU introduces non-linearity (allows the model to learn complex patterns)
2. Residual connection adds the original features (helps with gradient flow)

This is one layer of a GNN. Multiple layers can be stacked:
- Layer 1: Nodes aggregate from direct neighbors
- Layer 2: Nodes aggregate from 2-hop neighbors (neighbors of neighbors)
- Layer k: Nodes aggregate from k-hop neighbors

Each layer increases the "receptive field" - nodes can incorporate
information from nodes further away in the graph.`,
    tensor: FinalFeatures,
    tensorString: tensorToString(FinalFeatures, 2),
  });

  return {
    title: 'Graph Neural Network: Message Passing',
    description: `This example demonstrates how Graph Neural Networks map to Tensor Logic.

A GNN layer performs message passing:
1. Aggregate: Collect features from neighboring nodes
2. Transform: Apply learned weights to transform features
3. Update: Combine with original features (residual connection)

The key operation is:
  H'[v,d'] = Σ_u A[v,u] · H[u,d] · W[d,d']

Where:
- A[v,u] is the adjacency matrix (graph structure)
- H[u,d] are node features
- W[d,d'] are learnable weights

This is exactly Einstein summation! The adjacency matrix acts as a
"selector" - it determines which nodes contribute to each node's
updated representation, just like a logical relation determines
which facts contribute to a derived fact.

GNNs are powerful for:
- Node classification (predict node labels)
- Link prediction (predict missing edges)
- Graph classification (predict graph-level properties)
- Recommendation systems (users and items form a bipartite graph)

The same tensor operations work for any graph structure - social
networks, molecular graphs, knowledge graphs, citation networks, etc.`,
    code: `// Basic GNN layer:
H'[v,d'] = Σ_u A[v,u] · H[u,d] · W[d,d']

// Graph Attention Networks (GAT):
Attention[v,u] = softmax(Query[v,d] · Key[u,d])
H'[v,d'] = Σ_u Attention[v,u] · H[u,d] · W[d,d']`,
    steps,
  };
}

