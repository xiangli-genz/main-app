// main-app/models/movie.model.js

class MovieModel {
  constructor() {
    // Dữ liệu mẫu với 2 phim để test
    this.movies = [
      {
        _id: 'movie001',
        name: 'Oppenheimer',
        slug: 'oppenheimer',
        avatar: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=600&fit=crop',
        ageRating: 'T18',
        language: 'Tiếng Anh - Phụ đề Việt',
        duration: '180 phút',
        director: 'Christopher Nolan',
        cast: 'Cillian Murphy, Emily Blunt, Matt Damon, Robert Downey Jr.',
        releaseDate: '2023-07-21',
        category: 'Tiểu sử, Drama, Lịch sử',
        description: 'Câu chuyện về J. Robert Oppenheimer, nhà vật lý lý thuyết người đã được mệnh danh là "cha đẻ của bom nguyên tử" sau khi lãnh đạo Dự án Manhattan trong Thế chiến II. Bộ phim khám phá cuộc đời phức tạp của ông, từ những đóng góp khoa học cho đến những hệ lụy đạo đức của việc tạo ra vũ khí hủy diệt hàng loạt.',
        deleted: false,
        status: 'active',
        
        prices: {
          standard: 50000,
          vip: 70000,
          couple: 130000
        },
        
        showtimes: [
          { 
            cinema: 'CGV Vincom Hà Nội', 
            date: '2025-01-02', 
            times: ['09:00', '12:30', '16:00', '19:30', '22:00'],
            format: '2D'
          },
          { 
            cinema: 'CGV Vincom Hà Nội', 
            date: '2025-01-03', 
            times: ['10:00', '13:30', '17:00', '20:30'],
            format: 'IMAX'
          },
          { 
            cinema: 'Lotte Cinema Landmark', 
            date: '2025-01-02', 
            times: ['10:30', '14:00', '17:30', '21:00'],
            format: '2D'
          },
          { 
            cinema: 'Lotte Cinema Landmark', 
            date: '2025-01-03', 
            times: ['11:00', '15:00', '18:30', '22:00'],
            format: '2D'
          },
          { 
            cinema: 'Galaxy Cinema Nguyễn Du', 
            date: '2025-01-02', 
            times: ['09:30', '13:00', '16:30', '20:00'],
            format: '2D'
          },
          { 
            cinema: 'Galaxy Cinema Nguyễn Du', 
            date: '2025-01-03', 
            times: ['10:30', '14:30', '18:00', '21:30'],
            format: '2D'
          }
        ]
      },
      {
        _id: 'movie002',
        name: 'Barbie',
        slug: 'barbie',
        avatar: 'https://images.unsplash.com/photo-1594908900066-3f47337549d8?w=400&h=600&fit=crop',
        ageRating: 'T13',
        language: 'Tiếng Anh - Phụ đề Việt',
        duration: '114 phút',
        director: 'Greta Gerwig',
        cast: 'Margot Robbie, Ryan Gosling, America Ferrera, Will Ferrell',
        releaseDate: '2023-07-21',
        category: 'Hài, Phiêu lưu, Fantasy',
        description: 'Barbie và Ken đang có một cuộc sống tuyệt vời trong thế giới đầy màu sắc và dường như hoàn hảo của Barbie Land. Tuy nhiên, khi họ có cơ hội đến thế giới thực, họ sớm phát hiện ra những niềm vui và nguy hiểm của cuộc sống giữa những con người. Một bộ phim đầy màu sắc, vui nhộn nhưng cũng đầy ý nghĩa về việc tìm kiếm bản thân và giá trị thực sự của cuộc sống.',
        deleted: false,
        status: 'active',
        
        prices: {
          standard: 55000,
          vip: 75000,
          couple: 140000
        },
        
        showtimes: [
          { 
            cinema: 'CGV Vincom Hà Nội', 
            date: '2025-01-02', 
            times: ['08:30', '11:00', '14:30', '18:00', '21:30'],
            format: '2D'
          },
          { 
            cinema: 'CGV Vincom Hà Nội', 
            date: '2025-01-03', 
            times: ['09:30', '12:00', '15:30', '19:00', '22:30'],
            format: '3D'
          },
          { 
            cinema: 'CGV Vincom Hà Nội', 
            date: '2025-01-04', 
            times: ['10:00', '13:00', '16:00', '19:30'],
            format: '2D'
          },
          { 
            cinema: 'Lotte Cinema Landmark', 
            date: '2025-01-02', 
            times: ['09:00', '11:30', '15:00', '18:30', '22:00'],
            format: '2D'
          },
          { 
            cinema: 'Lotte Cinema Landmark', 
            date: '2025-01-03', 
            times: ['10:00', '13:00', '16:30', '20:00'],
            format: '3D'
          },
          { 
            cinema: 'Galaxy Cinema Nguyễn Du', 
            date: '2025-01-02', 
            times: ['08:00', '10:30', '14:00', '17:30', '21:00'],
            format: '2D'
          },
          { 
            cinema: 'Galaxy Cinema Nguyễn Du', 
            date: '2025-01-03', 
            times: ['09:00', '12:30', '16:00', '19:30'],
            format: '2D'
          },
          { 
            cinema: 'BHD Star Cineplex', 
            date: '2025-01-02', 
            times: ['11:00', '14:00', '17:00', '20:00'],
            format: '2D'
          },
          { 
            cinema: 'BHD Star Cineplex', 
            date: '2025-01-03', 
            times: ['10:30', '13:30', '16:30', '19:30', '22:30'],
            format: '2D'
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