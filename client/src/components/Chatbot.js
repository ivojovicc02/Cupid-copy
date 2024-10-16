import React, { useEffect, useState } from 'react';
import { Widget, addResponseMessage } from 'react-chat-widget';
import 'react-chat-widget/lib/styles.css';
import axios from 'axios';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false); 

    console.log("Chatbot component rendered");

    // Funkcija koja se poziva kada korisnik pošalje novu poruku
    const handleNewUserMessage = async (newMessage) => {
        try {
            const response = await axios.post('http://localhost:8000/api/message', { message: newMessage });
            addResponseMessage(response.data.reply);
        } catch (error) {
            console.error('Error sending message:', error);
            addResponseMessage("Žao mi je, nisam mogao obraditi vaš zahtjev.");
        }
    };

    // Dodajemo inicijalne poruke kad se widget otvori
    useEffect(() => {
        if (isOpen) {
            addResponseMessage("Pozdrav! Kako vam mogu pomoći danas?");
        }
    }, [isOpen]);

    // Funkcija koja se koristi za zatvaranje widgeta kada se klikne na 'x'
    const handleToggleChat = () => {
        setIsOpen(!isOpen); // Promijenimo state na suprotno
    };

    return (
        <div className="chatbot">
            <button onClick={handleToggleChat}>
                {isOpen ? 'Close Chat' : 'Open Chat'}
            </button>
            {isOpen && (
                <Widget 
                    handleNewUserMessage={handleNewUserMessage} 
                    title="Welcome"
                    subtitle="This is your chat subtitle"
                    handleToggle={handleToggleChat} 
                />
            )}
        </div>
    );
};

export default Chatbot;
