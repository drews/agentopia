import os
import logging
import sys
import asyncio  # Import asyncio for asynchronous processing
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

async def get_user_task_async():
    task = input("Please enter the task you want the agents to handle (or type 'exit' to quit): ").strip()
    return task

async def main_async():
    try:
        Screen.wrapper(animated_splash)

        while True:  # Start an infinite loop to keep asking for tasks
            user_task = await get_user_task_async()  # Await the user task input
            if user_task.lower() == 'exit':  # Check if the user wants to exit
                print("Exiting the program. Goodbye!")
                break  # Exit the loop
            
            # Measure the time taken to run the agents asynchronously
            try:
                # Gather the responses from the agents
                responses = await asyncio.gather(
                    asyncio.to_thread(blue_agent.run, user_task),
                    asyncio.to_thread(yellow_agent.run, user_task),
                    asyncio.to_thread(red_agent.run, user_task)
                )
                
                # Assuming measure_time is a function that takes a callable and its arguments
                blue_response, yellow_response, red_response = await measure_time(lambda: responses)

            except Exception as e:
                print(f"Error while running agents: {e}")
                continue  # Skip to the next iteration if there's an error

            # Format the response to show steps, thought process, and final answer
            print("\nAgent's Response:")
            print("Blue Agent Response:", blue_response)  # Assuming response is the final answer
            print("Yellow Agent Response:", yellow_response)  # Assuming response is the final answer
            print("Red Agent Response:", red_response)  # Assuming response is the final answer

            # New prompt for asking another query
            another_query = input("Would you like to ask another query Y/N: ").strip().lower()
            if another_query == 'n':
                print("Exiting the program. Goodbye!")
                break  # Exit the loop
    except KeyboardInterrupt:
        print("\nProgram interrupted by user. Exiting gracefully.")
        sys.exit(0)

# Check for any missing imports or incorrect function calls
# Ensure that the measure_time function is defined and works as expected

# Update the main function to run the async main
if __name__ == "__main__":
    asyncio.run(main_async())  # Run the asynchronous main function
