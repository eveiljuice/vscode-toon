# Публикация расширения в VS Code Marketplace

## Шаг 1: Подготовка

1. **Обновите package.json:**
   - Замените `YOUR_USERNAME` на ваш GitHub username в полях `repository`, `bugs`, `homepage`
   - Убедитесь, что `publisher` уникален (используйте ваш Azure DevOps или GitHub username)

2. **Создайте аккаунт в Azure DevOps:**
   - Перейдите на https://dev.azure.com
   - Войдите с вашим Microsoft/GitHub аккаунтом
   - Создайте организацию (если нужно)

## Шаг 2: Создание Personal Access Token (PAT)

1. В Azure DevOps перейдите в **User Settings** → **Personal Access Tokens**
2. Нажмите **New Token**
3. Настройки:
   - **Name**: `VS Code Extension Publishing`
   - **Organization**: выберите вашу организацию
   - **Expiration**: выберите срок действия
   - **Scopes**: выберите **Custom defined**
   - **Marketplace**: выберите **Manage** (полный доступ)
4. Скопируйте токен (он показывается только один раз!)

## Шаг 3: Установка vsce

```bash
npm install -g @vscode/vsce
```

## Шаг 4: Вход в Azure DevOps

```bash
vsce login YOUR_PUBLISHER_NAME
```

Введите ваш Personal Access Token когда попросит.

## Шаг 5: Сборка расширения

```bash
npm run compile
```

Убедитесь, что нет ошибок компиляции.

## Шаг 6: Публикация

### Первая публикация:

```bash
vsce package
vsce publish
```

### Обновление существующего расширения:

1. Обновите версию в `package.json` (например, `0.0.2`)
2. Выполните:

```bash
vsce package
vsce publish
```

## Шаг 7: Проверка

1. Перейдите на https://marketplace.visualstudio.com/vscode
2. Найдите ваше расширение по имени или publisher
3. Обычно публикация занимает несколько минут

## Альтернатива: Публикация через веб-интерфейс

1. Выполните `vsce package` для создания `.vsix` файла
2. Перейдите на https://marketplace.visualstudio.com/manage
3. Нажмите **New extension** → **Visual Studio Code**
4. Загрузите `.vsix` файл

## Важные замечания

- **Publisher ID** должен быть уникальным и соответствовать вашему Azure DevOps аккаунту
- Версия должна увеличиваться при каждом обновлении
- README.md будет использован как описание расширения в Marketplace
- Иконка расширения (128x128px) может быть добавлена в корень проекта как `icon.png`

## Troubleshooting

- **Ошибка "Publisher not found"**: Убедитесь, что publisher ID совпадает с вашим Azure DevOps аккаунтом
- **Ошибка "Extension not found"**: Используйте `vsce publish --packagePath your-extension.vsix` для первой публикации
- **Ошибка токена**: Создайте новый PAT с правильными правами

