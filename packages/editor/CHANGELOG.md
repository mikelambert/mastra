# @mastra/editor

## 0.3.0-alpha.1

### Minor Changes

- Added dynamic instructions for stored agents. Agent instructions can now be composed from reusable prompt blocks with conditional rules and variable interpolation, enabling a prompt-CMS-like editing experience. ([#12776](https://github.com/mastra-ai/mastra/pull/12776))

  **Instruction blocks** can be mixed in an agent's instructions array:
  - `text` — static text with `{{variable}}` interpolation
  - `prompt_block_ref` — reference to a versioned prompt block stored in the database
  - `prompt_block` — inline prompt block with optional conditional rules

  **Creating a prompt block and using it in a stored agent:**

  ```ts
  // Create a reusable prompt block
  const block = await editor.createPromptBlock({
    id: 'security-rules',
    name: 'Security Rules',
    content: "You must verify the user's identity. The user's role is {{user.role}}.",
    rules: {
      operator: 'AND',
      conditions: [{ field: 'user.isAuthenticated', operator: 'equals', value: true }],
    },
  });

  // Create a stored agent that references the prompt block
  await editor.createStoredAgent({
    id: 'support-agent',
    name: 'Support Agent',
    instructions: [
      { type: 'text', content: 'You are a helpful support agent for {{company}}.' },
      { type: 'prompt_block_ref', id: 'security-rules' },
      {
        type: 'prompt_block',
        content: 'Always be polite.',
        rules: { operator: 'AND', conditions: [{ field: 'tone', operator: 'equals', value: 'formal' }] },
      },
    ],
    model: { provider: 'openai', name: 'gpt-4o' },
  });

  // At runtime, instructions resolve dynamically based on request context
  const agent = await editor.getStoredAgentById('support-agent');
  const result = await agent.generate('Help me reset my password', {
    requestContext: new RequestContext([
      ['company', 'Acme Corp'],
      ['user.isAuthenticated', true],
      ['user.role', 'admin'],
      ['tone', 'formal'],
    ]),
  });
  ```

  Prompt blocks are versioned — updating a block's content takes effect immediately for all agents referencing it, with no cache clearing required.

### Patch Changes

- Updated dependencies [[`717ffab`](https://github.com/mastra-ai/mastra/commit/717ffab42cfd58ff723b5c19ada4939997773004), [`5719fa8`](https://github.com/mastra-ai/mastra/commit/5719fa8880e86e8affe698ec4b3807c7e0e0a06f), [`83cda45`](https://github.com/mastra-ai/mastra/commit/83cda4523e588558466892bff8f80f631a36945a), [`aa95f95`](https://github.com/mastra-ai/mastra/commit/aa95f958b186ae5c9f4219c88e268f5565c277a2), [`fdad759`](https://github.com/mastra-ai/mastra/commit/fdad75939ff008b27625f5ec0ce9c6915d99d9ec), [`e4569c5`](https://github.com/mastra-ai/mastra/commit/e4569c589e00c4061a686c9eb85afe1b7050b0a8), [`7309a85`](https://github.com/mastra-ai/mastra/commit/7309a85427281a8be23f4fb80ca52e18eaffd596), [`99424f6`](https://github.com/mastra-ai/mastra/commit/99424f6862ffb679c4ec6765501486034754a4c2), [`a211248`](https://github.com/mastra-ai/mastra/commit/a21124845b1b1321b6075a8377c341c7f5cda1b6), [`8c1135d`](https://github.com/mastra-ai/mastra/commit/8c1135dfb91b057283eae7ee11f9ec28753cc64f)]:
  - @mastra/core@1.3.0-alpha.1

## 0.2.1-alpha.0

### Patch Changes

- Fixed stale agent data in CMS pages by adding removeAgent method to Mastra and updating clearStoredAgentCache to clear both Editor cache and Mastra registry when stored agents are updated or deleted ([#12693](https://github.com/mastra-ai/mastra/pull/12693))

- Fix memory persistence: ([#12704](https://github.com/mastra-ai/mastra/pull/12704))
  - Fixed memory persistence bug by handling missing vector store gracefully
  - When semantic recall is enabled but no vector store is configured, it now disables semantic recall instead of failing
  - Fixed type compatibility for `embedder` field when creating agents from stored config

- Updated dependencies [[`90f7894`](https://github.com/mastra-ai/mastra/commit/90f7894568dc9481f40a4d29672234fae23090bb), [`8109aee`](https://github.com/mastra-ai/mastra/commit/8109aeeab758e16cd4255a6c36f044b70eefc6a6)]:
  - @mastra/core@1.2.1-alpha.0

## 0.2.0

### Minor Changes

- Created @mastra/editor package for managing and resolving stored agent configurations ([#12631](https://github.com/mastra-ai/mastra/pull/12631))

  This major addition introduces the editor package, which provides a complete solution for storing, versioning, and instantiating agent configurations from a database. The editor seamlessly integrates with Mastra's storage layer to enable dynamic agent management.

  **Key Features:**
  - **Agent Storage & Retrieval**: Store complete agent configurations including instructions, model settings, tools, workflows, nested agents, scorers, processors, and memory configuration
  - **Version Management**: Create and manage multiple versions of agents, with support for activating specific versions
  - **Dependency Resolution**: Automatically resolves and instantiates all agent dependencies (tools, workflows, sub-agents, etc.) from the Mastra registry
  - **Caching**: Built-in caching for improved performance when repeatedly accessing stored agents
  - **Type Safety**: Full TypeScript support with proper typing for stored configurations

  **Usage Example:**

  ```typescript
  import { MastraEditor } from '@mastra/editor';
  import { Mastra } from '@mastra/core';

  // Initialize editor with Mastra
  const mastra = new Mastra({
    /* config */
    editor: new MastraEditor(),
  });

  // Store an agent configuration
  const agentId = await mastra.storage.stores?.agents?.createAgent({
    name: 'customer-support',
    instructions: 'Help customers with inquiries',
    model: { provider: 'openai', name: 'gpt-4' },
    tools: ['search-kb', 'create-ticket'],
    workflows: ['escalation-flow'],
    memory: { vector: 'pinecone-db' },
  });

  // Retrieve and use the stored agent
  const agent = await mastra.getEditor()?.getStoredAgentById(agentId);
  const response = await agent?.generate('How do I reset my password?');

  // List all stored agents
  const agents = await mastra.getEditor()?.listStoredAgents({ pageSize: 10 });
  ```

  **Storage Improvements:**
  - Fixed JSONB handling in LibSQL, PostgreSQL, and MongoDB adapters
  - Improved agent resolution queries to properly merge version data
  - Enhanced type safety for serialized configurations

### Patch Changes

- Updated dependencies [[`e6fc281`](https://github.com/mastra-ai/mastra/commit/e6fc281896a3584e9e06465b356a44fe7faade65), [`97be6c8`](https://github.com/mastra-ai/mastra/commit/97be6c8963130fca8a664fcf99d7b3a38e463595), [`2770921`](https://github.com/mastra-ai/mastra/commit/2770921eec4d55a36b278d15c3a83f694e462ee5), [`b1695db`](https://github.com/mastra-ai/mastra/commit/b1695db2d7be0c329d499619c7881899649188d0), [`5fe1fe0`](https://github.com/mastra-ai/mastra/commit/5fe1fe0109faf2c87db34b725d8a4571a594f80e), [`4133d48`](https://github.com/mastra-ai/mastra/commit/4133d48eaa354cdb45920dc6265732ffbc96788d), [`5dd01cc`](https://github.com/mastra-ai/mastra/commit/5dd01cce68d61874aa3ecbd91ee17884cfd5aca2), [`13e0a2a`](https://github.com/mastra-ai/mastra/commit/13e0a2a2bcec01ff4d701274b3727d5e907a6a01), [`f6673b8`](https://github.com/mastra-ai/mastra/commit/f6673b893b65b7d273ad25ead42e990704cc1e17), [`cd6be8a`](https://github.com/mastra-ai/mastra/commit/cd6be8ad32741cd41cabf508355bb31b71e8a5bd), [`9eb4e8e`](https://github.com/mastra-ai/mastra/commit/9eb4e8e39efbdcfff7a40ff2ce07ce2714c65fa8), [`c987384`](https://github.com/mastra-ai/mastra/commit/c987384d6c8ca844a9701d7778f09f5a88da7f9f), [`cb8cc12`](https://github.com/mastra-ai/mastra/commit/cb8cc12bfadd526aa95a01125076f1da44e4afa7), [`aa37c84`](https://github.com/mastra-ai/mastra/commit/aa37c84d29b7db68c72517337932ef486c316275), [`62f5d50`](https://github.com/mastra-ai/mastra/commit/62f5d5043debbba497dacb7ab008fe86b38b8de3), [`47eba72`](https://github.com/mastra-ai/mastra/commit/47eba72f0397d0d14fbe324b97940c3d55e5a525)]:
  - @mastra/core@1.2.0
  - @mastra/memory@1.1.0

## 0.2.0-alpha.0

### Minor Changes

- Created @mastra/editor package for managing and resolving stored agent configurations ([#12631](https://github.com/mastra-ai/mastra/pull/12631))

  This major addition introduces the editor package, which provides a complete solution for storing, versioning, and instantiating agent configurations from a database. The editor seamlessly integrates with Mastra's storage layer to enable dynamic agent management.

  **Key Features:**
  - **Agent Storage & Retrieval**: Store complete agent configurations including instructions, model settings, tools, workflows, nested agents, scorers, processors, and memory configuration
  - **Version Management**: Create and manage multiple versions of agents, with support for activating specific versions
  - **Dependency Resolution**: Automatically resolves and instantiates all agent dependencies (tools, workflows, sub-agents, etc.) from the Mastra registry
  - **Caching**: Built-in caching for improved performance when repeatedly accessing stored agents
  - **Type Safety**: Full TypeScript support with proper typing for stored configurations

  **Usage Example:**

  ```typescript
  import { MastraEditor } from '@mastra/editor';
  import { Mastra } from '@mastra/core';

  // Initialize editor with Mastra
  const mastra = new Mastra({
    /* config */
    editor: new MastraEditor(),
  });

  // Store an agent configuration
  const agentId = await mastra.storage.stores?.agents?.createAgent({
    name: 'customer-support',
    instructions: 'Help customers with inquiries',
    model: { provider: 'openai', name: 'gpt-4' },
    tools: ['search-kb', 'create-ticket'],
    workflows: ['escalation-flow'],
    memory: { vector: 'pinecone-db' },
  });

  // Retrieve and use the stored agent
  const agent = await mastra.getEditor()?.getStoredAgentById(agentId);
  const response = await agent?.generate('How do I reset my password?');

  // List all stored agents
  const agents = await mastra.getEditor()?.listStoredAgents({ pageSize: 10 });
  ```

  **Storage Improvements:**
  - Fixed JSONB handling in LibSQL, PostgreSQL, and MongoDB adapters
  - Improved agent resolution queries to properly merge version data
  - Enhanced type safety for serialized configurations

### Patch Changes

- Updated dependencies [[`2770921`](https://github.com/mastra-ai/mastra/commit/2770921eec4d55a36b278d15c3a83f694e462ee5), [`b1695db`](https://github.com/mastra-ai/mastra/commit/b1695db2d7be0c329d499619c7881899649188d0), [`4133d48`](https://github.com/mastra-ai/mastra/commit/4133d48eaa354cdb45920dc6265732ffbc96788d), [`5dd01cc`](https://github.com/mastra-ai/mastra/commit/5dd01cce68d61874aa3ecbd91ee17884cfd5aca2), [`13e0a2a`](https://github.com/mastra-ai/mastra/commit/13e0a2a2bcec01ff4d701274b3727d5e907a6a01), [`c987384`](https://github.com/mastra-ai/mastra/commit/c987384d6c8ca844a9701d7778f09f5a88da7f9f), [`cb8cc12`](https://github.com/mastra-ai/mastra/commit/cb8cc12bfadd526aa95a01125076f1da44e4afa7), [`62f5d50`](https://github.com/mastra-ai/mastra/commit/62f5d5043debbba497dacb7ab008fe86b38b8de3)]:
  - @mastra/memory@1.1.0-alpha.1
  - @mastra/core@1.2.0-alpha.1

## 0.1.0

### Minor Changes

- Initial release of @mastra/editor
  - Agent storage and retrieval from database
  - Dynamic agent creation from stored configurations
  - Support for tools, workflows, nested agents, memory, and scorers
  - Integration with Mastra core for seamless agent management
