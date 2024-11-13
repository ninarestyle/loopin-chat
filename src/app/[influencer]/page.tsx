"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import { Chat } from '@/app/components/chat';

// Mapping of influencer names to their respective image URLs
const imageUrlMap: Record<string, string> = {
  Magasin: "https://storage.googleapis.com/restyle-app-assets/development_user_uploads/8490b8fe-494c-4c42-a885-5d71f138db42_1024x1280_2062c820-303f-4510-aa17-59777ede44da.webp",
  Junjunsquare: "https://yt3.googleusercontent.com/ytc/AIdro_mxt47XRYTJLxxIv6xv1o9PsOQ9HepW0wIcejxCCCUU4Q=s160-c-k-c0x00ffffff-no-rj",
};

// Default image URL if the influencer is not found in the map
const defaultImageUrl = "https://example.com/default-image.webp";

const InfluencerChat: React.FC = () => {
  const pathname = usePathname() ?? ''; // Fallback to an empty string if `usePathname` returns `null`
  const influencerRaw = pathname.split('/')[1] || "magasin";
  
  // Helper function to capitalize the first letter
  const capitalizeFirstLetter = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };
  
  // Capitalize the first letter of the influencer name
  const influencer = capitalizeFirstLetter(influencerRaw);
  
  // Get the image URL from the map or use the default image URL
  const imageUrl = imageUrlMap[influencer] || defaultImageUrl;

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Chat influencerName={influencer} imageUrl={imageUrl} />
    </div>
  );
};

export default InfluencerChat;
