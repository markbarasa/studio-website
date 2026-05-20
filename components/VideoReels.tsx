"use client";

import { useState, useRef } from "react";
import { Play, Pause, Volume2, VolumeX, X, Maximize } from "lucide-react";

type Video = {
  id: number;
  title: string;
  description: string;
  url: string;
  thumbnail: string;
  category: string;
  duration: string;
};

const videos: Video[] = [
  {
   id: 1,
title: "Our Stories From West Pokot",
description: "3 Queens Living with Disabilities in West Pokot",
url: "https://www.youtube.com/embed/XPpb8QVZ2Bg",
thumbnail: "https://img.youtube.com/vi/XPpb8QVZ2Bg/maxresdefault.jpg",
category: "Podcast",
duration: "22:50",

  },
 {
  id: 2, // or your next ID
  title: "The Kape Podcast Episode 4 | KORRA Empire",
  description: "Inspiring conversation with KORRA Empire on The Kape Podcast.",
  url: "https://www.youtube.com/embed/kWQ_Sx8hT3s",
  thumbnail: "https://img.youtube.com/vi/kWQ_Sx8hT3s/maxresdefault.jpg",
  category: "Podcast", // or "Documentary" / "Interview"
  duration: "22:50", // You can update with the actual duration
 
},

  {
  id: 3, // Use your next available ID
  title: "AIC Septonok Choir Kitale - Nimekukimbilia",
  description: "A moving gospel performance by the AIC Septonok Choir from Kitale.",
  url: "https://www.youtube.com/embed/aAcHHrkqTGI",
  thumbnail: "https://img.youtube.com/vi/aAcHHrkqTGI/maxresdefault.jpg",
  category: "Music", // Fits perfectly in your "Music" category
  duration: "7:17", // YouTube doesn't show duration easily here; you can update it later
 
},
  {
    id: 4,
    title: "Chemoyo by Pokot Boy - Latest Kalenjin Music",
    description: "An exciting new release from Pokot Boy.",
    url: "https://www.youtube.com/embed/zqzk8a-Mibc",
    thumbnail: "https://img.youtube.com/vi/zqzk8a-Mibc/maxresdefault.jpg",
    category: "Music",
    duration: "3:53",
    
  },
 {
  id: 5, // Use your next available ID
  title: "Pokot Boy - Peace (Official Video)",
  description: "A powerful call for unity and harmony. The official music video for 'Peace' by Pokot Boy.",
  url: "https://www.youtube.com/embed/XjUyIJbuJS4",
  thumbnail: "https://img.youtube.com/vi/XjUyIJbuJS4/maxresdefault.jpg",
  category: "Music", // Fits in your "Music" category
  duration: "4:52", // You can check the video page for the exact duration (e.g., "3:45")
 
},
  {
  id: 6, // Use your next available ID
  title: "AIC Septonok Choir Kitale - Nayaweza Mambo Yote",
  description: "An uplifting gospel performance by the AIC Septonok Choir from Kitale.",
  url: "https://www.youtube.com/embed/_lByM-8zKeo",
  thumbnail: "https://img.youtube.com/vi/_lByM-8zKeo/maxresdefault.jpg",
  category: "Music", // Fits in your "Music" category
  duration: "6:50", // You can check the video page for the exact duration
  // type: "youtube",
},


];

const categories = ["All", "Wedding", "Traditional", "Corporate", "Music", "Documentary", "Podcast", "Studio", "Events"];

export default function VideoReels() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = useRef<HTMLIFrameElement>(null);

  const filteredVideos = selectedCategory === "All"
    ? videos
    : videos.filter(video => video.category === selectedCategory);

  const openVideoModal = (video: Video) => {
    setSelectedVideo(video);
    setIsPlaying(true);
    document.body.style.overflow = "hidden";
  };

  const closeVideoModal = () => {
    setSelectedVideo(null);
    setIsPlaying(false);
    document.body.style.overflow = "auto";
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-3xl">🎬</span>
          <h2 className="text-3xl font-bold">Video Reels</h2>
        </div>
        <p className="text-zinc-400 max-w-2xl mx-auto">
          Watch our latest video productions - from weddings and events to music videos and documentaries
        </p>
        <div className="w-20 h-1 bg-amber-500 mx-auto mt-4 rounded-full" />
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap justify-center gap-3">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-full transition-all duration-300 text-sm ${
              selectedCategory === category
                ? "bg-amber-500 text-black font-semibold"
                : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800 border border-zinc-800"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Video Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVideos.map((video) => (
          <div
            key={video.id}
            onClick={() => openVideoModal(video)}
            className="group relative overflow-hidden rounded-xl cursor-pointer bg-zinc-900 border border-zinc-800 hover:border-amber-500/50 transition-all duration-300 hover:scale-105"
          >
            {/* Thumbnail */}
            <div className="relative aspect-video overflow-hidden">
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300">
                <div className="w-16 h-16 rounded-full bg-amber-500/90 flex items-center justify-center">
                  <Play className="w-8 h-8 text-black ml-1" />
                </div>
              </div>
              <div className="absolute bottom-2 right-2 bg-black/70 px-2 py-1 rounded text-xs text-white">
                {video.duration}
              </div>
              <div className="absolute top-2 left-2 bg-amber-500 text-black px-2 py-1 rounded text-xs font-semibold">
                {video.category}
              </div>
            </div>

            {/* Info */}
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-1 line-clamp-1">{video.title}</h3>
              <p className="text-sm text-zinc-400 line-clamp-2">{video.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Video Modal */}
      {selectedVideo && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={closeVideoModal}
        >
          <div
            className="relative w-full max-w-5xl bg-zinc-900 rounded-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 bg-zinc-800">
              <div>
                <h3 className="font-semibold text-lg">{selectedVideo.title}</h3>
                <p className="text-sm text-zinc-400">{selectedVideo.description}</p>
              </div>
              <button
                onClick={closeVideoModal}
                className="text-zinc-400 hover:text-white transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Video Player */}
            <div className="aspect-video bg-black">
              <iframe
                ref={videoRef}
                src={`${selectedVideo.url}?autoplay=1&mute=${isMuted ? 1 : 0}&rel=0`}
                title={selectedVideo.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-zinc-800 flex justify-between items-center">
              <div className="flex gap-3">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  {isMuted ? "Unmute" : "Mute"}
                </button>
              </div>
              <div className="text-sm text-zinc-400">
                Duration: {selectedVideo.duration}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* YouTube Channel CTA */}
      <div className="text-center pt-8">
        <a
          href="https://www.youtube.com/@TheKapePodcast"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full font-semibold transition"
        >
          <span className="text-xl">▶️</span>
          Subscribe to our YouTube Channel
        </a>
        <p className="text-xs text-zinc-500 mt-3">
          More videos, behind-the-scenes, and full productions on our YouTube channel
        </p>
      </div>
    </div>
  );
}