const themeSwitchCheckbox = document.getElementById('theme-switch-checkbox');
const body = document.body;
const feedbackButton = document.getElementById('feedback-button');
const modal = document.getElementById('feedback-modal');
// const closeFeedbackButton = modal.querySelector('.close-button');
const tutorialButton = document.getElementById('tutorial-button');
const tutorialModal = document.getElementById('tutorial-modal');
const closeTutorialButton = tutorialModal.querySelector('.close-button');
const feedbackForm = document.getElementById('feedback-form');

// Загрузка настроек темной темы из локального хранилища при загрузке страницы
const darkMode = localStorage.getItem('darkMode') === 'true';
if (darkMode) {
    themeSwitchCheckbox.checked = true;
    body.classList.add('dark');
}

themeSwitchCheckbox.addEventListener('change', function () {
    if (this.checked) {
        body.classList.add('dark');
    } else {
        body.classList.remove('dark');
    }
    localStorage.setItem('darkMode', this.checked);
});

// Взаимодействие с FAQ
document.querySelectorAll('.faq-item').forEach(item => {
    item.addEventListener('click', () => {
        const answer = item.querySelector('.faq-answer');
        answer.style.display = answer.style.display === 'none' || answer.style.display === '' ? 'block' : 'none';
    });
});


window.onclick = (event) => {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
};


// Модальное окно для туториала
tutorialButton.onclick = () => {
    tutorialModal.style.display = 'flex';
};

closeTutorialButton.onclick = () => {
    tutorialModal.style.display = 'none';
};

window.onclick = (event) => {
    if (event.target === tutorialModal) {
        tutorialModal.style.display = 'none';
    }
};
const tooltips = document.querySelectorAll(".tooltip");
tooltips.forEach(tooltip => {
    tooltip.addEventListener("mouseover", () => {
        tooltip.classList.add("tooltip-active");
    });
    tooltip.addEventListener("mouseout", () => {
        tooltip.classList.remove("tooltip-active");
    });
});