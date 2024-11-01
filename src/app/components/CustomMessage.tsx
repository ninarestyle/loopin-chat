import React from 'react';
import { useMessageContext } from 'stream-chat-react';

const CustomMessage: React.FC = () => {
    const { message } = useMessageContext();

    const isBotMessage = message.user?.name === "magasin's AI assistant";

    return (
        <div
            className="custom-message"
            style={{
                display: 'flex',
                justifyContent: isBotMessage ? 'flex-start' : 'flex-end',
                padding: '10px 0',
                width: '100%',
            }}
        >
            <div
                style={{
                    maxWidth: '60%', // Limits width of each message
                    padding: '10px',
                    borderRadius: '8px',
                    backgroundColor: isBotMessage ? '#f1f0f0' : '#0078fe',
                    color: isBotMessage ? '#333' : '#fff',
                    textAlign: isBotMessage ? 'left' : 'right',
                }}
            >
                <p style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '4px' }}>
                    {message.user?.name || 'Anonymous'}
                </p>

                <p style={{ fontSize: '16px', lineHeight: '1.4' }}>
                    {message?.text}
                </p>

                {message?.attachments && message.attachments.length > 0 && (
                    <div style={{
                        display: 'flex',
                        gap: '10px',
                        overflowX: 'auto',
                        padding: '10px 0',
                    }}>
                        {message?.attachments && message.attachments.length > 0 && (
                            <div style={{
                                display: 'flex',
                                gap: '20px', // Increase gap for spacing
                                overflowX: 'auto',
                                padding: '10px 0',
                            }}>
                                {message.attachments.map((attachment, index) => (
                                    <div key={index} style={{ textAlign: 'center', minWidth: '250px', maxWidth: '300px' }}> {/* Increased width */}
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
                                                    width: '100%', // Ensure image fills the container
                                                    height: 'auto',
                                                    objectFit: 'cover',
                                                    borderRadius: '8px',
                                                }}
                                            />
                                        </a>
                                        {/* Display title below each image */}
                                        <p style={{ fontSize: '16px', fontWeight: 'bold', marginTop: '8px' }}>
                                            {typeof attachment.title === 'string' ? attachment.title : 'Untitled'}
                                        </p>
                                        {/* Display description below the title */}
                                        {typeof attachment.description === 'string' && (
                                            <p style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
                                                {attachment.description}
                                            </p>
                                        )}

                                    </div>
                                ))}
                            </div>
                        )}

                    </div>
                )}
            </div>
        </div>
    );
};


export default CustomMessage;
