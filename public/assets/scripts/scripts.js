// Shared page script for movie-detail (moved from inline)
(function(){
  const params = new URLSearchParams(window.location.search);
  const movieId = params.get('movieId') || 'demo1';

  const cinemaSelect = document.getElementById('cinema-select');
  const dateSelect = document.getElementById('date-select');
  const timeSelect = document.getElementById('time-select');
  const formatSelect = document.getElementById('format-select');
  const btnToSeat = document.getElementById('btn-to-seat');

  let movie = null;
  let showtimeIndex = {};

  async function fetchMovie(){
    try{
      const res = await fetch('/api/movies/' + encodeURIComponent(movieId));
      const j = await res.json();
      if(j && j.code === 'success') return j.data.movie;
    }catch(e){ console.error('fetchMovie', e); }
    return null;
  }

  function buildIndex(showtimes){
    const idx = {};
    (showtimes || []).forEach(s => {
      const c = s.cinema || 'Unknown';
      const d = s.date || new Date().toISOString().split('T')[0];
      const t = s.time || '19:00';
      const fmt = s.format || '2D';
      if(!idx[c]) idx[c] = {};
      if(!idx[c][d]) idx[c][d] = { times: new Set(), formats: new Set() };
      idx[c][d].times.add(t);
      idx[c][d].formats.add(fmt);
    });
    Object.keys(idx).forEach(c => {
      Object.keys(idx[c]).forEach(d => {
        idx[c][d].times = Array.from(idx[c][d].times).sort();
        idx[c][d].formats = Array.from(idx[c][d].formats);
      });
    });
    return idx;
  }

  function populateCinemas(){
    cinemaSelect.innerHTML = '<option value="">-- Chọn rạp --</option>';
    Object.keys(showtimeIndex).forEach(c => {
      const opt = document.createElement('option'); opt.value = c; opt.textContent = c; cinemaSelect.appendChild(opt);
    });
  }

  function populateDates(cinema){
    dateSelect.innerHTML = '<option value="">-- Chọn ngày --</option>';
    timeSelect.innerHTML = '<option value="">-- Chọn suất --</option>'; timeSelect.disabled = true;
    formatSelect.innerHTML = '<option value="">-- Định dạng --</option>'; formatSelect.disabled = true;
    if(!cinema || !showtimeIndex[cinema]){ dateSelect.disabled = true; return; }
    dateSelect.disabled = false;
    Object.keys(showtimeIndex[cinema]).forEach(d => {
      const opt = document.createElement('option'); opt.value = d; opt.textContent = new Date(d).toLocaleDateString('vi-VN'); dateSelect.appendChild(opt);
    });
  }

  function populateTimes(cinema, date){
    timeSelect.innerHTML = '<option value="">-- Chọn suất --</option>';
    formatSelect.innerHTML = '<option value="">-- Định dạng --</option>';
    if(!cinema || !date || !showtimeIndex[cinema] || !showtimeIndex[cinema][date]){ timeSelect.disabled = true; return; }
    timeSelect.disabled = false;
    showtimeIndex[cinema][date].times.forEach(t => { const opt = document.createElement('option'); opt.value = t; opt.textContent = t; timeSelect.appendChild(opt); });
  }

  function populateFormats(cinema, date){
    formatSelect.innerHTML = '<option value="">-- Định dạng --</option>';
    if(!cinema || !date || !showtimeIndex[cinema] || !showtimeIndex[cinema][date]){ formatSelect.disabled = true; return; }
    formatSelect.disabled = false;
    showtimeIndex[cinema][date].formats.forEach(f => { const opt = document.createElement('option'); opt.value = f; opt.textContent = f; formatSelect.appendChild(opt); });
  }

  function updateBtn(){ btnToSeat.disabled = !(cinemaSelect.value && dateSelect.value && timeSelect.value && formatSelect.value); }

  cinemaSelect.addEventListener('change', function(){ populateDates(this.value); updateBtn(); });
  dateSelect.addEventListener('change', function(){ populateTimes(cinemaSelect.value, this.value); updateBtn(); });
  timeSelect.addEventListener('change', function(){ populateFormats(cinemaSelect.value, dateSelect.value); updateBtn(); });
  formatSelect.addEventListener('change', updateBtn);

  btnToSeat.addEventListener('click', function(){
    const cinema = cinemaSelect.value;
    const date = dateSelect.value;
    const time = timeSelect.value;
    const format = formatSelect.value;
    if(!cinema || !date || !time || !format){ alert('Vui lòng chọn đầy đủ suất chiếu'); return; }

    const bookingData = {
      movieId: movieId,
      movieName: movie ? movie.name : '',
      movieAvatar: movie ? movie.avatar : '',
      cinema: cinema,
      showtimeDate: date,
      showtimeTime: time,
      format: format,
      seats: [],
      ticketPrice: 0,
      combos: {},
      comboPrice: 0,
      total: 0
    };
    sessionStorage.setItem('bookingData', JSON.stringify(bookingData));
    window.location.href = '/booking/seat?movieId=' + encodeURIComponent(movieId);
  });

  (async ()=>{
    movie = await fetchMovie();
    if(movie){
      document.getElementById('movie-title').textContent = movie.name || '';
      document.getElementById('movie-desc').textContent = movie.description || '';
      document.getElementById('movie-poster').src = movie.avatar || document.getElementById('movie-poster').src;
      showtimeIndex = buildIndex(movie.showtimes || []);
      if(Object.keys(showtimeIndex).length === 0){
        showtimeIndex = { 'Cinema A': {} };
        const d = new Date().toISOString().split('T')[0];
        showtimeIndex['Cinema A'][d] = { times: ['19:00'], formats: ['2D'] };
      }
      populateCinemas();
    } else {
      document.getElementById('movie-title').textContent = 'Phim không tìm thấy';
    }
  })();

})();
