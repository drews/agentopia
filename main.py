import os
import logging
import sys
from asciimatics.screen import Screen
from smolagents import DuckDuckGoSearchTool, LiteLLMModel
from missions import MissionDrivenAgent
from splash import animated_splash

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')




# Define the local model to avoid paywalls and "becoming the product".
local_model = LiteLLMModel(model_id="ollama/deepseek-r1:latest",
            api_base="http://localhost:11434",)

blue_agent = MissionDrivenAgent(
    tools=[DuckDuckGoSearchTool()], model=local_model,
    name="Science_Officer",
    description="Handles the theoretical side of the mission"
)

yellow_agent = MissionDrivenAgent(
    tools=[DuckDuckGoSearchTool()], model=local_model,
    name="Operations_Officer",
    description="Handles the practical side of the mission"
)

red_agent = MissionDrivenAgent(
    tools=[DuckDuckGoSearchTool()], model=local_model,
    name="Executive_Officer",
    description="Manages the missions. Maintains focus, articulates objectives, assigns side quests, and queries their subordinates",
    managed_agents=[blue_agent, yellow_agent]
)

def get_user_task():
    task = input("Please enter the task you want the agents to handle: ").strip()
    return task

def main():
    try:
        Screen.wrapper(animated_splash)

        user_task = get_user_task()
        response = red_agent.run(user_task)
        
        # Format the response to show steps, thought process, and final answer
        print("\nAgent's Response:")
        print("Steps: ...")  # Placeholder for steps
        print("Thought Process: ...")  # Placeholder for thought process
        print("Final Answer:", response)  # Assuming response is the final answer
    except KeyboardInterrupt:
        print("\nProgram interrupted by user. Exiting gracefully.")
        sys.exit(0)

main()
