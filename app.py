from textual.app import ComposeResult, App, RenderResult
from textual.containers import Vertical, Horizontal, Grid
from textual.widgets import Collapsible, Static, Label, Welcome, LoadingIndicator, Placeholder, Button, Tabs, Tab, Header, ContentSwitcher, Markdown, DataTable, TabbedContent, TabPane
from textual.widget import Widget

class LLAP(Widget):
    """Display a greeting."""

    def render(self) -> RenderResult:
        return "Live long and prosper"

class ContextPane(Collapsible):
    def compose(self) -> ComposeResult:
        with Grid():
            
            # yield Button(classes="span2")
            # yield Placeholder(classes="span10")
            for _ in range(24):
                yield Placeholder(classes="box")

class DetailPane(Widget):
    def compose(self) -> ComposeResult:
        with Grid():
            yield Button(classes="span2")
            yield Label(classes="span10")
            yield Button(classes="span2")
            yield Placeholder(classes="span10")

    
class Ruler(Static):
    def compose(self):
        ruler_text = "····•" * 100
        yield Label(ruler_text)

class Agentopia(App):
    CSS_PATH = "style.tcss"
    
    def compose(self) -> ComposeResult:
        yield ContextPane();
        # with Horizontal(id="top-panel"):
        #     with Vertical():
        #         yield Placeholder("A")
        #         yield Placeholder("B")
        #     yield LoadingIndicator()
        yield Ruler()
        yield DetailPane();
        # with Horizontal(id="bottom-panel"):
        #     with Vertical():
        #         yield Placeholder("A")
        #         yield Placeholder("B")
        #     yield LoadingIndicator()
            
            # yield Placeholder("This is the focal panel.", id="top-pane")
            # yield Placeholder("This is the envionmental panel.", id="bottom-pane")
        # yield Welcome()
        
        #     yield Placeholder("foo")
        #     yield Placeholder("bar")
            # yield Welcome()
        # with TabbedContent(initial="launch"):
        #     with TabPane("🚀", id="launch"):
        #         yield Placeholder("launch pad")
        #     with TabPane("🖖", id="hello"):
        #         yield Placeholder("ready room")
        #     with TabPane("Bridge", id="bridge"):
        #         yield Bridge()
        #     with TabPane("Conference", id="conference"):
        #         yield Scene(room_name="Conference")
        #     with TabPane("Engineering", id="engineering"):
        #         yield Scene(room_name="Engineering")
        #     with TabPane("Cargo", id="cargo"):
        #         yield Scene(room_name="Cargo")



        
if __name__ == "__main__":
    app = Agentopia()
    app.run()   
