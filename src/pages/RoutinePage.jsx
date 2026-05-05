// Morning routine manager — fixed + flexible checklist, score, and history
import { useState } from 'react';
import PageWrapper from '../components/layout/PageWrapper.jsx';
import Card from '../components/ui/Card.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import RoutineItem from '../components/routine/RoutineItem.jsx';
import RoutineScore from '../components/routine/RoutineScore.jsx';
import useRoutine from '../hooks/useRoutine.js';
import { today, formatDisplay } from '../utils/dateUtils.js';
import en from '../locales/en.js';

const RoutinePage = () => {
  const { routineDay, history, loading, error, toggleItem, addItem } = useRoutine(today());
  const [newItem, setNewItem] = useState('');

  const handleAdd = async () => {
    if (!newItem.trim()) return;
    await addItem(newItem.trim());
    setNewItem('');
  };

  if (loading) return <PageWrapper title={en.routine.title}><Spinner className="py-16" /></PageWrapper>;

  return (
    <PageWrapper title={en.routine.title}>
      <div className="flex flex-col gap-5">
        {error && <div className="text-sm text-red-600 bg-red-50 rounded-lg p-3">{en.common.error}</div>}

        {/* Score */}
        <Card>
          <RoutineScore score={routineDay?.completionScore ?? 0} />
        </Card>

        {/* Fixed items */}
        <Card header={en.routine.fixedItems}>
          {(routineDay?.fixedItems || []).length === 0 ? (
            <p className="text-sm text-slate-400">{en.common.empty}</p>
          ) : (
            (routineDay.fixedItems).map((item) => (
              <RoutineItem key={item.id} item={item} onToggle={(id, done) => toggleItem('fixed', id, done)} />
            ))
          )}
        </Card>

        {/* Flexible items */}
        <Card header={en.routine.flexibleItems}>
          {(routineDay?.flexibleItems || []).map((item) => (
            <RoutineItem key={item.id} item={item} onToggle={(id, done) => toggleItem('flexible', id, done)} />
          ))}
          <div className="flex gap-2 mt-3">
            <Input
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              placeholder={en.routine.addPlaceholder}
              className="flex-1"
            />
            <Button onClick={handleAdd} size="sm">{en.common.add}</Button>
          </div>
        </Card>

        {/* History mini calendar */}
        <Card header={en.routine.history}>
          {history.length === 0 ? (
            <p className="text-sm text-slate-400">{en.routine.noHistory}</p>
          ) : (
            <div className="grid grid-cols-7 gap-1.5">
              {history.slice(0, 35).map((day) => {
                const score = day.completionScore || 0;
                const bg = score >= 80 ? 'bg-green-400' : score >= 50 ? 'bg-amber-400' : score > 0 ? 'bg-red-400' : 'bg-slate-200';
                return (
                  <div
                    key={day.date}
                    title={`${formatDisplay(day.date)}: ${score}%`}
                    className={`w-full aspect-square rounded-sm ${bg}`}
                  />
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </PageWrapper>
  );
};

export default RoutinePage;
