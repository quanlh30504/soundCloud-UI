export interface TrackDTO {
  id: number;
  spotifyId: string;
  name: string;
  artists: string[];
  albumImages: {
    height: number | null;
    width: number | null;
    url: string;
  }[];
  filePath: string;
  downloadStatus: 'completed' | 'pending' | 'failed';
}

export interface ListeningHistoryDTO {
  id: number;
  track: TrackDTO;
  listenedAt: string;
  playCount: number;
}

export interface HistoryPage {
  content: ListeningHistoryDTO[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
} 