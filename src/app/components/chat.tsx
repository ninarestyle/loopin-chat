"use client";

import React, { useEffect, useState } from 'react';
import { StreamChat, Channel as StreamChannel } from 'stream-chat';
import {
  Chat as StreamChatComponent,
  Channel,
  Window,
  ChannelHeader,
  MessageList,
  MessageInput,
  MessageToSend,
  DefaultStreamChatGenerics,
} from 'stream-chat-react';
import 'stream-chat-react/dist/css/v2/index.css';
import CustomMessage from './CustomMessage';

export enum LisaRole {
  stylist = 0,
  jjs = 1,
  magasin = 2,
  deals = 3,
}

const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY || '';
const lisaRoleMap: Record<string, number> = {
  Magasin: LisaRole.magasin,
  Junjunsquare: LisaRole.jjs,
};

export const Chat: React.FC<{ influencerName: string; imageUrl: string }> = ({ influencerName, imageUrl }) => {
  const [client, setClient] = useState<StreamChat | null>(null);
  const [channel, setChannel] = useState<StreamChannel | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [messageCount, setMessageCount] = useState<number>(0);
  const [isChatInitializing, setIsChatInitializing] = useState<boolean>(false);
  const [isBotTyping, setIsBotTyping] = useState<boolean>(false);

  // Adjust viewport height on mobile
  useEffect(() => {
    const adjustHeight = () => {
      document.body.style.height = `${window.innerHeight}px`;
    };

    window.addEventListener('resize', adjustHeight);
    adjustHeight();

    return () => {
      window.removeEventListener('resize', adjustHeight);
    };
  }, []);

  // Initialize chat when the influencerName changes
  useEffect(() => {
    const initializeChat = async () => {
      const storedUserId = localStorage.getItem("userId") || `web_guest_${crypto.randomUUID()}`;
      localStorage.setItem("userId", storedUserId);

      const jwtToken = localStorage.getItem("jwtToken");
      const userName = localStorage.getItem("userName") || "Guest User";

      const authenticated = !!jwtToken;
      setIsAuthenticated(authenticated);

      try {
        if (isChatInitializing) return;
        setIsChatInitializing(true);

        // Disconnect the existing client if any
        if (client) {
          console.log("Disconnecting existing client...");
          await client.disconnectUser();
          setClient(null);
        }

        // Create a new client instance
        const newClient = StreamChat.getInstance(apiKey);
        console.log("influencer name", influencerName);

        // Fetch channel information from the backend
        const requestBody = {
          influencerName,
          userName,
          guestUserId: storedUserId,
          imageUrl,
        };

        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/chatbot/influencer`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(jwtToken && { Authorization: `Bearer ${jwtToken}` }),
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          throw new Error(`Error fetching channel: ${response.statusText}`);
        }

        const resJson = await response.json();
        const payload = resJson?.data?.payload;
        console.log("payload", payload);
        const { channelId, token, authUserId } = payload;

        // Connect the user using `authUserId` and `token` from the backend response
        await newClient.connectUser(
          {
            id: authUserId,
            name: userName,
          },
          token
        );

        // Initialize the channel and set state
        const newChannel = newClient.channel('messaging', channelId);
        await newChannel.watch();

        setClient(newClient);
        setChannel(newChannel);
      } catch (error) {
        console.error('Failed to initialize chat:', error);
      } finally {
        setIsChatInitializing(false);
      }
    };

    initializeChat();

    // Cleanup function to disconnect the chat client when influencerName changes
    return () => {
      if (client) {
        console.log("Cleaning up and disconnecting client...");
        client.disconnectUser();
        setClient(null);
        setChannel(null);
      }
    };
  }, [influencerName]);

  const handleMessageSubmit = async (
    message: MessageToSend<DefaultStreamChatGenerics>
  ) => {
    if (!channel) return;

    const text = message.text || "";
    const attachments = message.attachments || [];

    if (!isAuthenticated && messageCount >= 5) {
      alert("You’ve reached the limit of messages as a guest. Please log in to continue chatting.");
      window.location.href = "/api/auth/google";
      return;
    }

    // Indicate that the bot is typing
    setIsBotTyping(true);

    try {
      // Send the user message to the channel
      await channel.sendMessage({
        text,
        user_id: client?.userID,
        attachments,
      });

      const userId = client?.userID;
      const channelId = channel.id;
      const lisaRole = lisaRoleMap[influencerName];
      const imageUrls = attachments.map((attachment) => attachment.image_url).filter(Boolean);

      // Call the backend process-message endpoint
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/chatbot/process-message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          lisaRole,
          channelId,
          lisaId: influencerName,
          message: text,
          imageUrls,
        }),
      });
    } catch (error) {
      console.error('Failed to process message:', error);
    } finally {
      // Stop indicating that the bot is typing
      setIsBotTyping(false);
    }

    // Update message count
    setMessageCount(messageCount + 1);
    localStorage.setItem("messageCount", (messageCount + 1).toString());
  };

  if (!channel) return <div>Loading chat...</div>;

  return (
    <StreamChatComponent client={client!} theme="messaging light">
      <Channel channel={channel}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            height: 'calc(100% - env(safe-area-inset-bottom))', // Updated line
            width: '100vw',
            maxWidth: '100%',
            margin: 0,
            padding: 0,
            boxSizing: 'border-box',
          }}
        >
          <Window>
            <ChannelHeader />
            <div
              style={{
                flexGrow: 1,
                overflowY: 'auto',
                padding: '10px',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                boxSizing: 'border-box',
              }}
            >
              <MessageList Message={CustomMessage} />
            </div>

            {isBotTyping && (
              <div style={{ padding: '10px', color: '#555', textAlign: 'left' }}>
                {"AI assistant is typing..."}
              </div>
            )}

            <div
              style={{
                position: 'sticky',
                bottom: 'env(safe-area-inset-bottom)',
                background: '#fff',
                padding: '8px 10px',
                paddingBottom: 'env(safe-area-inset-bottom)',
                borderTop: '1px solid #ddd',
                width: '100%',
                boxSizing: 'border-box',
              }}
            >
              <MessageInput overrideSubmitHandler={handleMessageSubmit} />
            </div>
          </Window>
        </div>
      </Channel>
    </StreamChatComponent>
  );
};
