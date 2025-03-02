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
red_agent = MultiStepAgent(
    tools=[DuckDuckGoSearchTool()], model=HfApiModel(),
    name="Commander",
    description="Articulates objectives, assigns side quests, and queries their subordinates",
    managed_agents=[blue_agent, yellow_agent]
)

prompts = [
    "How can I prioritize my activities for the week in a balanced way?",
    "What's a good approach to organizing my personal and community projects?",
    "How can I align my daily activities with my personal growth goals?",
    "Suggest a daily routine that helps me feel accomplished and relaxed.",
    "What activities should I focus on to feel fulfilled by the end of the week?",
    "How can I find harmony between my responsibilities and my personal time?",
    "Guide me in setting meaningful and achievable goals for this month.",
    "What are some strategies to make the most of my time each day?",
    "Help me reflect on my progress in various areas of my life.",
    "How can I ensure my activities reflect my personal values?",
    "Suggest ways to improve my concentration and mindfulness.",
    "What should I do to feel prepared and confident for upcoming events?",
    "How can I support my community or group effectively?",
    "What are the key areas I should focus on for personal growth this season?",
    "Help me create a plan to pursue my passions and interests.",
    "What steps can I take to nurture a healthy balance in my life?"
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
