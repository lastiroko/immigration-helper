# IMMIGRATION HELPER - AGENT SYSTEM

## PROJECT CONTEXT

Building a production-grade immigration platform for international students in Germany.
This is both a portfolio project (demonstrating enterprise-level skills) and a scalable startup (targeting 100K+ users).

**Existing Codebase:** ~/Landing-app (similar problem, reuse patterns)
Use `/graphify` to understand existing architecture before creating new code.

## CORE AGENTS

### Backend Agent (Spring Boot)
**Responsibility:** REST API, database, authentication, payments
**Stack:** Java 17, Spring Boot 3.2, PostgreSQL, Stripe
**Patterns:** Clean Architecture, CQRS, Repository Pattern
**Commands:**
- `/graphify analyze ~/Landing-app authentication` before implementing auth
- Use same JWT pattern as Landing app
- All entities must have JPA annotations, Lombok, validation
- Services use constructor injection
- Controllers return ResponseEntity with proper HTTP status
- MapStruct for DTO mapping

### Frontend Agent (React)
**Responsibility:** Web UI, user experience, API integration
**Stack:** React 18, TypeScript, Tailwind CSS, Vite
**Patterns:** Feature-based folder structure, custom hooks
**Commands:**
- `/graphify find API endpoints` to generate TypeScript types
- Use React Query for server state
- Axios with interceptors for API calls
- All components must be TypeScript with proper types
- Tailwind for styling (no inline styles)
- Accessibility: ARIA labels, semantic HTML

### Mobile Agent (Android)
**Responsibility:** Native Android app, offline-first
**Stack:** Kotlin, Jetpack Compose, Retrofit, Room
**Patterns:** MVVM, Clean Architecture, Use Cases
**Commands:**
- `/graphify get backend schema` for Retrofit models
- Jetpack Compose for 100% of UI
- Material 3 design
- Kotlin Coroutines for async
- Hilt for dependency injection

### Database Agent
**Responsibility:** Schema design, migrations, optimization
**Stack:** PostgreSQL, Flyway, Redis
**Commands:**
- Design normalized schemas
- Create Flyway migrations (V1__, V2__, etc.)
- Add indexes for performance
- Seed data with realistic German office locations

### DevOps Agent
**Responsibility:** CI/CD, deployment, monitoring
**Stack:** Docker, GitHub Actions, Railway, Vercel
**Commands:**
- Docker Compose for local development
- Multi-stage Docker builds
- GitHub Actions for testing + deployment
- Environment-based config (dev, staging, prod)

### Testing Agent
**Responsibility:** Unit, integration, E2E tests
**Stack:** JUnit 5, Mockito, TestContainers, Vitest, Playwright
**Commands:**
- Target 80%+ code coverage
- TestContainers for integration tests
- Mock external APIs (Stripe, Google Maps)
- E2E tests for critical flows

## DEVELOPMENT RULES

1. **ALWAYS check Graphify first:** `/graphify analyze ~/Landing-app <feature>` before creating similar features
2. **No code duplication:** Reuse patterns from Landing app
3. **Clean commits:** Descriptive messages, atomic changes
4. **Branch naming:** feature/*, fix/*, test/*
5. **PR requirements:** Tests pass, no linting errors, description filled
6. **Documentation:** Every public method needs JavaDoc/TSDoc
7. **Security:** Never commit secrets, use environment variables

## QUALITY GATES

Before marking task complete:
- [ ] Code compiles/builds
- [ ] Tests pass (unit + integration)
- [ ] Linter passes (no warnings)
- [ ] Documentation updated
- [ ] PR created (if using agent orchestrator)

## USEFUL GRAPHIFY QUERIES

```bash
# Before creating auth
/graphify analyze ~/Landing-app authentication

# Before creating API endpoint
/graphify find "REST controller patterns"

# Before database schema
/graphify explain "entity relationships"

# Finding payment integration patterns
/graphify search "payment OR stripe"

# Understanding folder structure
/graphify report ~/Landing-app
```

## CONTEXT WINDOWS

- Backend Agent: Can see entire backend/ directory
- Frontend Agent: Can see entire frontend-web/ directory
- Mobile Agent: Can see entire mobile-android/ directory
- Database Agent: Can see backend/src/main/resources/db/
- DevOps Agent: Can see docker/, .github/, deployment configs

## EMERGENCY CONTACTS

If stuck:
1. Ask Philip (project owner)
2. Use `/graphify explain <concept>` to understand Landing app approach
3. Search GitHub issues in Landing app repo
4. Check Spring Boot / React / Kotlin official docs

