
import { useState, useRef, useEffect } from 'react';
import { format } from 'date-fns';

export function useCalendarControls(onMonthChange?: (start: Date, end: Date) => void) {
  const [currentViewTitle, setCurrentViewTitle] = useState<string>('');
  const calendarRef = useRef<any>(null);
  
  // Initialize calendar title on component mount
  useEffect(() => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      updateViewTitle(calendarApi);
    }
  }, []);
  
  // Update the view title based on current calendar date
  const updateViewTitle = (calendarApi: any) => {
    if (calendarApi) {
      const currentDate = calendarApi.getDate();
      console.log('Current calendar date:', currentDate);
      const formattedTitle = format(currentDate, 'MMMM yyyy');
      setCurrentViewTitle(formattedTitle);
    }
  };
  
  // Notify parent component about date range change
  const notifyDateChange = (calendarApi: any) => {
    if (onMonthChange && calendarApi) {
      const view = calendarApi.view;
      onMonthChange(view.currentStart, view.currentEnd);
    }
  };
  
  // Handle calendar date navigation
  const handlePrev = () => {
    const calendarApi = calendarRef.current?.getApi();
    calendarApi?.prev();
    updateViewTitle(calendarApi);
    notifyDateChange(calendarApi);
    console.log('Navigated to previous period');
  };

  const handleNext = () => {
    const calendarApi = calendarRef.current?.getApi();
    calendarApi?.next();
    updateViewTitle(calendarApi);
    notifyDateChange(calendarApi);
    console.log('Navigated to next period');
  };

  const handleToday = () => {
    const calendarApi = calendarRef.current?.getApi();
    calendarApi?.today();
    updateViewTitle(calendarApi);
    notifyDateChange(calendarApi);
    console.log('Navigated to today');
  };
  
  // Handle date range change
  const handleDatesSet = (info: any) => {
    updateViewTitle(calendarRef.current?.getApi());
    if (onMonthChange) {
      onMonthChange(info.start, info.end);
    }
    console.log('Calendar dates set:', info.start, info.end);
  };
  
  return {
    currentViewTitle,
    calendarRef,
    handlePrev,
    handleNext,
    handleToday,
    handleDatesSet
  };
}
