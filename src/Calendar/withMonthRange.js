import {compose, withProps, withState} from 'recompose';
import {withDefaultProps} from './';
import {withImmutableProps} from '../utils';
import isBefore from 'date-fns/is_before';
import parse from 'date-fns/parse';
import {EVENT_TYPE} from '../withRange'

let isTouchDevice = false;

// Enhancer to handle selecting and displaying multiple dates
export const withMonthRange = compose(
  withDefaultProps,
  withState('scrollDate', 'setScrollDate', getInitialDate),
  withState('selectionStart', 'setSelectionStart', null),
  withImmutableProps(({
    YearsComponent,
  }) => ({
    YearsComponent: YearsComponent,
  })),
  withProps(({displayKey, passThrough, selected, setDisplayKey, ...props}) => ({
    /* eslint-disable sort-keys */
    passThrough: {
      ...passThrough,
      Years: {
        onSelect: (date) => handleYearSelect(date, {selected, ...props}),
        handlers: {
          onMouseOver: !isTouchDevice && props.selectionStart
            ? (e) => handleMouseOver(e, {selected, ...props})
            : null,
        },
      },
    },
    selected: {
      start: selected && parse(selected.start),
      end: selected && parse(selected.end),
    },
  })),

);

function handleYearSelect(date, {onSelect, selected, setScrollDate, selectionStart, setSelectionStart}) {
    if (selectionStart) {
      onSelect({
        eventType: EVENT_TYPE.END,
        ...getSortedSelection({
          start: selectionStart,
          end: date,
        }),
      });
      setSelectionStart(null);
    } else {
      onSelect({eventType:EVENT_TYPE.START, start: date, end: date});
      setSelectionStart(date);
    }
}

function getSortedSelection({start, end}) {
  return isBefore(start, end)
    ? {start, end}
    : {start: end, end: start};
}

function handleSelect(date, {onSelect, selected, selectionStart, setSelectionStart}) {
  if (selectionStart) {
    onSelect({
      eventType: EVENT_TYPE.END,
      ...getSortedSelection({
        start: selectionStart,
        end: date,
      }),
    });
    setSelectionStart(null);
  } else {
    onSelect({eventType:EVENT_TYPE.START, start: date, end: date});
    setSelectionStart(date);
  }
}

function handleMouseOver(e, {onSelect, selectionStart}) {
  const dateStr = e.target.getAttribute('data-date');
  const date = dateStr && parse(dateStr);

  if (!date) { return; }

  onSelect({
    eventType: EVENT_TYPE.HOVER,
    ...getSortedSelection({
      start: selectionStart,
      end: date,
    }),
  });
}

function getInitialDate({selected}) {
  return selected && selected.start || new Date();
}

if (typeof window !== 'undefined') {
  window.addEventListener('touchstart', function onTouch() {
    isTouchDevice = true;

    window.removeEventListener('touchstart', onTouch, false);
  });
}
