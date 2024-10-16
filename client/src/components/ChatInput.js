import { useState } from "react"
import axios from "axios"
import { io } from 'socket.io-client'

const socket = io('http://localhost:8000') // Povezivanje na backend server sa Socket.io

const ChatInput = ({ user, clickedUser, getUsersMessages, getClickedUsersMessages }) => {
    const [textArea, setTextArea] = useState("")
    const userId = user?.user_id
    const clickedUserId = clickedUser?.user_id

    const addMessage = async () => {
        const messageData = {
            timestamp: new Date().toISOString(),
            from_userId: userId,
            to_userId: clickedUserId,
            message: textArea
        }

        try {
            await axios.post('http://localhost:8000/message', { message: messageData })
            socket.emit('send_message', messageData) // Emitiraj poruku putem Socket.io
            getUsersMessages()
            getClickedUsersMessages()
            setTextArea("")
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <div className="chat-input">
            <textarea value={textArea} onChange={(e) => setTextArea(e.target.value)} />
            <button className="secondary-button" onClick={addMessage}>
                Submit
            </button>
        </div>
    )
}

export default ChatInput
