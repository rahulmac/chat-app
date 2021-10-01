const generateMessage = (text,username='Some User name') => {
    return {
        text: text,
        createdAt: new Date().getTime(),
        username:username.toLowerCase()
    }
}

module.exports = {
    generateMessage
}
