from rich.markdown import Markdown
from app import ComposeResult
from textual.containers import Container, HorizontalGroup, VerticalGroup, Center
from textual.widgets import Placeholder, Collapsible
from app import ComposeResult

class Scene(Container):
    tools: list[str] = []  # model-controlled tools (passed by reference)
    resources: list[str] = []  # application-controlled resources (passed by reference)
    prompts: list[str] = []  # user-controlled prompts (passed by reference)

    def __init__(self, room_name: str, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.room_name = room_name