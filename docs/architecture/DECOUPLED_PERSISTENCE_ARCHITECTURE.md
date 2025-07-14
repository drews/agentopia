# Decoupled Persistence Architecture - Clean Architecture Design

## Overview

This document outlines the architectural principles for implementing stateful persistence in Agentopia while maintaining clean, decoupled design patterns inspired by AI Town's proven separation of concerns.

## Architectural Principles

### 1. Separation of Concerns

**Persistence Layer** (Data)
- Database schema and migrations
- Raw data access patterns
- Storage optimization and indexing

**Domain Layer** (Business Logic)
- Agent memory management
- Relationship modeling
- Persona adaptation logic

**Application Layer** (Orchestration)
- Use case coordination
- Transaction boundaries
- External service integration

**Interface Layer** (Presentation)
- REST API endpoints
- WebSocket event handling
- User interface components

### 2. Dependency Inversion

```python
# Abstract interfaces in domain layer
class MemoryRepository(ABC):
    @abstractmethod
    async def store_memory(self, memory: AgentMemory) -> str: ...
    
    @abstractmethod 
    async def find_memories(self, agent_id: str, criteria: MemoryCriteria) -> List[AgentMemory]: ...

# Concrete implementation in infrastructure layer
class SQLiteMemoryRepository(MemoryRepository):
    async def store_memory(self, memory: AgentMemory) -> str:
        # SQLite-specific implementation
        
    async def find_memories(self, agent_id: str, criteria: MemoryCriteria) -> List[AgentMemory]:
        # SQLite-specific query logic
```

### 3. Domain-Driven Design

**Aggregates**
- `Agent` (root): Contains memories, relationships, goals
- `Conversation` (root): Contains interactions, participants, context
- `Persona` (root): Contains configuration, adaptations, usage

**Value Objects**
- `Memory`, `Relationship`, `Interaction`
- `Position`, `Trust Level`, `Importance Score`

**Domain Services**
- `MemoryConsolidationService`
- `RelationshipCalculationService`  
- `PersonaAdaptationService`

## Layered Architecture

### Infrastructure Layer (Bottom)

```
┌─────────────────────────────────────────────────────────────┐
│                    Infrastructure Layer                     │
├─────────────────────────────────────────────────────────────┤
│ Database Adapters    │ External APIs      │ Message Queues  │
│ - SQLiteRepository   │ - LLMClient        │ - EventBus      │
│ - VectorDB          │ - MCPServers       │ - WebSockets    │
│ - FileStorage       │ - EmbeddingAPI     │ - TaskQueue     │
└─────────────────────────────────────────────────────────────┘
```

#### Database Adapters

```python
# persistence/repositories/memory_repository.py
class SQLiteMemoryRepository(MemoryRepository):
    def __init__(self, db_connection: aiosqlite.Connection):
        self.db = db_connection
    
    async def store_memory(self, memory: AgentMemory) -> str:
        # Raw SQL operations, no business logic
        
    async def find_memories_by_embedding(self, embedding: List[float], 
                                       similarity_threshold: float) -> List[AgentMemory]:
        # Vector similarity search

# persistence/repositories/conversation_repository.py  
class SQLiteConversationRepository(ConversationRepository):
    async def create_thread(self, thread: ConversationThread) -> str: ...
    async def add_interaction(self, interaction: Interaction) -> str: ...
    async def find_conversations(self, criteria: SearchCriteria) -> List[ConversationThread]: ...
```

### Domain Layer (Core)

```
┌─────────────────────────────────────────────────────────────┐
│                      Domain Layer                          │
├─────────────────────────────────────────────────────────────┤
│ Entities            │ Value Objects      │ Domain Services  │
│ - Agent             │ - Memory           │ - MemoryManager  │
│ - Conversation      │ - Relationship     │ - PersonaEngine  │
│ - Persona           │ - Interaction      │ - TrustCalculator│
└─────────────────────────────────────────────────────────────┘
```

#### Domain Entities

```python
# domain/entities/agent.py
@dataclass
class Agent:
    id: AgentId
    name: str
    role: AgentRole
    current_persona: Optional[PersonaId]
    
    # Aggregate behavior
    def remember(self, content: str, memory_type: MemoryType, 
                importance: ImportanceScore) -> Memory:
        memory = Memory.create(
            agent_id=self.id,
            content=content,
            memory_type=memory_type,
            importance=importance
        )
        # Domain validation
        if importance < ImportanceScore.MIN_THRESHOLD:
            raise InvalidMemoryImportanceError()
        return memory
    
    def adapt_persona(self, feedback: PersonaFeedback) -> PersonaAdaptation:
        if not self.current_persona:
            raise NoActivePersonaError()
        # Domain logic for persona adaptation
        
    def calculate_trust_with(self, target: AgentId, 
                           interactions: List[Interaction]) -> TrustLevel:
        # Domain logic for trust calculation

# domain/entities/conversation.py
@dataclass  
class ConversationThread:
    id: ThreadId
    participants: List[ParticipantId]
    thread_type: ThreadType
    
    def add_interaction(self, from_participant: ParticipantId,
                       content: str, context: InteractionContext) -> Interaction:
        # Validation and business rules
        if from_participant not in self.participants:
            raise UnauthorizedParticipantError()
        
        interaction = Interaction.create(
            thread_id=self.id,
            from_participant=from_participant,
            content=content,
            context=context
        )
        return interaction
```

#### Domain Services

```python
# domain/services/memory_consolidation_service.py
class MemoryConsolidationService:
    """Handles complex memory management logic"""
    
    def __init__(self, memory_repo: MemoryRepository,
                 embedding_service: EmbeddingService):
        self.memory_repo = memory_repo
        self.embedding_service = embedding_service
    
    async def consolidate_similar_memories(self, agent_id: AgentId) -> ConsolidationResult:
        memories = await self.memory_repo.find_memories(
            agent_id, MemoryCriteria(importance_min=0.3)
        )
        
        # Domain logic for finding similar memories
        clusters = self._cluster_similar_memories(memories)
        consolidated = []
        
        for cluster in clusters:
            if len(cluster) > 1:
                consolidated_memory = self._merge_memories(cluster)
                consolidated.append(consolidated_memory)
        
        return ConsolidationResult(
            original_count=len(memories),
            consolidated_count=len(consolidated),
            space_saved=self._calculate_space_saved(memories, consolidated)
        )

# domain/services/relationship_service.py
class RelationshipService:
    """Manages relationship calculations and updates"""
    
    async def update_relationship(self, agent_id: AgentId, target_id: ParticipantId,
                                interaction: Interaction) -> RelationshipUpdate:
        current_relationship = await self.relationship_repo.find_relationship(
            agent_id, target_id
        )
        
        # Domain logic for relationship updates
        trust_delta = self._calculate_trust_delta(interaction)
        collaboration_delta = self._calculate_collaboration_delta(interaction)
        
        updated_relationship = current_relationship.update(
            trust_delta=trust_delta,
            collaboration_delta=collaboration_delta,
            last_interaction=interaction.created_at
        )
        
        return RelationshipUpdate(
            previous=current_relationship,
            updated=updated_relationship,
            changes=Changes(trust=trust_delta, collaboration=collaboration_delta)
        )
```

### Application Layer (Use Cases)

```
┌─────────────────────────────────────────────────────────────┐
│                   Application Layer                        │
├─────────────────────────────────────────────────────────────┤
│ Use Cases           │ Command Handlers   │ Event Handlers   │
│ - SendMissionUseCase│ - ProcessMission  │ - OnMemoryStored │
│ - RetrieveMemories  │ - UpdatePersona   │ - OnPersonaAdapt │
│ - AdaptPersona      │ - ConsolidateMemory│ - OnRelationship │
└─────────────────────────────────────────────────────────────┘
```

#### Use Cases

```python
# application/use_cases/send_mission_use_case.py
class SendMissionWithContextUseCase:
    def __init__(self, 
                 memory_repo: MemoryRepository,
                 conversation_repo: ConversationRepository,
                 relationship_repo: RelationshipRepository,
                 persona_service: PersonaService,
                 llm_service: LLMService,
                 event_bus: EventBus):
        self.memory_repo = memory_repo
        self.conversation_repo = conversation_repo
        self.relationship_repo = relationship_repo
        self.persona_service = persona_service
        self.llm_service = llm_service
        self.event_bus = event_bus
    
    async def execute(self, command: SendMissionCommand) -> MissionResponse:
        # 1. Retrieve relevant context
        memories = await self.memory_repo.find_relevant_memories(
            command.agent_id, command.mission_content
        )
        
        relationship = await self.relationship_repo.find_relationship(
            command.agent_id, command.user_id
        )
        
        persona_context = await self.persona_service.get_active_context(
            command.agent_id
        )
        
        # 2. Process mission with full context
        response = await self.llm_service.generate_contextual_response(
            mission=command.mission_content,
            memories=memories,
            relationship=relationship,
            persona=persona_context
        )
        
        # 3. Store interaction
        interaction = await self.conversation_repo.add_interaction(
            Interaction.create(
                thread_id=command.thread_id,
                from_participant=command.user_id,
                to_participant=command.agent_id,
                content=command.mission_content,
                response=response.content
            )
        )
        
        # 4. Update agent state
        new_memory = Memory.create(
            agent_id=command.agent_id,
            content=f"Mission: {command.mission_content}",
            memory_type=MemoryType.EXPERIENCE,
            importance=response.success_rating
        )
        await self.memory_repo.store_memory(new_memory)
        
        # 5. Publish events
        await self.event_bus.publish(MissionCompletedEvent(
            agent_id=command.agent_id,
            mission_id=interaction.id,
            success_rating=response.success_rating
        ))
        
        return MissionResponse(
            content=response.content,
            interaction_id=interaction.id,
            success_rating=response.success_rating
        )

# application/use_cases/retrieve_conversation_history_use_case.py
class RetrieveConversationHistoryUseCase:
    async def execute(self, query: ConversationHistoryQuery) -> ConversationHistory:
        # Use case orchestration without business logic
        
# application/use_cases/adapt_persona_use_case.py
class AdaptPersonaUseCase:
    async def execute(self, command: AdaptPersonaCommand) -> PersonaAdaptation:
        # Orchestrate persona adaptation workflow
```

#### Command/Query Handlers

```python
# application/handlers/command_handlers.py
class ProcessMissionCommandHandler:
    def __init__(self, send_mission_use_case: SendMissionWithContextUseCase):
        self.use_case = send_mission_use_case
    
    async def handle(self, command: ProcessMissionCommand) -> MissionResponse:
        return await self.use_case.execute(command)

# application/handlers/query_handlers.py  
class GetAgentMemoriesQueryHandler:
    def __init__(self, memory_repo: MemoryRepository):
        self.memory_repo = memory_repo
    
    async def handle(self, query: GetAgentMemoriesQuery) -> List[AgentMemory]:
        return await self.memory_repo.find_memories(
            query.agent_id, query.criteria
        )
```

### Interface Layer (Top)

```
┌─────────────────────────────────────────────────────────────┐
│                    Interface Layer                         │
├─────────────────────────────────────────────────────────────┤
│ REST Controllers    │ WebSocket Handlers │ CLI Commands     │
│ - AgentController   │ - MemoryEvents     │ - PersonaManager │
│ - ConversationCtrl  │ - RelationshipEvts │ - DataExport     │
│ - PersonaController │ - PersonaEvents    │ - Diagnostics    │
└─────────────────────────────────────────────────────────────┘
```

#### REST Controllers

```python
# interface/rest/agent_controller.py
class AgentController:
    def __init__(self, command_bus: CommandBus, query_bus: QueryBus):
        self.command_bus = command_bus
        self.query_bus = query_bus
    
    @app.post("/api/agents/{agent_id}/mission")
    async def assign_mission(self, agent_id: str, request: AssignMissionRequest):
        command = ProcessMissionCommand(
            agent_id=AgentId(agent_id),
            mission_content=request.mission,
            user_id=UserId(request.user_id),
            thread_id=ThreadId(request.thread_id)
        )
        
        result = await self.command_bus.execute(command)
        return MissionResponseDTO.from_domain(result)
    
    @app.get("/api/agents/{agent_id}/memories")
    async def get_memories(self, agent_id: str, criteria: MemoryQueryParams):
        query = GetAgentMemoriesQuery(
            agent_id=AgentId(agent_id),
            criteria=criteria.to_domain()
        )
        
        memories = await self.query_bus.execute(query)
        return [MemoryDTO.from_domain(m) for m in memories]
```

#### Event Handlers

```python
# interface/events/memory_event_handlers.py
class MemoryEventHandlers:
    def __init__(self, websocket_manager: WebSocketManager):
        self.websocket_manager = websocket_manager
    
    async def on_memory_stored(self, event: MemoryStoredEvent):
        await self.websocket_manager.broadcast_to_agent_subscribers(
            event.agent_id,
            {
                "type": "memory_updated",
                "agent_id": str(event.agent_id),
                "memory_type": event.memory_type,
                "importance": event.importance
            }
        )
    
    async def on_relationship_updated(self, event: RelationshipUpdatedEvent):
        await self.websocket_manager.broadcast_to_participants(
            [event.agent_id, event.target_id],
            {
                "type": "relationship_changed",
                "agent_id": str(event.agent_id),
                "target_id": str(event.target_id),
                "trust_delta": event.trust_delta
            }
        )
```

## Dependency Injection & Configuration

### DI Container

```python
# infrastructure/di_container.py
class DIContainer:
    def __init__(self):
        self._services = {}
        self._configure()
    
    def _configure(self):
        # Infrastructure layer
        self.register_singleton(DatabaseConnection, self._create_db_connection)
        self.register_singleton(EmbeddingService, OpenAIEmbeddingService)
        self.register_singleton(EventBus, InMemoryEventBus)
        
        # Repositories (Infrastructure -> Domain interfaces)
        self.register_scoped(MemoryRepository, SQLiteMemoryRepository)
        self.register_scoped(ConversationRepository, SQLiteConversationRepository)
        self.register_scoped(RelationshipRepository, SQLiteRelationshipRepository)
        
        # Domain services
        self.register_scoped(MemoryConsolidationService)
        self.register_scoped(RelationshipService)
        self.register_scoped(PersonaAdaptationService)
        
        # Application layer
        self.register_scoped(SendMissionWithContextUseCase)
        self.register_scoped(RetrieveConversationHistoryUseCase)
        self.register_scoped(AdaptPersonaUseCase)
        
        # Command/Query buses
        self.register_singleton(CommandBus)
        self.register_singleton(QueryBus)
        
        # Interface layer
        self.register_scoped(AgentController)
        self.register_scoped(ConversationController)
        self.register_scoped(PersonaController)
```

### Configuration Management

```python
# infrastructure/config/persistence_config.py
@dataclass
class PersistenceConfig:
    database_url: str
    vector_db_url: str
    memory_decay_schedule: str
    max_memories_per_agent: int
    embedding_model: str
    
    @classmethod
    def from_env(cls) -> 'PersistenceConfig':
        return cls(
            database_url=os.getenv('DATABASE_URL', 'sqlite:///agentopia.db'),
            vector_db_url=os.getenv('VECTOR_DB_URL', 'chroma://localhost:8000'),
            memory_decay_schedule=os.getenv('MEMORY_DECAY_SCHEDULE', 'daily'),
            max_memories_per_agent=int(os.getenv('MAX_MEMORIES_PER_AGENT', '10000')),
            embedding_model=os.getenv('EMBEDDING_MODEL', 'text-embedding-ada-002')
        )
```

## Event-Driven Architecture

### Domain Events

```python
# domain/events/memory_events.py
@dataclass
class MemoryStoredEvent(DomainEvent):
    agent_id: AgentId
    memory_id: MemoryId
    memory_type: MemoryType
    importance: ImportanceScore
    created_at: datetime

@dataclass  
class MemoryConsolidatedEvent(DomainEvent):
    agent_id: AgentId
    original_memories: List[MemoryId]
    consolidated_memory: MemoryId
    space_saved_bytes: int

# domain/events/relationship_events.py
@dataclass
class RelationshipUpdatedEvent(DomainEvent):
    agent_id: AgentId
    target_id: ParticipantId
    previous_trust: TrustLevel
    new_trust: TrustLevel
    trust_delta: float
    interaction_id: InteractionId
```

### Event Bus Implementation

```python
# infrastructure/events/event_bus.py
class EventBus:
    def __init__(self):
        self._handlers: Dict[Type[DomainEvent], List[EventHandler]] = {}
    
    def subscribe(self, event_type: Type[DomainEvent], handler: EventHandler):
        if event_type not in self._handlers:
            self._handlers[event_type] = []
        self._handlers[event_type].append(handler)
    
    async def publish(self, event: DomainEvent):
        event_type = type(event)
        if event_type in self._handlers:
            for handler in self._handlers[event_type]:
                await handler.handle(event)
```

## Testing Strategy

### Unit Tests (Domain Layer)

```python
# tests/unit/domain/test_agent.py
class TestAgentMemoryManagement:
    def test_agent_creates_valid_memory(self):
        agent = Agent(id=AgentId("test"), name="Test Agent", role=AgentRole.SCIENCE_OFFICER)
        
        memory = agent.remember(
            content="Important discovery about quantum mechanics",
            memory_type=MemoryType.EXPERIENCE,
            importance=ImportanceScore(0.8)
        )
        
        assert memory.agent_id == agent.id
        assert memory.content == "Important discovery about quantum mechanics"
        assert memory.importance == ImportanceScore(0.8)
    
    def test_agent_rejects_invalid_memory_importance(self):
        agent = Agent(id=AgentId("test"), name="Test Agent", role=AgentRole.SCIENCE_OFFICER)
        
        with pytest.raises(InvalidMemoryImportanceError):
            agent.remember(
                content="Trivial observation",
                memory_type=MemoryType.EXPERIENCE,  
                importance=ImportanceScore(-0.1)  # Invalid
            )
```

### Integration Tests (Application Layer)

```python
# tests/integration/application/test_send_mission_use_case.py
class TestSendMissionWithContextUseCase:
    async def test_mission_with_memory_context(self):
        # Arrange
        container = DIContainer()
        use_case = container.get(SendMissionWithContextUseCase)
        
        # Pre-store some memories
        await self._setup_agent_memories()
        
        command = SendMissionCommand(
            agent_id=AgentId("test_agent"),
            mission_content="Analyze the quantum data",
            user_id=UserId("test_user"),
            thread_id=ThreadId("test_thread")
        )
        
        # Act
        response = await use_case.execute(command)
        
        # Assert
        assert response.success_rating > 0.7
        assert "quantum" in response.content.lower()
        # Verify memory was stored
        memories = await container.get(MemoryRepository).find_memories(
            AgentId("test_agent"), MemoryCriteria(memory_type=MemoryType.EXPERIENCE)
        )
        assert len(memories) > 0
```

### End-to-End Tests

```python
# tests/e2e/test_persistence_workflows.py
class TestPersistenceWorkflows:
    async def test_complete_conversation_persistence(self):
        # Test full workflow from API call to database storage
        async with AsyncClient(app=app, base_url="http://test") as client:
            # Start conversation
            response = await client.post(
                "/api/agents/red_agent/mission",
                json={
                    "mission": "Help me plan a project",
                    "user_id": "test_user"
                }
            )
            
            # Continue conversation
            response2 = await client.post(
                "/api/agents/red_agent/mission", 
                json={
                    "mission": "What did we discuss about the project?",
                    "user_id": "test_user"
                }
            )
            
            # Verify agent remembers context
            assert "project" in response2.json()["content"].lower()
```

## Migration Path from Current Architecture

### Step 1: Add Persistence Layer (Non-Breaking)

```python
# Extend existing database.py
class Database:
    # ... existing methods ...
    
    async def _create_persistence_tables(self, db: aiosqlite.Connection):
        """Add new tables for persistence without breaking existing ones"""
        await db.execute(CREATE_AGENT_MEMORIES_TABLE)
        await db.execute(CREATE_INTERACTIONS_TABLE)
        await db.execute(CREATE_RELATIONSHIPS_TABLE)
        # etc.
```

### Step 2: Wrap Existing Services

```python
# Create adapters for existing services
class LegacyAgentManagerAdapter:
    def __init__(self, legacy_manager: AgentManager, 
                 memory_service: MemoryService):
        self.legacy_manager = legacy_manager
        self.memory_service = memory_service
    
    async def send_mission_to_agent(self, agent_id: str, mission: str):
        # Call legacy method
        result = await self.legacy_manager.send_mission_to_agent(agent_id, mission)
        
        # Add persistence
        await self.memory_service.store_memory(
            agent_id, MemoryType.EXPERIENCE, f"Mission: {mission}"
        )
        
        return result
```

### Step 3: Gradual Replacement

Replace legacy components one by one with new architecture:
1. Agent manager → StatefulAgentManager
2. Config service → Enhanced with persona persistence  
3. WebSocket manager → Event-driven WebSocket manager
4. Database → Repository pattern implementation

## Monitoring & Observability

### Metrics

```python
# infrastructure/monitoring/persistence_metrics.py
class PersistenceMetrics:
    def __init__(self, metrics_collector: MetricsCollector):
        self.metrics = metrics_collector
    
    def record_memory_operation(self, operation: str, duration_ms: float):
        self.metrics.histogram(
            'agentopia_memory_operation_duration',
            duration_ms,
            labels={'operation': operation}
        )
    
    def record_relationship_update(self, agent_id: str, target_type: str):
        self.metrics.counter(
            'agentopia_relationship_updates_total',
            labels={'agent_id': agent_id, 'target_type': target_type}
        )
```

### Health Checks

```python
# infrastructure/health/persistence_health.py
class PersistenceHealthCheck:
    async def check_database_connectivity(self) -> HealthStatus:
        # Test database connection
        
    async def check_memory_repository_performance(self) -> HealthStatus:  
        # Test query performance
        
    async def check_event_bus_status(self) -> HealthStatus:
        # Test event publishing/subscribing
```

This architecture provides a solid foundation for implementing stateful persistence while maintaining clean separation of concerns and enabling easy testing and future enhancements.