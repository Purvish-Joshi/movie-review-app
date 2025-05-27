export interface Movie {
    _id: string;
    title: string;
    description: string;
    releaseYear: number;
    genre: string[];
    director: string;
    posterUrl: string;
    averageRating: number;
    totalReviews: number;
} 