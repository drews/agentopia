import random

from rich.markdown import Markdown
from app import ComposeResult
from textual.containers import Container
from textual.widgets._static import Static
from textual.widgets._button import Button


class Room(Container):
    """A Textual widget representing a room that agents can enter or exit."""

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

    def __init__(self, room_name: str, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.room_name = room_name

    def compose(self) -> ComposeResult:
        yield Container(Static(f"Welcome to the {self.room_name} room.", id="text"), id="md")


QUOTES = {
    "Mr. Spock": [
        "Change is the essential process of all existence.",
        "Logic is the beginning of wisdom, not the end."
    ],
    "Captain Jean-Luc Picard": [
        "Things are only impossible until they're not.",
        "There is a way out of every box, a solution to every puzzle; it's just a matter of finding it."
    ],
    "Captain Benjamin Sisko": [
        "There is only one thing I want from you. Find something you love, then do it the best you can.",
        "Sometimes a feeling is all we humans have to go on."
    ],
    "Colonel Kira Nerys": [
        "I don't believe in fate. I believe in decisions."
    ],
    "Captain Michael Burnam": [
        "The only way to defeat fear is to tell it 'No.'"
    ],
    "Captain Kathryn Janeway": [
        "You know as well as I do that fear only exists for one purpose... to be conquered."
    ]
}

random_author = random.choice(list(QUOTES.keys()))
random_quote_from_random_author = random.choice(QUOTES[random_author])

WELCOME_MD = f"""\
# Greetings, $USER 🖖


**Agentopia** is an *adaptive executive functioning toolkit* designed 
to help you reflect, plan, and take action towards your life's goals. 

What's your next mission? 


> {random_quote_from_random_author}

*— {random_author}*

"""

class Welcome(Room):
    """A brief intro to the agentopia project

    This widget can be used as a form of placeholder within a Textual
    application; although also see
    [Placeholder][textual.widgets._placeholder.Placeholder].
    """
    DEFAULT_CSS = DEFAULT_CSS = """
    Welcome {
        width: 100%;
        height: 100%;
        background: $surface;
    }

    Welcome Container {
        padding: 1;
        color: $foreground;
    }

    Welcome #text {
        margin:  0 1;
    }

    Welcome #close {
        dock: bottom;
        width: 100%;
    }
"""
    def __init__(self):
        super().__init__(room_name="Welcome")

    def compose(self) -> ComposeResult:
        yield Static(Markdown(WELCOME_MD), id="text")
        yield Button("Ready?", id="ready", variant="success")