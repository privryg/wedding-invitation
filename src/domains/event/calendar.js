/** Builds a "Add to Google Calendar" template URL from the event's calendar
 *  descriptor. */
export function buildCalendarUrl(cal) {
  return (
    'https://calendar.google.com/calendar/render?action=TEMPLATE' +
    '&text=' + encodeURIComponent(cal.text) +
    '&dates=' + cal.dates +
    '&details=' + encodeURIComponent(cal.details) +
    '&location=' + encodeURIComponent(cal.location)
  )
}
