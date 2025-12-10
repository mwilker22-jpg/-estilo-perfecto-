// =================== CONFIGURACIÓN RESPONSIVE ===================
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');

// Toggle menú móvil
menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    const icon = menuToggle.querySelector('i');
    icon.classList.toggle('fa-bars');
    icon.classList.toggle('fa-times');
});

// Cerrar menú al hacer click en un enlace
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        menuToggle.querySelector('i').classList.add('fa-bars');
        menuToggle.querySelector('i').classList.remove('fa-times');
    });
});

// =================== LÓGICA DE HORARIOS ===================
const dateInput = document.getElementById('date');
const timeSelect = document.getElementById('time');
const today = new Date().toISOString().split('T')[0];

dateInput.min = today;
dateInput.value = today;

document.addEventListener('DOMContentLoaded', () => {
    generateTimeSlots(dateInput.value);
});

dateInput.addEventListener('change', (e) => {
    generateTimeSlots(e.target.value);
});

function generateTimeSlots(selectedDateStr) {
    timeSelect.innerHTML = '<option value="">Elige hora...</option>';
    timeSelect.disabled = false;

    if (!selectedDateStr) {
        timeSelect.disabled = true;
        return;
    }

    const startHour = 8; 
    // CAMBIO REALIZADO: Límite hasta las 22:00 (10 PM)
    const endHour = 22; 
    
    // Simulación de base de datos local
    const appointments = JSON.parse(localStorage.getItem('estiloPerfectoAppointments')) || [];
    const takenTimes = appointments
        .filter(app => app.date === selectedDateStr)
        .map(app => app.time);

    const now = new Date();
    const isToday = selectedDateStr === today;
    const currentHour = now.getHours();
    let hasSlots = false;

    for (let hour = startHour; hour <= endHour; hour++) {
        const timeString = `${hour.toString().padStart(2, '0')}:00`;
        const displayTime = formatTimeDisplay(hour);

        if (takenTimes.includes(timeString)) continue;
        if (isToday && hour <= currentHour) continue;

        const option = document.createElement('option');
        option.value = timeString;
        option.textContent = displayTime;
        timeSelect.appendChild(option);
        hasSlots = true;
    }

    if (!hasSlots) {
        timeSelect.innerHTML = '<option value="">Sin cupos</option>';
        timeSelect.disabled = true;
    }
}

function formatTimeDisplay(hour) {
    const period = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
    return `${hour12}:00 ${period}`;
}

// =================== ENVÍO FORMULARIO (WHATSAPP) ===================
const appointmentForm = document.getElementById('appointmentForm');
const submitBtn = document.getElementById('submitBtn');
const btnText = document.getElementById('btnText');
const formLoader = document.getElementById('formLoader');
const formMessage = document.getElementById('formMessage');

async function sendWhatsAppDirectly(data) {
    return new Promise((resolve) => {
        const message = `💈 *RESERVA WEB* 💈%0A%0A` +
                       `👤 *Cliente:* ${encodeURIComponent(data.name)}%0A` +
                       `📱 *Tel:* ${encodeURIComponent(data.phone)}%0A` +
                       `✂️ *Servicio:* ${encodeURIComponent(data.service)}%0A` +
                       `📅 *Fecha:* ${encodeURIComponent(formatDate(data.date))}%0A` +
                       `⏰ *Hora:* ${encodeURIComponent(formatTimeDisplay(parseInt(data.time.split(':')[0])))}%0A` +
                       `${data.message ? `📝 *Nota:* ${encodeURIComponent(data.message)}%0A` : ''}`;
        
        const phoneNumber = '584127680533';
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
        
        window.open(whatsappUrl, '_blank');
        saveAppointment(data);
        generateTimeSlots(data.date);
        resolve(true);
    });
}

function formatDate(dateString) {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' });
}

function saveAppointment(appointment) {
    let appointments = JSON.parse(localStorage.getItem('estiloPerfectoAppointments')) || [];
    appointment.id = Date.now();
    appointments.push(appointment);
    localStorage.setItem('estiloPerfectoAppointments', JSON.stringify(appointments));
}

appointmentForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const data = {
        name: document.getElementById('name').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        service: document.getElementById('service').value,
        date: document.getElementById('date').value,
        time: document.getElementById('time').value,
        message: document.getElementById('message').value.trim()
    };

    if (!data.time) {
        alert('Por favor selecciona una hora disponible');
        return;
    }

    submitBtn.disabled = true;
    btnText.textContent = 'Procesando...';
    formLoader.style.display = 'block';

    try {
        await sendWhatsAppDirectly(data);
        document.getElementById('confirmationModal').style.display = 'flex';
        appointmentForm.reset();
        document.getElementById('date').value = today;
        generateTimeSlots(today);
    } catch (error) {
        alert('Error al abrir WhatsApp');
    } finally {
        submitBtn.disabled = false;
        btnText.innerHTML = 'CONFIRMAR RESERVA <i class="fab fa-whatsapp"></i>';
        formLoader.style.display = 'none';
    }
});

// =================== INTERACCIONES UI ===================
function closeModal() {
    document.getElementById('confirmationModal').style.display = 'none';
}

// =================== SLIDER Y GALERÍA 3D ===================
const carousel = document.getElementById('interstellarCarousel');
function pauseRotation() { if(carousel) carousel.style.animationPlayState = 'paused'; }
function resumeRotation() { if(carousel) carousel.style.animationPlayState = 'running'; }

// Inicialización Slider Hero
const slidesData = [
    { pais: 'Mohicano', lugar: 'FADE', desc: 'Degradado perfecto', img: '1.jpeg' },
    { pais: 'Med fade', lugar: 'TIJERA', desc: 'Corte tradicional', img: '2.jpeg' },
    { pais: 'Burst fade', lugar: 'DISEÑO', desc: 'Arte capilar', img: '4.jpeg' },
    { pais: 'High fade', lugar: 'DISEÑO', desc: 'Arte capilar', img: '5.jpeg' },
];

let currentSlide = 0;
const backgroundLayer = document.getElementById('backgroundLayer');
const sliderLayer = document.querySelector('.slider-layer');

function initHeroSlider() {
    if (!backgroundLayer || !sliderLayer) return;

    // Generar Slides
    slidesData.forEach((slide, index) => {
        const bg = document.createElement('div');
        bg.className = `background-slide ${index === 0 ? 'active' : ''}`;
        bg.innerHTML = `<img src="${slide.img}" onerror="this.src='https://via.placeholder.com/1920x1080/000000/FFFFFF?text=Estilo+Perfecto'">`;
        backgroundLayer.appendChild(bg);

        const card = document.createElement('div');
        card.className = `slide-card ${index === 0 ? 'active' : index === 1 ? 'next' : 'prev'}`;
        card.innerHTML = `
            <img src="${slide.img}" onerror="this.src='https://via.placeholder.com/400x600/333333/FFFFFF?text=Corte'">
            <div class="slide-overlay">
                <h3 class="slide-country">${slide.pais}</h3>
                <p class="slide-description">${slide.desc}</p>
            </div>
        `;
        sliderLayer.appendChild(card);
    });

    // Eventos Botones
    const nextBtn = document.querySelector('.next-btn');
    const prevBtn = document.querySelector('.prev-btn');

    if (nextBtn) nextBtn.addEventListener('click', () => changeSlide(1));
    if (prevBtn) prevBtn.addEventListener('click', () => changeSlide(-1));
}

function changeSlide(direction) {
    const slides = document.querySelectorAll('.slide-card');
    const bgs = document.querySelectorAll('.background-slide');
    
    if (slides.length === 0) return;

    // Limpiar clases
    slides.forEach(s => s.classList.remove('active', 'prev', 'next'));
    bgs.forEach(b => b.classList.remove('active'));

    // Calcular índice
    currentSlide = (currentSlide + direction + slidesData.length) % slidesData.length;

    // Asignar nuevas clases
    slides[currentSlide].classList.add('active');
    bgs[currentSlide].classList.add('active');
    
    // Asignar prev/next
    const prev = (currentSlide - 1 + slidesData.length) % slidesData.length;
    const next = (currentSlide + 1) % slidesData.length;
    slides[prev].classList.add('prev');
    slides[next].classList.add('next');
}

// Iniciar todo
window.addEventListener('DOMContentLoaded', initHeroSlider);