import os
import random
import sys

from smolagents import CodeAgent, DuckDuckGoSearchTool, HfApiModel

if "HF_TOKEN" not in os.environ:
    print("Error: Set the HF_TOKEN environment variable to use the Hugging Face API.")
    sys.exit(1)

agent = CodeAgent(tools=[DuckDuckGoSearchTool()], model=HfApiModel())

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

agent.run(random.choice(prompts))
