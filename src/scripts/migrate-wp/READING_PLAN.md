# 📚 Reading Plan: WordPress → PayloadCMS Migration Module

A systematic guide to understanding the migration pipeline architecture and codebase.

---

## 🎯 **Phase 1: Foundation (Start Here)**

### **1.1 Core Types** (`core/types.ts`)

**Purpose:** Understand the data structures used throughout the system.

**Read in this order:**

1. `WPPost` - WordPress post structure
2. `WPChunk` - Individual block chunk
3. `ConvertedNode` - Result of conversion (Lexical or CMS block)
4. `ConversionContext` - Context passed to converters
5. `ConversionResult` - Result with success/errors/warnings
6. `MigrationOptions` - Configuration for migration

**Key Questions:**

- What data does a WordPress post contain?
- How is content split into chunks?
- What's the difference between Lexical nodes and CMS blocks?

**Time:** ~10 minutes

---

### **1.2 Constants** (`core/constants.ts`)

**Purpose:** Learn all the block types, mappings, and configuration values.

**Read in this order:**

1. `WP_BLOCKS` - WordPress block type names
2. `CMS_BLOCKS` - PayloadCMS block slugs
3. `LEXICAL_NODES` - Lexical editor node types
4. `MIGRATION_CONFIG` - Limits and settings
5. `YOUTUBE_PATTERNS` - Regex patterns for detection

**Key Questions:**

- What WordPress blocks are supported?
- Which blocks map to which CMS blocks?
- What are the size limits for images?

**Time:** ~5 minutes

---

### **1.3 Registry** (`core/registry.ts`)

**Purpose:** Understand how the system routes blocks to converters.

**Read in this order:**

1. `LEXICAL_SUPPORTED` - What Lexical handles natively
2. `UNSUPPORTED_MAPPING` - WordPress → CMS block mapping
3. `isLexicalSupported()` - Check if Lexical can handle it
4. `getCMSBlockMapping()` - Get CMS block for WP block
5. `detectBlockType()` - Detect block type from HTML
6. `getConversionStrategy()` - Determine conversion path

**Key Questions:**

- How does the system decide which converter to use?
- What happens to unsupported blocks?
- How can I add a new block type?

**Time:** ~15 minutes

---

## 🔄 **Phase 2: WordPress Processing**

### **2.1 Mock Data** (`wp/mock-data.ts`)

**Purpose:** See example WordPress content structure.

**Read:**

- `MOCK_WP_POSTS` - Sample posts with various block types
- Notice the WordPress block comment syntax: `<!-- wp:block-type -->`

**Key Questions:**

- What does WordPress block HTML look like?
- What block types are in the examples?

**Time:** ~5 minutes

---

### **2.2 Fetch** (`wp/fetch.ts`)

**Purpose:** Understand how posts are retrieved.

**Read in this order:**

1. `fetchWPPosts()` - Main fetch function
2. `fetchFromAPI()` - WordPress REST API integration
3. `getMockWPPosts()` - Mock data helper

**Key Questions:**

- How does the system fetch from WordPress API?
- What authentication is used?
- How does mock mode work?

**Time:** ~10 minutes

---

### **2.3 Chunk Splitter** (`wp/chunk-splitter.ts`)

**Purpose:** Learn how WordPress content is parsed into chunks.

**Read in this order:**

1. `parseBlockComment()` - Parse WP block comment syntax
2. `splitIntoChunks()` - Main splitting function
3. `normalizeBlockType()` - Normalize block type names
4. `hasWPBlocks()` - Check if content has blocks
5. `detectBlockTypeFromHTML()` - Fallback detection

**Key Questions:**

- How are WordPress block comments parsed?
- What happens to nested blocks?
- How are block attributes extracted?

**Time:** ~15 minutes

---

### **2.4 Chunk Detector** (`wp/chunk-detector.ts`)

**Purpose:** Understand how chunks are analyzed and routed.

**Read in this order:**

1. `detectChunk()` - Main detection function
2. `getChunkStrategy()` - Get conversion strategy
3. `batchDetectChunks()` - Process multiple chunks
4. `validateDetection()` - Validate detection result

**Key Questions:**

- How is the conversion strategy determined?
- What is "confidence" in detection?
- How are ambiguous blocks handled?

**Time:** ~10 minutes

---

## 🖼️ **Phase 3: Media Handling**

### **3.1 Extract** (`media/extract.ts`)

**Purpose:** Learn how images are extracted from HTML.

**Read in this order:**

1. `extractImages()` - Extract from single HTML
2. `extractImagesFromChunks()` - Extract from multiple chunks
3. `extractYouTubeIds()` - Extract YouTube video IDs
4. `extractGalleryImages()` - Extract gallery image URLs

**Key Questions:**

- How are images found in HTML?
- How are duplicates handled?
- What metadata is extracted?

**Time:** ~10 minutes

---

### **3.2 Upload** (`media/upload.ts`)

**Purpose:** Understand image upload process.

**Read in this order:**

1. `normalizeImageUrl()` - Remove staging suffix
2. `downloadImage()` - Download from URL
3. `checkExistingMedia()` - Check for duplicates
4. `uploadImageToPayload()` - Upload to Payload
5. `uploadImages()` - Batch upload with retry

**Key Questions:**

- How are images deduplicated?
- What happens if upload fails?
- How are staging URLs normalized?

**Time:** ~15 minutes

---

## 🔀 **Phase 4: Conversion Engines**

### **4.1 HTML Utils** (`converters/html-utils.ts`)

**Purpose:** Utility functions for HTML manipulation.

**Read:**

- `cleanHTML()` - Remove WP-specific classes
- `extractText()` - Get plain text
- `sanitizeHTML()` - Remove dangerous content
- `extractAttributes()` - Get element attributes

**Key Questions:**

- Why clean HTML before conversion?
- What WordPress-specific code is removed?

**Time:** ~5 minutes

---

### **4.2 Lexical Converter** (`converters/lexical.ts`)

**Purpose:** Convert HTML to Lexical JSON format.

**Read in this order:**

1. `convertToLexical()` - Main conversion function
   - Step 1: Extract and upload images
   - Step 2: Replace image URLs
   - Step 3: Clean HTML
   - Step 4: Get editor config
   - Step 5: Convert to Lexical JSON
   - Step 6: Validate structure
   - Step 7: Replace pending uploads
2. `replacePendingUploads()` - Replace image placeholders

**Key Questions:**

- Why upload images before conversion?
- How are images replaced in Lexical nodes?
- What is a "pending upload node"?

**Time:** ~20 minutes

---

### **4.3 Unsupported Blocks** (`converters/unsupported-blocks.ts`)

**Purpose:** Convert WordPress blocks to PayloadCMS blocks.

**Read in this order:**

1. `convertYouTube()` - YouTube embeds → youtubeBlock
2. `convertGallery()` - Gallery → galleryBlock
3. `convertButton()` - Buttons → buttonBlock
4. `convertVideo()` - Video → videoBlock
5. `convertUnsupportedBlock()` - Router function

**Key Questions:**

- How does each converter match the CMS block schema?
- What happens if conversion fails?
- How are images handled in galleries?

**Time:** ~25 minutes

---

### **4.4 HTML Engine** (`converters/html-engine.ts`)

**Purpose:** Main orchestrator that routes chunks to converters.

**Read in this order:**

1. `convertChunk()` - Convert single chunk
   - Determines strategy (lexical/cms-block/custom)
   - Routes to appropriate converter
   - Handles errors
2. `convertChunks()` - Convert multiple chunks sequentially
3. `convertChunksWithStats()` - Convert with statistics

**Key Questions:**

- How does the routing work?
- What happens to failed conversions?
- How are statistics collected?

**Time:** ~15 minutes

---

## 🔗 **Phase 5: Merging & Utilities**

### **5.1 Merge Lexical** (`utils/merge-lexical.ts`)

**Purpose:** Combine converted nodes into final structure.

**Read in this order:**

1. `isLexicalNode()` - Check if node is Lexical
2. `isCMSBlockNode()` - Check if node is CMS block
3. `createLexicalRoot()` - Create root node
4. `mergeNodes()` - Merge nodes preserving order
5. `validateMergedStructure()` - Validate final structure

**Key Questions:**

- How are Lexical nodes and CMS blocks combined?
- What is the final structure?
- How is order preserved?

**Time:** ~10 minutes

---

### **5.2 Logger** (`utils/logger.ts`)

**Purpose:** Centralized logging system.

**Read:**

- Log levels (DEBUG, INFO, WARN, ERROR)
- `logStats()` - Migration statistics
- `setLogLevel()` - Configure logging

**Time:** ~5 minutes

---

### **5.3 Tester** (`utils/tester.ts`)

**Purpose:** Testing utilities for debugging.

**Read:**

- `testSplitChunks()` - Test chunk splitting
- `testDetectChunk()` - Test detection
- `testConvertChunk()` - Test conversion
- `testFullMigration()` - Test entire flow

**Time:** ~10 minutes

---

## 🚀 **Phase 6: Main Pipeline**

### **6.1 Main Migration** (`migrate-wp.ts`)

**Purpose:** Understand the complete migration flow.

**Read in this order:**

1. `migratePost()` - Migrate single post
   - Step 1: Split into chunks
   - Step 2: Extract images
   - Step 3: Upload images
   - Step 4: Convert chunks
   - Step 5: Merge nodes
   - Step 6: Create Payload post
2. `migrate()` - Main migration function
   - Fetch posts
   - Process each post
   - Collect statistics
   - Handle errors

**Key Questions:**

- What is the complete flow?
- How are errors handled?
- What statistics are collected?

**Time:** ~20 minutes

---

## 📊 **Phase 7: Integration**

### **7.1 Index** (`index.ts`)

**Purpose:** See all public exports.

**Read:** All exported functions and types

**Time:** ~5 minutes

---

## 🎓 **Learning Path Summary**

### **Quick Start (30 minutes)**

1. Core Types (`core/types.ts`)
2. Constants (`core/constants.ts`)
3. Main Migration (`migrate-wp.ts`)

### **Deep Dive (2-3 hours)**

Follow phases 1-6 in order

### **Adding New Blocks (1 hour)**

1. Constants (`core/constants.ts`)
2. Registry (`core/registry.ts`)
3. Unsupported Blocks (`converters/unsupported-blocks.ts`)
4. Test with Tester (`utils/tester.ts`)

---

## 🔍 **Key Concepts to Understand**

1. **Chunk-based Processing**: WordPress content is split into individual blocks (chunks)
2. **Registry Routing**: System uses registry to determine conversion strategy
3. **Two Conversion Paths**:
   - Lexical-supported → Direct HTML to Lexical conversion
   - Unsupported → Convert to CMS blocks
4. **Image Handling**: Images uploaded BEFORE conversion, then referenced
5. **Error Handling**: Continue on error or fail fast (configurable)
6. **Type Safety**: Full TypeScript types throughout

---

## 🧪 **Recommended Practice**

1. **Read with mock data**: Use `useMock: true` to test without WordPress
2. **Use tester utilities**: Test each stage independently
3. **Check existing blocks**: Look at `/src/blocks/*/config.ts` to understand schemas
4. **Trace a single post**: Follow one post through the entire pipeline
5. **Add a simple block**: Try adding support for a new block type

---

## 📝 **Questions to Answer**

After reading, you should be able to answer:

1. How does a WordPress post become a PayloadCMS post?
2. What happens to images during migration?
3. How would I add support for a new WordPress block type?
4. What's the difference between Lexical nodes and CMS blocks?
5. How are errors handled during migration?
6. How can I test the migration without WordPress?

---

**Total Reading Time:** ~3-4 hours for complete understanding

**Quick Reference Time:** ~30 minutes for overview
