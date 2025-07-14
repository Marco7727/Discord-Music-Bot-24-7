class QueueService {
    constructor() {
        this.queues = new Map(); // guildId -> array of songs
    }

    // Get queue for a guild
    getQueue(guildId) {
        return this.queues.get(guildId) || [];
    }

    // Add song to queue
    addToQueue(guildId, song) {
        if (!this.queues.has(guildId)) {
            this.queues.set(guildId, []);
        }
        
        const queue = this.queues.get(guildId);
        queue.push(song);
        
        console.log(`Added song to queue for guild ${guildId}: ${song.title}`);
        return queue.length;
    }

    // Remove first song from queue (current song)
    removeFromQueue(guildId) {
        const queue = this.queues.get(guildId);
        if (queue && queue.length > 0) {
            const removedSong = queue.shift();
            console.log(`Removed song from queue for guild ${guildId}: ${removedSong.title}`);
            return removedSong;
        }
        return null;
    }

    // Clear entire queue
    clearQueue(guildId) {
        this.queues.set(guildId, []);
        console.log(`Cleared queue for guild ${guildId}`);
    }

    // Get queue length
    getQueueLength(guildId) {
        const queue = this.getQueue(guildId);
        return queue.length;
    }

    // Remove song at specific index
    removeAtIndex(guildId, index) {
        const queue = this.queues.get(guildId);
        if (queue && index >= 0 && index < queue.length) {
            const removedSong = queue.splice(index, 1)[0];
            console.log(`Removed song at index ${index} from queue for guild ${guildId}: ${removedSong.title}`);
            return removedSong;
        }
        return null;
    }

    // Move song to different position
    moveSong(guildId, fromIndex, toIndex) {
        const queue = this.queues.get(guildId);
        if (queue && fromIndex >= 0 && fromIndex < queue.length && toIndex >= 0 && toIndex < queue.length) {
            const song = queue.splice(fromIndex, 1)[0];
            queue.splice(toIndex, 0, song);
            console.log(`Moved song from index ${fromIndex} to ${toIndex} in guild ${guildId}: ${song.title}`);
            return true;
        }
        return false;
    }

    // Shuffle queue (excluding current song)
    shuffleQueue(guildId) {
        const queue = this.queues.get(guildId);
        if (queue && queue.length > 1) {
            const currentSong = queue.shift(); // Remove current song
            
            // Shuffle remaining songs
            for (let i = queue.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [queue[i], queue[j]] = [queue[j], queue[i]];
            }
            
            queue.unshift(currentSong); // Put current song back at front
            console.log(`Shuffled queue for guild ${guildId}`);
            return true;
        }
        return false;
    }
}

module.exports = new QueueService();
