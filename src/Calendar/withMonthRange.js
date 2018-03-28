import parse from 'date-fns/parse';
import format from 'date-fns/format';
import min from 'date-fns/min';
import max from 'date-fns/max';
import {compose, withProps, withState} from 'recompose';
import {withDefaultProps} from './';
import {withImmutableProps, getFirstDateOfMonth, getLastDateOfMonth} from '../utils';
import {EVENT_TYPE, getInitialDate, getSortedSelection} from './Range';

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
  withProps(({passThrough, selected, ...props}) => ({
    /* eslint-disable sort-keys */
    passThrough: {
      ...passThrough,
      Years: {
        onSelect: (date) => handleSelect(date, {selected, ...props}),
        handlers: {
          onMouseOver: !isTouchDevice && props.selectionStart
            ? (e) => handleMouseOver(e, {selected, ...props})
            : null,
        },
      },
    },
    selected: {
      start: selected && getFirstDateOfMonth(selected.start),
      end: selected && getLastDateOfMonth(selected.end),
    },
  })),
);

function handleSelect(date, {onSelect, selected, selectionStart, setSelectionStart}) {
  if (selectionStart) {
    onSelect({
      eventType: EVENT_TYPE.END,
      ...getMonthRangeDate({
        start: selectionStart,
        end: date,
      }),
    });
    setSelectionStart(null);
  } else {
    onSelect({
      eventType: EVENT_TYPE.START,
      ...getMonthRangeDate({
        start: date,
        end: date,
      }),
    });
    setSelectionStart(date);
  }
}

function handleMouseOver(e, {onSelect, selectionStart}) {
  e.stopPropagation();
  const month = e.target.getAttribute('data-month');
  if (!month) { return; }
  onSelect({
    eventType: EVENT_TYPE.HOVER,
    ...getMonthRangeDate({
      start: selectionStart,
      end: month,
    }),
  });
}

function getMonthRangeDate({start, end, minSelected, maxSelected, minScrolled, maxScrolled}) {
  const sortedDate = getSortedSelection({start, end});
  const compareStartDate = [];
  const compareEndDate = [];
  if (sortedDate.start) {
    compareStartDate.push(sortedDate.start, getFirstDateOfMonth(sortedDate.start));
    minScrolled && compareStartDate.push(minScrolled);
    minSelected && compareStartDate.push(minSelected);
  }
  if (sortedDate.end) {
    compareEndDate.push(getLastDateOfMonth(sortedDate.end));
    maxScrolled && compareEndDate.push(maxScrolled);
    maxSelected && compareEndDate.push(maxSelected);
  }
  return {
    start: compareStartDate.length > 0 ?
            format(max(...compareStartDate), 'YYYY-MM-DD') :
            sortedDate.start,
    end: compareEndDate.length > 0 ?
          format(min(...compareEndDate), 'YYYY-MM-DD') :
          sortsortedDate.end,
  };
}

if (typeof window !== 'undefined') {
  window.addEventListener('touchstart', function onTouch() {
    isTouchDevice = true;

    window.removeEventListener('touchstart', onTouch, false);
  });
}
