import { Share, Alert } from 'react-native';
import DeepLinkService from './DeepLinkService';

class ShareService {
  /**
   * Chia sẻ playlist qua URL
   */
  async sharePlaylist(playlistId: string, playlistName: string): Promise<void> {
    try {
      const shareUrl = DeepLinkService.createPlaylistShareUrl(playlistId);
        const shareOptions = {
        title: `Check out "${playlistName}" playlist`,
        message: `🎵 Listen to "${playlistName}" playlist on VibeStream app!\n\n${shareUrl}`,
        url: shareUrl,
      };

      const result = await Share.share(shareOptions);
      
      if (result.action === Share.sharedAction) {
        console.log('Playlist shared successfully');
      } else if (result.action === Share.dismissedAction) {
        console.log('Share dismissed');
      }
    } catch (error) {
      console.error('Error sharing playlist:', error);
      Alert.alert('Share Error', 'Failed to share playlist. Please try again.');
    }
  }

  /**
   * Copy playlist URL to clipboard
   */
  async copyPlaylistUrl(playlistId: string, playlistName: string): Promise<void> {
    try {
      const { Clipboard } = await import('react-native');
      const shareUrl = DeepLinkService.createPlaylistShareUrl(playlistId);
      
      await Clipboard.setString(shareUrl);
      Alert.alert('Link Copied', `"${playlistName}" playlist link has been copied to your clipboard.`);
    } catch (error) {
      console.error('Error copying playlist URL:', error);
      Alert.alert('Copy Error', 'Failed to copy playlist link. Please try again.');
    }
  }
}

export default new ShareService();
