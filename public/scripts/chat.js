const socket = io()

const getMessageTemplate = document.querySelector('#get__message__template').innerHTML
const sendMessageTemplate = document.querySelector('#send__message__template').innerHTML
const userProfileTemplate = document.querySelector('#user__profile__template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar__template').innerHTML
const friendProfileTemplate = document.querySelector('#friend__profile__template').innerHTML

const chatMessages = document.querySelector('#chat__messages')
const userProfile = document.querySelector('#user__profile')
const sidebar = document.querySelector('#sidebar')
const friendProfile = document.querySelector('#friend__profile')

const messageForm = document.querySelector('#message__form')
const messageInput = document.querySelector('#message__input')
const sendButton = document.querySelector('#send__message__btn')

const autoscroll = () => {
	const newMessage = chatMessages.lastElementChild

	const newMessageStyles = getComputedStyle(newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = chatMessages.offsetHeight

    // Height of messages container
    const containerHeight = chatMessages.scrollHeight

    // How far have I scrolled?
    const scrollOffset = chatMessages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        chatMessages.scrollTop = chatMessages.scrollHeight
    }
}

//socket.io events
socket.on('reciever', (message) => {
	console.log("We got message")
	const html = Mustache.render(getMessageTemplate, {
		message: message.text,
		createdAt: moment(message.createdAt).format('h:mm a')
	})
	chatMessages.insertAdjacentHTML('beforeend',html)
	autoscroll()
})

socket.on('sender', (message) => {
	console.log("we are about to send a message")
	const html = Mustache.render(sendMessageTemplate, {
		message: message.text,
		createdAt: moment(message.createdAt).format('h:mm a')
	})
	chatMessages.insertAdjacentHTML('beforeend',html)
	autoscroll()
})

socket.on('friends-data', ({friends}) => {
	const html = Mustache.render(sidebarTemplate, {
		friends
	})
	sidebar.innerHTML = html
})

socket.on('user-profile', ({username}) => {
	const html = Mustache.render(userProfileTemplate, {
		username
	})

	userProfile.innerHTML = html
})

//custom events
sendButton.addEventListener('click', (e) => {
	e.preventDefault()
	const message = messageInput.value
	// sendButton.setAttribute('disabled', 'disabled')
	

	socket.emit('sendMessage', message, (error) => {
		sendButton.removeAttribute('disabled')
		messageInput.value = ''
		messageInput.focus()

		if(error) {
			console.log("could not send message: ", error)
		}
	})

	console.log('message', message)
})