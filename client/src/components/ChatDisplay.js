import { useState, useEffect } from "react"
import axios from "axios"
import Chat from './Chat'
import ChatInput from './ChatInput'
import { io } from 'socket.io-client'

const socket = io('http://localhost:8000') 

const ChatDisplay = ({ user, clickedUser }) => {
    const userId = user?.user_id
    const clickedUserId = clickedUser?.user_id
    const [usersMessages, setUsersMessages] = useState(null)
    const [clickedUsersMessages, setClickedUsersMessages] = useState(null)

    const getUsersMessages = async () => {
        try {
            const response = await axios.get('http://localhost:8000/messages', {
                params: { userId: userId, correspondingUserId: clickedUserId }
            })
            setUsersMessages(response.data)
        } catch (error) {
            console.log(error)
        }
    }

    const getClickedUsersMessages = async () => {
        try {
            const response = await axios.get('http://localhost:8000/messages', {
                params: { userId: clickedUserId, correspondingUserId: userId }
            })
            setClickedUsersMessages(response.data)
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        getUsersMessages()
        getClickedUsersMessages()

        // Pridruži se sobi na osnovu korisničkih ID-ova
        socket.emit('join_room', { userId, correspondingUserId: clickedUserId })

        // Osluhni za primljene poruke putem Socket.io
        socket.on('receive_message', (messageData) => {
            setUsersMessages((prevMessages) => [...prevMessages, messageData])
        })

        return () => {
            socket.off('receive_message')
        }
    }, [userId, clickedUserId])

    const messages = []

    usersMessages?.forEach(message => {
        const formattedMessage = {
            name: user?.first_name,
            img: user?.url,
            message: message.message,
            timestamp: message.timestamp
        }
        messages.push(formattedMessage)
    })

    clickedUsersMessages?.forEach(message => {
        const formattedMessage = {
            name: clickedUser?.first_name,
            img: clickedUser?.url,
            message: message.message,
            timestamp: message.timestamp
        }
        messages.push(formattedMessage)
    })

    const descendingOrderMessages = messages?.sort((a, b) => a.timestamp.localeCompare(b.timestamp))

    return (
        <>
            <Chat descendingOrderMessages={descendingOrderMessages} />
            <ChatInput
                user={user}
                clickedUser={clickedUser}
                getUsersMessages={getUsersMessages}
                getClickedUsersMessages={getClickedUsersMessages}
            />
        </>
    )
}

export default ChatDisplay