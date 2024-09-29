import discord
from discord.ext import commands, tasks
import json
import os
import asyncio

# Intents necessários para acessar mensagens, membros e cargos
# Intents required to access messages, members and roles
intents = discord.Intents.default()
intents.message_content = True
intents.guilds = True
intents.members = True

# Configurando o bot
# Configuring the bot
bot = commands.Bot(command_prefix='!', intents=intents)

# Insira o ID do seu servidor (guild)
# Insert your server (guild) ID
GUILD_ID = 1178394769173528576  # Substitua pelo ID do servidor / Replace with your server ID

# Insira o token do seu bot
# Insert your bot token
TOKEN = 'MTI4NzE3MDU3ODE2NzM2OTc4MA.G6jfK7.2fdeGIg86uaBcprhHcUxDaxsc7PsagmtwUtaYA'  # Substitua pelo token do bot / Replace with your bot token

# Lista de cargos com os IDs dos emojis personalizados
# List of roles with custom emoji IDs
elos = [
    "𝗙𝗘𝗥𝗥𝗢 𝟭              <:Ferro_1:1287124142881116254>", "𝗙𝗘𝗥𝗥𝗢 𝟮              <:Ferro_2:1287124144764223548>", "𝗙𝗘𝗥𝗥𝗢 𝟯              <:Ferro_3:1287124736324800522>",
    "𝗕𝗥𝗢𝗡𝗭𝗘 𝟭           <:Bronze_1:1287124132269395998>", "𝗕𝗥𝗢𝗡𝗭𝗘 𝟮           <:Bronze_2:1287124134693699727>", "𝗕𝗥𝗢𝗡𝗭𝗘 𝟯           <:Bronze_3:1287124136593854549>",
    "𝗣𝗥𝗔𝗧𝗔 𝟭              <:Prata_1:1287124438122365022>", "𝗣𝗥𝗔𝗧𝗔 𝟮              <:Prata_2:1287124174518751293>", "𝗣𝗥𝗔𝗧𝗔 𝟯              <:Prata_3:1287124176628613120>",
    "𝗢𝗨𝗥𝗢 𝟭                <:Ouro_1:1287124156671856734>", "𝗢𝗨𝗥𝗢 𝟮                <:Ouro_2:1287124160413438063>", "𝗢𝗨𝗥𝗢 𝟯                <:Ouro_3:1287124162631962706>",
    "𝗣𝗟𝗔𝗧𝗜𝗡𝗔 𝟭          <:Platina_1:1287124506493849631>", "𝗣𝗟𝗔𝗧𝗜𝗡𝗔 𝟮          <:Platina_2:1287124166927188039>", "𝗣𝗟𝗔𝗧𝗜𝗡𝗔 𝟯          <:Platina_3:1287124170349744211>",
    "𝗗𝗜𝗔𝗠𝗔𝗡𝗧𝗘 𝟭      <:Diamante_1:1287124138443411557>", "𝗗𝗜𝗔𝗠𝗔𝗡𝗧𝗘 𝟮      <:Diamante_2:1287124140070801502>", "𝗗𝗜𝗔𝗠𝗔𝗡𝗧𝗘 𝟯      <:Diamante_3:1287124141673021552>",
    "𝗔𝗦𝗖𝗘𝗡𝗗𝗘𝗡𝗧𝗘 𝟭  <:Ascendente_1:1287124127026774097>", "𝗔𝗦𝗖𝗘𝗡𝗗𝗘𝗡𝗧𝗘 𝟮  <:Ascendente_2:1287124128389660764>", "𝗔𝗦𝗖𝗘𝗡𝗗𝗘𝗡𝗧𝗘 𝟯  <:Ascendente_3:1287124130298335384>",
    "𝗜𝗠𝗢𝗥𝗧𝗔𝗟 𝟭          <:Imortal_1:1287124150691041280>", "𝗜𝗠𝗢𝗥𝗧𝗔𝗟 𝟮          <:Imortal_2:1287124153110892566>", "𝗜𝗠𝗢𝗥𝗧𝗔𝗟 𝟯          <:Imortal_3:1287124685892358228>",
    "𝗥𝗔𝗗𝗜𝗔𝗡𝗧𝗘           <:Radiante:1287124827270025246>"
]

# Variável para armazenar o canal e a mensagem que será atualizada
# Variable to store the channel and message that will be updated
canal_ranking = None
mensagem_ranking = None

# Caminho para o arquivo onde os pontos dos usuários serão salvos
# Path to the file where user points will be saved
PONTOS_FILE = "pontos.json"

# Função para carregar os pontos do arquivo JSON
# Function to load points from JSON file
def carregar_pontos():
    if os.path.exists(PONTOS_FILE):
        with open(PONTOS_FILE, 'r') as f:
            return json.load(f)
    return {}

# Função para salvar os pontos no arquivo JSON
# Function to save points to JSON file
def salvar_pontos():
    with open(PONTOS_FILE, 'w') as f:
        json.dump(pontos, f)

# Carregar os pontos existentes no início do bot
# Load existing points at bot startup
pontos = carregar_pontos()

# Definindo os limites de pontos e as "cargas" associadas (roles no Discord)
# Defining point limits and associated "charges" (Discord roles)
cargas = {
    0: "Ferro1",
    10: "Ferro2",
    20: "Ferro3",
    30: "Bronze1",
    40: "Bronze2",
    50: "Bronze3",
    60: "Prata1",
    70: "Prata2",
    80: "Prata3",
    90: "Ouro1",
    100: "Ouro2",
    110: "Ouro3",
    120: "Platina1",
    130: "Platina2",
    140: "Platina3",
    150: "Diamante1",
    160: "Diamante2",
    170: "Diamante3",
    180: "Ascendente1",
    190: "Ascendente2",
    200: "Ascendente3",
    210: "Imortal1",
    220: "Imortal2",
    230: "Imortal3",
    240: "Radiante"
}

# Função para encontrar o cargo atual do usuário com base nos pontos
# Function to find the user's current role based on points
def obter_cargo(pontos_atualizados):
    cargo_atual = "Ferro1"  # Todos começam com Ferro1 no mínimo / Everyone starts with Ferro1 at minimum
    for pontos_requisito, role_name in sorted(cargas.items()):
        if pontos_atualizados >= pontos_requisito:
            cargo_atual = role_name
    return cargo_atual

# Função para atribuir o papel (role) ao usuário e remover cargos antigos
# Function to assign role to user and remove old roles
async def atribuir_carga(member, guild, pontos_atualizados):
    novo_cargo = None

    # Descobrir o cargo correspondente com base nos pontos
    # Find the corresponding role based on points
    for pontos_requisito, role_name in sorted(cargas.items()):
        if pontos_atualizados >= pontos_requisito:
            novo_cargo = discord.utils.get(guild.roles, name=role_name)

    # Se o usuário já tem o cargo correto, não precisa fazer nada
    # If the user already has the correct role, no need to do anything
    if novo_cargo and novo_cargo not in member.roles:
        # Remover todos os cargos antigos que estão na lista de elos
        # Remove all old roles that are in the elos list
        for role in member.roles:
            if role.name in cargas.values() and role != novo_cargo:
                await member.remove_roles(role)

        # Atribuir o novo cargo
        # Assign the new role
        await member.add_roles(novo_cargo)
        await member.send(f"Parabéns! Você atingiu {pontos_atualizados} pontos e recebeu o papel '{novo_cargo.name}' no servidor {guild.name}.")

# Comando para adicionar pontos (somente admins)
# Command to add points (admin only)
@bot.command()
@commands.has_permissions(administrator=True)
async def add(ctx, member: discord.Member, amount: int):
    if member.id in pontos:
        pontos[member.id] += amount
    else:
        pontos[member.id] = amount

    salvar_pontos()  # Salvar os pontos no arquivo / Save points to file
    await ctx.send(f'{amount} pontos adicionados para {member.name}. Total: {pontos[member.id]} pontos.')

    # Verifica se o usuário atingiu pontos suficientes para receber uma carga
    # Check if the user has reached enough points to receive a charge
    await atribuir_carga(member, ctx.guild, pontos[member.id])

# Comando para remover pontos (somente admins)
# Command to remove points (admin only)
@bot.command()
@commands.has_permissions(administrator=True)
async def remove(ctx, member: discord.Member, amount: int):
    if member.id in pontos:
        pontos[member.id] -= amount
        if pontos[member.id] < 0:
            pontos[member.id] = 0
    else:
        pontos[member.id] = 0

    salvar_pontos()  # Salvar os pontos no arquivo / Save points to file
    await ctx.send(f'{amount} pontos removidos de {member.name}. Total: {pontos[member.id]} pontos.')

    # Verifica se o usuário deve ter seu cargo atualizado após a remoção de pontos
    # Check if the user should have their role updated after point removal
    await atribuir_carga(member, ctx.guild, pontos[member.id])

# Comando para remover todos os pontos de um usuário (somente admins)
# Command to remove all points from a user (admin only)
@bot.command()
@commands.has_permissions(administrator=True)
async def reset(ctx, member: discord.Member):
    if member.id in pontos:
        pontos[member.id] = 0
        salvar_pontos()  # Salvar os pontos no arquivo / Save points to file
        await ctx.send(f'Todos os pontos de {member.name} foram resetados.')
    else:
        await ctx.send(f'{member.name} não tem pontos.')

# Comando para verificar o elo do usuário (acessível a todos)
# Command to check user's rank (accessible to all)
@bot.command()
async def elo(ctx, member: discord.Member = None):
    # Se nenhum membro for especificado, verifica o autor do comando
    # If no member is specified, check the command author
    member = member or ctx.author
    total_pontos = pontos.get(member.id, 0)

    # Obtém o cargo correspondente com base nos pontos
    # Get the corresponding role based on points
    cargo_atual = obter_cargo(total_pontos)

    # Envia a resposta com o nome do cargo
    # Send the response with the role name
    await ctx.send(f'{cargo_atual}')

# Função para coletar os membros com base nos cargos
# Function to collect members based on roles
async def obter_membros_por_cargo(guild):
    resultado = ""

    for i, elo in enumerate(elos):
        # Tenta encontrar o cargo no servidor correspondente ao índice do elo
        # Try to find the role in the server corresponding to the elo index
        cargo_name = cargas[i * 10]  # Usa o índice para buscar o nome do cargo correspondente / Use the index to fetch the corresponding role name
        cargo = discord.utils.get(guild.roles, name=cargo_name)
        if cargo:
            # Pega todos os membros com esse cargo
            # Get all members with this role
            membros_com_cargo = [member.name for member in cargo.members]
            if membros_com_cargo:
                # Formata a linha de texto para esse cargo com o emoji
                # Format the text line for this role with the emoji
                resultado += f"{elo} {', '.join(membros_com_cargo)}\n"
            else:
                resultado += f"{elo} \n"  # Alterado para espaço em branco / Changed to blank space
        else:
            resultado += f"{elo} \n"  # Caso não haja o cargo, também deixa em branco / If there's no role, also leave blank

    return resultado

# Loop que atualiza a mensagem a cada 5 segundos
# Loop that updates the message every 5 seconds
@tasks.loop(seconds=5)
async def atualizar_ranking(guild):
    global mensagem_ranking

    # Obtém a lista de membros por cargo
    # Get the list of members by role
    conteudo_ranking = await obter_membros_por_cargo(guild)

    # Atualiza a mensagem no canal
    # Update the message in the channel
    if mensagem_ranking:
        await mensagem_ranking.edit(content=conteudo_ranking)

# Comando para criar o canal e iniciar a atualização
# Command to create the channel and start the update
@bot.command()
@commands.has_permissions(administrator=True)
async def lista(ctx):
    global canal_ranking, mensagem_ranking

    # Verifica se o canal já existe
    # Check if the channel already exists
    canal_ranking = discord.utils.get(ctx.guild.channels, name="🇷🇦🇳🇰🇮🇳🇬")

    # Se o canal não existir, cria um novo
    # If the channel doesn't exist, create a new one
    if canal_ranking is None:
        canal_ranking = await ctx.guild.create_text_channel('🇷🇦🇳🇰🇮🇳🇬')

    # Envia uma mensagem inicial
    # Send an initial message
    if mensagem_ranking is None:
        mensagem_ranking = await canal_ranking.send("Iniciando atualização de ranking...")

    # Inicia o loop de atualização
    # Start the update loop
    atualizar_ranking.start(ctx.guild)

# Evento para verificar quando o bot é adicionado a um novo servidor
# Event to check when the bot is added to a new server
@bot.event
async def on_ready():
    guild = discord.utils.get(bot.guilds, id=GUILD_ID)
    if guild:
        print(f'Bot conectado ao servidor: {guild.name} (ID: {guild.id})')
    else:
        print(f'Bot não está no servidor com o ID {GUILD_ID}. Verifique se o bot foi adicionado corretamente.')

# Tratamento de erros para falta de permissões
# Error handling for lack of permissions
@add.error
@remove.error
@reset.error
async def permission_error(ctx, error):
    if isinstance(error, commands.MissingPermissions):
        await ctx.send("Você não tem permissão para usar este comando.")

# Iniciando o bot
# Starting the bot
bot.run(TOKEN)
