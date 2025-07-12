import * as Linking from 'expo-linking';
import NavigationService from './navigation/NavigationService';

export interface DeepLinkData {
  screen: string;
  params?: any;
}

class DeepLinkService {
  private prefix = Linking.createURL('/');
  private cloudflareWorkerUrl = 'https://tranduytoan.xyz';

  /**
   * Tạo shareable URL cho playlist qua Cloudflare Worker
   * URL này sẽ redirect tới deep link thực tế
   */
  createPlaylistShareUrl(playlistId: string): string {
    return `${this.cloudflareWorkerUrl}/playlist?id=${playlistId}`;
  }

  /**
   * Tạo deep link URL trực tiếp (để xử lý internal)
   */
  private createDirectDeepLink(playlistId: string): string {
    return Linking.createURL('playlist', {
      queryParams: { id: playlistId }
    });
  }  /**
   * Parse deep link URL (xử lý cả URL từ Cloudflare Worker và deep link trực tiếp)
   */
  parseDeepLink(url: string): DeepLinkData | null {
    try {
      // Xử lý deep link trực tiếp (vibestream://playlist?id=...)
      if (url.startsWith('vibestream://')) {
        const { hostname, queryParams } = Linking.parse(url);
        
        if (hostname === 'playlist' && queryParams?.id) {
          return {
            screen: 'OwnPlaylistDetail',
            params: { playlistId: queryParams.id }
          };
        }
      }
      
      // Xử lý URL từ Cloudflare Worker (https://tranduytoan.xyz/playlist?id=...)
      if (url.includes('tranduytoan.xyz/playlist')) {
        const urlObj = new URL(url);
        const playlistId = urlObj.searchParams.get('id');
        
        if (playlistId) {
          return {
            screen: 'OwnPlaylistDetail',
            params: { playlistId }
          };
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error parsing deep link:', error);
      return null;
    }
  }
  /**
   * Xử lý deep link và navigate đến màn hình tương ứng
   */
  handleDeepLink(url: string): boolean {
    const linkData = this.parseDeepLink(url);
    
    if (!linkData) {
      return false;
    }

    switch (linkData.screen) {
      case 'OwnPlaylistDetail':
        NavigationService.navigateToOwnPlaylist(linkData.params.playlistId);
        return true;
      default:
        return false;
    }
  }

  /**
   * Lắng nghe deep links khi app đang chạy
   */
  addDeepLinkListener() {
    return Linking.addEventListener('url', ({ url }) => {
      console.log('Deep link received:', url);
      this.handleDeepLink(url);
    });
  }

  /**
   * Xử lý deep link khi app được mở từ deep link
   */
  async getInitialDeepLink(): Promise<string | null> {
    try {
      return await Linking.getInitialURL();
    } catch (error) {
      console.error('Error getting initial deep link:', error);
      return null;
    }
  }
}

export default new DeepLinkService();
