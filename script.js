let agents = [
    { id: 'system', name: 'System Observer', state: 'active', room: 'central_plaza' }
];
let currentRoom = 'central_plaza';
let interactionCount = 0;

function addMessage(agent, content, type = 'general') {
    const chatArea = document.getElementById('chat-area');
    const timestamp = new Date().toLocaleString();
    
    const message = document.createElement('div');
    message.className = 'message';
    message.innerHTML = `
        <div class="message-meta">[${currentRoom.toUpperCase()}] ${timestamp}</div>
        <div class="message-content">${agent}: ${content}</div>
    `;
    
    chatArea.appendChild(message);
    chatArea.scrollTop = chatArea.scrollHeight;
    
    interactionCount++;
    updateStatus();
}

function sendMessage() {
    const input = document.getElementById('message-input');
    const agentSelect = document.getElementById('agent-select');
    
    if (!input.value.trim()) return;
    
    const selectedAgent = agentSelect.value || 'User';
    addMessage(selectedAgent, input.value);
    input.value = '';
}

function addAgent() {
    const name = prompt('Agent name:');
    if (!name) return;
    
    const agentId = 'agent_' + Date.now();
    const newAgent = {
        id: agentId,
        name: name,
        state: 'idle',
        room: 'central_plaza'
    };
    
    agents.push(newAgent);
    updateAgentsList();
    updateAgentSelect();
    addMessage('SYSTEM', `${name} joined the environment`);
}

function moveAgent() {
    const agentSelect = document.getElementById('agent-select');
    const roomSelect = document.getElementById('room-select');
    
    if (!agentSelect.value || !roomSelect.value) return;
    
    const agent = agents.find(a => a.id === agentSelect.value);
    if (!agent) return;
    
    const oldRoom = agent.room;
    agent.room = roomSelect.value;
    
    addMessage('SYSTEM', `${agent.name} moved from ${oldRoom} to ${roomSelect.value}`);
    updateAgentsList();
}

function updateAgentsList() {
    const agentsList = document.getElementById('agents-list');
    agentsList.innerHTML = agents.map(agent => `
        <div class="agent">
            <div>
                <div class="agent-name">${agent.name}</div>
                <div style="font-size: 11px; color: #666;">Room: ${agent.room}</div>
            </div>
            <div class="agent-state">${agent.state}</div>
        </div>
    `).join('');
}

function updateAgentSelect() {
    const agentSelect = document.getElementById('agent-select');
    agentSelect.innerHTML = '<option value="">Select Agent</option>' + 
        agents.map(agent => `<option value="${agent.id}">${agent.name}</option>`).join('');
}

function updateStatus() {
    document.getElementById('agent-count').textContent = agents.length;
    document.getElementById('interaction-count').textContent = interactionCount;
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Room selection
    document.querySelectorAll('.room').forEach(room => {
        room.addEventListener('click', () => {
            document.querySelectorAll('.room').forEach(r => r.classList.remove('active'));
            room.classList.add('active');
            currentRoom = room.dataset.room;
            addMessage('SYSTEM', `Viewing ${room.querySelector('.room-name').textContent}`);
        });
    });

    // Enter key for sending messages
    document.getElementById('message-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    // Initialize
    updateAgentsList();
    updateAgentSelect();
    updateStatus();
    
    // Demo interactions
    setTimeout(() => {
        addMessage('System Observer', 'Environment initialized successfully');
    }, 1000);
});