function parseInlineMarkdown(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }

    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={index}>{part.slice(1, -1)}</em>;
    }

    return part;
  });
}

export function MarkdownContent({ content }: { content: string }) {
  const blocks = content.split(/\n{2,}/).map((block) => block.trim());

  return (
    <div className="space-y-5 text-base leading-8">
      {blocks.map((block, index) => {
        if (block.startsWith("### ")) {
          return (
            <h3 className="text-xl font-semibold" key={index}>
              {parseInlineMarkdown(block.slice(4))}
            </h3>
          );
        }

        if (block.startsWith("## ")) {
          return (
            <h2 className="text-2xl font-semibold" key={index}>
              {parseInlineMarkdown(block.slice(3))}
            </h2>
          );
        }

        if (block.startsWith("# ")) {
          return (
            <h2 className="text-2xl font-semibold" key={index}>
              {parseInlineMarkdown(block.slice(2))}
            </h2>
          );
        }

        if (/^[-*]\s/m.test(block)) {
          return (
            <ul className="list-disc space-y-2 pl-5" key={index}>
              {block
                .split("\n")
                .filter((line) => /^[-*]\s/.test(line))
                .map((line, lineIndex) => (
                  <li key={lineIndex}>{parseInlineMarkdown(line.slice(2))}</li>
                ))}
            </ul>
          );
        }

        return (
          <p className="whitespace-pre-wrap" key={index}>
            {parseInlineMarkdown(block)}
          </p>
        );
      })}
    </div>
  );
}
