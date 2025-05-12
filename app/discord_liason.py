import os

import discord
from discord import app_commands
from discord.ext import commands
from dotenv import load_dotenv
from typing import Optional

# 1. Set up Intents and client
intents = discord.Intents.default()
client = discord.Client(intents=intents)

# 2. Create a CommandTree for slash commands
tree = app_commands.CommandTree(client) 

# Error handler for commands
async def on_app_command_error(interaction: discord.Interaction, error: app_commands.AppCommandError):
    if isinstance(error, app_commands.CommandOnCooldown):
        await interaction.response.send_message(
            f"This command is on cooldown. Try again in {error.retry_after:.2f}s",
            ephemeral=True
        )
    else:
        await interaction.response.send_message(
            "An error occurred while processing your command. Please try again later.",
            ephemeral=True
        )
        print(f"Command error: {error}")

# Add error handler to tree
tree.on_error = on_app_command_error

# 3. Define the slash commands: 
# @tree.command(
#     name="vibes",
#     description="Summarize recent discussions and ongoing themes"
# )
async def vibes(interaction: discord.Interaction):
    """
    Analyzes recent messages to provide thematic summary of discussions.
    """
    await interaction.response.send_message(
        "🔄 Analyzing recent discussions... This feature is coming soon!"
    )

# @tree.command(
#     name="atlas", 
#     description="Visualize the community's information architecture"
# )
async def atlas(interaction: discord.Interaction):
    """
    Creates and displays a visualization of the server's channel structure and information flow.
    """
    await interaction.response.send_message(
        "🗺️ Generating community atlas... This feature is coming soon!"
    )

# @tree.command(
#     name="capture",
#     description="Dispatch information to configured destinations"
# )
async def capture(interaction: discord.Interaction, content: str):
    """
    Captures and routes information to appropriate channels or storage.
    """
    await interaction.response.send_message(
        f"📥 Captured: '{content}'\nRouting to configured destinations..."
    )

# @tree.command(
#     name="observe",
#     description="Share an observation for the community"
# )
async def observe(interaction: discord.Interaction, observation: str):
    """
    Records user observations in the backend storage system.
    """
    await interaction.response.send_message(
        f"👁️ Observation noted: '{observation}'\nThank you for contributing!"
    )

# @tree.command(
#     name="catalyze",
#     description="Combine existing elements to create something new"
# )
async def catalyze(interaction: discord.Interaction):
    """
    Facilitates combination of existing community resources.
    """
    await interaction.response.send_message(
        "⚡ Initiating catalysis process... This feature is coming soon!"
    )

# @tree.command(
#     name="enable",
#     description="Highlight how observations and catalysts create new possibilities"
# )
async def enable(interaction: discord.Interaction):
    """
    Shows how community contributions lead to new opportunities.
    """
    await interaction.response.send_message(
        "🌟 Illuminating pathways... This feature is coming soon!"
    )

# Create slash command for hello with cooldown
@tree.command(
    name="hello",
    description="Say hello to the bot!"
)
@app_commands.checks.cooldown(1, 60.0)  # 1 use per 60 seconds
async def hello(interaction: discord.Interaction):
    """
    When a user types /hello, the bot will respond with a greeting.
    """
    try:
        await interaction.response.send_message(
            f"Hello, {interaction.user.mention}! 👋"
        )
    except Exception as e:
        print(f"Error in hello command: {e}")
        await interaction.response.send_message(
            "Sorry, I couldn't process your hello command. Please try again later.",
            ephemeral=True
        )

# Create slash command for ping with cooldown
@tree.command(
    name="ping",
    description="Check the bot's latency"
)
@app_commands.checks.cooldown(1, 30.0)  # 1 use per 30 seconds
async def ping(interaction: discord.Interaction):
    try:
        latency = round(client.latency * 1000)  # Convert to ms and round
        await interaction.response.send_message(f"🏓Pong!🏓 Latency: {latency}ms")
    except Exception as e:
        print(f"Error in ping command: {e}")
        await interaction.response.send_message(
            "Sorry, I couldn't check the latency. Please try again later.",
            ephemeral=True
        )

# Event: Message received
@client.event
async def on_message(message):
    try:
        # Ignore messages from bots
        if message.author.bot:
            return

        # Initialize message counts if not exists
        if not hasattr(client, 'user_message_counts'):
            client.user_message_counts = {}
        
        user_id = message.author.id
        client.user_message_counts[user_id] = client.user_message_counts.get(user_id, 0) + 1
        
        # Log milestone messages (every 100 messages)
        if client.user_message_counts[user_id] % 100 == 0:
            print(f"Milestone: User {message.author.name} has sent {client.user_message_counts[user_id]} messages")
            
    except Exception as e:
        print(f"Error processing message: {e}")

# Add persistence for message counts
@client.event
async def on_ready():
    print(f'Connected to Discord!')
    print("Syncing commands...")
    try:
        # Load message counts from file if exists
        try:
            import json
            with open('message_counts.json', 'r') as f:
                client.user_message_counts = json.load(f)
            print("Loaded message counts from file")
        except FileNotFoundError:
            client.user_message_counts = {}
            print("No existing message counts found")
        
        # Sync to specific guild first (faster for testing)
        guild = discord.Object(id="1240677917449519124")
        guild_synced = await tree.sync(guild=guild)
        print(f"Synced {len(guild_synced)} command(s) to guild")
        
        # Then sync globally
        global_synced = await tree.sync()
        print(f"Synced {len(global_synced)} command(s) globally")
    except Exception as e:
        print(f"Failed to sync commands: {e}")

# Save message counts periodically
@client.event
async def on_disconnect():
    try:
        import json
        with open('message_counts.json', 'w') as f:
            json.dump(client.user_message_counts, f)
        print("Saved message counts to file")
    except Exception as e:
        print(f"Failed to save message counts: {e}")

# Run the client with your token
load_dotenv()
token = os.getenv('DISCORD_TOKEN')
client.run(token)

