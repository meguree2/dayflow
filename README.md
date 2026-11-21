# DAYFLOW

DAYFLOW — персональный центр управления повседневными делами. В приложении есть dashboard, задачи, расходы, заметки, привычки и Pomodoro-таймер.

## Требования

- Node.js LTS
- npm или pnpm

## Запуск в режиме разработки

Из корня проекта установи зависимости и запусти Vite:

```sh
npm install
npm run dev
```

Или используй pnpm:

```sh
pnpm install
pnpm dev
```

Открой адрес, который Vite покажет в терминале (обычно `http://localhost:5173`).

## Production-сборка

```sh
npm run build
npm run preview
```

Или через pnpm:

```sh
pnpm run build
pnpm preview
```

## Данные и приватность

Backend и регистрация не требуются. Данные задач, расходов, заметок и привычек хранятся локально в IndexedDB браузера. Между браузерами и устройствами синхронизации нет. В настройках можно скачать JSON-резервную копию; не добавляй её в GitHub.

## PWA

Vite собирает web manifest и service worker для установки и офлайн-кэша. Для установки на устройство сайт должен открываться по HTTPS; `localhost` подходит для разработки.

## Windows-приложение (Tauri 2)

Проект включает конфигурацию Tauri. Для сборки Windows-приложения нужны Rust stable с MSVC toolchain и Visual Studio C++ Build Tools с компонентом «Desktop development with C++». Убедись, что установлен Microsoft Edge WebView2 Runtime.

```sh
pnpm run desktop:dev
pnpm run desktop:build
```

## Структура проекта

- `src/pages/` — страницы приложения.
- `src/components/` — общие UI-компоненты.
- `src/data/db.ts` — схема IndexedDB на Dexie.
- `src/lib/` — форматирование дат и денег, определение платформы.
- `src-tauri/` — конфигурация и Rust-точка входа Tauri.
- `vite.config.ts` — Vite, Tailwind CSS и PWA.
