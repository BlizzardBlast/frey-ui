# Graph Report - frey-ui  (2026-07-17)

## Corpus Check
- 246 files · ~109,807 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1966 nodes · 3013 edges · 183 communities (109 shown, 74 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 32 edges (avg confidence: 0.79)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `347a263e`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Date Field Architecture
- Alerts Icons Toast
- Storybook Turbo Pipeline
- Layout Primitive Components
- Monorepo Build Inputs
- Storybook Documentation Checks
- Command Palette
- Date Arithmetic Engine
- Calendar Grid State
- Biome Formatting Rules
- Library TypeScript Build
- Playwright Turbo Pipeline
- Drawer Component
- Roving Focus Collections
- Overlay Focus Scope
- Dialog Component
- Breadcrumbs and Links
- Storybook Node TypeScript
- Library Development Dependencies
- Popover Overlay Component
- Table Component
- Storybook App TypeScript
- Date Component Architecture
- Library Turbo Pipeline
- Playwright Visual Assertions
- Date Locale Formatting
- Floating Geometry Engine
- Accordion Component
- Calendar Keyboard Interactions
- Playwright Package Setup
- Root Workspace Scripts
- Storybook Test Preview
- Avatar and Badge
- Floating Auto Update
- Storybook Development Dependencies
- Library Package Exports
- Card Component
- Theme Token Generation
- Button and Slot
- Dropdown Menu Component
- Dismissible Layer Stack
- Root Development Dependencies
- Segmented Control
- CI Coverage Pipeline
- Agent Workflow Rules
- Controllable State Components
- Tooltip Interaction Engine
- Combobox Component
- Date Locale Hook
- Theme Provider and Portal
- Floating Position Hook
- Storybook Package Scripts
- Date Quality Refactor
- Playwright TypeScript Config
- Storybook Runtime Dependencies
- Changesets Release Pipeline
- Usage Pattern Stories
- Changesets Configuration
- Rollup CSS Build
- Library Package Scripts
- Overlay Browser Testing
- Radio Group
- Select and ARIA
- Root Package Metadata
- Avatar Image Tests
- Progress Component
- Spinner Component
- Renovate Dependency Policy
- Overlay Engine Migration
- Storybook GitHub Pages
- Storybook MCP Config
- Storybook Package Metadata
- React Peer Dependencies
- Accessible Design System
- Skeleton Component
- Switch Component
- Textarea Component
- CSS Module Types
- Chromatic Publishing
- Component Roadmap
- Jest Axe Types
- Monorepo Architecture
- Date Browser Coverage
- Storybook MCP Metadata
- Pagination Stories
- Segmented Control Stories
- clsx Stories
- Calendar Stories
- field Stories
- index Stories
- generate-theme-tokens Stories
- playwright Stories
- Calendar Stories
- Combobox Stories
- Command Palette Stories
- Field Stories
- Flex Stories
- Grid Stories
- Radio Group Stories
- Stack Stories
- Theme Provider Stories
- Toast Stories
- calendar Stories
- Accordion Stories
- Alert Stories
- Avatar Stories
- Badge Stories
- Box Stories
- Breadcrumbs Stories
- Button Stories
- Card Stories
- Checkbox Stories
- Chip Stories
- Dialog Stories
- Drawer Stories
- Dropdown Menu Stories
- Icons Stories
- Link Stories
- Popover Stories
- Progress Stories
- Select Stories
- Skeleton Stories
- Spinner Stories
- Switch Stories
- Table Stories
- Tabs Stories
- Textarea Stories
- Text Input Stories
- Tooltip Stories
- Storybook Main Config
- Storybook Project References
- Date Component Changelog
- CSS Side Effects
- Library Project References
- Workspace Dependency Policy
- Cursor Storybook MCP
- Root Storybook MCP
- Chromatic Dependency
- Chromatic Addon Dependency
- JSDOM Dependency
- Storybook Dependency
- Storybook Docs Dependency
- Storybook MCP Dependency
- Storybook Vite Dependency
- Testing Library Matchers
- React Type Dependency
- TypeScript Dependency
- Vitest Dependency
- Calendar Stories
- Date Field Stories
- Date Picker Stories
- Automated Release History
- Commitlint Configuration
- Commitlint Conventional Dependency
- Date Components Review Gates
- Date Quality Review Gates
- Husky Git Hooks
- Public Export Policy
- JSDOM Library Dependency
- PostCSS Dependency
- Rollup Peer Externalization
- Rollup TypeScript Plugin
- User Event Testing
- Jest Axe Type Dependency
- Segmented Control Changelog
- Accordion Roadmap
- Command Palette Roadmap
- Empty State Roadmap
- Segmented Control Roadmap
- Date Calendar Concept
- Date Segment Concept
- First Day Week Type
- Segmented Control Release
- Q: How does dismissibleLayer scrollbar press detection work, and which tests and overlay consumers depend on it?
- post-commit
- post-checkout
- platform.ts
- @storybook/addon-themes

## God Nodes (most connected - your core abstractions)
1. `parseDateValue()` - 32 edges
2. `getCalendarDate()` - 25 edges
3. `scripts` - 23 edges
4. `useControllableValue()` - 22 edges
5. `compilerOptions` - 22 edges
6. `compilerOptions` - 20 edges
7. `createCalendarGridModel()` - 20 edges
8. `serializeDateValue()` - 20 edges
9. `compilerOptions` - 19 edges
10. `fromCalendarDate()` - 19 edges

## Surprising Connections (you probably didn't know these)
- `Changesets Action` --conceptually_related_to--> `Version PR`  [INFERRED]
  .github/workflows/publish.yml → .changeset/README.md
- `Storybook MCP` --conceptually_related_to--> `Storybook Canonical API Reference`  [INFERRED]
  AGENTS.md → apps/storybook/src/stories/Introduction.mdx
- `Playwright Browser E2E` --conceptually_related_to--> `Playwright End-to-End Suite`  [INFERRED]
  packages/frey-ui/README.md → apps/playwright/README.md
- `Changesets Release Flow` --conceptually_related_to--> `Release`  [INFERRED]
  .changeset/README.md → .github/workflows/publish.yml
- `getLocalTodayValue()` --calls--> `serializeDateValue()`  [EXTRACTED]
  packages/frey-ui/src/Calendar/index.tsx → packages/frey-ui/src/date/dateEngine.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Completed Date Components Roadmap** — docs_component_priorities_date_components_roadmap, docs_component_priorities_datefield, docs_component_priorities_calendar, docs_component_priorities_datepicker [EXTRACTED 1.00]
- **Shared Public Date Component Composition** — docs_superpowers_plans_2026_07_16_date_components_datefield, docs_superpowers_plans_2026_07_16_date_components_calendar, docs_superpowers_plans_2026_07_16_date_components_datepicker, docs_superpowers_plans_2026_07_16_date_components_calendar_engine, docs_superpowers_plans_2026_07_16_date_components_iso_gregorian_value_contract, docs_superpowers_plans_2026_07_16_date_components_popover [EXTRACTED 1.00]
- **Pure Interaction Module Refactor** — docs_superpowers_plans_2026_07_16_date_quality_refactor_datefield, docs_superpowers_plans_2026_07_16_date_quality_refactor_datefieldinteractions, docs_superpowers_plans_2026_07_16_date_quality_refactor_calendar, docs_superpowers_plans_2026_07_16_date_quality_refactor_calendarinteractions, docs_superpowers_plans_2026_07_16_date_quality_refactor_datepicker [EXTRACTED 1.00]
- **Date Input Browser Coverage** — apps_playwright_changelog_calendar, apps_playwright_changelog_datefield, apps_playwright_changelog_datepicker, apps_playwright_changelog_browser_interaction_coverage [EXTRACTED 1.00]
- **Storybook Date Input Release** — apps_storybook_changelog_calendar, apps_storybook_changelog_datefield, apps_storybook_changelog_datepicker, apps_storybook_changelog_storybook_1_0_9 [EXTRACTED 1.00]
- **Frey UI Date Input System** — packages_frey_ui_changelog_calendar, packages_frey_ui_changelog_datefield, packages_frey_ui_changelog_datepicker [EXTRACTED 1.00]
- **Overlay Behavior Preservation** — _changeset_calm_overlays_float_overlay_engine_migration, _changeset_calm_overlays_float_popover, _changeset_calm_overlays_float_dropdownmenu, _changeset_calm_overlays_float_tooltip, _changeset_calm_overlays_float_datepicker [EXTRACTED 1.00]
- **CI Quality Reporting** — _github_workflows_ci_library_coverage, _github_workflows_ci_codecov_coverage_upload, _github_workflows_ci_codecov_test_results_upload, _github_workflows_ci_test_report_artifact [EXTRACTED 1.00]
- **Affected-Gated Storybook Deployment** — _github_workflows_deploy_github_pages_storybook_affected_query, _github_workflows_deploy_github_pages_conditional_storybook_deployment, _github_workflows_deploy_github_pages_storybook_static_site, _github_workflows_deploy_github_pages_github_pages [EXTRACTED 1.00]

## Communities (183 total, 74 thin omitted)

### Community 0 - "Date Field Architecture"
Cohesion: 0.05
Nodes (66): DATE_CALENDARS, validateDateCalendar(), validateDateConstraints(), CalendarEraOption, DateSegmentLayoutPart, CalendarDate, DateSegment, DateSegmentLabels (+58 more)

### Community 1 - "Alerts Icons Toast"
Cohesion: 0.05
Nodes (49): Alert, AlertComponent, AlertProps, AlertVariant, icons, VariantClassMap, VariantRoleMap, stubbornRef (+41 more)

### Community 2 - "Storybook Turbo Pipeline"
Cohesion: 0.07
Nodes (48): inputs, outputs, dependsOn, inputs, outputs, cache, dependsOn, persistent (+40 more)

### Community 3 - "Layout Primitive Components"
Cohesion: 0.06
Nodes (31): Box, BoxBaseProps, BoxComponent, BoxElement, BoxProps, ColorToken, ColorValueMap, RadiusToken (+23 more)

### Community 4 - "Monorepo Build Inputs"
Cohesion: 0.07
Nodes (43): apps/storybook/src/stories/**, biome.json, node_modules/.tmp/tsconfig.tsbuildinfo, packages/frey-ui/src/index.ts, scripts/check-storybook-api-coverage.mjs, scripts/storybookDocsCheck.mjs, dependsOn, inputs (+35 more)

### Community 5 - "Storybook Documentation Checks"
Cohesion: 0.09
Nodes (37): castWrapperStoryFiles, componentStoryFiles, __dirname, documentedComponents, exportedComponents, exportMatches, __filename, incompleteStoryFiles (+29 more)

### Community 6 - "Command Palette"
Cohesion: 0.05
Nodes (36): CommandPalette, CommandPaletteComponent, CommandPaletteContent, CommandPaletteContentComponent, CommandPaletteContentProps, CommandPaletteContext, CommandPaletteContextValue, CommandPaletteEmpty (+28 more)

### Community 7 - "Date Arithmetic Engine"
Cohesion: 0.12
Nodes (53): addClampedCalendarUnit(), createCalendarState(), FIXED_MONTH_CALENDARS, getCalendarMonthStart(), getNextCalendarMonthEpoch(), isSameCalendarUnit(), resolveInitialCalendarFocus(), addCalendarMonths() (+45 more)

### Community 8 - "Calendar Grid State"
Cohesion: 0.16
Nodes (17): eventIsInside(), getElementScale(), getEventPath(), getPointerTargetContext(), getScaledClientBounds(), getScrollbarPresence(), hasScrollbar(), isDocumentScrollbarPress() (+9 more)

### Community 9 - "Biome Formatting Rules"
Cohesion: 0.05
Nodes (37): source, assist, actions, enabled, css, formatter, files, ignoreUnknown (+29 more)

### Community 10 - "Library TypeScript Build"
Cohesion: 0.05
Nodes (36): compilerOptions, allowSyntheticDefaultImports, declaration, declarationDir, declarationMap, esModuleInterop, forceConsistentCasingInFileNames, isolatedDeclarations (+28 more)

### Community 11 - "Playwright Turbo Pipeline"
Cohesion: 0.06
Nodes (33): extends, extends, extends, //, ^build, !CHANGELOG.md, !**/.continue/**, !**/.cursor/** (+25 more)

### Community 12 - "Drawer Component"
Cohesion: 0.06
Nodes (30): Drawer, DrawerBody, DrawerBodyComponent, DrawerBodyProps, DrawerComponent, DrawerContent, DrawerContentComponent, drawerContentPlacementClassMap (+22 more)

### Community 13 - "Roving Focus Collections"
Cohesion: 0.07
Nodes (25): OrderedRovingItem, RegisterItemOptions, RovingCollection, RovingItem, sortByDomOrder(), Harness(), HarnessProps, useRovingCollection() (+17 more)

### Community 14 - "Overlay Focus Scope"
Cohesion: 0.22
Nodes (13): focusElement(), FocusGuardProps, focusGuardStyle, FocusScope(), FocusScopeProps, getInitialFocusTarget(), hideElement(), hideOutsideContents() (+5 more)

### Community 15 - "Dialog Component"
Cohesion: 0.07
Nodes (28): Dialog, DialogBody, DialogBodyComponent, DialogBodyProps, DialogComponent, DialogContent, DialogContentComponent, DialogContentProps (+20 more)

### Community 16 - "Breadcrumbs and Links"
Cohesion: 0.08
Nodes (25): Breadcrumbs, BreadcrumbsComponent, BreadcrumbsCurrent, BreadcrumbsCurrentComponent, BreadcrumbsCurrentProps, BreadcrumbsItem, BreadcrumbsItemComponent, BreadcrumbsItemProps (+17 more)

### Community 17 - "Storybook Node TypeScript"
Cohesion: 0.07
Nodes (28): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection, moduleResolution (+20 more)

### Community 18 - "Library Development Dependencies"
Cohesion: 0.07
Nodes (29): jest-axe, devDependencies, @biomejs/biome, jest-axe, postcss-modules, rimraf, rollup, @rollup/plugin-commonjs (+21 more)

### Community 19 - "Popover Overlay Component"
Cohesion: 0.13
Nodes (13): Popover, PopoverComponent, PopoverContent, PopoverContentComponent, PopoverContentProps, PopoverContext, PopoverContextValue, PopoverPlacement (+5 more)

### Community 20 - "Table Component"
Cohesion: 0.07
Nodes (26): Table, TableBody, TableBodyComponent, TableBodyProps, TableCaption, TableCaptionComponent, TableCaptionProps, TableCell (+18 more)

### Community 21 - "Storybook App TypeScript"
Cohesion: 0.07
Nodes (26): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection, moduleResolution (+18 more)

### Community 22 - "Date Component Architecture"
Cohesion: 0.10
Nodes (26): APG keyboard behavior, Button, Calendar, Calendar adapters, Calendar engine, Calendar grid model, computeAriaProps, Date draft reducer (+18 more)

### Community 23 - "Library Turbo Pipeline"
Cohesion: 0.08
Nodes (25): outputs, cache, persistent, extends, //, !CHANGELOG.md, coverage/**, dist/** (+17 more)

### Community 24 - "Playwright Visual Assertions"
Cohesion: 0.12
Nodes (15): contrastRatio(), expectBalancedDatePartGaps(), parseRgb(), relativeLuminance(), Rgb, BoxGeometry, getBoxGap(), getElementGeometry() (+7 more)

### Community 25 - "Date Locale Formatting"
Cohesion: 0.20
Nodes (25): createCalendarGridModel(), createUtcPresentationDate(), formatCalendarMonthHeading(), formatDateValue(), formatEraLabel(), formatLocalizedNumber(), FRIDAY_FIRST_REGIONS, getCalendarEraOptions() (+17 more)

### Community 26 - "Floating Geometry Engine"
Cohesion: 0.05
Nodes (47): autoUpdateFloating(), Cleanup, getOverflowAncestors(), getOverflowElements(), getParentElement(), isOverflowElement(), observeReferenceMove(), SharedListener (+39 more)

### Community 27 - "Accordion Component"
Cohesion: 0.08
Nodes (19): Accordion, AccordionComponent, AccordionContent, AccordionContentComponent, AccordionContentProps, AccordionContext, AccordionContextValue, AccordionItem (+11 more)

### Community 28 - "Calendar Keyboard Interactions"
Cohesion: 0.07
Nodes (37): CalendarKeyboardCommand, resolveCalendarKeyboardCommand(), resolvePageMovement(), STATIC_MOVEMENTS, addClampedIsoDays(), CalendarCellModel, CalendarFocusMovement, CalendarGridModel (+29 more)

### Community 29 - "Playwright Package Setup"
Cohesion: 0.09
Nodes (22): dependencies, @frey-ui/storybook, devDependencies, @playwright/test, serve, @types/node, typescript, @types/node (+14 more)

### Community 30 - "Root Workspace Scripts"
Cohesion: 0.09
Nodes (23): scripts, build, build:storybook, changeset, check, check:changed, check:staged, ci:changed (+15 more)

### Community 31 - "Storybook Test Preview"
Cohesion: 0.10
Nodes (18): preview, compilerOptions, declarationMap, isolatedDeclarations, noEmit, types, exclude, extends (+10 more)

### Community 32 - "Avatar and Badge"
Cohesion: 0.13
Nodes (16): Avatar, AvatarComponent, AvatarProps, AvatarSize, AvatarStatus, SizeClassMap, StatusClassMap, Badge (+8 more)

### Community 33 - "Floating Auto Update"
Cohesion: 0.21
Nodes (9): mergeRefs(), AnyEvent, AnyProps, composeEventHandlers(), EventHandler, isEventHandler(), mergeProps(), Slot (+1 more)

### Community 34 - "Storybook Development Dependencies"
Cohesion: 0.11
Nodes (19): devDependencies, @biomejs/biome, @storybook/addon-a11y, @storybook/addon-docs, @types/node, @types/react-dom, vite, @vitejs/plugin-react (+11 more)

### Community 35 - "Library Package Exports"
Cohesion: 0.11
Nodes (18): exports, ./package.json, ./theme.css, files, dist, license, main, module (+10 more)

### Community 36 - "Card Component"
Cohesion: 0.11
Nodes (17): Card, CardComponent, CardContent, CardContentComponent, CardContentProps, CardFooter, CardFooterComponent, CardFooterProps (+9 more)

### Community 37 - "Theme Token Generation"
Cohesion: 0.25
Nodes (18): buildCss(), contrastingText(), contrastRatio(), contrastSafeSelection(), darken(), DEFAULT_COLORS, hexToRgb(), lighten() (+10 more)

### Community 38 - "Button and Slot"
Cohesion: 0.20
Nodes (8): Button, ButtonBaseProps, ButtonComponent, ButtonProps, ButtonSize, ButtonVariant, SizeClassMap, VariantClassMap

### Community 39 - "Dropdown Menu Component"
Cohesion: 0.11
Nodes (16): DropdownMenu, DropdownMenuComponent, DropdownMenuContent, DropdownMenuContentComponent, DropdownMenuContentProps, DropdownMenuContext, DropdownMenuContextValue, DropdownMenuItem (+8 more)

### Community 40 - "Dismissible Layer Stack"
Cohesion: 0.20
Nodes (9): attachManagerListeners(), DismissReason, getTopLayer(), Layer, LayerManager, LayerOptions, managers, registerLayer() (+1 more)

### Community 41 - "Root Development Dependencies"
Cohesion: 0.12
Nodes (17): @changesets/cli, @commitlint/cli, @commitlint/types, devDependencies, @biomejs/biome, @changesets/cli, @commitlint/cli, @commitlint/types (+9 more)

### Community 42 - "Segmented Control"
Cohesion: 0.12
Nodes (12): SegmentedControl, SegmentedControlComponent, SegmentedControlContext, SegmentedControlContextValue, SegmentedControlItem, SegmentedControlItemComponent, SegmentedControlItemProps, SegmentedControlProps (+4 more)

### Community 43 - "CI Coverage Pipeline"
Cohesion: 0.21
Nodes (15): Affected-Package Checks, CI, Codecov, Codecov Coverage Upload, Codecov Test Results Upload, JUnit Test Report, LCOV Coverage Report, Library Coverage (+7 more)

### Community 44 - "Agent Workflow Rules"
Cohesion: 0.13
Nodes (15): Agent Self-Review Loop, CI Parity Installation, Frey UI Monorepo, Git Hook Quality Gates, Node.js 24.16.0, Required Validation Pipeline, Storybook API Coverage Check, Storybook MCP (+7 more)

### Community 45 - "Controllable State Components"
Cohesion: 0.22
Nodes (4): Pagination, PaginationComponent, PaginationItem, PaginationProps

### Community 46 - "Tooltip Interaction Engine"
Cohesion: 0.27
Nodes (9): isFocusVisible(), ModalityManager, modalityManagers, nonTypeableInputTypes, subscribeToModality(), TooltipInputFixture(), TooltipInteractionFixture(), useTooltipInteractions() (+1 more)

### Community 47 - "Combobox Component"
Cohesion: 0.15
Nodes (7): options, Combobox, ComboboxComponent, ComboboxOption, ComboboxProps, ComboboxSize, SizeClassMap

### Community 48 - "Date Locale Hook"
Cohesion: 0.52
Nodes (5): getBrowserLocale(), getServerLocale(), subscribeToLocale(), LocaleProbe(), useDateLocale()

### Community 49 - "Theme Provider and Portal"
Cohesion: 0.16
Nodes (10): FreyTheme, ThemeContext, ThemeContextValue, ThemeProvider(), ThemeProviderProps, useTheme(), InvalidConsumer(), ThemeConsumer() (+2 more)

### Community 50 - "Floating Position Hook"
Cohesion: 0.31
Nodes (9): DropdownMenuRoot(), useDismissibleLayer(), ServerOverlayFixture(), useFloatingPosition(), useControllableValue(), PopoverRoot(), Tooltip(), TooltipPlacement (+1 more)

### Community 51 - "Storybook Package Scripts"
Cohesion: 0.17
Nodes (12): scripts, build, build-storybook, dev, format, format:check, lint, preview (+4 more)

### Community 52 - "Date Quality Refactor"
Cohesion: 0.20
Nodes (12): Calendar, calendarInteractions, CodeFactor, Cognitive complexity threshold 15, DateField, DateField and Calendar Quality Refactor, dateFieldInteractions, DatePicker (+4 more)

### Community 53 - "Playwright TypeScript Config"
Cohesion: 0.18
Nodes (10): compilerOptions, esModuleInterop, module, moduleResolution, skipLibCheck, strict, target, include (+2 more)

### Community 54 - "Storybook Runtime Dependencies"
Cohesion: 0.18
Nodes (11): dependencies, frey-ui, react, react-dom, tailwindcss, @tailwindcss/vite, react, react-dom (+3 more)

### Community 55 - "Changesets Release Pipeline"
Cohesion: 0.24
Nodes (10): Changesets, Changesets Release Flow, npm, Version PR, Changesets Action, npm Registry, pnpm release, Release (+2 more)

### Community 56 - "Usage Pattern Stories"
Cohesion: 0.20
Nodes (8): actionRowStyle, basePatternStyle, headingBlockStyle, meta, Story, subtitleStyle, SyncStatus, titleStyle

### Community 57 - "Changesets Configuration"
Cohesion: 0.20
Nodes (9): access, baseBranch, changelog, commit, fixed, ignore, linked, $schema (+1 more)

### Community 58 - "Rollup CSS Build"
Cohesion: 0.20
Nodes (5): magic-string, magic-string, externalPackages, packageJson, prependAfterDirectivePrologue()

### Community 59 - "Library Package Scripts"
Cohesion: 0.20
Nodes (10): scripts, build, check, dev, format, format:check, lint, test (+2 more)

### Community 60 - "Overlay Browser Testing"
Cohesion: 0.22
Nodes (9): PLAYWRIGHT_BASE_URL, Playwright End-to-End Suite, PLAYWRIGHT_STORYBOOK_PORT, Storybook Test Target, Accordion Content Boundary, Accordion Content Animation, JSDOM, Overlay Focus Management (+1 more)

### Community 61 - "Radio Group"
Cohesion: 0.25
Nodes (7): OrientationClassMap, RadioGroup, RadioGroupComponent, RadioGroupOrientation, RadioGroupProps, RadioOption, options

### Community 62 - "Select and ARIA"
Cohesion: 0.25
Nodes (6): Select, SelectComponent, SelectProps, SelectSize, SizeClassMap, computeAriaProps()

### Community 63 - "Root Package Metadata"
Cohesion: 0.25
Nodes (7): engines, node, name, packageManager, private, publishConfig, provenance

### Community 64 - "Avatar Image Tests"
Cohesion: 0.25
Nodes (3): DeferredImage, FailingImage, SuccessfulImage

### Community 65 - "Progress Component"
Cohesion: 0.25
Nodes (5): Progress, ProgressComponent, ProgressProps, ProgressSize, SizeClassMap

### Community 66 - "Spinner Component"
Cohesion: 0.29
Nodes (5): Spinner, SpinnerComponent, SpinnerProps, SpinnerSize, SpinnerSizeMap

### Community 67 - "Renovate Dependency Policy"
Cohesion: 0.25
Nodes (7): config:recommended, dependencies, helpers:pinGitHubActionDigests, extends, labels, packageRules, $schema

### Community 68 - "Overlay Engine Migration"
Cohesion: 0.29
Nodes (7): DatePicker, DropdownMenu, Floating UI, Frey UI Private Overlay Engine, Behavior-Preserving Overlay Engine Migration, Popover, Tooltip

### Community 69 - "Storybook GitHub Pages"
Cohesion: 0.29
Nodes (7): Bitovi Storybook to GitHub Pages Action, Conditional Storybook Deployment, GitHub Pages, Storybook Affected Query, Build and Publish Storybook to GitHub Pages, Storybook Static Site, Turborepo

### Community 70 - "Storybook MCP Config"
Cohesion: 0.29
Nodes (6): mcp, Storybook, $schema, enabled, type, url

### Community 71 - "Storybook Package Metadata"
Cohesion: 0.29
Nodes (6): name, private, publishConfig, provenance, type, version

### Community 72 - "React Peer Dependencies"
Cohesion: 0.29
Nodes (7): react, react-dom, react, react-dom, peerDependencies, react, react-dom

### Community 73 - "Accessible Design System"
Cohesion: 0.29
Nodes (7): Brand Token Generator, Frey UI, jest-axe, Public Subpath Imports, Storybook Addon A11y, Storybook API Docs, WCAG 2.2 AA

### Community 74 - "Skeleton Component"
Cohesion: 0.33
Nodes (5): ShapeClassMap, Skeleton, SkeletonComponent, SkeletonProps, SkeletonShape

### Community 75 - "Switch Component"
Cohesion: 0.33
Nodes (5): SizeClassMap, Switch, SwitchComponent, SwitchProps, SwitchSize

### Community 76 - "Textarea Component"
Cohesion: 0.29
Nodes (5): ResizeClassMap, Textarea, TextareaComponent, TextareaProps, TextareaResize

### Community 77 - "CSS Module Types"
Cohesion: 0.29
Nodes (6): *.css, *.module.css, *.module.less, *.module.sass, *.module.scss, *.module.styl

### Community 78 - "Chromatic Publishing"
Cohesion: 0.33
Nodes (6): Chromatic, Chromatic Publish, Only Changed Stories, Storybook Preview Stats, Storybook, Turborepo

### Community 79 - "Component Roadmap"
Cohesion: 0.33
Nodes (6): Alert, Dropzone, Field, FileUpload, Progress, Toast

### Community 80 - "Jest Axe Types"
Cohesion: 0.33
Nodes (3): Assertion, AsymmetricMatchersContaining, vitest

### Community 81 - "Monorepo Architecture"
Cohesion: 0.33
Nodes (6): Changesets Release Workflow, Frey UI Component Library, Frey UI Monorepo, Playwright End-to-End App, Storybook Canonical API Reference, Storybook Docs App

### Community 82 - "Date Browser Coverage"
Cohesion: 0.60
Nodes (5): Browser Interaction Coverage, Calendar, DateField, DatePicker, SegmentedControl

### Community 83 - "Storybook MCP Metadata"
Cohesion: 0.40
Nodes (5): Local Storybook MCP Endpoint, Model Context Protocol, Storybook MCP Server, Frey UI Component Library Stories and Documentation, Noindex Robots Policy

### Community 85 - "Segmented Control Stories"
Cohesion: 0.40
Nodes (3): SegmentedControlStoryProps, Story, ThemeCompatibilityPreviewProps

### Community 86 - "clsx Stories"
Cohesion: 0.40
Nodes (5): clsx, dependencies, clsx, tslib, tslib

### Community 87 - "Calendar Stories"
Cohesion: 0.60
Nodes (5): Calendar, Date Components Roadmap, DateField, DatePicker, Release-owner maintenance checks

### Community 89 - "index Stories"
Cohesion: 0.50
Nodes (3): TextInput, TextInputComponent, TextInputProps

### Community 90 - "generate-theme-tokens Stories"
Cohesion: 0.50
Nodes (3): contrastRatio(), relativeLuminance(), scriptPath

### Community 91 - "playwright Stories"
Cohesion: 0.50
Nodes (3): EnvMap, hasCustomBaseURL, PORT

### Community 92 - "Calendar Stories"
Cohesion: 0.83
Nodes (4): Calendar, DateField, DatePicker, Frey UI Storybook 1.0.9

### Community 93 - "Combobox Stories"
Cohesion: 0.50
Nodes (3): ComboboxStoryProps, options, Story

### Community 95 - "Field Stories"
Cohesion: 0.50
Nodes (3): baseInputStyle, FieldStoryProps, Story

### Community 96 - "Flex Stories"
Cohesion: 0.50
Nodes (3): FlexStoryProps, itemStyle, Story

### Community 97 - "Grid Stories"
Cohesion: 0.50
Nodes (3): cellStyle, GridStoryProps, Story

### Community 98 - "Radio Group Stories"
Cohesion: 0.50
Nodes (3): planOptions, RadioGroupStoryProps, Story

### Community 99 - "Stack Stories"
Cohesion: 0.50
Nodes (3): panelStyle, StackStoryProps, Story

### Community 131 - "Date Component Changelog"
Cohesion: 0.67
Nodes (3): Calendar, DateField, DatePicker

### Community 132 - "CSS Side Effects"
Cohesion: 0.67
Nodes (3): sideEffects, **/*.css, **/*.module.css

### Community 134 - "Workspace Dependency Policy"
Cohesion: 0.67
Nodes (3): pnpm Dependency Catalog, Dependency Installation Policy, Frey UI Workspaces

### Community 141 - "Storybook Docs Dependency"
Cohesion: 0.39
Nodes (8): filterRadioGroups(), focusableSelector, getTabbableElements(), isElementDisabled(), isElementVisible(), isInsideClosedDetails(), isRadio(), sortByTabOrder()

### Community 177 - "Q: How does dismissibleLayer scrollbar press detection work, and which tests and overlay consumers depend on it?"
Cohesion: 0.40
Nodes (4): Answer, Outcome, Q: How does dismissibleLayer scrollbar press detection work, and which tests and overlay consumers depend on it?, Source Nodes

### Community 178 - "post-commit"
Cohesion: 0.40
Nodes (4): post-commit script, GRAPHIFY_CHANGED, GRAPHIFY_REBUILD_LOG, PYTHONHASHSEED

### Community 179 - "post-checkout"
Cohesion: 0.50
Nodes (3): post-checkout script, GRAPHIFY_REBUILD_LOG, PYTHONHASHSEED

## Knowledge Gaps
- **861 isolated node(s):** `Answer`, `Outcome`, `Source Nodes`, `FocusScopeProps`, `modalAccessibilityManagers` (+856 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **74 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useControllableValue()` connect `Floating Position Hook` to `Date Field Architecture`, `Command Palette`, `Dropdown Menu Component`, `Segmented Control`, `Switch Component`, `Controllable State Components`, `Roving Focus Collections`, `Combobox Component`, `Dialog Component`, `Popover Overlay Component`, `Accordion Component`, `Calendar Keyboard Interactions`, `Radio Group`?**
  _High betweenness centrality (0.010) - this node is a cross-community bridge._
- **Why does `DateCalendar` connect `Calendar Keyboard Interactions` to `Date Field Architecture`, `Date Locale Formatting`, `Avatar and Badge`, `Date Arithmetic Engine`?**
  _High betweenness centrality (0.006) - this node is a cross-community bridge._
- **Why does `useToast()` connect `Alerts Icons Toast` to `Avatar and Badge`?**
  _High betweenness centrality (0.006) - this node is a cross-community bridge._
- **What connects `Answer`, `Outcome`, `Source Nodes` to the rest of the system?**
  _861 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Date Field Architecture` be split into smaller, more focused modules?**
  _Cohesion score 0.054945054945054944 - nodes in this community are weakly interconnected._
- **Should `Alerts Icons Toast` be split into smaller, more focused modules?**
  _Cohesion score 0.053994732221246705 - nodes in this community are weakly interconnected._
- **Should `Storybook Turbo Pipeline` be split into smaller, more focused modules?**
  _Cohesion score 0.07482993197278912 - nodes in this community are weakly interconnected._