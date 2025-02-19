function assignRoles(room, word) {
    const impostorIndex = Math.floor(Math.random() * room.players.length);
    room.word = word;
    room.impostorIndex = impostorIndex;
}

module.exports = { assignRoles };
