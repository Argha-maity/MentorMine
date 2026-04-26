import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

export default function MarkdownRenderer({ content }) {
  const detectLanguage = (code) => {
    const text = String(code).trim();
    if (/^\s*#include\b|std::|cout\b/.test(text)) return 'cpp';
    if (/^\s*import\s+\w+|def\s+\w+\(|self\b/.test(text)) return 'python';
    if (/\bpublic\s+static\s+void\b|System\.out\.println\b/.test(text)) return 'java';
    if (/^\s*#\s!/m.test(text)) return 'bash';
    if (/\bfunc\s+\w+\(|package\s+\w+/.test(text)) return 'go';
    return 'text';
  };

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        code({ node, inline, className, children, ...props }) {
          // allow languages with non-word chars like "c++" or "c#"
          const match = /language-(\S+)/.exec(className || '');
          if (inline) {
            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          }

          const inferredLang = match ? match[1] : detectLanguage(children);

          return (
            <SyntaxHighlighter
              style={oneDark}
              language={inferredLang}
              PreTag="div"
              customStyle={{
                margin: '10px 0',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              {...props}
            >
              {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
}