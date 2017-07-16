
using System;
using System.Globalization;

namespace Services
{
    public static class DateTimeExtensions
    {
        public static DateTime NextFriday(this DateTime dt)
        {
            var sunday = new GregorianCalendar().AddDays(dt, -((int) dt.DayOfWeek) + 7);
            var friday = sunday.AddDays(-2);
            return friday;
        }
    }
}
