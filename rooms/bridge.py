from .room import Scene

from textual.widgets import Placeholder
from textual.containers import Grid
from app import ComposeResult

class Bridge(Scene):

    def __init__(self):
        super().__init__(room_name="The Bridge")



    def compose(self) -> ComposeResult:
        # Define visual placeholders for different parts of the starship bridge
        with Grid():
            yield Placeholder("Command Center")
            yield Placeholder("Navigation Station")
            yield Placeholder("Communication Station")
            yield Placeholder("Engineering Station")
            yield Placeholder("Science Station")
