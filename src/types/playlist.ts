export interface Image {
  height: number;
  width: number;
  url: string;
}

export interface Track {
  id: number;
  spotifyId: string;
  name: string;
  artists: string[];
  artistIds?: string[];
  albumName: string;
  albumId?: string;
  albumImages: Image[];
  durationMs: number;
  previewUrl?: string;
  popularity?: number;
  releaseDate?: string;
  explicit?: boolean;
  spotifyUri?: string;
  spotifyUrl?: string;
  filePath?: string | null;
  downloadStatus?: string | null;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  ownerName: string;
  ownerId: string;
  images: Image[];
  tracks?: Track[];
  totalTracks: number;
  spotifyUri?: string;
  spotifyUrl?: string;
  isPublic: boolean;
  collaborative: boolean;
}

export interface CreatePlaylistDTO {
  name: string;
  description?: string;
  isPublic?: boolean;
}

export interface PagedResponse<T> {
  content: T[];
  pageable: {
    sort: {
      sorted: boolean;
      unsorted: boolean;
      empty: boolean;
    };
    pageNumber: number;
    pageSize: number;
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
  sort: {
    sorted: boolean;
    unsorted: boolean;
    empty: boolean;
  };
  numberOfElements: number;
  size: number;
  number: number;
  empty: boolean;
}
