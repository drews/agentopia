import os
import logging
import sys
# from asciimatics.screen import Screen
from smolagents import DuckDuckGoSearchTool, LiteLLMModel
from missions import MissionDrivenAgent
from rooms import * 
from welcome import Welcome
# from splash import animated_splash
from app import NoMatches
from timing_utils import measure_time  # Import the timing utility
from app import App, ComposeResult
from textual.containers import VerticalScroll, Horizontal, Grid
from textual.widgets import Button, Tabs, Tab, Header, ContentSwitcher, Markdown, DataTable, TabbedContent, TabPane

class Agentopia(App):
    def on_mount(self) -> None:
        """Focus the tabs when the app starts."""
        self.query_one(Tabs).focus()
    def on_tabs_tab_activated(self, event: Tabs.TabActivated) -> None:
        """Handle TabActivated message sent by Tabs."""
        pass
    # self.notify(event.tab)

    def compose(self) -> ComposeResult:
        yield Header()
        with TabbedContent(initial="splash"):
            with TabPane("Welcome", id="splash"):
                yield Welcome()
            with TabPane("Ready Room", id="ready"):
                yield ReadyRoom()
            with TabPane("Bridge", id="bridge"):
                yield Bridge()
            with TabPane("Conference", id="conference"):
                yield Scene(room_name="Conference")
            with TabPane("Engineering", id="engineering"):
                yield Scene(room_name="Engineering")
            with TabPane("Cargo", id="cargo"):
                yield Scene(room_name="Cargo")
        # yield Tabs(Tab("bridge"), Tab("ready"),Tab("conf"),Tab("eng"), Tab("cargo"))
        
        # with Horizontal(id="buttons"):  
        #     yield Button("Ready", id="ready")
        #     yield Button("Conference", id="conference")
        #     yield Button("Engineering", id="engineering")
        #     yield Button("Cargo", id="cargo")
        with ContentSwitcher(initial="welcome"):
            yield Welcome()
            yield ReadyRoom()
            yield Bridge()
            # yield ConferenceRoom(id="bridge") 
            # with VerticalScroll(id="welcome"):
            #     yield rooms.Welcome()
            # with VerticalScroll(id="ready"):
            #     yield rooms.Room(room_name="Ready")
            # with Grid(id="conference"):
            #     yield rooms.Room("Conference")
            # with Horizontal(id="bridge"):
            #     yield Button("Operations", id="operations")
            #     yield Button("Command", id="command")
            #     yield Button("Science", id="science")
            # # with Grid(id ="engineering"):
            #     yield DataTable(id="tools")
            # with VerticalScroll(id="cargo"):
            #     yield DataTable(id="models")
            #     yield DataTable(id="artifacts")
        # yield Footer()
    # a la turbolift
    def on_button_pressed(self, event: Button.Pressed) -> None:
        destination = event.button.id 
        if destination == "close":
            destination = "ready"
        try:
            self.query_one(ContentSwitcher).current = destination
        except NoMatches:
            self.notify(f"No matching destination found for button id: {destination}", severity="error")

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Define the local model to avoid paywalls and "becoming the product".
local_model = LiteLLMModel(model_id="ollama/deepseek-r1:latest",
            api_base="http://localhost:11434",)

# blue_agent = MissionDrivenAgent(
#     tools=[DuckDuckGoSearchTool()], model=local_model,
#     name="Science_Officer",
#     description="Handles the theoretical side of the mission"
# )

# yellow_agent = MissionDrivenAgent(
#     tools=[DuckDuckGoSearchTool()], model=local_model,
#     name="Operations_Officer",
#     description="Handles the practical side of the mission"
# )

red_agent = MissionDrivenAgent(
    tools=[DuckDuckGoSearchTool()], model=local_model,
    name="Executive_Officer",
    description="Manages the missions. Maintains focus, articulates objectives, assigns side quests, and queries their subordinates",
    # managed_agents=[blue_agent, yellow_agent]
)

def get_user_task():
    task = input("Please enter the task you want the agents to handle (or type 'exit' to quit): ").strip()
    return task

# def main():
#     try:
#         Screen.wrapper(animated_splash)

#         while True:  # Start an infinite loop to keep asking for tasks
#             user_task = get_user_task()
#             if user_task.lower() == 'exit':  # Check if the user wants to exit
#                 print("Exiting the program. Goodbye!")
#                 break  # Exit the loop
            
#             # Measure the time taken to run the red agent
#             response = measure_time(red_agent.run, user_task)
            
#             # Format the response to show steps, thought process, and final answer
#             print("\nAgent's Response:")
#             print("Steps: ...")  # Placeholder for steps
#             print("Thought Process: ...")  # Placeholder for thought process
#             print("Final Answer:", response)  # Assuming response is the final answer

#             # New prompt for asking another query
#             another_query = input("Would you like to ask another query Y/N: ").strip().lower()
#             if another_query == 'n':
#                 print("Exiting the program. Goodbye!")
#                 break  # Exit the loop
#     except KeyboardInterrupt:
#         print("\nProgram interrupted by user. Exiting gracefully.")
#         sys.exit(0)

# main()



if __name__ == "__main__":
    app = Agentopia()
    app.run()   
