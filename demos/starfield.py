# COMBINED WARP

from math import cos, sin, radians, pi
import random
import time
from asciimatics.screen import Screen

NUM_STARS_V1 = 50
NUM_STARS_V2 = 40

def combined_starfield(screen):
    # Determine the screen center for warp_starfield_v1.
    cx = screen.width // 4
    cy = screen.height // 2

    # Initialize stars for warp_starfield_v1 with an angle, distance, and speed.
    stars_v1 = []
    for _ in range(NUM_STARS_V1):
        angle = random.uniform(0, 360)
        distance = random.uniform(0, 1)
        speed = random.uniform(0.5, 1.5)
        stars_v1.append({"angle": angle, "distance": distance, "speed": speed})

    # Initialize stars for warp_starfield_v2 with x, y, speed, and a phase for twinkling.
    stars_v2 = []
    for _ in range(NUM_STARS_V2):
        x = random.randint(screen.width // 2, screen.width - 1)
        y = random.randint(0, screen.height - 1)
        speed = random.uniform(0.5, 2.0)
        phase = random.uniform(0, 2 * pi)
        stars_v2.append({"x": x, "y": y, "speed": speed, "phase": phase})

    frame = 0
    while True:
        screen.clear_buffer(Screen.COLOUR_BLACK, Screen.A_NORMAL, Screen.COLOUR_BLACK)

        # Update and draw stars for warp_starfield_v1.
        for star in stars_v1:
            prev_distance = star["distance"]
            star["distance"] += star["speed"]
            old_x = cx + int(cos(radians(star["angle"])) * prev_distance)
            old_y = cy + int(sin(radians(star["angle"])) * prev_distance)
            new_x = cx + int(cos(radians(star["angle"])) * star["distance"])
            new_y = cy + int(sin(radians(star["angle"])) * star["distance"])

            if 0 <= old_x < screen.width // 2 and 0 <= old_y < screen.height:
                screen.print_at(".", old_x, old_y, colour=Screen.COLOUR_MAGENTA)
            if 0 <= new_x < screen.width // 2 and 0 <= new_y < screen.height:
                screen.print_at("*", new_x, new_y, colour=Screen.COLOUR_GREEN)

            if (new_x < 0 or new_x >= screen.width // 2 or
                new_y < 0 or new_y >= screen.height):
                star["angle"] = random.uniform(0, 360)
                star["distance"] = random.uniform(0, 1)
                star["speed"] = random.uniform(0.5, 1.5)

        # Update and draw stars for warp_starfield_v2.
        for star in stars_v2:
            star["y"] += star["speed"]
            if star["y"] >= screen.height:
                star["y"] = 0
                star["x"] = random.randint(screen.width // 2, screen.width - 1)
                star["phase"] = random.uniform(0, 2 * pi)
            brightness = 0.5 + 0.5 * sin(star["phase"] + frame * 0.2)
            if brightness < 0.3:
                char = "."
                colour = Screen.COLOUR_BLUE
            elif brightness < 0.7:
                char = "*"
                colour = Screen.COLOUR_MAGENTA
            else:
                char = "o"
                colour = Screen.COLOUR_YELLOW
            screen.print_at(char, int(star["x"]), int(star["y"]), colour=colour)

        screen.refresh()
        frame += 1
        time.sleep(0.03)

Screen.wrapper(combined_starfield)
