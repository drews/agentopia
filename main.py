import os
import logging
import sys
from asciimatics.screen import Screen
from smolagents import DuckDuckGoSearchTool, LiteLLMModel
from missions import MissionDrivenAgent
from splash import animated_splash
from timing_utils import measure_time  # Import the timing utility

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
    task = input("Please enter the task you want the agents to handle (or type 'exit' to quit): ").strip()
    return task

def main():
    try:
        Screen.wrapper(animated_splash)

        while True:  # Start an infinite loop to keep asking for tasks
            user_task = get_user_task()
            if user_task.lower() == 'exit':  # Check if the user wants to exit
                print("Exiting the program. Goodbye!")
                break  # Exit the loop
            
            # Measure the time taken to run the red agent
            response = measure_time(red_agent.run, user_task)
            
            # Format the response to show steps, thought process, and final answer
            print("\nAgent's Response:")
            print("Steps: ...")  # Placeholder for steps
            print("Thought Process: ...")  # Placeholder for thought process
            print("Final Answer:", response)  # Assuming response is the final answer

            # New prompt for asking another query
            another_query = input("Would you like to ask another query Y/N: ").strip().lower()
            if another_query == 'n':
                print("Exiting the program. Goodbye!")
                break  # Exit the loop
    except KeyboardInterrupt:
        print("\nProgram interrupted by user. Exiting gracefully.")
        sys.exit(0)

main()
