from asciimatics.effects import Stars, Print, Sprite
from asciimatics.renderers import FigletText
from asciimatics.scene import Scene
from asciimatics.paths import Path

class BouncingPath:
    def __init__(self, screen, start_x=0, start_y=0, dx=1, dy=1):
        """
        :param screen: The Screen being used for the Scene.
        :param start_x: Starting x position of the sprite.
        :param start_y: Starting y position of the sprite.
        :param dx: Initial x direction (1 for right, -1 for left).
        :param dy: Initial y direction (1 for down, -1 for up).
        """
        self._screen = screen
        self._x = start_x
        self._y = start_y
        self._dx = dx
        self._dy = dy

    def next_pos(self):
        # Calculate the next position
        new_x = self._x + self._dx
        new_y = self._y + self._dy

        # Check for boundary collision and reverse direction if needed
        if new_x < 0 or new_x >= self._screen.width:
            self._dx *= -1
            new_x = self._x + self._dx

        if new_y < 0 or new_y >= self._screen.height:
            self._dy *= -1
            new_y = self._y + self._dy

        # Update the current position
        self._x = new_x
        self._y = new_y

        return self._x, self._y

    def reset(self):
        # Reset the path to the initial state if needed
        self._x = 0
        self._y = 0
        self._dx = 1
        self._dy = 1

    def is_finished(self):
        # This path never finishes
        return False
def animated_splash(screen):
    """
    Show a splash screen with animated effects until a keypress or resize.
    
    Args:
        screen: Screen object for rendering.
    """
    from asciimatics.screen import Screen
    from asciimatics.exceptions import ResizeScreenError

    last_scene = None
    while True:
        def demo(screen, scene):
            top_text = FigletText("WELCOME TO", font='small')
            middle_text = FigletText("AGENTOPIA", font='big')

            effects = [
                Stars(screen, (screen.width + screen.height) // 2),
                Print(screen, top_text, (screen.height - middle_text.max_height) // 2 - top_text.max_height, speed=1),
                Print(screen, middle_text, (screen.height - middle_text.max_height) // 2, speed=1)
            ]

            screen.play([Scene(effects, -1)], stop_on_resize=True, start_scene=scene)

        try:
            Screen.wrapper(demo, arguments=[last_scene])
            break
        except ResizeScreenError as e:
            last_scene = e.scene