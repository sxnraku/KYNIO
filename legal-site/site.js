const supportedLanguages = new Set(['pt', 'en']);
const savedLanguage = localStorage.getItem('kynio-legal-language');
const browserLanguage = navigator.language.toLowerCase().startsWith('pt') ? 'pt' : 'en';

function setLanguage(language) {
  const selected = supportedLanguages.has(language) ? language : 'pt';
  document.documentElement.dataset.activeLanguage = selected;
  document.documentElement.lang = selected;
  localStorage.setItem('kynio-legal-language', selected);

  document.querySelectorAll('[data-language-button]').forEach((button) => {
    button.classList.toggle('active', button.dataset.languageButton === selected);
    button.setAttribute('aria-pressed', String(button.dataset.languageButton === selected));
  });
}

document.querySelectorAll('[data-language-button]').forEach((button) => {
  button.addEventListener('click', () => setLanguage(button.dataset.languageButton));
});

setLanguage(savedLanguage || browserLanguage);
