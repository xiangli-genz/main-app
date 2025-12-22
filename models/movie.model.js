// models/movie.model.js
const movies = [
  {
    _id: 'demo1',
    name: 'Phim Demo: Hành Trình Kỳ Diệu',
    avatar: 'https://via.placeholder.com/320x480?text=Demo+Movie',
    ageRating: 'C13',
    language: 'Tiếng Việt - Phụ đề',
    description: 'Phim mẫu dùng để kiểm tra chức năng đặt ghế và combo.',
    deleted: false,
    
    // ✅ THÊM GIÁ VÉ
    prices: {
      standard: 50000,
      vip: 60000,
      couple: 110000
    },
    
    // ✅ CẬP NHẬT SHOWTIMES VỚI FORMAT
    showtimes: [
      { 
        cinema: 'CGV Vincom', 
        date: '2025-12-22', 
        times: ['10:00', '14:00', '18:00', '21:00'],
        format: '2D'
      },
      { 
        cinema: 'Lotte Cinema', 
        date: '2025-12-23', 
        times: ['11:00', '15:00', '19:00'],
        format: '3D'
      },
      { 
        cinema: 'Galaxy Cinema', 
        date: '2025-12-24', 
        times: ['12:00', '16:00', '20:00'],
        format: 'IMAX'
      }
    ]
  }
];