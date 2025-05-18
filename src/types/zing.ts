// 2.1 SongData
export interface SongData {
  encodeId: string;
  title: string;
  alias: string;
  artistsNames: string;
  artists: Artist[];
  thumbnailM: string;
  link: string;
  thumbnail: string;
  duration: number;
  releaseDate: string;
  genreIds: string[];
  distributor: string;
  streamingStatus: number;
  hasLyric: boolean;
  genres: Genre[];
  composers: Composer[];
  album: Album;
}

// 2.2 Artist
export interface Artist {
  id: string;
  name: string;
  alias: string;
  thumbnail: string;
  thumbnailM: string;
  biography?: string;
  sortBiography?: string;
  national?: string;
  birthday?: string;
  realname?: string;
  totalFollow?: string;
}

// 2.3 Album
export interface Album {
  encodeId: string;
  title: string;
  aliasTitle: string;
  thumbnail: string;
  thumbnailM: string;
  releaseDate: string;
  sortDescription: string;
  releasedAt: number;
  genreIds: string[];
  genres: Genre[];
  artists: Artist[];
  artistsNames: string;
  distributor: string;
  song?: {
    items: SongData[];
  };
}

// 2.4 Genre
export interface Genre {
  id: string;
  name: string;
  alias: string;
}

// 2.5 Composer
export interface Composer {
  id: string;
  name: string;
  alias: string;
  thumbnail: string;
}

// 2.6 StreamData
export interface StreamData {
  "128": string;
  "320": string;
}

// 2.7 SyncResponse
export interface SyncResponse {
  success: boolean;
  zingId: string;
  message: string;
}

// 2.8 Top100
export interface Top100 {
  banner: string;
  type: string;
  sectionType: string;
  viewType: string;
  title: string;
  items: SongData[];
}

// 2.9 HubDetail
export interface HubDetail {
  encodeId: string;
  cover: string;
  thumbnail: string;
  thumbnailHasText: string;
  title: string;
  description: string;
  sections: HubSection[];
}

export interface HubSection {
  title: string;
  items: any[]; // Có thể là SongData, Album, v.v. — tuỳ tình huống bạn có thể dùng union type
}

// 2.10 ChartHomeData
export interface ChartHomeData {
  RTChart: {
    promotes: SongData[];
    items: SongData[];
    chart: {
      minScore: number;
      maxScore: number;
      totalScore: number;
      items: {
        [songId: string]: ChartItemInfo[];
      };
    };
  };
  weekChart: {
    vn: WeekChartInfo;
    us: WeekChartInfo;
    korea: WeekChartInfo;
  };
}

export interface ChartItemInfo {
  time: number;
  score: number;
}

export interface WeekChartInfo {
  playlistId: string;
  items: SongData[];
}
