'use strict';

const form = document.querySelector('#search-form');
const totalCountInput = document.querySelector('#total-count');
const status = document.querySelector('#request-status');
const filterPanel = document.querySelector('#filter-panel');
const groups = document.querySelector('#letter-groups');
const ignoreAccents = document.querySelector('#ignore-accents');
const requiredLetters = document.querySelector('#required-letters');
const excludedLetters = document.querySelector('#excluded-letters');
const clueConflict = document.querySelector('#clue-conflict');
const list = document.querySelector('#word-list');
const empty = document.querySelector('#empty-state');
const badge = document.querySelector('#result-count');
const summary = document.querySelector('#result-summary');
const more = document.querySelector('#show-more');
let words = [];
let matches = [];
let slots = [];
let rendered = 0;
let wordIndex = null;
const pageSize = 120;
const segmenter = typeof Intl.Segmenter === 'function' ? new Intl.Segmenter('vi', { granularity: 'grapheme' }) : null;
const normalize = text => text.normalize('NFC');
const chars = text => segmenter ? Array.from(segmenter.segment(normalize(text)), part => part.segment) : Array.from(normalize(text));
const number = value => value.toLocaleString('vi-VN');

function getWordIndex() {
    if (wordIndex) return wordIndex;
    if (!Array.isArray(window.WORDS_DATA?.words)) {
        throw new Error('Không đọc được dữ liệu từ. Hãy đặt words-data.js cùng thư mục với index.html rồi tải lại trang.');
    }
    const index = new Map();
    for (const row of window.WORDS_DATA.words) {
        if (typeof row.text !== 'string' || !Number.isInteger(row.count_1) || !Number.isInteger(row.count_2)) continue;
        const key = row.count_1 + row.count_2;
        if (!index.has(key)) index.set(key, []);
        index.get(key).push(row.text);
    }
    wordIndex = index;
    return wordIndex;
}

function fold(text) {
    text = normalize(text).toLocaleLowerCase('vi');
    return ignoreAccents.checked ? text.normalize('NFD').replace(/\p{M}/gu, '').replace(/đ/g, 'd') : text;
}

function clueLetters(input) {
    // Ignore separators without modifying the input while the user is typing Vietnamese.
    return [...new Set(chars(input.value).filter(character => /^\p{L}\p{M}*$/u.test(character)).map(fold))];
}

function showEmpty(title, description) {
    empty.querySelector('h3').textContent = title;
    empty.querySelector('p').textContent = description;
    empty.hidden = false;
    list.hidden = true;
    more.hidden = true;
}

function resetResults() {
    words = [];
    matches = [];
    slots = [];
    filterPanel.hidden = true;
    requiredLetters.value = '';
    excludedLetters.value = '';
    clueConflict.hidden = true;
    clueConflict.textContent = '';
    list.replaceChildren();
    groups.replaceChildren();
    badge.textContent = '—';
}

function createSlots(count) {
    const group = document.createElement('div');
    group.className = 'letter-group';
    const heading = document.createElement('h3');
    heading.textContent = `${count} ký tự · Không tính khoảng trắng`;
    const row = document.createElement('div');
    row.className = 'slots';
    for (let index = 0; index < count; index++) {
        const label = document.createElement('label');
        label.className = 'slot';
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = '·';
        input.autocomplete = 'off';
        input.spellcheck = false;
        input.setAttribute('autocapitalize', 'none');
        input.setAttribute('aria-label', `Ký tự ${index + 1}`);
        // Không dùng maxlength / tự chuyển ô: bộ gõ tiếng Việt cần hoàn thành dấu.
        const update = () => {
            input.value = chars(input.value.replace(/\s/gu, '')).slice(0, 1).join('');
            input.classList.toggle('filled', Boolean(input.value));
            filterWords();
        };
        input.addEventListener('input', event => { if (!event.isComposing) update(); });
        input.addEventListener('compositionend', update);
        input.addEventListener('keydown', event => {
            if (event.isComposing) return;
            let target;
            if (event.key === 'ArrowRight') target = slots[index + 1];
            if (event.key === 'ArrowLeft' || (event.key === 'Backspace' && !input.value)) target = slots[index - 1];
            if (target) { event.preventDefault(); target.focus(); target.select(); }
        });
        input.addEventListener('focus', () => input.select());
        input.addEventListener('paste', event => {
            const pasted = chars((event.clipboardData?.getData('text') || '').replace(/\s/gu, ''));
            if (!pasted.length) return;
            event.preventDefault();
            pasted.slice(0, count - index).forEach((character, offset) => {
                const target = slots[index + offset];
                target.value = character;
                target.classList.add('filled');
            });
            filterWords();
        });
        const position = document.createElement('span');
        position.textContent = index + 1;
        position.setAttribute('aria-hidden', 'true');
        label.append(input, position);
        row.append(label);
        slots.push(input);
    }
    group.append(heading, row);
    groups.append(group);
}

function renderMore() {
    const required = new Set(clueLetters(requiredLetters));
    const fragment = document.createDocumentFragment();
    const end = Math.min(rendered + pageSize, matches.length);
    for (let i = rendered; i < end; i++) {
        const card = document.createElement('div');
        card.className = 'word-card';
        let position = 0;
        matches[i].parts.forEach((part, groupIndex) => {
            if (groupIndex) card.append(' ');
            part.forEach(character => {
                if (slots[position].value || required.has(fold(character))) {
                    const mark = document.createElement('mark');
                    mark.textContent = character;
                    card.append(mark);
                } else card.append(character);
                position++;
            });
        });
        fragment.append(card);
    }
    list.append(fragment);
    rendered = end;
    more.hidden = rendered >= matches.length;
    more.textContent = `Xem thêm (${number(matches.length - rendered)} từ)`;
}

function filterWords() {
    const pattern = slots.map(input => fold(input.value));
    const required = clueLetters(requiredLetters);
    const excluded = new Set(clueLetters(excludedLetters));
    const conflicts = [...new Set([...required, ...pattern].filter(character => character && excluded.has(character)))];
    clueConflict.hidden = conflicts.length === 0;
    clueConflict.textContent = conflicts.length ? `Gợi ý mâu thuẫn: ${conflicts.join(', ')} vừa phải có, vừa bị loại. Hãy kiểm tra lại các chữ hoặc tùy chọn bỏ dấu.` : '';
    matches = words.filter(word => {
        if (!word.letters.every((character, index) => !pattern[index] || fold(character) === pattern[index])) return false;
        const present = new Set(word.letters.map(fold));
        return required.every(character => present.has(character)) && [...excluded].every(character => !present.has(character));
    });
    list.replaceChildren();
    rendered = 0;
    badge.textContent = number(matches.length);
    summary.textContent = `${number(matches.length)} / ${number(words.length)} từ khớp`;
    if (!matches.length) {
        showEmpty('Chưa tìm thấy từ phù hợp', words.length ? 'Thử xóa bớt ký tự ở hai card hoặc kiểm tra tùy chọn “Bỏ qua dấu tiếng Việt”.' : 'Không có từ hai tiếng tương ứng trong dữ liệu. Thử độ dài khác nhé.');
        return;
    }
    empty.hidden = true;
    list.hidden = false;
    renderMore();
}

form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    resetResults();
    status.hidden = true;
    status.classList.remove('error');
    const total = Number(totalCountInput.value);
    try {
        const candidates = getWordIndex().get(total) || [];
        const seen = new Set();
        words = candidates.flatMap(text => {
            const cleaned = normalize(text.trim()).replace(/\s+/gu, ' ');
            const parts = cleaned.split(' ').map(chars);
            const letters = parts.flat();
            const key = cleaned.toLocaleLowerCase('vi');
            if (seen.has(key) || parts.length !== 2 || letters.length !== total) return [];
            seen.add(key);
            return [{ text: cleaned, parts, letters }];
        }).sort((a, b) => a.text.localeCompare(b.text, 'vi'));
        createSlots(total);
        filterPanel.hidden = false;
        status.hidden = true;
        filterWords();
    } catch (error) {
        status.hidden = false;
        status.textContent = error.message;
        status.classList.add('error');
        summary.textContent = 'Tải dữ liệu chưa thành công';
        showEmpty('Chưa thể tải danh sách', 'Kiểm tra file dữ liệu words-data.js rồi tải lại trang.');
    }
});

totalCountInput.addEventListener('input', () => {
    status.hidden = true;
    resetResults();
    summary.textContent = 'Đang chờ gợi ý của bạn';
    showEmpty('Tra theo độ dài mới', 'Nhấn “Tìm từ” để tải danh sách và tạo lại các ô ký tự.');
});
document.querySelector('#clear-letters').addEventListener('click', () => {
    slots.forEach(input => { input.value = ''; input.classList.remove('filled'); });
    filterWords();
    slots[0]?.focus();
});
[requiredLetters, excludedLetters].forEach(input => {
    input.addEventListener('input', event => { if (!event.isComposing) filterWords(); });
    input.addEventListener('compositionend', filterWords);
});
document.querySelector('#clear-clues').addEventListener('click', () => {
    requiredLetters.value = '';
    excludedLetters.value = '';
    filterWords();
    requiredLetters.focus();
});
ignoreAccents.addEventListener('change', filterWords);
more.addEventListener('click', renderMore);
