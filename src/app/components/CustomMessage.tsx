import React from 'react';
import { useMessageContext } from 'stream-chat-react';

const CustomMessage: React.FC = () => {
    const { message } = useMessageContext();
    
    // Check if the message is from the bot or the user
    const isBotMessage = message.user?.name === "magasin's AI assistant";

    return (
        <div 
            className="custom-message"
            style={{
                display: 'flex',
                justifyContent: isBotMessage ? 'flex-start' : 'flex-end', // Left for bot, right for user
                padding: '10px 0'
            }}
        >
            <div
                style={{
                    maxWidth: '60%',
                    padding: '10px',
                    borderRadius: '8px',
                    backgroundColor: isBotMessage ? '#f1f0f0' : '#0078fe', // Different background color
                    color: isBotMessage ? '#333' : '#fff',
                    textAlign: isBotMessage ? 'left' : 'right', // Text alignment based on the sender
                }}
            >
                {/* Display the sender's name */}
                <p style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '4px' }}>
                    {message.user?.name || 'Anonymous'}
                </p>
                
                {/* Display the message text */}
                <p style={{ fontSize: '16px', lineHeight: '1.4' }}>
                    {message?.text}
                </p>

                {/* Display attachments, if any */}
                {message?.attachments && message.attachments.length > 0 && (
                    <div style={{
                        display: 'flex',
                        gap: '10px',
                        overflowX: 'auto',
                        padding: '10px 0',
                    }}>
                        {message.attachments.map((attachment, index) => (
                            <div key={index} style={{ textAlign: 'center' }}>
                                <a 
                                    href={attachment.og_scrape_url || '#'}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        display: 'inline-block',
                                        textDecoration: 'none'
                                    }}
                                >
                                    <img
                                        src={attachment.image_url || 'https://cdn-images.farfetch-contents.com/23/95/98/93/23959893_54010053_1000.jpg'}
                                        alt={attachment.title || 'Image'}
                                        style={{
                                            width: 'auto',
                                            height: '300px',
                                            objectFit: 'cover',
                                            borderRadius: '8px',
                                        }}
                                    />
                                </a>
                                {/* Display title below each image */}
                                <p style={{ fontSize: '14px', fontWeight: 'bold', marginTop: '8px' }}>
                                    {attachment.title || 'Untitled'}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CustomMessage;
