// In-memory demo Movie model for local testing (no DB required)
const movies = [
  {
    _id: 'demo1',
    name: 'Phim Demo: Hành Trình Kỳ Diệu',
    avatar: 'https://via.placeholder.com/320x480?text=Demo+Movie',
    ageRating: 'C13',
    language: 'Tiếng Việt',
    description: 'Phim mẫu dùng để kiểm tra chức năng đặt ghế và combo trong môi trường dev.',
    deleted: false,
    // Example showtimes (used by UI or tests if needed)
    showtimes: [
      { cinema: 'Cinema A', date: '2025-12-22', time: '19:00' },
      { cinema: 'Cinema B', date: '2025-12-23', time: '20:30' }
    ]
  }
];

module.exports = {
  findOne: async (query) => {
    const id = query && (query._id || query.id) ? (query._id || query.id) : null;
    if (!id) return null;

    const found = movies.find(m => String(m._id) === String(id));
    if (found) return found;

    // Fallback: if any id provided but not found, return a generic demo object
    return {
      _id: id,
      name: 'Phim Mẫu',
      avatar: 'https://via.placeholder.com/320x480?text=Demo+Movie',
      ageRating: 'P',
      language: 'Phụ đề',
      deleted: false
    };
  },

  // Optional helper to list movies (not required by controllers currently)
  find: async (query = {}) => {
    return movies.filter(m => !m.deleted);
  }
};

