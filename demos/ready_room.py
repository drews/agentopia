from asciimatics.screen import Screen
from asciimatics.effects import Stars, Print
from asciimatics.scene import Scene
from asciimatics.renderers import Box
from asciimatics.effects import Sprite
from asciimatics.paths import Path

def stars_demo(screen):

        
    # Define a renderer_dict for the Sprite
    from asciimatics.renderers import FigletText

    renderer_dict = {
        # "default": Box(3, 3, uni=True),
        "default": FigletText("A", font="starwars")  # Approximating the Star Trek Delta
    }
    box_width = int(screen.width * 0.75)
    box_height = int(screen.height * 0.75)
    box_x = (screen.width - box_width) // 2
    box_y = (screen.height - box_height) // 2
    from random import randint

    def random_brownian_path():
        path = Path()
        # Ensure the path starts within the box
        start_x, start_y = randint(box_x, box_x + box_width - 1), randint(box_y, box_y + box_height - 1)
        path.move_straight_to(start_x, start_y, 0)  # Start at a specific point
        for _ in range(5):  # Create a short random path
            x, y = randint(box_x, box_x + box_width - 1), randint(box_y, box_y + box_height - 1)
            path.move_straight_to(x, y, randint(5, 15))
            path.wait(randint(10, 50))
        return path

    effects = [
        Print(screen, Box(box_width, box_height, uni=True), box_y, box_x, transparent=False, bg=Screen.COLOUR_WHITE),
        Sprite(screen, renderer_dict=renderer_dict, path=random_brownian_path(), colour=Screen.COLOUR_RED),
        Sprite(screen, renderer_dict=renderer_dict, path=random_brownian_path(), colour=Screen.COLOUR_BLUE),
        Sprite(screen, renderer_dict=renderer_dict, path=random_brownian_path(), colour=Screen.COLOUR_YELLOW),
        Stars(screen, (screen.width + screen.height) // 2),
    ]
    screen.play([Scene(effects, -1)], stop_on_resize=True)

def main():
    Screen.wrapper(stars_demo)

if __name__ == "__main__":
    main()
