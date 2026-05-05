// Expandable card showing a logged study topic with full notes
import { useState } from 'react';
import PropTypes from 'prop-types';
import { ChevronDown, ChevronUp } from 'lucide-react';
import Card from '../ui/Card.jsx';
import Badge from '../ui/Badge.jsx';
import Rating from '../ui/Rating.jsx';
import { minsToHrs } from '../../utils/timeUtils.js';
import en from '../../locales/en.js';

const TopicCard = ({ topic }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="mb-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-semibold text-slate-800 text-sm truncate">{topic.title}</h3>
          {topic.courseSection && <p className="text-xs text-slate-500 mt-0.5">{topic.courseSection}</p>}
          <p className="text-sm text-slate-600 mt-1 line-clamp-2">{topic.summary}</p>
        </div>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <span className="text-xs text-slate-400">{minsToHrs(topic.timeSpentMinutes)}</span>
          <Rating value={topic.difficulty || 0} max={5} readOnly />
        </div>
      </div>

      {topic.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {topic.tags.map((tag) => <Badge key={tag} color="slate">{tag}</Badge>)}
        </div>
      )}

      {topic.keyNotes && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-1 text-xs text-sky-600 mt-2 hover:underline"
        >
          {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          {expanded ? en.study.collapseNotes : en.study.expandNotes}
        </button>
      )}

      {expanded && topic.keyNotes && (
        <div className="mt-2 p-3 bg-slate-50 rounded-lg text-sm text-slate-700 whitespace-pre-line">
          {topic.keyNotes}
        </div>
      )}
    </Card>
  );
};

TopicCard.propTypes = {
  topic: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    summary: PropTypes.string,
    courseSection: PropTypes.string,
    timeSpentMinutes: PropTypes.number,
    keyNotes: PropTypes.string,
    difficulty: PropTypes.number,
    tags: PropTypes.arrayOf(PropTypes.string),
    date: PropTypes.string,
  }).isRequired,
};

export default TopicCard;
