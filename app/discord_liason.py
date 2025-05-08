import os

import discord
from dotenv import load_dotenv

# Create client instance
client = discord.Client(intents=discord.Intents.default())

# Event: Bot is ready
@client.event
async def on_ready():
    print(f'{client.user} has connected to Discord!')

# Event: Message received
@client.event
async def on_message(message):
    # Don't respond to our own messages
    if message.author == client.user:
        return

    # Check if message starts with "hello" (case insensitive)
    if message.content.lower().startswith('hello'):
        await message.channel.send("hi there, I'm a bot!")

# Run the client with your token
load_dotenv()
token = os.getenv('DISCORD_TOKEN')
client.run(token)

