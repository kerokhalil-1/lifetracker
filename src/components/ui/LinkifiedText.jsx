// Renders plain text with any URLs auto-converted to clickable links
import PropTypes from 'prop-types';

// Matches http/https URLs (greedy, stops at whitespace or common trailing punctuation)
const URL_RE = /(https?:\/\/[^\s<>"')\]]+)/g;

const LinkifiedText = ({ text, className = '' }) => {
  if (!text) return null;

  const parts = text.split(URL_RE);

  return (
    <span className={className}>
      {parts.map((part, i) => {
        if (URL_RE.test(part)) {
          // Reset lastIndex after test() so the next test() starts fresh
          URL_RE.lastIndex = 0;
          return (
            <a
              key={i}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-sky-600 underline underline-offset-2 hover:text-sky-800 break-all"
            >
              {part}
            </a>
          );
        }
        URL_RE.lastIndex = 0;
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
};

LinkifiedText.propTypes = {
  text:      PropTypes.string,
  className: PropTypes.string,
};

export default LinkifiedText;
