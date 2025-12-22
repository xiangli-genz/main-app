// main-app/models/movie.model.js

class MovieModel {
  constructor() {
    // Dữ liệu mẫu
    this.movies = [
      {
        _id: 'demo1',
        name: 'Avatar: The Way of Water',
        slug: 'avatar-the-way-of-water',
        avatar: 'https://via.placeholder.com/320x480?text=Avatar+2',
        ageRating: 'T13',
        language: 'Tiếng Anh - Phụ đề Việt',
        duration: '192 phút',
        director: 'James Cameron',
        cast: 'Sam Worthington, Zoe Saldana',
        releaseDate: '2022-12-16',
        category: 'Hành động, Khoa học viễn tưởng',
        description: 'Bối cảnh của Avatar: The Way of Water lấy hơn một thập kỷ sau các sự kiện của phần phim đầu tiên...',
        deleted: false,
        status: 'active',
        
        prices: {
          standard: 50000,
          vip: 60000,
          couple: 110000
        },
        
        showtimes: [
          { 
            cinema: 'CGV Vincom', 
            date: '2025-12-24', 
            times: ['10:00', '14:00', '18:00', '21:00'],
            format: '2D'
          },
          { 
            cinema: 'CGV Vincom', 
            date: '2025-12-25', 
            times: ['09:00', '13:00', '17:00', '20:00'],
            format: '3D'
          },
          { 
            cinema: 'Lotte Cinema', 
            date: '2025-12-24', 
            times: ['11:00', '15:00', '19:00'],
            format: 'IMAX'
          },
          { 
            cinema: 'Galaxy Cinema', 
            date: '2025-12-24', 
            times: ['12:00', '16:00', '20:00'],
            format: '2D'
          }
        ]
      },
      {
        _id: 'demo2',
        name: 'The Marvels',
        slug: 'the-marvels',
        avatar: 'https://via.placeholder.com/320x480?text=The+Marvels',
        ageRating: 'T13',
        language: 'Tiếng Anh - Phụ đề Việt',
        duration: '105 phút',
        director: 'Nia DaCosta',
        cast: 'Brie Larson, Teyonah Parris',
        releaseDate: '2023-11-10',
        category: 'Hành động, Siêu anh hùng',
        description: 'Carol Danvers aka Captain Marvel has reclaimed her identity...',
        deleted: false,
        status: 'active',
        
        prices: {
          standard: 55000,
          vip: 65000,
          couple: 120000
        },
        
        showtimes: [
          { 
            cinema: 'CGV Vincom', 
            date: '2025-12-24', 
            times: ['10:30', '14:30', '18:30', '21:30'],
            format: '2D'
          },
          { 
            cinema: 'Lotte Cinema', 
            date: '2025-12-24', 
            times: ['11:30', '15:30', '19:30'],
            format: '3D'
          }
        ]
      }
    ];
  }

  async findOne(query) {
    return this.movies.find(m => {
      if (query._id) return m._id === query._id;
      if (query.slug) return m.slug === query.slug;
      return false;
    }) || null;
  }

  async find(query = {}) {
    let results = [...this.movies];
    
    if (query.deleted === false) {
      results = results.filter(m => !m.deleted);
    }
    
    if (query.status) {
      results = results.filter(m => m.status === query.status);
    }
    
    return results;
  }
}

module.exports = new MovieModel();