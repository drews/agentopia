import random

from rich.markdown import Markdown
from app import ComposeResult
from textual.containers import Container, HorizontalGroup, VerticalGroup, Center
from textual.widgets import Placeholder, Collapsible
from app import ComposeResult


DEFAULT_CSS = """
    Room {
        width: 100%;
        height: 100%;
        background: $background;
    }

    Room Container {
        padding: 1;
        color: $foreground;
    }

    Room #enter, Room #exit {
        dock: bottom;
        width: 50%;
    }
"""
    
class Scene(Container):
    tools: list[str] = []  # model-controlled tools (passed by reference)
    resources: list[str] = []  # application-controlled resources (passed by reference)
    prompts: list[str] = []  # user-controlled prompts (passed by reference)

    def __init__(self, room_name: str, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.room_name = room_name
        
    def compose(self) -> ComposeResult:
        # Create a vertical container for the environment
        yield VerticalGroup(
         Center(
            Placeholder(
                name="Stage",),
                id="stage",
            )
         )

        # Create a toggleable bottom panel with three subpanes
        with Collapsible(HorizontalGroup()):
            yield Placeholder(name="Resources")
            yield Placeholder(name="Prompts")
            yield Placeholder(name="Tools")
        # yield Static(f"An empty room identifies itself as '{self.room_name}'.", id="wayfinding"),
