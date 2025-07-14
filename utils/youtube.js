const ytdl = require('@distube/ytdl-core');
const youtubeSearch = require('youtube-search-api');

/**
 * Check if a URL is a valid YouTube URL
 * @param {string} url - The URL to check
 * @returns {boolean} - True if valid YouTube URL
 */
function isValidYouTubeUrl(url) {
    try {
        return ytdl.validateURL(url);
    } catch (error) {
        return false;
    }
}

/**
 * Get video information from YouTube URL
 * @param {string} url - YouTube URL
 * @returns {Object|null} - Video info object or null if error
 */
async function getVideoInfo(url) {
    try {
        const info = await ytdl.getInfo(url);
        
        return {
            title: info.videoDetails.title,
            duration: formatDuration(info.videoDetails.lengthSeconds),
            thumbnail: info.videoDetails.thumbnails[0]?.url || null,
            author: info.videoDetails.author.name,
            views: info.videoDetails.viewCount,
            description: info.videoDetails.description || 'No description available'
        };
    } catch (error) {
        console.error('Error getting video info:', error);
        return null;
    }
}

/**
 * Format duration from seconds to MM:SS or HH:MM:SS
 * @param {number} seconds - Duration in seconds
 * @returns {string} - Formatted duration string
 */
function formatDuration(seconds) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hrs > 0) {
        return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
}

/**
 * Search YouTube for videos using youtube-search-api
 * @param {string} query - Search query
 * @returns {Array} - Array of video objects
 */
async function searchYouTube(query) {
    try {
        console.log(`Searching YouTube for: ${query}`);
        
        // Use youtube-search-api to search for videos
        const searchResults = await youtubeSearch.GetListByKeyword(query, false, 5);
        
        if (!searchResults || !searchResults.items || searchResults.items.length === 0) {
            console.log('No search results found');
            return [];
        }
        
        // Filter only videos (not playlists or channels)
        const videos = searchResults.items.filter(item => item.type === 'video');
        
        if (videos.length === 0) {
            console.log('No video results found');
            return [];
        }
        
        // Return the first video result formatted
        const firstVideo = videos[0];
        const videoUrl = `https://www.youtube.com/watch?v=${firstVideo.id}`;
        
        return [{
            title: firstVideo.title,
            url: videoUrl,
            duration: firstVideo.length?.simpleText || 'Desconocido',
            thumbnail: firstVideo.thumbnail?.thumbnails?.[0]?.url || null,
            author: firstVideo.channelTitle || 'Desconocido'
        }];
        
    } catch (error) {
        console.error('Error searching YouTube:', error);
        return [];
    }
}

/**
 * Get video ID from YouTube URL
 * @param {string} url - YouTube URL
 * @returns {string|null} - Video ID or null if invalid
 */
function getVideoId(url) {
    try {
        const videoId = ytdl.getVideoID(url);
        return videoId;
    } catch (error) {
        console.error('Error extracting video ID:', error);
        return null;
    }
}

/**
 * Check if video is available for streaming
 * @param {string} url - YouTube URL
 * @returns {boolean} - True if available
 */
async function isVideoAvailable(url) {
    try {
        const info = await ytdl.getInfo(url);
        return info.videoDetails.isLiveContent === false; // Don't allow live streams
    } catch (error) {
        console.error('Error checking video availability:', error);
        return false;
    }
}

module.exports = {
    isValidYouTubeUrl,
    getVideoInfo,
    formatDuration,
    searchYouTube,
    getVideoId,
    isVideoAvailable
};
