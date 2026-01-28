# Primary goal

Create a "cards against humanity" style game where users can create/join rooms and play with friends.

- If you notice a task with your own name on it that is marked as in progress, continue working on it.
- Check the TASKS.md file for a list of current tasks and priorities. Use your best judgment for task selection, not just the first available task.
- When starting a new task, add your name next to it with a relevant emoji.
- If you fail to complete a task, write an explanatory markdown file in the `docs/` folder, link to it from the task, and free up the task for others to pick up.
- Do not pick up a task that someone else is already working on.
- Update this file with any relevant information for new developers.
- Verify completed tasks via verbose tests and lack of lint/compile errors.
- Any completed tasks should be moved to the COMPLETED_TASKS.md file. A commit should be made with the message "Completed task: [task name]".
- You should change your git name via `git config user.name "Your Name"` so that completed tasks can be tracked to the correct developer. Unset the name when done via `git config --unset user.name`.
- Create new subtasks in the TASKS.md file to break down larger tasks as needed. Keep tasks as isolated as reasonably possible.

# Project Structure

The server files are located in the `cards-server/` folder.

The client files are located in the `cards-client/` folder.

Install dependencies for each project separately using `pnpm install` in each folder.

Update each project's README.md with any relevant information for new developers. Don't be too verbose; just include what is necessary.

Strictly use pnpm to manage dependencies and scripts.

Use node v22.

`nvm` command can be used to switch node versions if not on v22.

# Maintenance

- Keep dependencies up to date, and uninstall unused dependencies.
- Update package.json scripts as needed.

# Running the server

- Check `cards-server/package.json` for available commands. Typically you'll use `start:dev`.

# Communication with the API

Use tanstack query for data fetching and mutations.

# Component Creation Guidelines

When creating new UI components in this project, follow these standards:

**Reference Components:** For examples of components that follow these guidelines well, see: `Panel`, `Drawer`, `Frame`, and `Sortable` in `libs/ui-panel/src/components/`.

## Before Using Components

Before using any component from the codebase:

- **Check for README documentation** - Look for a `README.md` in the component folder for API reference, usage patterns, and caveats
- **Review caveats and best practices** - Component documentation often contains important constraints or gotchas that aren't obvious from the API

This helps avoid common pitfalls and ensures correct usage of components, especially those with specific structural requirements (like compound components or context-dependent behavior).

## Technology Stack

- **Radix UI Themes**: Always use Radix UI themes primitives and components (e.g., `Flex`, `Box`, `Button`, `Card`, etc.)
- **CSS Modules**: Use CSS modules for styling instead of inline styles
- **TypeScript**: All components must be written in TypeScript with proper type definitions

## Component Architecture

### Compound Components Pattern

- Use compound component patterns for complex components (like Panel, Drawer, Frame)
- Export components as a namespace object for cleaner API:
  ```typescript
  export const Component = {
    Root: ComponentRoot,
    Header: ComponentHeader,
    Footer: ComponentFooter,
    // ... other sub-components
  };
  ```

### Props Forwarding Pattern

- **Always forward the main wrapper props** in compound components
- Extend the base component props type and spread remaining props to the underlying component
- This allows consumers to use all props from the underlying Radix UI component

Example:

```typescript
// Type definition extends the base component props
type ComponentSidebarProps = FlexProps & {
  specificProp?: ReactNode;
  // ... other component-specific props
};

// Component destructures specific props and forwards rest
const ComponentSidebar: FC<ComponentSidebarProps> = ({
  specificProp,
  children,
  className,
  ...props // All remaining FlexProps
}) => (
  <Flex {...props} className={cn(className, styles.ComponentSidebar)}>
    {children}
  </Flex>
);
```

### State Management with Data Attributes

- **Hoist component state/variants as data-attributes** on the root element
- Use data-attributes in CSS modules to apply conditional styles
- **Do NOT use compound classes** for each selector

Example:

```typescript
// Good: Using data-attributes
<div data-open={isOpen} data-variant={variant} className={styles.Root}>
  {children}
</div>

// CSS Module
.Root[data-open="true"] {
  /* styles when open */
}
.Root[data-variant="floating"] {
  /* styles for floating variant */
}
```

```typescript
// Bad: Using compound classes
<div className={cn(styles.Root, { [styles.open]: isOpen })}>{children}</div>
```

### CSS Variables for Customization

- Use CSS variables for values that instances might want to override
- Define size/width presets as CSS variables
- Allow easy customization by setting the variable on the parent element

Example:

```css
.Root {
  --component-width: 340px;
  width: var(--component-width);
}

.Root[data-size="1"] {
  --component-width: 340px;
}

.Root[data-size="2"] {
  --component-width: 480px;
}
```

## Styling Guidelines

- Use CSS modules with `.module.css` extension
- Prefer semantic class names that describe purpose, not appearance
- Use Radix UI design tokens (e.g., `var(--gray-2)`, `var(--space-4)`)
- Avoid using `z-index` unless strictly necessary (prevents stacking context issues)
- Keep CSS organized with clear sections

### Styling Radix UI Components

**Prefer component props over inline styles** - When styling Radix UI components, always use the component's built-in props rather than inline `style` attributes with CSS variables.

```typescript
// Good: Use component props
<Text color="gray">Muted text</Text>
<Button variant="outline" size="3">Click me</Button>
<Card size="2">Content</Card>

// Bad: Don't use inline styles for props that exist
<Text style={{ color: "var(--gray-9)" }}>Muted text</Text>
<Button style={{ padding: "var(--space-3)" }}>Click me</Button>
```

**Why this matters:**

- Component props are type-safe and provide autocomplete
- Props ensure consistent theming and dark mode support
- Inline styles bypass the component's built-in styling logic
- Props make the code more readable and maintainable

**When inline styles are acceptable:**

- Custom positioning (e.g., `style={{ position: "absolute", top: 0 }}`)
- Dynamic values that can't be expressed with props
- One-off layout adjustments that don't fit existing props

## File Organization

For a component named `Component`:

- `ComponentRoot.tsx` - Root/container component
- `ComponentProvider.tsx` - Context provider (if needed)
- `Component*.tsx` - Sub-components
- `Component.module.css` - Styles
- `Component.stories.tsx` - Storybook stories
- `index.ts` - Exports

## Utilities and Hooks

When creating components, prefer extracting complex or common logic into reusable utilities and hooks:

### Extract to Utilities/Hooks

- **Split component internals** into reusable utilities or hooks when feasible
- Only extract when it simplifies the component without adding unnecessary complexity
- Consider extraction when:
    - Logic is complex or could be tested independently
    - Logic could be reused across multiple components
    - Logic is general-purpose and not tightly coupled to the component

### Scan for Existing Utilities

Before creating new utilities or hooks:

- **Scan existing utility folders**
- **Reuse existing utilities** when convenient and appropriate
- If existing utilities don't fit perfectly:
    - Notify about potential refactor opportunities
    - Document the duplication or need for new utilities
    - Consider whether to extend existing utilities vs. creating new ones

### Library Placement

Place utilities/hooks in the appropriate folder:

- **Same folder** - When the utility is specific to that component/library context
- **Utility folder** - When the utility is general-purpose and could be used across multiple areas

### Keep READMEs Updated

- **Always update library READMEs** when adding or modifying utilities/hooks
- Document what the utility does, when to use it, and provide usage examples
- Follow the same documentation guidelines as components (practical and concise)

### Refactoring Existing Utilities

Before refactoring any existing hook or utility:

- **Scan the project for all usages** of the utility/hook
- **Outline risks** and potential breaking changes
- **Migrate all usages** to avoid regressions
- Test thoroughly before and after the refactor
- Consider backwards compatibility when possible

## Best Practices

- Always use `forwardRef` for components that accept refs
- Export type definitions for props
- Use descriptive prop names and provide good defaults
- Handle responsive behavior appropriately (mobile vs desktop)
- Ensure accessibility with proper ARIA attributes when needed

### Code Style

- **Avoid nested ternaries** - Use if/else statements or early returns for better readability

  ```typescript
  // Bad: Nested ternaries
  const value = condition1 ? result1 : condition2 ? result2 : result3;

  // Good: If/else statements
  let value;
  if (condition1) {
    value = result1;
  } else if (condition2) {
    value = result2;
  } else {
    value = result3;
  }
  ```

- **Extract conditional logic from component bodies** - Don't use inline variable declarations with `let` and if/else in React component bodies. Extract such logic into utility functions or hooks.

  ```typescript
  // Bad: Inline let + if/else in component body
  const Component = ({ mode }) => {
    let availableStates: State[];
    if (mode === "open/close") {
      availableStates = ["closed", "expanded"];
    } else if (mode === "expand/collapse") {
      availableStates = ["collapsed", "expanded"];
    } else {
      availableStates = ["closed", "collapsed", "expanded"];
    }
    // ... rest of component
  };

  // Good: Extract to utility function (in same file or utility library)
  const getAvailableStates = (mode: Mode): State[] => {
    switch (mode) {
      case "open/close":
        return ["closed", "expanded"];
      case "expand/collapse":
        return ["collapsed", "expanded"];
      default:
        return ["closed", "collapsed", "expanded"];
    }
  };

  const Component = ({ mode }) => {
    const availableStates = getAvailableStates(mode);
    // ... rest of component
  };
  ```

    - Extract to a utility function within the same file for component-specific logic
    - Extract to a utility library (e.g., `/utility-components`) for reusable logic
    - Extract to a custom hook within the same file or utility library if the logic involves React-specific concerns (state, effects, etc.)

- **Prefer computed state over effects** - Use `useMemo` for derived/computed state instead of `useEffect` + `useState` when the value can be computed from existing state or props

  ```typescript
  // Bad: Using useEffect to populate derived state
  const [sortedItems, setSortedItems] = useState<Item[]>([]);

  useEffect(() => {
    if (data) {
      setSortedItems([...data.items].sort((a, b) => a.order - b.order));
    }
  }, [data]);

  // Good: Using useMemo for computed state
  const sortedItems = useMemo(() => {
    if (!data) return [];
    return [...data.items].sort((a, b) => a.order - b.order);
  }, [data]);
  ```

    - Only use `useEffect` + `setState` when you need to sync with external systems or perform side effects
    - Use `useMemo` when the value is purely derived from props/state and has no side effects
    - This pattern is more predictable, avoids unnecessary re-renders, and makes dependencies explicit

- **Use `useEffectEvent` for accessing latest values in effects** - When you need to access the latest props/state inside an effect without adding them to the dependency array

  ```typescript
  // Bad: Adding form to dependencies causes effect to run too often
  useEffect(() => {
    if (shouldReset) {
      form.setValue("field", null);
    }
  }, [shouldReset, form]);

  // Good: Use useEffectEvent to access latest values without adding to deps
  const handleReset = useEffectEvent(() => {
    if (shouldReset) {
      form.setValue("field", null);
    }
  });

  useEffect(() => {
    handleReset();
  }, [shouldReset]);
  ```

    - Use `useEffectEvent` when an effect needs to access the latest props/state but shouldn't re-run when they change
    - Common use cases: form operations, callbacks that read current state, event handlers in effects
    - Prevents unnecessary effect re-runs while maintaining access to fresh values

- **Use optional chaining for optional callbacks** - Prefer optional chaining over if statements when invoking optional callback functions

  ```typescript
  // Bad: Using if statements
  if (onSaveSuccess) {
    onSaveSuccess();
  }

  if (onChange) {
    onChange(value);
  }

  // Good: Using optional chaining
  onSaveSuccess?.();
  onChange?.(value);
  ```

- **Avoid inline JSX variable assignments** - Don't create JSX variables (e.g., `const logo = <div>...</div>`) inside React component bodies. Extract them into separate components within the same file.

  ```typescript
  // Bad: Inline JSX variable
  const Component = ({ color, animate }) => {
    const logo = (
      <Theme accentColor={color}>
        <MyLogo color="var(--accent-10)" />
      </Theme>
    );

    if (animate) {
      return <AuraSpinner>{logo}</AuraSpinner>;
    }

    return logo;
  };

  // Good: Extract into separate component
  const Logo: FC<{ color: string }> = ({ color }) => {
    return (
      <Theme accentColor={color}>
        <MyLogo color="var(--accent-10)" />
      </Theme>
    );
  };

  const Component = ({ color, animate }) => {
    if (animate) {
      return (
        <AuraSpinner>
          <Logo color={color} />
        </AuraSpinner>
      );
    }

    return <Logo color={color} />;
  };
  ```

    - Extract JSX into separate named components within the same file
    - This improves readability and enables proper debugging/profiling
    - Makes the component structure clearer and more maintainable

- **Avoid ternary rendering for loading/empty states** - Break down components into smaller parts instead of using complex ternary expressions. Extract sub-components within the same file when their complexity is low or trivial.

  ```typescript
  // Bad: Complex ternary rendering
  const Component = ({ items }) => {
    return (
      <div>
        {items.length === 0 ? (
          <Card>
            <Text>No items</Text>
          </Card>
        ) : (
          <Sortable.Root items={items.map((i) => i.id)}>
            {items.map((item) => (
              <Sortable.Item key={item.id}>
                <Card>
                  <Text>{item.title}</Text>
                  <Sortable.Handle>
                    <Icon />
                  </Sortable.Handle>
                </Card>
              </Sortable.Item>
            ))}
          </Sortable.Root>
        )}
      </div>
    );
  };

  // Good: Break down into sub-components in the same file
  const EmptyState = () => {
    return (
      <Card>
        <Text>No items</Text>
      </Card>
    );
  };

  const ItemsList = ({ items }) => {
    return (
      <Sortable.Root items={items.map((i) => i.id)}>
        {items.map((item) => (
          <Item key={item.id} item={item} />
        ))}
      </Sortable.Root>
    );
  };

  const Component = ({ items }) => {
    return (
      <div>
        {items.length === 0 && <EmptyState />}
        {items.length > 0 && <ItemsList items={items} />}
      </div>
    );
  };
  ```

  Prefer a small “content” sub-component with early returns when there are 2+ branches (loading/error/empty/list, etc.). This keeps the parent render flat, avoids unreadable JSX code, and makes each state easy to test and iterate on.

  ```typescript
  type ContentProps = {
    isLoading: boolean;
    items: Item[];
  };

  const Content = ({ isLoading, items }: ContentProps) => {
    if (isLoading) return <LoadingState />;
    if (items.length === 0) return <EmptyState />;
    return <ItemsList items={items} />;
  };

  const Component = ({ items, isLoading }: { items: Item[]; isLoading: boolean }) => {
    return (
      <div>
        <Content isLoading={isLoading} items={items} />
      </div>
    );
  };
  ```

    - Break complex JSX into smaller, named sub-components
    - Keep sub-components in the same file when they're trivial or low complexity
    - Use conditional rendering with `&&` for cleaner layout code
    - Makes the component structure more scannable and maintainable

### Examples and Test Data

- **Avoid regional bias in examples** - Don't default to USA-centric examples (e.g., 🇺🇸, "American", US phone formats, USD)
- **Use neutral or locally-relevant examples** - Prefer Australian examples (🇦🇺) where a regional example is needed, or use globally neutral data
- **Consider international formats** - Use ISO standards where applicable (dates, currencies, etc.)

### Code Comments

- **Avoid unnecessary comments** - Write self-documenting code with clear naming
- **Only add comments when:**
    - Explaining why something is more complex than usual
    - Outlining bugs, workarounds, or temporary solutions
    - Documenting caveats that are meaningful for code maintainability
    - Clarifying non-obvious business logic or requirements
- **Do NOT comment:**
    - Obvious code (e.g., "// Set the width")
    - Section labels (e.g., "// Sidebar styles")
    - What the code does (the code should be self-explanatory)

### Debug Logging

When adding debug/console logs for troubleshooting:

- **Always prefix logs with a unique emoji** (use 🐛) to make them easy to filter
- This allows developers to quickly find and filter debug logs in the console
- Example: `console.log("🐛 Form values changed", values);`
- Remove debug logs before committing code to the repository

### Error Handling and User Feedback

- **Always wrap submit handlers in try/catch blocks** to handle errors gracefully
- **Use toast notifications** for success and error states
- **Provide clear, user-friendly error messages** that help users understand what went wrong

Example:

```typescript
const handleSubmit = async () => {
  try {
    // Validate and throw errors for invalid states
    if (!data) {
      throw new Error("Data is not available");
    }

    if (!isValid) {
      throw new Error("Please complete all required fields");
    }

    if (!requiredField) {
      throw new Error("Please add a required field");
    }

    // Perform the action
    await submitAction();

    // Show success feedback
    toast.success("Successfully saved");
  } catch (error) {
    console.error("Error during submit:", error);
    const message = error instanceof Error ? error.message : "Something went wrong";
    toast.error(message, {
      description: error instanceof Error ? undefined : "Please try again later.",
    });
  }
};
```

**Key practices:**

- **Throw errors for validation failures** instead of showing toasts inline
- **Handle all errors in a single catch block** with appropriate toast notifications
- **Extract error messages from Error instances** to show specific validation messages to users
- **Show loading states** during async operations (e.g., `loading={isSubmitting}` on buttons)
- **Disable form submission** when validation fails or during loading
- **Provide specific error messages** when possible (e.g., "Please add a company logo" vs. "Validation failed")

### Toast Notifications for Async Operations

When implementing toast notifications that transition through multiple states (e.g., saving → success/error), **always use a consistent toast ID** to prevent duplicate toasts and ensure smooth transitions.

- **Always add an `id` to toast calls** when you have state transitions (loading → success/error)
- **Use the same ID across all toast states** (saving, success, error) so the toast updates in place rather than creating multiple notifications
- **Inline the ID string directly** - no need to create a constant for the toast ID

Example with React Query mutations:

```typescript
const { mutate } = useMutation({
  mutationFn: async (description: JobDescription) => {
    await updateJob(client, { jobId: job.id, payload: { description } });
    return description;
  },
  onMutate: () => {
    toast.loading("Saving job description...", {
      id: "job-description-save",
    });
  },
  onSuccess: async () => {
    await invalidateJobQuery();
    toast.success("Job description saved", {
      id: "job-description-save",
    });
  },
  onError: (error) => {
    const message = error instanceof Error ? error.message : "Something went wrong";
    toast.error(message, {
      id: "job-description-save",
      description: "Failed to update the job description. Please try again later.",
    });
  },
});
```

This ensures:

- Only one toast is shown at a time for the operation
- The toast smoothly transitions from loading → success/error
- Rapid successive operations update the same toast instead of creating duplicates

## Documentation

### Component README

Each component should have its own detailed README (`Component/README.md`):

**Include:**

- Brief technical description and architecture (keep concise)
- Full API reference with all props
- Complete examples demonstrating features
- Usage patterns and import statements
- Caveats, limitations, or ways it should NOT be used
- Troubleshooting tips (only if needed)

**Do NOT include:**

- Installation steps (not needed for internal libraries)
- Over-explanation of architecture unless necessary for understanding
- "Next steps" or future improvements (unless explicitly noting a bug or missing feature that must be added)
- Unnecessary filler content

**Keep it practical:** Focus on what developers need to use the component effectively.

### Lib folder README

The parent library README should be concise and serve as an index/overview:

- **Brief introduction** to each component (1-2 sentences)
- **Quick example** showing basic usage with import statements
- **Link to component's detailed README** for full documentation
- Do NOT duplicate the full API reference or detailed documentation
- Think of it as a landing page that directs users to the right place

# Resetting the database/loading test data

Strictly only use typeorm commands, and only ever run against localhost databases.

- Test data can be found in `bin/sql`
- `cah_cards_sample_small.sql` is a smaller dataset if you need to check the structure/test file data without reading in the full dataset.
- an initial script called `load-data.sh` is available.
