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

const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY || '';
const client = StreamChat.getInstance(apiKey);
const influencerName = "magasin";

export const Chat: React.FC = () => {
  const [channel, setChannel] = useState<StreamChannel | null>(null);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [messageCount, setMessageCount] = useState<number>(0);

  useEffect(() => {
    let storedUserId = localStorage.getItem("userId");

    if (!storedUserId) {
      storedUserId = crypto.randomUUID();
      localStorage.setItem("userId", storedUserId);
    }

    const storedMessageCount = localStorage.getItem("messageCount");
    setMessageCount(storedMessageCount ? parseInt(storedMessageCount) : 0);

    const token = localStorage.getItem("jwtToken");

    if (token) {
      setIsAuthenticated(true);
    }

    initChat(storedUserId, token);
  }, []);

  const handleGoogleLogin = () => {
    alert("You’ve reached the limit of messages as a guest. Please log in to continue chatting.");
    window.location.href = "/api/auth/google";
  };

  const initChat = async (userId: string, jwtToken: string | null) => {
    try {
      const requestBody = {
        influencerName,
        userName: "Guest User",
        guestUserId: userId,
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
      const { channelId, token, authUserId } = payload;
      console.log("channelId is", channelId)
      await client.connectUser(
        {
          id: authUserId,
          name: "Guest User",
        },
        token
      );

      const existingChannel = client.channel('messaging', channelId);
      await existingChannel.watch();
      setChannel(existingChannel);

    } catch (error) {
      console.error('Failed to initialize chat:', error);
    }
  };

  const handleMessageSubmit = async (
    message: MessageToSend<DefaultStreamChatGenerics>,
  ) => {
    if (!channel) return;

    const text = message.text || "";

    if (!isAuthenticated && messageCount >= 3) {
      handleGoogleLogin();
      return;
    }

    sendMessage(text);
  };

  const sendMessage = async (text: string) => {
    if (!channel) return;

    await channel.sendMessage({
      text: text,
      user_id: client.userID,
    });

    const newMessageCount = messageCount + 1;
    setMessageCount(newMessageCount);
    localStorage.setItem("messageCount", newMessageCount.toString());

    try {
      setIsBotTyping(true);

      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/chatbot/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          influencerName,
          channelId: channel.id,
          message: text,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to get AI response: ${response.statusText}`);
      }

      const aiResponseData = await response.json();
      const payload = aiResponseData?.data?.payload;
      const { tips, items } = payload;

      console.log("tips and items", tips, items);

    } catch (error) {
      console.error('Error sending AI response:', error);
    } finally {
      setIsBotTyping(false);
    }
  };

  if (!channel) return <div>Loading chat...</div>;

  return (
    // Adjustments for the main layout
    <StreamChatComponent client={client} theme="messaging light">
      <Channel channel={channel}>
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100%' }}>
          <Window>
            <ChannelHeader />

            {/* Main message list area with flex-grow to use full height */}
            <div style={{ flexGrow: 1, overflowY: 'auto' }}>
              <MessageList Message={CustomMessage} />
            </div>

            {isBotTyping && (
              <div style={{ padding: '10px', color: '#555', textAlign: 'left' }}>
                {"Magasin's AI assistant is typing..."}
              </div>
            )}

            <MessageInput overrideSubmitHandler={handleMessageSubmit} />
          </Window>
        </div>
      </Channel>
    </StreamChatComponent>




  );
};
