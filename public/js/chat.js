const socket = io()


//listen server event
//name should exactly match with the one used while emitting event

//Elements
const $messges = document.querySelector('#messages')

//Templates
const $messageTemplate = document.querySelector('#message-template').innerHTML
const $sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//options - read data from the url

const {username, room} = Qs.parse(location.search, {
    ignoreQueryPrefix: true
})

/**
 * add autoscroll
 */
const autoscroll = () => {

    const $newMessage = $messges.lastElementChild

    // Height of the new messages

    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin
    //visible height

    const visibleHeight = $messges.offsetHeight

    //height of message container\
    const containerHeight = $messges.scrollHeight

    //how far I have scrolled
    const scrollOffset = $messges.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
            $messges.scrollTop = $messges.scrollHeight
    }

}
socket.on('messageReceived', (message) => {
    //console.log(message)
    const html = Mustache.render($messageTemplate, {
        message: message.text,
        time: moment(message.createdAt).format('h:mm:ss a'),
        username: message.username
    })
    $messges.insertAdjacentHTML('beforeend', html)
    autoscroll()

})

socket.on('roomData', ({room, users}) => {
    document.querySelector('#sidebar').innerHTML = ''
    const html = Mustache.render($sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').insertAdjacentHTML('beforeend', html)
})
document.querySelector('#message').addEventListener('keyup', () => {
    var message = document.querySelector('#message').value
    if (message.length > 0) {
        document.querySelector('#sendMessage').removeAttribute('disabled')
    } else {
        document.querySelector('#sendMessage').setAttribute('disabled', true)
    }
})
document.querySelector('#sendMessage').addEventListener('click', (e) => {
    e.preventDefault()
    var message = document.querySelector('#message').value
    socket.emit('messagesent', message, (error) => {
        if (error) {
            console.log(error)
        }
        console.log('the message was delivered !')
        document.querySelector('#message').value = ''
        document.querySelector('#message').focus()
        document.querySelector('#sendMessage').setAttribute('disabled', true)
    })
})

socket.emit('join', {username, room}, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})
/*
socket.on('countUpdated', (count) => {
    console.log('the count has been updated ' + count)
    var button = document.querySelector('#decrement')
    var status = false
    if (count == 0) {
        status = true
    } else {
        status = false
    }
    button.disabled = status
})

document.querySelector('#increment').addEventListener('click', () => {
    socket.emit('increment')
})
document.querySelector('#decrement').addEventListener('click', () => {
    socket.emit('decrement')
})
*/
