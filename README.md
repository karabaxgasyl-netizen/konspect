# Конспект: школьные учебники в трёх уровнях

Статический сайт (HTML + CSS + JS, без сборки и сервера). Готов к GitHub Pages.

## Структура
```
index.html               интерфейс (SPA, hash-роутинг)
css/style.css            дизайн-система, светлая/тёмная тема, mobile first
js/app.js                логика: предметы, параграфы, 3 уровня, поиск, избранное, история
data/subjects.json       список 6 предметов (1 готов, 5 слотов "Скоро")
data/geography-9.json    География 9 кл. (Алексеев и др.), 57 параграфов × 3 уровня
manifest.webmanifest, sw.js, icons/   PWA (установка на главный экран, офлайн)
tools/                   скрипты обработки PDF
```

## Публикация на GitHub Pages
1. Создайте репозиторий на github.com (например, `konspekt`), Public.
2. Add file → Upload files → перетащите ВСЁ содержимое этой папки (не саму папку) → Commit.
3. Settings → Pages → Source: Deploy from a branch → Branch: `main`, папка `/ (root)` → Save.
4. Через 1–2 минуты сайт будет доступен по адресу `https://ВАШ_ЛОГИН.github.io/konspekt/`.
5. На телефоне: Safari → Поделиться → «На экран Домой» (iPhone) или Chrome → «Установить приложение» (Android).

Локальная проверка: `python3 -m http.server` в папке проекта → http://localhost:8000 (через file:// fetch не работает).

## Как добавить учебник
1. Обработайте PDF скриптами из `tools/` (pdfplumber + poppler) → получите `data/<id>.json` в том же формате, что `geography-9.json`.
2. В `data/subjects.json` замените один из слотов `slot-N`: укажите `name`, `grade`, `book`, `file: "data/<id>.json"`, `ready: true`.
3. Поднимите версию кеша `C` в `sw.js` (например, `konspekt-v2`).

Формат параграфа: `id, num, title, page, chapter, short{concl, terms[{term,def}], facts}, medium[{h,p[]}], detailed[{h,p[]}], conclusions, keywords, questions`.
