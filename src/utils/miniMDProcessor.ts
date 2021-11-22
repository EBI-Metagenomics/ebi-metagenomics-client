type TextBlock = {
  type: 'link' | 'text';
  content: string;
  href?: string;
};

export const processMDLinks = (text: string): TextBlock[] => {
  return text.split(/(\[[^\]]+\]\([^)]+\))/).map((block) => {
    if (block.startsWith('[')) {
      const match = block.match(/\[([^\]]+)\]\(([^)]+)\)/);
      return {
        type: 'link',
        content: match[1],
        href: match[2],
      };
    }
    return {
      type: 'text',
      content: block,
    };
  });
};

export default processMDLinks;
