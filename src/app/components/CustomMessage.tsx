import React from 'react';
import { useMessageContext } from 'stream-chat-react';

const CustomMessage: React.FC = () => {
  const { message } = useMessageContext();

  const isBotMessage = message.user?.id === 'ai_assistant' || message.user?.name?.includes('AI assistant');

  return (
    <div
      className="custom-message"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: isBotMessage ? 'flex-start' : 'flex-end',
        padding: '8px 16px',
        marginBottom: '12px',
        width: '100%',
        maxWidth: '100vw',
      }}
    >
      <div
        style={{
          maxWidth: '85%', // Adjusted for mobile
          padding: '12px',
          borderRadius: '12px',
          backgroundColor: isBotMessage ? '#f1f0f0' : '#0078fe',
          color: isBotMessage ? '#333' : '#fff',
          textAlign: isBotMessage ? 'left' : 'right',
          wordWrap: 'break-word',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        }}
      >
        <p style={{ fontWeight: 'bold', fontSize: '13px', marginBottom: '4px' }}>
          {message.user?.name || 'Anonymous'}
        </p>

        <div
          style={{ fontSize: '14px', lineHeight: '1.4' }}
          dangerouslySetInnerHTML={{ __html: message?.text || '' }}
        />

        {message?.attachments && message.attachments.length > 0 && (
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '10px',
            overflowX: 'auto',
            padding: '8px 0',
          }}>
            {message.attachments.map((attachment, index) => (
              <div
                key={index}
                style={{
                  textAlign: 'center',
                  minWidth: '120px',
                  maxWidth: '150px',
                }}
              >
                <a
                  href={attachment.og_scrape_url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'inline-block', textDecoration: 'none' }}
                >
                  <img
                    src={attachment.image_url || 'https://loopin.me/'}
                    alt={attachment.title || 'Image'}
                    style={{
                      width: '100%',
                      height: 'auto',
                      objectFit: 'cover',
                      borderRadius: '8px',
                      maxHeight: '120px',
                    }}
                  />
                </a>
                <p style={{ fontSize: '13px', fontWeight: 'bold', marginTop: '4px' }}>
                  {typeof attachment.title === 'string' ? attachment.title : 'Untitled'}
                </p>
                {typeof attachment.description === 'string' && (
                  <p style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                    {attachment.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomMessage;
