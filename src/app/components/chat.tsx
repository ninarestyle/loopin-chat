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
import { useRouter } from 'next/navigation';


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
  Deals: LisaRole.deals
};

export const Chat: React.FC<{ influencerName: string; imageUrl: string }> = ({ influencerName, imageUrl }) => {
  const [client, setClient] = useState<StreamChat | null>(null);
  const [channel, setChannel] = useState<StreamChannel | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [messageCount, setMessageCount] = useState<number>(0);
  const [isChatInitializing, setIsChatInitializing] = useState<boolean>(false);
  const [isBotTyping, setIsBotTyping] = useState<boolean>(false);
  //const [selectedOption, setSelectedOption] = useState<string>('Magasin');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);

  const toggleSidebar = () => {
      setIsSidebarCollapsed(!isSidebarCollapsed);
  };
  // // Function to handle Gmail promotions integration
  // const manageGmailPromotions = async () => {
  //   try {
  //     // Check if the user is already authenticated
  //     const jwtToken = localStorage.getItem('jwtToken');
  //     // Check if the user is already authenticated
  //     const accessTokenAvailable = localStorage.getItem('accessTokenAvailable');
  //     // User is not logged in, redirect them to Google OAuth login
  //     const currentUrl = window.location.href;

  //     if (!jwtToken) {
  //       alert("Please log in first to continue managing Gmail promotions.")
  //       // Redirect to Google OAuth login with the current URL as redirectUrl
  //       window.location.href = `/api/auth/google?redirectUrl=${encodeURIComponent(currentUrl)}`;
  //       return;
  //     }
  //     // User is logged in, proceed with requesting Gmail API access
  //     if (!accessTokenAvailable) {
  //       alert("Redirecting you to grant Gmail API access.");
  //       const baseUrl = window.location.origin; 
  //       const redirectUrl = `${baseUrl}/deals`; 
        
  //       window.location.href = `/api/auth/google/incremental?redirectUrl=${encodeURIComponent(redirectUrl)}`;
  //     }

  //   } catch (error) {
  //     console.error('Error during Gmail integration:', error);
  //     alert('Failed to integrate Gmail. Please try again.');
  //   }
  // };

  useEffect(() => {
    const adjustContentHeight = () => {
      const viewportHeight = window.innerHeight;
      const chatContent = document.querySelector('.chat-content');

      if (chatContent instanceof HTMLElement) {
        chatContent.style.height = `${viewportHeight - 70}px`;
      }

      // Scroll to the bottom to ensure the latest message is visible
      window.scrollTo(0, document.body.scrollHeight);
    };

    window.addEventListener('resize', adjustContentHeight);
    adjustContentHeight();

    return () => {
      window.removeEventListener('resize', adjustContentHeight);
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
  // Inside the Chat component
  const router = useRouter();

  // Define options in one place
  const options = [
    { label: 'Discover recommendations from Magasin', route: '/magasin' },
    { label: `Check out JunJun's favorites`, route: '/junjunsquare' },
    // { label: 'Manage 2024 holiday promotions', route: '/deals', action: manageGmailPromotions },
  ];

  // Handle option clicks
  const handleOptionClick = async (option: typeof options[number]) => {
    // Call the action if it exists (e.g., manageGmailPromotions)
    // if (option.action) {
    //   await option.action();
    // }

    // Navigate to the associated route
    router.push(option.route);

    // Update the selected option
    //setSelectedOption(option.label);
  };
  
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
    <div style={{ height: '100vh', display: 'flex', position: 'relative' }}>
        {/* Sidebar */}
        <div className={`sidebar ${isSidebarCollapsed ? 'collapsed' : 'expanded'}`}>
            <h3>Options</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {options.map((option) => (
                    <li
                        key={option.label}
                        style={{
                            padding: '10px',
                            margin: '10px 0',
                            cursor: 'pointer',
                            background: '#fff',
                            borderRadius: '5px',
                        }}
                        onClick={() => handleOptionClick(option)}
                    >
                        {option.label}
                    </li>
                ))}
            </ul>
        </div>

        {/* Chat Content */}
        <div className={`chat-container ${isSidebarCollapsed ? 'collapsed' : ''}`}>
            <StreamChatComponent client={client!} theme="messaging light">
                <Channel channel={channel}>
                    <Window>
                        <ChannelHeader />
                        <MessageList Message={CustomMessage} />
                        {isBotTyping && (
                            <div style={{ padding: '10px', color: '#555' }}>AI assistant is typing...</div>
                        )}
                        <MessageInput overrideSubmitHandler={handleMessageSubmit} />
                    </Window>
                </Channel>
            </StreamChatComponent>
        </div>

        {/* Sidebar Toggle Button */}
        <div
            className="sidebar-toggle"
            onClick={toggleSidebar}
            title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
            {isSidebarCollapsed ? '☰' : '×'}
        </div>
    </div>
);

};
