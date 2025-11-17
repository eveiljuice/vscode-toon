import * as vscode from 'vscode';

interface ArrayInfo {
    name: string;
    declaredLength: number;
    actualLength: number;
    line: number;
    delimiter: string;
    fields?: string[];
    isTabular: boolean;
    isInline: boolean;
}

export function activate(context: vscode.ExtensionContext) {
    console.log('Toon language support activated');

    // Диагностика для валидации
    const diagnosticCollection = vscode.languages.createDiagnosticCollection('toon');
    
    function validateDocument(document: vscode.TextDocument) {
        const config = vscode.workspace.getConfiguration('toon');
        if (!config.get<boolean>('validation.enabled', true)) {
            diagnosticCollection.set(document.uri, []);
            return;
        }

        const diagnostics: vscode.Diagnostic[] = [];
        const text = document.getText();
        const lines = text.split('\n');
        const arrays: ArrayInfo[] = [];
        let currentArray: ArrayInfo | null = null;
        let indentLevel = 0;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmed = line.trim();
            const lineIndent = line.length - line.trimStart().length;

            // Табличный массив: name[count]{fields}:
            const tabularMatch = trimmed.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\[(\d+)([,\|\\t]?)\]\{([^}]*)\}\s*:/);
            if (tabularMatch) {
                currentArray = {
                    name: tabularMatch[1],
                    declaredLength: parseInt(tabularMatch[2]),
                    actualLength: 0,
                    line: i,
                    delimiter: tabularMatch[3] || ',',
                    fields: tabularMatch[4].split(',').map(f => f.trim()),
                    isTabular: true,
                    isInline: false
                };
                arrays.push(currentArray);
                indentLevel = lineIndent + 2;
                continue;
            }

            // Встроенный массив: name[count]: (только если не табличный)
            const inlineMatch = trimmed.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\[(\d+)([,\|\\t]?)\]\s*:/);
            if (inlineMatch) {
                currentArray = {
                    name: inlineMatch[1],
                    declaredLength: parseInt(inlineMatch[2]),
                    actualLength: 0,
                    line: i,
                    delimiter: inlineMatch[3] || ',',
                    isTabular: false,
                    isInline: true
                };
                arrays.push(currentArray);
                indentLevel = lineIndent + 2;
                continue;
            }

            // Корневой массив: [count]:
            const rootMatch = trimmed.match(/^\[(\d+)\]\s*:/);
            if (rootMatch) {
                currentArray = {
                    name: '',
                    declaredLength: parseInt(rootMatch[1]),
                    actualLength: 0,
                    line: i,
                    delimiter: ',',
                    isTabular: false,
                    isInline: true
                };
                arrays.push(currentArray);
                indentLevel = lineIndent + 2;
                continue;
            }

            // Подсчет строк данных массива
            if (currentArray && lineIndent >= indentLevel && trimmed && !trimmed.startsWith('//')) {
                if (trimmed.startsWith('-')) {
                    // Смешанный массив
                    currentArray.actualLength++;
                } else if (currentArray.isTabular) {
                    // Табличный массив - считаем строки данных
                    currentArray.actualLength++;
                } else if (currentArray.isInline) {
                    // Встроенный массив - считаем элементы после двоеточия
                    const values = trimmed.split(currentArray.delimiter === '\\t' ? '\t' : currentArray.delimiter || ',');
                    currentArray.actualLength += values.length;
                }
            }

            // Сброс текущего массива при уменьшении отступа
            if (currentArray && lineIndent < indentLevel && trimmed && !trimmed.startsWith('//')) {
                currentArray = null;
                indentLevel = 0;
            }
        }

        // Проверка соответствия длин
        for (const arr of arrays) {
            if (arr.declaredLength !== arr.actualLength) {
                const range = new vscode.Range(
                    arr.line,
                    0,
                    arr.line,
                    lines[arr.line].length
                );
                diagnostics.push({
                    range,
                    message: `Array "${arr.name || '[root]'}" declared length ${arr.declaredLength} but has ${arr.actualLength} items`,
                    severity: vscode.DiagnosticSeverity.Warning,
                    source: 'toon'
                });
            }
        }

        diagnosticCollection.set(document.uri, diagnostics);
    }

    // Валидация при открытии и изменении документа
    if (vscode.window.activeTextEditor) {
        validateDocument(vscode.window.activeTextEditor.document);
    }

    vscode.workspace.onDidChangeTextDocument(e => {
        if (e.document.languageId === 'toon') {
            validateDocument(e.document);
        }
    });

    vscode.window.onDidChangeActiveTextEditor(editor => {
        if (editor && editor.document.languageId === 'toon') {
            validateDocument(editor.document);
        }
    });

    // Обновление валидации при изменении настроек
    vscode.workspace.onDidChangeConfiguration(e => {
        if (e.affectsConfiguration('toon.validation.enabled')) {
            vscode.workspace.textDocuments.forEach(doc => {
                if (doc.languageId === 'toon') {
                    validateDocument(doc);
                }
            });
        }
    });

    // Автодополнение для ключевых слов и структур
    const completionProvider = vscode.languages.registerCompletionItemProvider(
        'toon',
        {
            provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
                const completions: vscode.CompletionItem[] = [];

                // Табличный массив
                const tabularArray = new vscode.CompletionItem('tabular-array', vscode.CompletionItemKind.Snippet);
                tabularArray.insertText = new vscode.SnippetString('${1:name}[${2:count}]{${3:field1,field2}}:\n  $0');
                tabularArray.documentation = new vscode.MarkdownString('Create a tabular array with field names');
                completions.push(tabularArray);

                // Встроенный массив
                const inlineArray = new vscode.CompletionItem('inline-array', vscode.CompletionItemKind.Snippet);
                inlineArray.insertText = new vscode.SnippetString('${1:name}[${2:count}]: ${3:value1,value2}');
                inlineArray.documentation = new vscode.MarkdownString('Create an inline array');
                completions.push(inlineArray);

                // Смешанный массив
                const mixedArray = new vscode.CompletionItem('mixed-array', vscode.CompletionItemKind.Snippet);
                mixedArray.insertText = new vscode.SnippetString('${1:name}[${2:count}]:\n  - ${3:item1}\n  - ${4:item2}');
                mixedArray.documentation = new vscode.MarkdownString('Create a mixed array with list markers');
                completions.push(mixedArray);

                // Корневой массив
                const rootArray = new vscode.CompletionItem('root-array', vscode.CompletionItemKind.Snippet);
                rootArray.insertText = new vscode.SnippetString('[${1:count}]: ${2:value1,value2}');
                rootArray.documentation = new vscode.MarkdownString('Create a root-level array');
                completions.push(rootArray);

                // Простое свойство
                const propertyTemplate = new vscode.CompletionItem('property', vscode.CompletionItemKind.Snippet);
                propertyTemplate.insertText = new vscode.SnippetString('${1:key}: ${2:value}');
                propertyTemplate.documentation = new vscode.MarkdownString('Create a property');
                completions.push(propertyTemplate);

                // Булевы значения
                const trueValue = new vscode.CompletionItem('true', vscode.CompletionItemKind.Value);
                trueValue.insertText = 'true';
                completions.push(trueValue);

                const falseValue = new vscode.CompletionItem('false', vscode.CompletionItemKind.Value);
                falseValue.insertText = 'false';
                completions.push(falseValue);

                // Null
                const nullValue = new vscode.CompletionItem('null', vscode.CompletionItemKind.Value);
                nullValue.insertText = 'null';
                completions.push(nullValue);

                return completions;
            }
        }
    );

    // Форматирование документа
    const formattingProvider = vscode.languages.registerDocumentFormattingEditProvider('toon', {
        provideDocumentFormattingEdits(document: vscode.TextDocument): vscode.TextEdit[] {
            const edits: vscode.TextEdit[] = [];
            const text = document.getText();
            const lines = text.split('\n');
            
            let formatted = '';
            let indent = 0;
            let inArray = false;
            
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                const trimmed = line.trim();
                
                if (!trimmed) {
                    formatted += '\n';
                    continue;
                }
                
                // Комментарии без изменений
                if (trimmed.startsWith('//') || trimmed.startsWith('/*')) {
                    formatted += ' '.repeat(indent) + trimmed + '\n';
                    continue;
                }
                
                // Табличный массив: name[count]{fields}:
                if (trimmed.match(/^[a-zA-Z_][a-zA-Z0-9_]*\[\d+([,\|\\t]?)\]\{[^}]*\}\s*:/)) {
                    formatted += trimmed + '\n';
                    indent = 2;
                    inArray = true;
                    continue;
                }
                
                // Встроенный массив: name[count]:
                if (trimmed.match(/^[a-zA-Z_][a-zA-Z0-9_]*\[\d+([,\|\\t]?)\]\s*:/)) {
                    formatted += trimmed + '\n';
                    indent = 2;
                    inArray = true;
                    continue;
                }
                
                // Корневой массив: [count]:
                if (trimmed.match(/^\[\d+\]\s*:/)) {
                    formatted += trimmed + '\n';
                    indent = 2;
                    inArray = true;
                    continue;
                }
                
                // Свойство верхнего уровня
                if (trimmed.match(/^[a-zA-Z_][a-zA-Z0-9_]*\s*:/) && !trimmed.match(/^\d+[,|]/)) {
                    formatted += trimmed + '\n';
                    indent = 2;
                    inArray = false;
                    continue;
                }
                
                // Строки данных массива или вложенные свойства
                const lineIndent = line.length - line.trimStart().length;
                if (inArray || lineIndent > 0) {
                    formatted += ' '.repeat(indent) + trimmed + '\n';
                } else {
                    formatted += trimmed + '\n';
                }
            }
            
            const fullRange = new vscode.Range(
                document.positionAt(0),
                document.positionAt(text.length)
            );
            
            edits.push(vscode.TextEdit.replace(fullRange, formatted.trimEnd()));
            return edits;
        }
    });

    // Hover provider для подсказок
    const hoverProvider = vscode.languages.registerHoverProvider('toon', {
        provideHover(document, position) {
            const line = document.lineAt(position.line).text;
            const trimmed = line.trim();
            
            // Булевы значения
            if (trimmed === 'true' || trimmed === 'false') {
                return new vscode.Hover('**Boolean value**\n\n`true` or `false`');
            }
            
            // Null
            if (trimmed === 'null') {
                return new vscode.Hover('**Null value**');
            }
            
            // Табличный массив
            const tabularMatch = trimmed.match(/([a-zA-Z_][a-zA-Z0-9_]*)\[(\d+)([,\|\\t]?)\]\{([^}]*)\}/);
            if (tabularMatch) {
                const delimiter = tabularMatch[3] || 'comma';
                const delimiterName = delimiter === '\\t' ? 'tab' : delimiter === '|' ? 'pipe' : 'comma';
                return new vscode.Hover(
                    `**Tabular Array**\n\n` +
                    `Name: \`${tabularMatch[1]}\`\n` +
                    `Declared length: \`${tabularMatch[2]}\`\n` +
                    `Delimiter: \`${delimiterName}\`\n` +
                    `Fields: \`${tabularMatch[4]}\``
                );
            }
            
            // Встроенный массив
            const inlineMatch = trimmed.match(/([a-zA-Z_][a-zA-Z0-9_]*)\[(\d+)([,\|\\t]?)\]/);
            if (inlineMatch) {
                const delimiter = inlineMatch[3] || 'comma';
                const delimiterName = delimiter === '\\t' ? 'tab' : delimiter === '|' ? 'pipe' : 'comma';
                return new vscode.Hover(
                    `**Inline Array**\n\n` +
                    `Name: \`${inlineMatch[1]}\`\n` +
                    `Declared length: \`${inlineMatch[2]}\`\n` +
                    `Delimiter: \`${delimiterName}\``
                );
            }
            
            // Корневой массив
            const rootMatch = trimmed.match(/\[(\d+)\]/);
            if (rootMatch) {
                return new vscode.Hover(
                    `**Root Array**\n\n` +
                    `Declared length: \`${rootMatch[1]}\``
                );
            }
            
            return null;
        }
    });

    context.subscriptions.push(
        completionProvider,
        formattingProvider,
        hoverProvider,
        diagnosticCollection
    );
}

export function deactivate() {}

