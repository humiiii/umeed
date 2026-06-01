'use client';

export default function ScheduleControl({ mode, onModeChange, scheduledAt, onScheduledAtChange }) {
  // Get minimum datetime (now + 5 minutes)
  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 5);
    return now.toISOString().slice(0, 16);
  };

  return (
    <div id="schedule-control">
      <div className="segmented-control" id="mode-selector">
        <button
          className={`segmented-btn ${mode === 'now' ? 'active' : ''}`}
          onClick={() => onModeChange('now')}
          id="mode-now"
        >
          Post Now
        </button>
        <button
          className={`segmented-btn ${mode === 'scheduled' ? 'active' : ''}`}
          onClick={() => onModeChange('scheduled')}
          id="mode-scheduled"
        >
          Schedule
        </button>
      </div>

      {mode === 'scheduled' && (
        <div style={{ marginTop: '12px' }}>
          <input
            type="datetime-local"
            className="datetime-input"
            value={scheduledAt}
            onChange={(e) => onScheduledAtChange(e.target.value)}
            min={getMinDateTime()}
            id="datetime-picker"
          />
        </div>
      )}
    </div>
  );
}
