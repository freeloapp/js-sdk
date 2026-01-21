# Basic Examples

Simple examples demonstrating core Freelo SDK functionality.

## Prerequisites

- Node.js 18+
- Freelo account with API key
- Install the SDK: `npm install @freelo/js-sdk`

## Setup

Set environment variables:

```bash
export FREELO_EMAIL="your@email.tld"
export FREELO_API_KEY="your-api-key"
```

## Examples

### Getting Started

Basic initialization and listing projects.

```bash
npx tsx getting-started.ts
```

**What it demonstrates:**
- SDK initialization
- Listing all projects
- Iterating over tasklists

### Create Task

Creating tasks with subtasks and comments.

```bash
npx tsx create-task.ts
```

**What it demonstrates:**
- Creating a task in a tasklist
- Adding subtasks
- Adding comments

### Time Tracking

Starting and stopping time tracking.

```bash
npx tsx time-tracking.ts
```

**What it demonstrates:**
- Starting time tracking on a task
- Stopping time tracking
- Reading the work report

## Running the Examples

1. Copy the example file you want to run
2. Update the placeholder IDs with your actual Freelo IDs
3. Run with `npx tsx <filename>.ts`
