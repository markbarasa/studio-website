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
    title: "Wedding Highlights - James & Mary",
    description: "Beautiful wedding ceremony and reception highlights",
    url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    thumbnail: "https://images.unsplash.com/photo-1519741497674-611481863552?w=600",
    category: "Wedding",
    duration: "3:45",
  },
  {
    id: 2,
    title: "Traditional Ceremony - Cultural Dance",
    description: "Vibrant traditional wedding celebrations",
    url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    thumbnail: "https://images.unsplash.com/photo-1519677100203-a0e668c92439?w=600",
    category: "Traditional",
    duration: "4:20",
  },
  {
    id: 3,
    title: "Corporate Event - Company Launch",
    description: "Professional corporate event coverage",
    url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    thumbnail: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600",
    category: "Corporate",
    duration: "2:30",
  },
  {
    id: 4,
    title: "Music Video - Gospel Song",
    description: "Professional music video production",
    url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    thumbnail: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600",
    category: "Music",
    duration: "5:15",
  },
  {
    id: 5,
    title: "Documentary - Community Story",
    description: "Cinematic documentary storytelling",
    url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    thumbnail: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600",
    category: "Documentary",
    duration: "8:00",
  },
  {
    id: 6,
    title: "Podcast Episode - Interview",
    description: "Studio-quality podcast recording",
    url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    thumbnail: "https://images.unsplash.com/photo-1598550886636-96871e1f1b79?w=600",
    category: "Podcast",
    duration: "15:30",
  },
  {
    id: 7,
    title: "Birthday Shoot - Behind the Scenes",
    description: "Fun birthday photoshoot BTS",
    url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    thumbnail: "https://images.unsplash.com/photo-1492724724894-7464c27d0ceb?w=600",
    category: "Studio",
    duration: "1:45",
  },
  {
    id: 8,
    title: "Graduation Ceremony",
    description: "Special graduation day coverage",
    url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    thumbnail: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600",
    category: "Events",
    duration: "3:20",
  },
  {
    id: 9,
    title: "Choir Recording - 10 Songs",
    description: "Professional choir video production",
    url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    thumbnail: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600",
    category: "Music",
    duration: "45:00",
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
          href="https://www.youtube.com/@AlakaraStudios"
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