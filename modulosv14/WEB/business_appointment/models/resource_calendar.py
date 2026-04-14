#coding: utf-8

from datetime import datetime, timedelta
from dateutil.rrule import DAILY, rrule
from pytz import timezone

from odoo import api, models

from odoo.addons.resource.models.resource import Intervals, float_to_time


class resource_calendar(models.Model):
    """
    Overwrite to have the possibility of the whole day
    """
    _inherit = "resource.calendar"

    def _ba_attendance_intervals(self, start_dt, end_dt, resource=None):
        """
        The method to return the attendance intervals in the given datetime range.

        Args:
         * start_dt - datetime with tz
         * end_dt - datetime with tz
         * resource - calendar.resource object

        Returns:
         * Interval object
        """
        assert start_dt.tzinfo and end_dt.tzinfo
        combine = datetime.combine
        tz = timezone(self.tz)
        start_dt = start_dt.astimezone(tz)
        end_dt = end_dt.astimezone(tz)
        result = []
        for attendance in self.attendance_ids:
            start = start_dt.date()
            if attendance.date_from:
                start = max(start, attendance.date_from)
            until = end_dt.date()
            if attendance.date_to:
                until = min(until, attendance.date_to)
            weekday = int(attendance.dayofweek)

            for day in rrule(DAILY, start, until=until, byweekday=weekday):
                dt0 = tz.localize(combine(day, float_to_time(attendance.hour_from)))
                if attendance.hour_to == 24:
                    next_day = day + timedelta(days=1)
                    hour_to = 0
                    dt1 = tz.localize(combine(next_day, float_to_time(hour_to)))
                else:
                    dt1 = tz.localize(combine(day, float_to_time(attendance.hour_to)))
                result.append((max(start_dt, dt0), min(end_dt, dt1), attendance))
        return Intervals(result)

    def _ba_work_intervals(self, start_dt, end_dt, resource=None, domain=None):
        """
        The method to return the effective work intervals between the given datetimes

        Args:
         * start_dt - datetime with tz
         * end_dt - datetime with tz
         * resource - calendar.resource object
         * domain - RPN domain

        Methods:
         * _ba_attendance_intervals
         * _leave_intervals

        Returns:
         * Interval object
        """
        return (self._ba_attendance_intervals(start_dt, end_dt, resource) -
                self._leave_intervals(start_dt, end_dt, resource, domain))
