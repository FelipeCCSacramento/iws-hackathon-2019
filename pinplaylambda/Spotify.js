const axios = require('axios');

const baseUrl = 'https://api.spotify.com';

class Spotify {

  constructor(options) {
    const { accessToken } = options
    
    this.accessToken = accessToken;
  };

  async search(q, type) {
    const result = await axios({
      method: 'GET',
      url: `${baseUrl}/v1/search`,
      params: { q, type },
      headers: { Authorization: `Bearer ${this.accessToken}`}
    });
    return result.data;
  }

  async getPlaylist(playlistId) {
    const result = await axios({
      method: 'GET',
      url: `${baseUrl}/v1/playlists/${playlistId}`,
      headers: { Authorization: `Bearer ${this.accessToken}`}
    });
    return result.data;
  }

  async createPlaylist({ name, description }) {
    const result = await axios({
      method: 'POST',
      url: `${baseUrl}/v1/me/playlists`,
      headers: { Authorization: `Bearer ${this.accessToken}`},
      data: {
        name: name,
        public: false,
        collaborative: false,
        description: description
      }
    });
    return result.data;
  }

  async addTrackToPlaylist(trackIds, playlistId) {
    const result = await axios({
      method: 'POST',
      url: `${baseUrl}/v1/playlists/${playlistId}/tracks`,
      headers: { Authorization: `Bearer ${this.accessToken}`},
      data: { uris: trackIds.map(t => `spotify:track:${t}`) }
    });
    return result.data;
  }

  async removeTrackFromPlaylist(trackIds, playlistId) {
    const result = await axios({
      method: 'DELETE',
      url: `${baseUrl}/v1/playlists/${playlistId}/tracks`,
      headers: { Authorization: `Bearer ${this.accessToken}`},
      data: { uris: trackIds.map(t => `spotify:track:${t}`) }
    });
    return result.data;
  }

  async getAudioFeaturesForSeveralTracks(trackIds) {
    const result = await axios({
      method: 'GET',
      url: `${spotifyData.data}/v1/audio-features`,
      headers: { Authorization: `Bearer ${this.accessToken}`},
      params: { ids: trackIds }
    });
    return result.data;
  }

}

module.exports = Spotify;
