import os
import random
import sys

import inquirer
from smolagents import CodeAgent, DuckDuckGoSearchTool, HfApiModel, MultiStepAgent

if "HF_TOKEN" not in os.environ:
    print("Error: Set the HF_TOKEN environment variable to use the Hugging Face API.")
    sys.exit(1)

blue_agent = CodeAgent(
    tools=[DuckDuckGoSearchTool()], model=HfApiModel(),
    name="Science Officer",
    description="Handles the theoretical side of the project"
)

yellow_agent = CodeAgent(
    tools=[DuckDuckGoSearchTool()], model=HfApiModel(),
    name="Operations Officer",
    description="Handles the practical side of the project"
)
red_agent = CodeAgent(
    tools=[DuckDuckGoSearchTool()], model=HfApiModel(),
    name="Commander",
    description="Articulates objectives, assigns side quests, and queries their subordinates",
    managed_agents=[blue_agent, yellow_agent]
)

prompts = [
    "How can I structure my learning path to master the smolagents library effectively?",
    "What's the best approach to organizing and documenting my AI agent development projects?",
    "How can I systematically test and improve my AI agents' performance?",
    "Suggest a development routine that balances coding, research, and documentation.",
    "What core AI agent features should I focus on implementing this week?",
    "How can I effectively integrate the knowledge graph module with my existing agents?",
    "Guide me in setting up a robust testing framework for my AI agents.",
    "What are the best practices for implementing secure data storage in my agent system?",
    "Help me evaluate the current capabilities and limitations of my AI agents.",
    "How can I ensure my AI agents align with user privacy and security requirements?",
    "Suggest ways to improve the interaction between my different agent modules.",
    "What should I prioritize when implementing the Discord and Obsidian integrations?",
    "How can I contribute effectively to the AI agent development community?",
    "What are the key areas to focus on when dockerizing my AI agent system?",
    "Help me create a plan to implement voice interaction capabilities.",
    "What steps should I take to enhance my agents' natural language processing abilities?"
]

def get_user_input():
    questions = [
        inquirer.List(
            'prompt',
            message="Choose a prompt to explore:",
            choices=prompts,
        ),
    ]
    answers = inquirer.prompt(questions)
    return answers['prompt']

def main():
    while True:
        user_prompt = get_user_input()
        response = red_agent.run(user_prompt)
        print("\nAgent's Response:")
        print(response)
        continue_prompt = input("\nWould you like to explore another prompt? (yes/no): ").strip().lower()
        if continue_prompt != 'yes':
            print("Goodbye!")
            break

main()
