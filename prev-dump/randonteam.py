import discord
from discord.ext import commands
import random
import asyncio

intents = discord.Intents.default()
intents.messages = True
intents.message_content = True

bot = commands.Bot(command_prefix='!', intents=intents)

inscritos = {
    "🇸​​🇨​​🇭​​🇴​​🇱​​🇦​​🇷​": [],
    "​🇨​​🇭​​🇦​​🇲​​🇵​​🇮​​🇴​​🇳​": [],
    "​🇵​​🇦​​🇱​​🇦​​🇩​​🇮​​🇳​": [],
    "​🇭​​🇮​​🇬​​🇭​ ​🇵​​🇷​​🇮​​🇪​​🇸​​🇹​": [],
    "🇭​​🇮​​🇬​​🇭​ ​🇼​​🇮​​🇿​​🇦​​🇷​​🇩": [],
    "​🇲​​🇮​​🇳​​🇸​​🇹​​🇷​​🇪​​🇱": [],
    "7️⃣​🇹​​🇭​": []
}

usuarios_inscritos = {}  # To track the class of each user (Para acompanhar a classe de cada usuário)
mensagem_inscricoes = None  # Current registration message (Mensagem de inscrições atuais)


@bot.event
async def on_ready():
    print(f'Bot {bot.user} está online.')  # Bot is online


@bot.command()
async def d(ctx):
    guild = ctx.guild
    nome_canal = "sala-de-inscricao"  # registration room

    if discord.utils.get(guild.text_channels, name=nome_canal):
        await ctx.send(f"A sala `{nome_canal}` já existe!")  # The room already exists!
        return

    canal = await guild.create_text_channel(nome_canal)
    await ctx.send(
        f"Sala `{nome_canal}` criada! Use os botões abaixo para se inscrever.")  # Room created! Use the buttons below to register.

    embed = discord.Embed(title="Inscrição para o Draft",  # Registration for the Draft
                          description="Escolha sua classe abaixo:")  # Choose your class below:

    view = discord.ui.View()

    class InscricaoButton(discord.ui.Button):

        def __init__(self, classe):
            super().__init__(label=classe, style=discord.ButtonStyle.green)
            self.classe = classe

        async def callback(self, interaction):
            usuario = interaction.user

            # Check if the user is already registered (Verifica se o usuário já está inscrito)
            if usuario in usuarios_inscritos:
                classe_antiga = usuarios_inscritos[usuario]
                inscritos[classe_antiga].remove(
                    usuario)  # Remove from previous class (Remove da classe anterior)

            # Add the user to the new class (Adiciona o usuário à nova classe)
            if len(inscritos[self.classe]) < 2:
                inscritos[self.classe].append(usuario)
                usuarios_inscritos[usuario] = self.classe
                await interaction.response.send_message(
                    f"{usuario.mention} se inscreveu como {self.classe}!",  # registered as
                    ephemeral=True)
                await self.atualizar_inscricoes(canal)
            else:
                await interaction.response.send_message(
                    f"A classe {self.classe} já está cheia!", ephemeral=True)  # The class is already full!

        async def atualizar_inscricoes(self, canal):
            global mensagem_inscricoes
            inscricoes = "\n".join([
                f"{classe}: {', '.join(user.mention for user in users)}"
                for classe, users in inscritos.items() if users
            ])
            if mensagem_inscricoes is None:
                mensagem_inscricoes = await canal.send(embed=discord.Embed(
                    title="Inscrições Atuais",  # Current Registrations
                    description=inscricoes or "Nenhum inscrito ainda."))  # No registrations yet.
            else:
                await mensagem_inscricoes.edit(embed=discord.Embed(
                    title="Inscrições Atuais",  # Current Registrations
                    description=inscricoes or "Nenhum inscrito ainda."))  # No registrations yet.

    # Creating buttons for each class (Criando botões para cada classe)
    for classe in inscritos.keys():
        button = InscricaoButton(classe)
        view.add_item(button)

    await canal.send(embed=embed, view=view)


@bot.command()
async def s(ctx):
    # The draw can now be performed regardless of the number of registrants
    # (O sorteio agora pode ser realizado independentemente do número de inscritos)
    # if sum(len(v) for v in inscritos.values()) < 14:
    #     await ctx.send("É necessário pelo menos 14 inscritos para realizar o sorteio!")
    #     return

    # Create a list for the teams (Criar uma lista para as equipes)
    equipe1 = []
    equipe2 = []

    # Let's ensure there's no repetition of classes in each team
    # (Vamos garantir que não haja repetição de classes em cada time)
    for classe in inscritos.keys():
        if inscritos[classe]:
            # Draw a player from each class for team 1
            # (Sortear um jogador de cada classe para a equipe 1)
            jogador1 = random.choice(inscritos[classe])
            equipe1.append(jogador1)
            inscritos[classe].remove(jogador1)  # Remove the player from the list (Remove o jogador da lista)

            if inscritos[classe]:
                # Draw a player of the same class for team 2
                # (Sortear um jogador da mesma classe para a equipe 2)
                jogador2 = random.choice(inscritos[classe])
                equipe2.append(jogador2)
                inscritos[classe].remove(jogador2)  # Remove the player from the list (Remove o jogador da lista)

    await ctx.send(
        f"**Equipe BLUE:** {', '.join(user.mention for user in equipe1)}\n**Equipe RED:** {', '.join(user.mention for user in equipe2)}"
    )

    # Clear registrations after the draw (Limpar inscritos após o sorteio)
    inscritos.clear()  # Clear the dictionary of registrants (Limpa o dicionário de inscritos)
    usuarios_inscritos.clear()  # Clear user registrations (Limpa as inscrições dos usuários)
    global mensagem_inscricoes
    mensagem_inscricoes = None  # Reset the registration message (Reseta a mensagem de inscrições)


@bot.command()
async def testar_sortear(ctx):
    # Simulating the registration of 14 fictitious players
    # (Simulando a inscrição de 14 jogadores fictícios)
    fake_inscritos = {
        "🇸​​🇨​​🇭​​🇴​​🇱​​🇦​​🇷​": [ctx.guild.get_member(i) for i in range(1, 3)],
        "​🇨​​🇭​​🇦​​🇲​​🇵​​🇮​​🇴​​🇳​": [ctx.guild.get_member(i) for i in range(3, 5)],
        "​🇵​​🇦​​🇱​​🇦​​🇩​​🇮​​🇳​": [ctx.guild.get_member(i) for i in range(5, 7)],
        "​🇭​​🇮​​🇬​​🇭​ ​🇵​​🇷​​🇮​​🇪​​🇸​​🇹​": [ctx.guild.get_member(i) for i in range(7, 9)],
        "🇭​​🇮​​🇬​​🇭​ ​🇼​​🇮​​🇿​​🇦​​🇷​​🇩": [ctx.guild.get_member(i) for i in range(9, 11)],
        "​🇲​​🇮​​🇳​​🇸​​🇹​​🇷​​🇪​​🇱": [ctx.guild.get_member(i) for i in range(11, 13)],
        "7️⃣​🇹​​🇭​": [ctx.guild.get_member(i) for i in range(13, 15)]
    }

    global inscritos
    inscritos = fake_inscritos  # Use the fictitious registrants (Usar os inscritos fictícios)

    await sortear(ctx)  # Call the draw method (Chama o método de sorteio)


@bot.command()
async def r(ctx):
    global inscritos, usuarios_inscritos, mensagem_inscricoes
    # Clear registrations (Limpa as inscrições)
    inscritos = {
        "🇸​​🇨​​🇭​​🇴​​🇱​​🇦​​🇷​": [],
        "​🇨​​🇭​​🇦​​🇲​​🇵​​🇮​​🇴​​🇳​": [],
        "​🇵​​🇦​​🇱​​🇦​​🇩​​🇮​​🇳​": [],
        "​🇭​​🇮​​🇬​​🇭​ ​🇵​​🇷​​🇮​​🇪​​🇸​​🇹​": [],
        "🇭​​🇮​​🇬​​🇭​ ​🇼​​🇮​​🇿​​🇦​​🇷​​🇩": [],
        "​🇲​​🇮​​🇳​​🇸​​🇹​​🇷​​🇪​​🇱": [],
        "7️⃣​🇹​​🇭​": []
    }
    usuarios_inscritos.clear()
    mensagem_inscricoes = None

    # Delete the registration channel if it exists
    # (Apaga o canal de inscrição se ele existir)
    nome_canal = "sala-de-inscricao"
    canal = discord.utils.get(ctx.guild.text_channels, name=nome_canal)
    if canal:
        await canal.delete()

    await ctx.send("O bot foi resetado para a estaca zero.")  # The bot has been reset to square one.


# Replace 'seu_token_aqui' with your bot's token
# (Substitua 'seu_token_aqui' pelo token do seu bot)
bot.run(
    'MTI4NzIzNzk1MTE0NjgxOTU4Ng.GUbjRD.H_XGk5g-TKp3F5UmBJ7eN7yXlrO9LObtTIwfOQ')
