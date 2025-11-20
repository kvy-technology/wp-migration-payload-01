# WordPress → PayloadCMS Migration Pipeline

A scalable, modular migration system for converting WordPress posts to PayloadCMS format.

## 📁 Architecture

```
/scripts/migrate-wp/
├── core/              # Core types, constants, and registry
│   ├── constants.ts   # All WP block types, CMS blocks, patterns
│   ├── types.ts       # TypeScript type definitions
│   └── registry.ts    # Registry-based routing engine
├── wp/                # WordPress-specific utilities
│   ├── fetch.ts       # Fetch posts from WP API or mock
│   ├── mock-data.ts   # Mock WordPress posts for testing
│   ├── chunk-splitter.ts  # Split WP content into chunks
│   └── chunk-detector.ts  # Detect chunk types and strategies
├── converters/        # Conversion engines
│   ├── html-engine.ts      # Main conversion orchestrator
│   ├── lexical.ts          # Lexical HTML converter
│   ├── unsupported-blocks.ts  # CMS block converters
│   └── html-utils.ts       # HTML manipulation utilities
├── media/            # Media handling
│   ├── extract.ts    # Extract images from HTML
│   └── upload.ts     # Upload images to Payload
└── utils/            # Utilities
    ├── merge-lexical.ts  # Merge nodes into Lexical structure
    ├── logger.ts         # Centralized logging
    └── tester.ts         # Test utilities
```

## 🚀 Usage

### Basic Migration (Mock Data)

```typescript
import { migrate } from './migrate-wp'

const stats = await migrate({
  useMock: true,
  dryRun: false,
})
```

### Migrate from WordPress API

```typescript
const stats = await migrate({
  useMock: false,
  wpApiUrl: 'https://example.com/wp-json/wp/v2',
  wpCredentials: {
    username: 'your-username',
    password: 'application-password',
  },
  batchSize: 10,
  continueOnError: true,
})
```

### With Category/Author Mapping

```typescript
const categoryMap = new Map([
  [1, 5], // WP category 1 → Payload category 5
  [2, 6], // WP category 2 → Payload category 6
])

const authorMap = new Map([
  [1, 10], // WP user 1 → Payload user 10
])

const stats = await migrate({
  useMock: true,
  categoryMap,
  authorMap,
})
```

## 🔄 Migration Flow

1. **Fetch WordPress Posts** - From API or mock data
2. **Split into Chunks** - Parse WordPress block comments
3. **Detect Chunk Types** - Determine conversion strategy
4. **Upload Images** - Extract and upload images before conversion
5. **Convert Chunks**:
   - Lexical-supported → Convert to Lexical JSON
   - CMS blocks → Convert to CMS block format
   - Unknown → Attempt Lexical conversion with warning
6. **Merge Nodes** - Combine all converted nodes
7. **Create Payload Posts** - Save to PayloadCMS

## 🧪 Testing

Use the test utilities to debug at any stage:

```typescript
import { testSplitChunks, testDetectChunk, testFullMigration } from './migrate-wp/utils/tester'

// Test chunk splitting
const chunks = testSplitChunks(wpPostContent)

// Test chunk detection
const detection = testDetectChunk(chunk)

// Test full migration
const result = await testFullMigration(wpPost, { payload, imageMap: new Map() })
```

## 📝 Adding New Block Types

### 1. Add to Constants

```typescript
// core/constants.ts
export const WP_BLOCKS = {
  // ... existing blocks
  NEW_BLOCK: 'new-block',
}

export const CMS_BLOCKS = {
  // ... existing blocks
  NEW_BLOCK: 'newBlock',
}
```

### 2. Add to Registry

```typescript
// core/registry.ts
export const UNSUPPORTED_MAPPING = {
  // ... existing mappings
  [WP_BLOCKS.NEW_BLOCK]: CMS_BLOCKS.NEW_BLOCK,
}
```

### 3. Implement Converter

```typescript
// converters/unsupported-blocks.ts
export async function convertNewBlock(
  context: ConversionContext
): Promise<ConversionResult> {
  // Implementation following existing block schema
  const node: CMSBlockNode = {
    blockType: CMS_BLOCKS.NEW_BLOCK,
    // ... fields matching your block config
  }
  
  return {
    nodes: [node],
    warnings: [],
    errors: [],
    success: true,
  }
}

// Add to router
export async function convertUnsupportedBlock(context: ConversionContext) {
  switch (cmsBlockSlug) {
    // ... existing cases
    case CMS_BLOCKS.NEW_BLOCK:
      return convertNewBlock(context)
  }
}
```

## 🎯 Key Features

- **Registry-Based Routing** - Easy to extend with new block types
- **Mock Data Support** - Test without WordPress instance
- **Image Handling** - Automatic upload and deduplication
- **Error Handling** - Continue on error or fail fast
- **Type Safety** - Full TypeScript support
- **Modular Design** - Each component is independently testable
- **Follows Existing Patterns** - Uses same structure as existing CMS blocks

## 📚 API Reference

See individual file JSDoc comments for detailed API documentation.

## ⚠️ Important Notes

- Images are uploaded **before** HTML conversion
- CMS blocks must follow the exact schema from `/src/blocks/*/config.ts`
- The system uses Payload's `convertHTMLToLexical` for Lexical-supported blocks
- Unknown block types will attempt Lexical conversion with warnings

